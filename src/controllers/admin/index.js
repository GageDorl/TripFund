import { sql } from '../../middleware/db.js';
import { getAllCategories, createCategory, findCategoryById, updateCategory } from '../../models/budgetCategories.js';

const adminPage = async (req, res) => {
  try {
    const categories = await getAllCategories();
    const usersRows = await sql`SELECT username, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC`;
    const users = usersRows.map(u => ({
      username: u.username,
      name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim(),
      email: u.email,
      role: u.role || 'user',
      createdAt: u.created_at
    }));

    // compute basic operational metrics
    try {
      const [tu] = await sql`SELECT COUNT(*)::int AS total FROM users`;
      const [tt] = await sql`SELECT COUNT(*)::int AS total FROM trips`;
      const [pt] = await sql`SELECT COUNT(*)::int AS total FROM trips WHERE status = 'public'`;
      const [tr] = await sql`SELECT COUNT(*)::int AS total FROM recaps`;
      const [cc] = await sql`SELECT COUNT(*)::int AS count FROM contributions`;
      const [cs] = await sql`SELECT COALESCE(SUM(amount),0)::numeric AS sum FROM contributions`;
      const [orow] = await sql`SELECT COUNT(*)::int AS total FROM reports WHERE status IS NULL OR status = 'open'`;

      const metrics = {
        totalUsers: tu ? Number(tu.total) : 0,
        totalTrips: tt ? Number(tt.total) : 0,
        publicTrips: pt ? Number(pt.total) : 0,
        totalRecaps: tr ? Number(tr.total) : 0,
        contributionsCount: cc ? Number(cc.count) : 0,
        contributionsSum: cs ? Number(cs.sum) : 0,
        openReports: orow ? Number(orow.total) : 0
      };

      return res.render('admin/index', { categories, users, error: null, addValues: null, metrics });
    } catch (mErr) {
      // metrics failure should not block page render
      return res.render('admin/index', { categories, users, error: null, addValues: null, metrics: null });
    }
  } catch (error) {
    res.status(500).render('admin/index', { categories: [], users: [], error: error.message, metrics: null });
  }
};

const createCategoryHandler = async (req, res) => {
  const { name, slug, description } = req.body;
  try {
    if (!name || String(name).trim() === '') {
      throw new Error('Name required');
    }
    const s = slug && String(slug).trim() !== '' ? slug : name.toLowerCase().replace(/\s+/g,'-');
    // check duplicates by name or slug
    const dup = await sql`SELECT id FROM budget_categories WHERE (LOWER(name) = LOWER(${name}) OR slug = ${s}) LIMIT 1`;
    if (dup && dup[0]) throw new Error('Category name or slug already exists');
    await createCategory({ name, slug: s, description });
    return res.redirect('/admin');
  } catch (error) {
    // render admin page with error and preserve entered values
    try {
      const categories = await getAllCategories();
      const usersRows = await sql`SELECT username, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC`;
      const users = usersRows.map(u => ({
        username: u.username,
        name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim(),
        email: u.email,
        role: u.role || 'user',
        createdAt: u.created_at
      }));
        // attempt to include metrics too
        try {
          const [cc] = await sql`SELECT COUNT(*)::int AS count FROM contributions`;
          const [cs] = await sql`SELECT COALESCE(SUM(amount),0)::numeric AS sum FROM contributions`;
          const [orow] = await sql`SELECT COUNT(*)::int AS total FROM reports WHERE status IS NULL OR status = 'open'`;
          const metrics = { contributionsCount: cc ? Number(cc.count) : 0, contributionsSum: cs ? Number(cs.sum) : 0, openReports: orow ? Number(orow.total) : 0 };
          return res.status(400).render('admin/index', { categories, users, error: error.message, addValues: { name, slug, description }, metrics });
        } catch (me) {
          return res.status(400).render('admin/index', { categories, users, error: error.message, addValues: { name, slug, description }, metrics: null });
        }
    } catch (e) {
      return res.status(500).send(error.message);
    }
  }
};

const deleteCategoryHandler = async (req, res) => {
  const id = req.params.id;
  try {
    await sql`DELETE FROM budget_categories WHERE id = ${id}`;
    res.redirect('/admin');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateUserRoleHandler = async (req, res) => {
  const username = req.params.username;
  const { role } = req.body;
  try {
    if (!['user','moderator','admin'].includes(role)) return res.status(400).send('Invalid role');
    await sql`UPDATE users SET role = ${role} WHERE username = ${username}`;
    res.redirect('/admin');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const bulkUpdateUserRoles = async (req, res) => {
  const selected = req.body.selectedUsers;
  const role = req.body.bulkRole;
  try {
    const usernames = Array.isArray(selected) ? selected : (selected ? [selected] : []);
    if (!usernames.length) return res.status(400).send('No users selected');
    if (!['user','moderator','admin'].includes(role)) return res.status(400).send('Invalid role');
    // update each user (simple, avoids array SQL issues)
    for (const u of usernames) {
      await sql`UPDATE users SET role = ${role} WHERE username = ${u}`;
    }
    return res.redirect('/admin');
  } catch (error) {
    try {
      const categories = await getAllCategories();
      const usersRows = await sql`SELECT username, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC`;
      const users = usersRows.map(u => ({
        username: u.username,
        name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim(),
        email: u.email,
        role: u.role || 'user',
        createdAt: u.created_at
      }));
      try {
        const [cc] = await sql`SELECT COUNT(*)::int AS count FROM contributions`;
        const [cs] = await sql`SELECT COALESCE(SUM(amount),0)::numeric AS sum FROM contributions`;
        const [orow] = await sql`SELECT COUNT(*)::int AS total FROM reports WHERE status IS NULL OR status = 'open'`;
        const metrics = { contributionsCount: cc ? Number(cc.count) : 0, contributionsSum: cs ? Number(cs.sum) : 0, openReports: orow ? Number(orow.total) : 0 };
        return res.status(500).render('admin/index', { categories, users, error: error.message, metrics });
      } catch (me) {
        return res.status(500).render('admin/index', { categories, users, error: error.message, metrics: null });
      }
    } catch (e) {
      return res.status(500).send(error.message);
    }
  }
};

const updateCategoryHandler = async (req, res) => {
  const id = req.params.id;
  const { name, slug, description } = req.body;
  try {
    if (!name || String(name).trim() === '') {
      throw new Error('Name required');
    }
    const s = slug && String(slug).trim() !== '' ? slug : name.toLowerCase().replace(/\s+/g,'-');
    // check duplicates excluding current id
    const dup = await sql`SELECT id FROM budget_categories WHERE (LOWER(name) = LOWER(${name}) OR slug = ${s}) AND id != ${id} LIMIT 1`;
    if (dup && dup[0]) throw new Error('Another category with that name or slug exists');
    await updateCategory(id, { name, slug: s, description });
    return res.redirect('/admin');
  } catch (error) {
    // render admin page with error
    try {
      const categories = await getAllCategories();
      const usersRows = await sql`SELECT username, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC`;
      const users = usersRows.map(u => ({
        username: u.username,
        name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim(),
        email: u.email,
        role: u.role || 'user',
        createdAt: u.created_at
      }));
        return res.status(400).render('admin/index', { categories, users, error: error.message, addValues: null });
    } catch (e) {
      return res.status(500).send(error.message);
    }
  }
};

export { adminPage, createCategoryHandler, deleteCategoryHandler, updateUserRoleHandler, updateCategoryHandler, bulkUpdateUserRoles };

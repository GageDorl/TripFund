import { getTripById } from '../../models/trips.js';
import { getExpensesForTrip, addExpense } from '../../models/expenses.js';
import { getAllCategories, findCategoryById, createCategory } from '../../models/budgetCategories.js';

const expensesPage = async (req, res) => {
  const tripId = req.params.id;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).render('expenses/index', { error: 'Trip not found', expenses: [] });
    if (trip.userId !== req.session.user.username) return res.status(403).render('expenses/index', { error: 'Unauthorized', expenses: [] });
    let expenses = await getExpensesForTrip(tripId);
    let categories = await getAllCategories();
    // If no categories exist yet, seed some sensible defaults to populate the select
    if (!categories || categories.length === 0) {
      const defaults = [
        { name: 'Food', slug: 'food', description: 'Meals and groceries' },
        { name: 'Transport', slug: 'transport', description: 'Flights, trains, taxis' },
        { name: 'Lodging', slug: 'lodging', description: 'Hotels, hostels, rentals' },
        { name: 'Activities', slug: 'activities', description: 'Tours and experiences' },
        { name: 'Misc', slug: 'misc', description: 'Other expenses' }
      ];
      for (const c of defaults) {
        try {
          await createCategory(c);
        } catch (e) {
          // ignore errors (e.g., unique constraint) and continue
        }
      }
      categories = await getAllCategories();
    }
    // attach category name to each expense for display
    const catMap = (categories || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    expenses = (expenses || []).map(e => ({
      ...e,
      categoryName: (e.categoryId && catMap[e.categoryId]) ? catMap[e.categoryId].name : 'Uncategorized'
    }));

    res.render('expenses/index', { error: null, trip, expenses, categories });
  } catch (error) {
    res.status(500).render('expenses/index', { error: error.message, expenses: [] });
  }
};

const addExpenseHandler = async (req, res) => {
  const tripId = req.params.id;
  const { categoryId, amount, description, expenseDate } = req.body;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    if (trip.userId !== req.session.user.username) return res.status(403).send('Unauthorized');
    // normalize categoryId: empty string -> null
    let catId = categoryId;
    if (!catId || String(catId).trim() === '') {
      catId = null;
    } else {
      const exists = await findCategoryById(catId);
      if (!exists) return res.status(400).send('Selected category does not exist');
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return res.status(400).send('Invalid amount');
    await addExpense({ tripId, categoryId: catId, createdBy: req.session.user.username, amount: numericAmount, description, expenseDate });
    res.redirect(`/trips/${tripId}/expenses`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteExpenseHandler = async (req, res) => {
  const tripId = req.params.id;
  const expenseId = req.params.expenseId;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    if (trip.userId !== req.session.user.username) return res.status(403).send('Unauthorized');
    const { deleteExpense } = await import('../../models/expenses.js');
    if (typeof deleteExpense !== 'function') return res.status(500).send('Delete not implemented');
    await deleteExpense(expenseId);
    res.redirect(`/trips/${tripId}/expenses`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { expensesPage, addExpenseHandler, deleteExpenseHandler };

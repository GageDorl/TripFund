import { getTripById } from '../../models/trips.js';
import { getBudgetForTrip, addBudgetItem } from '../../models/tripBudgets.js';
import { getAllCategories, createCategory } from '../../models/budgetCategories.js';

const budgetPage = async (req, res) => {
  const tripId = req.params.id;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).render('budget/index', { error: 'Trip not found', trip: null, items: [], categories: [] });
    if (trip.userId !== req.session.user.username) return res.status(403).render('budget/index', { error: 'Unauthorized', trip: null, items: [], categories: [] });
    const items = await getBudgetForTrip(tripId);
    let categories = await getAllCategories();
    // seed defaults if none exist
    if (!categories || categories.length === 0) {
      const defaults = [
        { name: 'Food', slug: 'food', description: 'Meals and groceries' },
        { name: 'Transport', slug: 'transport', description: 'Flights, trains, taxis' },
        { name: 'Lodging', slug: 'lodging', description: 'Hotels, hostels, rentals' },
        { name: 'Activities', slug: 'activities', description: 'Tours and experiences' },
        { name: 'Misc', slug: 'misc', description: 'Other expenses' }
      ];
      for (const c of defaults) {
        try { await createCategory(c); } catch (e) { /* ignore unique errors */ }
      }
      categories = await getAllCategories();
    }
    res.render('budget/index', { error: null, trip, items, categories });
  } catch (error) {
    res.status(500).render('budget/index', { error: error.message, trip: null, items: [], categories: [] });
  }
};

const addBudgetHandler = async (req, res) => {
  const tripId = req.params.id;
  const { categoryId, plannedAmount } = req.body;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    if (trip.userId !== req.session.user.username) return res.status(403).send('Unauthorized');
    await addBudgetItem({ tripId, categoryId, plannedAmount });
    res.redirect(`/trips/${tripId}/budget`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { budgetPage, addBudgetHandler };
const deleteBudgetHandler = async (req, res) => {
  const tripId = req.params.id;
  const itemId = req.params.itemId;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    if (trip.userId !== req.session.user.username) return res.status(403).send('Unauthorized');
    // delete budget item
    const { deleteBudgetItem } = await import('../../models/tripBudgets.js');
    await deleteBudgetItem(itemId);
    res.redirect(`/trips/${tripId}/budget`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { deleteBudgetHandler };

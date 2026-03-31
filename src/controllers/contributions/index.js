import { addContribution } from '../../models/contributions.js';
import { getTripById } from '../../models/trips.js';

const addDonationHandler = async (req, res) => {
  const tripId = req.params.id;
  const { amount: amountRaw, message } = req.body;
  const amount = Number(amountRaw);
  try {
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).render('trips/details', { error: 'Please enter a valid donation amount.', trip: await getTripById(tripId) });
    }

    const contributor = req.session.user ? req.session.user.username : null;
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');

    const contrib = await addContribution({ tripId, contributorUserId: contributor, amount, type: 'donation', message });
    console.log('Contribution recorded:', contrib);
    res.redirect(`/trips/${tripId}`);
  } catch (error) {
    console.error('Donation error:', error && error.message ? error.message : error);
    res.status(400).render('trips/details', { error: error.message || 'Failed to record donation', trip: await getTripById(tripId) });
  }
};

export { addDonationHandler };

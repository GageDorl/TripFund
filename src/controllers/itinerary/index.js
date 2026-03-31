import { getTripById } from '../../models/trips.js';
import { getItineraryForTrip, addItineraryItem } from '../../models/itinerary.js';

const itineraryPage = async (req, res) => {
  const tripId = req.params.id;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).render('itinerary/index', { error: 'Trip not found', items: [] });
    if (trip.userId !== req.session.user.username) {
      return res.status(403).render('itinerary/index', { error: 'Unauthorized', items: [] });
    }
    const items = await getItineraryForTrip(tripId);
    res.render('itinerary/index', { error: null, trip, items });
  } catch (error) {
    res.status(500).render('itinerary/index', { error: error.message, items: [] });
  }
};

const addItineraryHandler = async (req, res) => {
  const tripId = req.params.id;
  const { dayNumber, title, location, notes, estimatedCost, activityTime } = req.body;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    if (trip.userId !== req.session.user.username) return res.status(403).send('Unauthorized');
    await addItineraryItem({ tripId, dayNumber, title, location, notes, estimatedCost, activityTime });
    res.redirect(`/trips/${tripId}/itinerary`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { itineraryPage, addItineraryHandler };

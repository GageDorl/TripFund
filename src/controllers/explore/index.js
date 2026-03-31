import { sql } from '../../middleware/db.js';
import { getAllTrips } from '../../models/trips.js';
import formatDate from '../../utils/formatDate.js';

const tripsExplorePage = async (req, res) => {
  try {
    const trips = await getAllTrips();
    const formatted = (trips || []).map(t => ({
      ...t,
      startDate: formatDate(t.startDate),
      endDate: formatDate(t.endDate)
    }));
    res.render('explore/trips', { trips: formatted, error: null });
  } catch (error) {
    res.status(500).render('explore/trips', { trips: [], error: error.message });
  }
};

const recapsExplorePage = async (req, res) => {
  try {
    const rows = await sql`SELECT r.*, t.name as trip_name, t.destination as trip_destination FROM recaps r JOIN trips t ON t.id = r.trip_id ORDER BY r.posted_at DESC`;
    const recaps = (rows || []).map(r => ({
      id: r.id,
      tripId: r.trip_id,
      tripName: r.trip_name,
      tripDestination: r.trip_destination,
      title: r.title,
      postedAt: formatDate(r.posted_at)
    }));
    res.render('explore/recaps', { recaps, error: null });
  } catch (error) {
    res.status(500).render('explore/recaps', { recaps: [], error: error.message });
  }
};

export { tripsExplorePage, recapsExplorePage };

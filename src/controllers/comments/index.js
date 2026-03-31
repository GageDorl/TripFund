import { addComment, getCommentsForTrip, findCommentById, deleteComment } from '../../models/comments.js';
import { getTripById } from '../../models/trips.js';

const commentsForTrip = async (req, res) => {
  const tripId = req.params.id;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    const comments = await getCommentsForTrip(tripId);
    res.render('itinerary/index', { trip, items: [], comments }); // placeholder: you can render comments into appropriate view
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const postCommentHandler = async (req, res) => {
  const tripId = req.params.id;
  const { body, parentId } = req.body;
  try {
    const comment = await addComment({ tripId, userId: req.session.user.username, body, parentId });
    res.redirect(`/trips/${tripId}#comments`);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export { commentsForTrip, postCommentHandler };

const deleteCommentHandler = async (req, res) => {
  const tripId = req.params.id;
  const commentId = req.params.commentId;
  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).send('Trip not found');
    const comment = await findCommentById(commentId);
    if (!comment) return res.status(404).send('Comment not found');
    const current = req.session.user && req.session.user.username;
    // allow if comment author or trip owner
    if (current !== comment.userId && current !== trip.userId) {
      return res.status(403).send('Forbidden');
    }
    await deleteComment(commentId);
    return res.redirect(`/trips/${tripId}#comments`);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

export { deleteCommentHandler };

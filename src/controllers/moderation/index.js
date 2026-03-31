import { getOpenReports, updateReportStatus } from '../../models/reports.js';
import { deleteTrip, getTripById } from '../../models/trips.js';
import { deleteComment, findCommentById } from '../../models/comments.js';

const moderationQueue = async (req, res) => {
  try {
    const reports = await getOpenReports();
    // enrich reports with trip name, reporter, and trip link when possible
    const enriched = [];
    for (const r of reports) {
      const item = { ...r };
      item.reportedBy = r.reportedBy || r.reported_by || 'Unknown';
      item.targetType = r.targetType || r.target_type;
      item.targetId = r.targetId || r.target_id;
      item.tripName = null;
      item.tripLink = null;
      if (item.targetType === 'trip') {
        const trip = await getTripById(item.targetId);
        if (trip) {
          item.tripName = trip.name;
          item.tripLink = `/trips/${trip.id}`;
        }
      } else if (item.targetType === 'comment') {
        const comment = await findCommentById(item.targetId);
        if (comment && comment.tripId) {
          const trip = await getTripById(comment.tripId);
          if (trip) {
            item.tripName = trip.name;
            item.tripLink = `/trips/${trip.id}`;
          }
          item.commentBody = comment.body;
        }
      }
      enriched.push(item);
    }
    res.render('moderation/index', { reports: enriched });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const resolveReportHandler = async (req, res) => {
  const reportId = req.params.id;
  const { action } = req.body; // action: dismiss | delete-target
  try {
    // fetch report row is not necessary here; decision based on action
    if (action === 'delete-target') {
      // load report to get target
      // for simplicity, fetch via SQL inline
      // but we can call getReportsForTarget if needed
      // Use raw query to get the report
    }
    if (action === 'dismiss') {
      await updateReportStatus(reportId, 'dismissed');
      return res.redirect('/moderation/reports');
    }

    // handle delete-target: retrieve report row
    const sql = (await import('../../middleware/db.js')).sql;
    const rows = await sql`SELECT * FROM reports WHERE id = ${reportId} LIMIT 1`;
    const report = rows[0];
    if (!report) return res.status(404).send('Report not found');

    const targetType = report.target_type;
    const targetId = report.target_id;
    if (targetType === 'trip') {
      await deleteTrip(targetId);
    } else if (targetType === 'comment') {
      await deleteComment(targetId);
    }
    await updateReportStatus(reportId, 'resolved');
    return res.redirect('/moderation/reports');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export { moderationQueue, resolveReportHandler };

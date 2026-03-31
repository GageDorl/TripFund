import { createReport, getReportsForTarget } from '../../models/reports.js';

const createReportHandler = async (req, res) => {
  const { targetType, targetId, reason, details } = req.body;
  try {
    const report = await createReport({ targetType, targetId, reportedBy: req.session.user && req.session.user.username, reason, details });
    res.redirect(req.get('Referer') || '/');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export { createReportHandler, getReportsForTarget };

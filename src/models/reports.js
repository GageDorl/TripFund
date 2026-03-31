import { v4 as uuidv4 } from 'uuid';
import { sql } from '../middleware/db.js';

const mapRow = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    reportedBy: r.reported_by,
    reason: r.reason,
    details: r.details,
    status: r.status,
    createdAt: r.created_at
  };
};

const createReport = async ({ targetType, targetId, reportedBy, reason, details }) => {
  if (!targetType || !targetId) throw new Error('targetType and targetId required');
  const id = uuidv4();
  const rows = await sql`INSERT INTO reports (id, target_type, target_id, reported_by, reason, details) VALUES (${id}, ${targetType}, ${targetId}, ${reportedBy || null}, ${reason || null}, ${details || null}) RETURNING *`;
  return mapRow(rows[0]);
};

const getReportsForTarget = async ({ targetType, targetId }) => {
  const rows = await sql`SELECT * FROM reports WHERE target_type = ${targetType} AND target_id = ${targetId} ORDER BY created_at DESC`;
  return rows.map(mapRow);
};

const getOpenReports = async () => {
  const rows = await sql`SELECT * FROM reports WHERE status = 'open' ORDER BY created_at DESC`;
  return rows.map(mapRow);
};

const updateReportStatus = async (id, status) => {
  const rows = await sql`UPDATE reports SET status = ${status} WHERE id = ${id} RETURNING *`;
  return mapRow(rows[0]);
};

export { createReport, getReportsForTarget, getOpenReports, updateReportStatus };

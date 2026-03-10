const pool = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");
const { buildScopeWhere } = require("../../middleware/scopeFilter");
const { generateCode } = require("../../utils/idGenerator");

function normalizeMySQLDateTime(value) {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

exports.list = asyncHandler(async (req, res) => {
  const { where, params } = buildScopeWhere(req.user, "t");
  const { zone_id, branch_id, assigned_to, month, customer_name, l2_status, order_status } = req.query;

  let sql = `SELECT t.* FROM l2_feasibility t WHERE ${where}`;
  const queryParams = [...params];

  if (zone_id) {
    sql += ` AND t.zone_id = ?`;
    queryParams.push(zone_id);
  }

  if (branch_id) {
    sql += ` AND t.branch_id = ?`;
    queryParams.push(branch_id);
  }

  if (assigned_to) {
    sql += ` AND t.assigned_to = ?`;
    queryParams.push(assigned_to);
  }

  if (customer_name) {
    sql += ` AND t.customer_name LIKE ?`;
    queryParams.push(`%${customer_name}%`);
  }

  if (month) {
    sql += ` AND MONTH(t.date) = ?`;
    queryParams.push(month);
  }

  if (l2_status) {
    sql += ` AND t.l2_status = ?`;
    queryParams.push(l2_status);
  }

  if (order_status) {
    sql += ` AND t.order_status = ?`;
    queryParams.push(order_status);
  }

  sql += ` ORDER BY t.id DESC LIMIT 300`;

  const [rows] = await pool.query(sql, queryParams);
  res.json({ data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const u = req.user;
  const b = req.body || {};

  if (!b.date || !b.customer_name) {
    return res.status(400).json({ message: "date and customer_name required" });
  }

  const ticket_id = b.ticket_id || await generateCode(pool, "l2_feasibility", "L2");
  const zoneId = b.zone_id || u.zone_id || 1;
  const branchId = b.branch_id || u.branch_id || 1;

  const [r] = await pool.query(
    `INSERT INTO l2_feasibility
      (ticket_id, date, customer_name, mobile, location, sales_person_id,
       l2_status, order_status, sales_follow_status, last_discussion_time,
       zone_id, branch_id, created_by, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticket_id,
      b.date,
      b.customer_name,
      b.mobile || null,
      b.location || null,
      b.sales_person_id || null,
      b.l2_status || null,
      b.order_status || null,
      b.sales_follow_status || null,
      normalizeMySQLDateTime(b.last_discussion_time),
      zoneId,
      branchId,
      u.id,
      b.assigned_to || null
    ]
  );

  res.json({ id: r.insertId, ticket_id, message: "Created" });
});

exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  const { where, params } = buildScopeWhere(req.user, "t");

  const [chk] = await pool.query(
    `SELECT t.id FROM l2_feasibility t WHERE t.id=? AND ${where}`,
    [id, ...params]
  );

  if (!chk.length) {
    return res.status(404).json({ message: "Not found / no access" });
  }

  await pool.query(
    `UPDATE l2_feasibility
     SET customer_name=?, mobile=?, location=?, sales_person_id=?, l2_status=?, order_status=?,
         sales_follow_status=?, last_discussion_time=?, assigned_to=?, zone_id=?, branch_id=?
     WHERE id=?`,
    [
      b.customer_name || null,
      b.mobile || null,
      b.location || null,
      b.sales_person_id || null,
      b.l2_status || null,
      b.order_status || null,
      b.sales_follow_status || null,
      normalizeMySQLDateTime(b.last_discussion_time),
      b.assigned_to || null,
      b.zone_id || null,
      b.branch_id || null,
      id
    ]
  );

  res.json({ message: "Updated" });
});

exports.assign = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { assigned_to } = req.body || {};

  if (!assigned_to) {
    return res.status(400).json({ message: "assigned_to required" });
  }

  const { where, params } = buildScopeWhere(req.user, "t");
  const [chk] = await pool.query(
    `SELECT t.id FROM l2_feasibility t WHERE t.id=? AND ${where}`,
    [id, ...params]
  );

  if (!chk.length) {
    return res.status(404).json({ message: "Not found / no access" });
  }

  await pool.query(`UPDATE l2_feasibility SET assigned_to=? WHERE id=?`, [assigned_to, id]);
  res.json({ message: "Assigned" });
});
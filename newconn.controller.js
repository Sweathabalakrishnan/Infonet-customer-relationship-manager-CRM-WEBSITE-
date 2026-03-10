const pool = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");
const { buildScopeWhere } = require("../../middleware/scopeFilter");
const { generateCode } = require("../../utils/idGenerator");

exports.list = asyncHandler(async (req, res) => {
  const { where, params } = buildScopeWhere(req.user, "t");
  const { zone_id, branch_id, assigned_to, month, week, lead_id, plan, connection_type, connection_mode, payment_mode } = req.query;

  let sql = `SELECT t.* FROM new_connection_commitment t WHERE ${where}`;
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

  if (month) {
    sql += ` AND t.month = ?`;
    queryParams.push(month);
  }

  if (week) {
    sql += ` AND t.week LIKE ?`;
    queryParams.push(`%${week}%`);
  }

  if (lead_id) {
    sql += ` AND t.lead_id LIKE ?`;
    queryParams.push(`%${lead_id}%`);
  }

  if (plan) {
    sql += ` AND t.plan = ?`;
    queryParams.push(plan);
  }

  if (connection_type) {
    sql += ` AND t.connection_type = ?`;
    queryParams.push(connection_type);
  }

  if (connection_mode) {
    sql += ` AND t.connection_mode = ?`;
    queryParams.push(connection_mode);
  }

  if (payment_mode) {
    sql += ` AND t.payment_mode = ?`;
    queryParams.push(payment_mode);
  }

  sql += ` ORDER BY t.id DESC LIMIT 300`;

  const [rows] = await pool.query(sql, queryParams);
  res.json({ data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const u = req.user;
  const b = req.body || {};

  if (!b.month || !b.week) {
    return res.status(400).json({ message: "month and week required" });
  }

  const lead_id = b.lead_id || await generateCode(pool, "new_connection_commitment", "NC");
  const zoneId = b.zone_id || u.zone_id || 1;
  const branchId = b.branch_id || u.branch_id || 1;

  const [r] = await pool.query(
    `INSERT INTO new_connection_commitment
      (month, week, ft_user_id, lead_id, plan, plan_amount, connection_type, connection_mode,
       payment_mode, zone_id, branch_id, created_by, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.month,
      b.week,
      b.ft_user_id || u.id,
      lead_id,
      b.plan || null,
      b.plan_amount || 0,
      b.connection_type || null,
      b.connection_mode || null,
      b.payment_mode || null,
      zoneId,
      branchId,
      u.id,
      b.assigned_to || null
    ]
  );

  res.json({ id: r.insertId, lead_id, message: "Created" });
});

exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  const { where, params } = buildScopeWhere(req.user, "t");

  const [chk] = await pool.query(
    `SELECT t.id FROM new_connection_commitment t WHERE t.id=? AND ${where}`,
    [id, ...params]
  );

  if (!chk.length) {
    return res.status(404).json({ message: "Not found / no access" });
  }

  await pool.query(
    `UPDATE new_connection_commitment
     SET month=?, week=?, ft_user_id=?, plan=?, plan_amount=?, connection_type=?, connection_mode=?,
         payment_mode=?, assigned_to=?, zone_id=?, branch_id=?
     WHERE id=?`,
    [
      b.month || null,
      b.week || null,
      b.ft_user_id || null,
      b.plan || null,
      b.plan_amount || 0,
      b.connection_type || null,
      b.connection_mode || null,
      b.payment_mode || null,
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
    `SELECT t.id FROM new_connection_commitment t WHERE t.id=? AND ${where}`,
    [id, ...params]
  );

  if (!chk.length) {
    return res.status(404).json({ message: "Not found / no access" });
  }

  await pool.query(`UPDATE new_connection_commitment SET assigned_to=? WHERE id=?`, [assigned_to, id]);
  res.json({ message: "Assigned" });
});
const pool = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");
const { buildScopeWhere } = require("../../middleware/scopeFilter");
const { generateCode } = require("../../utils/idGenerator");

exports.list = asyncHandler(async (req, res) => {
  const { where, params } = buildScopeWhere(req.user, "t");
  const { zone_id, branch_id, month, week, assigned_to, customer_name } = req.query;

  let sql = `SELECT t.* FROM tech_ref_leads t WHERE ${where}`;
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
    sql += ` AND MONTH(t.lead_date) = ?`;
    queryParams.push(month);
  }

  sql += ` ORDER BY t.id DESC LIMIT 300`;

  const [rows] = await pool.query(sql, queryParams);
  res.json({ data: rows });
});

exports.create = asyncHandler(async (req, res) => {
  const u = req.user;
  const b = req.body || {};

  if (!b.lead_date || !b.customer_name) {
    return res.status(400).json({ message: "lead_date and customer_name required" });
  }

  const tech_ref_id = b.tech_ref_id || await generateCode(pool, "tech_ref_leads", "TRL");
  const zoneId = b.zone_id || u.zone_id || 1;
  const branchId = b.branch_id || u.branch_id || 1;

  const [r] = await pool.query(
    `INSERT INTO tech_ref_leads
      (tech_ref_id, lead_date, customer_name, mobile, location, plan, plan_value, sales_follow_status, updates,
       zone_id, branch_id, created_by, assigned_to, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tech_ref_id,
      b.lead_date,
      b.customer_name,
      b.mobile || null,
      b.location || null,
      b.plan || null,
      b.plan_value || 0,
      b.sales_follow_status || null,
      b.updates || null,
      zoneId,
      branchId,
      u.id,
      b.assigned_to || null,
      b.status || "OPEN"
    ]
  );

  res.json({ id: r.insertId, tech_ref_id, message: "Created" });
});

exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  const { where, params } = buildScopeWhere(req.user, "t");

  const [chk] = await pool.query(
    `SELECT t.id FROM tech_ref_leads t WHERE t.id=? AND ${where}`,
    [id, ...params]
  );

  if (!chk.length) return res.status(404).json({ message: "Not found / no access" });

  await pool.query(
    `UPDATE tech_ref_leads
     SET customer_name=?, mobile=?, location=?, plan=?, plan_value=?, sales_follow_status=?, updates=?,
         assigned_to=?, zone_id=?, branch_id=?, status=?
     WHERE id=?`,
    [
      b.customer_name || null,
      b.mobile || null,
      b.location || null,
      b.plan || null,
      b.plan_value || 0,
      b.sales_follow_status || null,
      b.updates || null,
      b.assigned_to || null,
      b.zone_id || null,
      b.branch_id || null,
      b.status || "OPEN",
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
    `SELECT t.id FROM tech_ref_leads t WHERE t.id=? AND ${where}`,
    [id, ...params]
  );

  if (!chk.length) return res.status(404).json({ message: "Not found / no access" });

  await pool.query(`UPDATE tech_ref_leads SET assigned_to=? WHERE id=?`, [assigned_to, id]);
  res.json({ message: "Assigned" });
});
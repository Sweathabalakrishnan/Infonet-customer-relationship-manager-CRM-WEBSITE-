function pad(n, size = 5) {
  return String(n).padStart(size, "0");
}

/**
 * Generate IDs like: TRL-00001, L2-00001, NC-00001, RE-00001, UP-00001
 * Uses table max(id) + 1 (simple and works fine for small/medium usage).
 */
async function generateCode(pool, tableName, prefix) {
  const [rows] = await pool.query(`SELECT IFNULL(MAX(id),0) AS maxId FROM ${tableName}`);
  const next = Number(rows[0].maxId) + 1;
  return `${prefix}-${pad(next)}`;
}

module.exports = { generateCode };
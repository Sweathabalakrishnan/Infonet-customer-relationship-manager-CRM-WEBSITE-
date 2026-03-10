require("dotenv").config();

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

module.exports = {
  PORT: process.env.PORT || 4000,
  DB_HOST: must("DB_HOST"),
  DB_USER: must("DB_USER"),
  DB_PASS: must("DB_PASS"),
  DB_NAME: must("DB_NAME"),
  JWT_SECRET: must("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 10)
};
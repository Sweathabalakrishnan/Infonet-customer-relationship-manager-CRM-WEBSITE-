const env = require("./config/env");
const app = require("./app");

app.listen(env.PORT, () => {
  console.log(`CRM API running on port ${env.PORT}`);
});
const router = require("express").Router();
const auth = require("../../middleware/auth");
const c = require("./master.controller");

router.use(auth);

router.get("/zones", c.zones);
router.get("/branches", c.branches);
router.get("/plans", c.plans);
router.get("/users-lite", c.usersLite);

module.exports = router;
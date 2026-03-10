const router = require("express").Router();
const auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");
const c = require("./react.controller");

router.use(auth);

router.get("/", c.list);
router.post("/", authorize("SALES", "ADMIN"), c.create);
router.put("/:id", c.update);
router.post("/:id/assign", authorize("ADMIN", "ZONE_MANAGER", "BRANCH_MANAGER"), c.assign);

module.exports = router;
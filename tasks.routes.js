const router = require("express").Router();
const auth = require("../../middleware/auth");
const c = require("./tasks.controller");

router.use(auth);

router.get("/", c.list);
router.post("/", c.create);
router.put("/:id", c.update);

module.exports = router;
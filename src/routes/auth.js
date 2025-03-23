const express = require("express");
const router = express.Router();
const { handleLogin } = require("../controller/authController");

router.post("/", handleLogin);

module.exports = router;

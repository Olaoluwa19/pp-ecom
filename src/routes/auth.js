const express = require("express");
const router = express.Router();
const passport = require("passport");
const { handleLogin } = require("../controller/authController");

router.post("/", handleLogin);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Forces account selection
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:8000/404",
  }),
  (req, res) => {
    res.redirect("http://localhost:8000");
    console.log("User authenticated with google successfully");
  }
);

module.exports = router;

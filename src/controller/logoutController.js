const User = require("../model/User");
const { responseMessage } = require("../services/utils");

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  //
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return responseMessage(res, 200, false, "No JWT cookies found"); // No content
  const refreshToken = cookies.jwt;

  // is refreshToken in db
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return responseMessage(res, 200, false, "No cookies found in DB.");
  }

  // delete refreshToken in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  }); // secure: true - only serves on http
  responseMessage(
    res,
    200,
    true,
    "Successfully cleared refreshtoken. Logout successfully."
  );
};

const handleGoogleLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Internal server error");
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Internal server error");
      }

      // Clear the session cookie on the client
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: false, // Match sessionConfig
        sameSite: "None",
      });

      res.redirect("/");
      console.log("Google logout successfully.");
    });
  });
};

module.exports = { handleLogout, handleGoogleLogout };

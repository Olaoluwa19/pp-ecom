const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, email, phone, password } = req.body;
  // Use user, email, or phone (whichever is provided)
  const loginIdentifier = user || email || phone;
  if (!loginIdentifier)
    return res
      .status(400)
      .json({ message: "enter a valid email or mobile to login." });

  if (!password)
    return res.status(400).json({ message: "enter your password to login." });

  const foundUser = await User.findOne({
    $or: [{ phone: loginIdentifier }, { email: loginIdentifier }],
  }).exec();

  if (!foundUser)
    return res.status(401).json({
      message: "Incorrect phone number or email",
    }); // Unauthorised

  // Evaluate password
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    //create JWT's
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.email || foundUser.phone,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.email || foundUser.phone },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    // secure: true
    res.json({ accessToken });
  } else {
    return res.status(401).json({
      message: "Incorrect password",
    });
  }
};

module.exports = { handleLogin };

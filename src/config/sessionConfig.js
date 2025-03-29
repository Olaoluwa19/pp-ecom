require("dotenv").config();

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: false, // set to true if your using https
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: true,
};

module.exports = sessionConfig;

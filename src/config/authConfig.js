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

const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/google/callback",
};

module.exports = { sessionConfig, googleConfig };

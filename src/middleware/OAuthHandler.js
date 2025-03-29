const { googleConfig } = require("../config/authConfig");

const googleLogin = (passport, GoogleStrategy) => {
  passport.use(
    new GoogleStrategy(
      googleConfig,
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  // serialize user
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

module.exports = googleLogin;

const validatePassword = (password, res) => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  if (!regex.test(password)) {
    responseMessage(
      res,
      400,
      false,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    );
  }
};

const responseMessage = (res, resStat, sucStat, resMsg) => {
  return res.status(resStat).json({
    success: `${sucStat}`,
    message: `${resMsg}`,
  });
};

module.exports = { validatePassword, validatePasswordDigit, responseMessage };

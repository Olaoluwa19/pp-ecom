const validatePassword = (password) => {
  const regex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
  return regex.test(password);
};

const responseMessage = (res, resStat, sucStat, resMsg) => {
  res.status(resStat).json({
    success: sucStat,
    message: resMsg,
  });
};

module.exports = {
  validatePassword,
  responseMessage,
};

const mongoose = require("mongoose");

const validMongooseId = (id) => {
  return mongoose.isValidObjectId(id);
};

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

const getImage = async (req) => {
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  return `${basePath}${fileName}`;
};

const getGalleryImages = async (req) => {
  const files = req.body.files;
  let images = [];

  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

  if (files) {
    images = files.map((image) => {
      return `${basePath}${image}`;
    });
  }

  return images;
};

module.exports = {
  validMongooseId,
  validatePassword,
  responseMessage,
  getImage,
  getGalleryImages,
};

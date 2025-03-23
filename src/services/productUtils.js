const Product = require("../models/Product");
const Category = require("../model/apiModel/Category");
const mongoose = require("mongoose");

const validMongooseId = (id) => {
  return mongoose.isValidObjectId({ _id: id });
};

const findProduct = async () => {
  return await Product.find().populate("category");
};

const getImage = async (request) => {
  const fileName = request.file.filename;
  const basePath = `${request.protocol}://${request.get(
    "host"
  )}/public/upload/`;
  return `${basePath}${fileName}`;
};

const findUserById = async (userId) => {
  return await User.findOne({ _id: userId }).exec();
};

const findCategoryById = async (catId) => {
  return await Category.findOne({ _id: catId }).exec();
};

const createProductFields = async (req, userId, image, catId) => {
  return await Product.create({
    user: userId,
    name: req.body.name,
    image,
    description: req.body.description,
    richDescription: req.body.richDescription,
    brand: req.body.brand,
    price: req.body.price,
    category: catId,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
};

module.exports = {
  validMongooseId,
  findProduct,
  getImage,
  findUserById,
  findCategoryById,
  createProductFields,
};

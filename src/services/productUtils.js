const Product = require("../model/apiModel/Product");
const Category = require("../model/apiModel/Category");
const User = require("../model/User");
const mongoose = require("mongoose");

const validMongooseId = (id) => {
  return mongoose.isValidObjectId(id);
};

const findProductAndPopulateCategory = async () => {
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

const createProductFields = async (req, image) => {
  return await Product.create({
    user: req.body.user,
    name: req.body.name,
    image,
    description: req.body.description,
    richDescription: req.body.richDescription,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
};

const populateProductCategoryField = async (obj) => {
  return await Product.findOne({ _id: obj._id }).populate("category").exec();
};

module.exports = {
  validMongooseId,
  findProductAndPopulateCategory,
  getImage,
  findUserById,
  findCategoryById,
  createProductFields,
  populateProductCategoryField,
};

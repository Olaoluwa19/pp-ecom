const Product = require("../model/apiModel/Product");
const User = require("../model/User");

const findProductbyId = async (id) => {
  return await Product.findOne({ _id: id }).exec();
};

const findAllProductsAndPopulateCategory = async () => {
  return await Product.find().populate("category");
};

const findUserById = async (userId) => {
  return await User.findOne({ _id: userId }).exec();
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

const updateProductImages = async (req, product, imagePath) => {
  product.images = imagePath;

  return await product.save();
};

module.exports = {
  findProductbyId,
  findAllProductsAndPopulateCategory,
  findUserById,
  createProductFields,
  populateProductCategoryField,
  updateProductImages,
};

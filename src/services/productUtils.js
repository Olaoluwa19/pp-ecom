const Product = require("../model/apiModel/Product");
const User = require("../model/User");

const findProductById = async (id) => {
  return await Product.findOne({ _id: id }).exec();
};

const findAllProductsAndPopulateCategory = async () => {
  return await Product.find().populate("category");
};

const createProductFields = async (req, image) => {
  return await Product.create({
    seller: req.body.seller,
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

const updateProductFields = async (req, product, image, images, catId) => {
  if (req?.body?.name) product.name = req.body.name;
  if (req?.body?.image) product.image = image;
  if (req?.body?.images) product.images = images;
  if (req?.body?.description) product.description = req.body.description;
  if (req?.body?.richDescription)
    product.richDescription = req.body.richDescription;
  if (req?.body?.brand) product.brand = req.body.brand;
  if (req?.body?.price) product.price = req.body.price;
  if (req?.body?.category) product.category = catId;
  if (req?.body?.countInStock) product.countInStock = req.body.countInStock;
  if (req?.body?.rating) product.rating = req.body.rating;
  if (req?.body?.numReviews) product.numReviews = req.body.numReviews;
  if (req?.body?.isFeatured) product.isFeatured = req.body.isFeatured;
  return await product.save();
};

const populateProductCategoryField = async (obj) => {
  return await Product.findOne({ _id: obj._id }).populate("category").exec();
};

const updateProductImages = async (req, product, imagePath) => {
  product.images = imagePath;

  return await product.save();
};

module.exports = {
  findProductById,
  findAllProductsAndPopulateCategory,
  createProductFields,
  updateProductFields,
  populateProductCategoryField,
  updateProductImages,
};

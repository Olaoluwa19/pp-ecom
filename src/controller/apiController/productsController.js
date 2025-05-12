const mongoose = require("mongoose");
const Product = require("../../model/apiModel/Product");
const {
  findProductById,
  findAllProductsAndPopulateCategory,
  createProductFields,
  updateProductFields,
  populateProductCategoryField,
  updateProductImages,
} = require("../../services/productUtils");

const { findUserById } = require("../../services/userUtils");

const { findCategoryById } = require("../../services/categoryUtils");
const {
  validMongooseId,
  responseMessage,
  serverErrorMessage,
  getImage,
  getGalleryImages,
} = require("../../services/utils");

const getAllProduct = async (req, res) => {
  try {
    // find all products
    const products = await findAllProductsAndPopulateCategory();
    if (!products) {
      return responseMessage(res, 204, false, "No Products found.");
    }
    const productsCount = products.length;

    res.json({ productsCount, products });
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const createNewProduct = async (req, res) => {
  const { seller, name, description, countInStock, category } = req.body;

  // check for required fields
  if (!seller || !name || !description || !countInStock || !category) {
    return responseMessage(res, 400, false, "Required fields are missing");
  }

  // get image file
  const file = req.file;
  if (!file)
    return responseMessage(res, 400, false, "No image files detected.");

  // check if uder ID is valid
  if (!validMongooseId(seller))
    return responseMessage(res, 400, false, `Invalid seller ID: ${seller}.`);

  // check if seller exists
  const validSeller = await findUserById(seller);
  if (!validSeller)
    return responseMessage(
      res,
      400,
      false,
      "No Seller matches the ID provided"
    );

  // check if category ID is valid
  if (!validMongooseId(category))
    return responseMessage(
      res,
      400,
      false,
      `Invalid category ID: ${category}.`
    );

  // check if category exists
  const validCategory = await findCategoryById(category);
  if (!validCategory)
    return responseMessage(
      res,
      400,
      false,
      "No Category matches the ID provided"
    );

  const uploadedImage = await getImage(req);
  try {
    const result = await createProductFields(req, uploadedImage);

    const populatedResult = await populateProductCategoryField(result);
    console.log(populatedResult);
    res.status(201).json(populatedResult);
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const updateProduct = async (req, res) => {
  const { id, category } = req.body;
  if (!id) return responseMessage(res, 400, false, "product ID is required");

  if (!validMongooseId(id))
    return responseMessage(
      res,
      400,
      false,
      `Product ID: ${id} is not a valid ID.`
    );

  if (!validMongooseId(category))
    return responseMessage(
      res,
      400,
      false,
      `Category ID: ${category} is not a valid ID.`
    );

  const product = await findProductById(id);
  if (!product) {
    return responseMessage(res, 400, false, `No product matches the ID ${id}.`);
  }

  const validCat = await findCategoryById(category);
  if (!validCat) {
    return responseMessage(
      res,
      400,
      false,
      `No category ID matches the ID: ${category}.`
    );
  }

  let file = req.file || req.files;
  if (!file) return responseMessage(res, 400, false, "No file detected.");

  const image = await getImage(req);

  const uploadedImages = await getGalleryImages(req);
  try {
    const result = await updateProductFields(
      req,
      product,
      image,
      uploadedImages,
      category
    );
    res.json(result);
  } catch (error) {
    serverErrorMessage(res, error);
  }
};

const deleteProduct = async (req, res) => {
  if (!req?.body?.id)
    return responseMessage(res, 400, false, "Product ID is required.");

  if (!validMongooseId(req.body.id))
    return responseMessage(
      res,
      400,
      false,
      `Invalid product ID: ${req.body.id}.`
    );

  const product = await Product.findOne({ _id: req.body.id }).exec();
  if (!product) {
    return responseMessage(
      res,
      400,
      false,
      `No product matches the ID ${req.body.id}.`
    );
  }

  const result = await product.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getFeaturedProduct = async (req, res) => {
  const count = req?.params?.count ? req.params.count : 0;
  const numberOfFeaturedProduct = await Product.countDocuments({
    isFeatured: true,
  });

  try {
    const featureProducts = await Product.find({ isFeatured: true }).limit(
      count
    );
    if (featureProducts === 0) {
      return res.status(404).json({ error: "No Featured Products found" });
    }
    if (numberOfFeaturedProduct < count) {
      return res.status(404).json({
        error: `You dont have up to ${count} Featured product. You only have ${numberOfFeaturedProduct} Featured product.`,
      });
    }

    res.json({ numberOfFeaturedProduct, featureProducts });
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const getProductCategory = async (req, res) => {
  let filter = {};
  if (req?.query?.categories) {
    const categories = req.query.categories.split(",");
    if (!categories.every(mongoose.isValidObjectId)) {
      return res.status(400).json({
        message: `${req.query.categories} contains an invalid category ID.`,
      });
    }
    filter = {
      category: {
        $in: categories.map((id) => new mongoose.Types.ObjectId(id)),
      },
    };
  }
  const productCategory = await Product.find(filter).populate("category");
  res.json(productCategory);
};

const getSellerProducts = async (req, res) => {
  const { seller } = req.params;
  console.log(seller);

  if (!seller)
    return responseMessage(res, 400, false, "Seller ID is required.");

  if (!validMongooseId(seller))
    return responseMessage(
      res,
      400,
      false,
      `The ID: ${seller} provided is an invalid ID.`
    );

  try {
    const sellerProducts = await Product.find({ seller: seller })
      .populate("category")
      .sort({ createdAt: -1 })
      .exec();

    console.log(sellerProducts);
    const sellerProductCount = sellerProducts.length;

    return res.json({ sellerProductCount, sellerProducts });
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const getProduct = async (req, res) => {
  if (!req?.params?.id)
    return responseMessage(res, 400, false, "Product ID is required.");

  if (!validMongooseId(req.params.id))
    return responseMessage(
      res,
      400,
      false,
      `Invalid product ID: ${req.params.id}.`
    );

  const product = await Product.findOne({ _id: req.params.id })
    .populate("category")
    .exec();

  res.json(product);
};

module.exports = {
  getAllProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProduct,
  getProductCategory,
  getProduct,
  getSellerProducts,
};

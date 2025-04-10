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
  getImage,
  getGalleryImages,
} = require("../../services/utils");

const getAllProduct = async (req, res) => {
  // find all products
  const products = await findAllProductsAndPopulateCategory();
  if (!products) {
    return responseMessage(res, 204, false, "No Products found.");
  }

  res.json(products);
};

const createNewProduct = async (req, res) => {
  const { user, name, image, description, countInStock, category } = req.body;

  // check for required fields
  if (!user || !name || !description || !countInStock || !category) {
    return responseMessage(res, 400, false, "Required fields are missing");
  }

  // get image file
  const file = req.file;
  if (!file)
    return responseMessage(res, 400, false, "No image files detected.");

  // check if uder ID is valid
  if (!validMongooseId(user))
    return responseMessage(res, 400, false, `Invalid user ID: ${user}.`);

  // check if user exists
  const validUser = await findUserById(user);
  if (!validUser)
    return responseMessage(res, 400, false, "No User matches the ID provided");

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

  const uploadedImage = await getImage({ body: { ...image } });
  try {
    const result = await createProductFields(req, uploadedImage);

    const populatedResult = await populateProductCategoryField(result);
    console.log(populatedResult);
    res.status(201).json(populatedResult);
  } catch (error) {
    console.error(error);
    return responseMessage(res, 500, false, `Error in creating product`);
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
    console.error(error);
    return responseMessage(
      res,
      500,
      false,
      `Error in updating product: ${error.message}`
    );
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

const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();

    return responseMessage(
      res,
      200,
      true,
      `There are ${count} products in the database.`
    );
  } catch (err) {
    console.error(err);
    responseMessage(
      res,
      500,
      false,
      `Error fetching product count: ${err.message}`
    );
  }
};

const countUserProduct = async () => {
  const userid = req.params.userid;
  if (!validMongooseId(userid))
    responseMessage(
      res,
      400,
      false,
      `The ID: ${userid} provided is an invalid ID.`
    );

  try {
    const productCount = await Product.countDocuments({ user: userid });

    if (productCount)
      return responseMessage(
        res,
        200,
        false,
        `This User: ${userid} has ${productCount} products in database.`
      );
  } catch (error) {
    console.error(error);
    return responseMessage(res, 200, false, `error: ${error.message}`);
  }
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

    res.json(featureProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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

const updateGalleryImages = async (req, res) => {
  // check if product ID is present
  if (!req?.params?.id)
    return responseMessage(res, 400, false, "Product ID is required.");

  // get product by ID
  const product = await findProductById(req.params.id);
  if (!product) {
    return responseMessage(
      res,
      400,
      false,
      `No product matches the ID ${req.params.id}.`
    );
  }

  if (!validMongooseId(req.params.id))
    return responseMessage(
      res,
      400,
      false,
      `Invalid product ID: ${req.params.id}.`
    );

  // check if image files are present
  const files = req.files;
  if (!files) return responseMessage(res, 400, false, "No files detected.");
  if (files.length > 10)
    responseMessage(res, 400, false, "Maximum of 10 files allowed.");

  try {
    // get image files
    const imagePaths = await getGalleryImages(req);

    // upload images to db
    const result = await updateProductImages(req, product, imagePaths);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return responseMessage(res, 500, false, `Error in uploading image gallery`);
  }
};

const getUserProducts = async (req, res) => {
  try {
    const userid = req.params.userid;
    if (!validMongooseId(userid))
      responseMessage(
        res,
        400,
        false,
        `The ID: ${userid} provided is an invalid ID.`
      );
    const userProducts = await Product.find({ user: userid })
      .populate("category")
      .sort({ createdAt: -1 })
      .exec();
    if (!userProducts || userProducts.length === 0) {
      return responseMessage(res, 400, false, `No products found.`);
    }
    console.log(userProducts);
    res.json(userProducts);
  } catch (error) {
    console.log(error);
    return responseMessage(
      res,
      500,
      false,
      `Error fetching user products: ${error.message}`
    );
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
  getProductCount,
  countUserProduct,
  getFeaturedProduct,
  getProductCategory,
  getProduct,
  updateGalleryImages,
  getUserProducts,
};

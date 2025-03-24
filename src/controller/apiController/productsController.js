const mongoose = require("mongoose");
const Product = require("../../model/apiModel/Product");
// const uploadOptions = require("../../middleware/productImageHandler");
const {
  validMongooseId,
  findProductAndPopulateCategory,
  // getImage,
  findUserById,
  findCategoryById,
  createProductFields,
  populateProductCategoryField,
} = require("../../services/productUtils");
const Category = require("../../model/apiModel/Category");
const { responseMessage } = require("../../services/utils");

const getAllProduct = async (req, res) => {
  // find all products
  const products = await findProductAndPopulateCategory();
  if (!products) {
    return responseMessage(res, 204, false, "No Products found.");
  }

  res.json(products);
};

const createNewProduct = async (req, res) => {
  const { user, name, image, description, countInStock, category } = req.body;

  // check for required fields
  if (
    !user ||
    !name ||
    // !image ||
    !description ||
    !countInStock ||
    !category
  ) {
    return responseMessage(res, 400, false, "Required fields are missing");
  }

  // get file
  // const file = req.file;
  // if (!file) return responseMessage(res, 400, false, "No files detected.");

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

  // const uploadedImage = await getImage(req);
  try {
    const result = await createProductFields(
      req
      // uploadedImage,
    );

    const populatedResult = await populateProductCategoryField(result);
    console.log(populatedResult);
    res.status(201).json(populatedResult);
  } catch (error) {
    console.error(error);
    return responseMessage(res, 500, false, `Error in creating product`);
  }
};

const updateProduct1 = async (req, res) => {
  const { id, category } = req.body;
  if (!id)
    return res.status(400).json({ message: "product id required is required" });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: `No product ID matches ${id}.` });

  if (!mongoose.isValidObjectId(category))
    return res
      .status(400)
      .json({ message: `No category ID matches ${category}.` });

  const file = req.file;
  const files = req.files;
  let imagePaths = [];
  const fileName = req.file.filename;
  result;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  if (file) {
    result = `${basePath}${fileName}`;
  } else if (files) {
    file.map((file) => {
      imagePaths.push(`${basePath}${file.name}`);
    });
    result = imagePaths;
  } else {
    res.status(400).json({ message: "No file detected." });
  }

  try {
    const product = await Product.findOne({ _id: req.body.id }).exec();
    if (!product) {
      return res
        .status(400)
        .json({ message: `No product matches the ID ${req.body.id}.` });
    }

    if (req?.body?.name) product.name = req.body.name;
    if (req?.body?.image) product.image = result;
    if (req?.body?.images) product.image = result;
    if (req?.body?.description) product.description = req.body.description;
    if (req?.body?.richDescription)
      product.richDescription = req.body.richDescription;
    if (req?.body?.brand) product.brand = req.body.brand;
    if (req?.body?.price) product.price = req.body.price;
    if (req?.body?.category) product.category = category;
    if (req?.body?.countInStock) product.countInStock = req.body.countInStock;
    if (req?.body?.rating) product.rating = req.body.rating;
    if (req?.body?.numReviews) product.numReviews = req.body.numReviews;
    if (req?.body?.isFeatured) product.isFeatured = req.body.isFeatured;

    const result = await product.save();
    res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error in updating product` });
  }
};

const updateProduct = async (req, res) => {
  const { id, category } = req.body;
  if (!id)
    return res.status(400).json({ message: "product id required is required" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: `No product ID matches ${id}.` });
  if (!mongoose.isValidObjectId(category))
    return res
      .status(400)
      .json({ message: `No category ID matches ${category}.` });

  let file = req.file;
  if (!file) return res.status(400).json({ message: "No files detected." });

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  const uploadedImage = `${basePath}${fileName}`;
  // const files = req.files;
  // if (file) {
  //   files = [req.file];
  // }
  // let imagePaths = [];
  // if (files) {
  //   files.forEach((file) => {
  //     imagePaths.push(`${basePath}${file.fileName}`);
  //   });
  //   imageGallery = imagePaths;
  // }

  try {
    const product = await Product.findOne({ _id: id }).exec();
    if (!product) {
      return res
        .status(400)
        .json({ message: `No product matches the ID ${id}.` });
    }
    if (req?.body?.name) product.name = req.body.name;
    if (req?.body?.image) product.image = uploadedImage;
    // if (req?.body?.images) product.image = result;
    if (req?.body?.description) product.description = req.body.description;
    if (req?.body?.richDescription)
      product.richDescription = req.body.richDescription;
    if (req?.body?.brand) product.brand = req.body.brand;
    if (req?.body?.price) product.price = req.body.price;
    if (req?.body?.category) product.category = category;
    if (req?.body?.countInStock) product.countInStock = req.body.countInStock;
    if (req?.body?.rating) product.rating = req.body.rating;
    if (req?.body?.numReviews) product.numReviews = req.body.numReviews;
    if (req?.body?.isFeatured) product.isFeatured = req.body.isFeatured;
    const result = await product.save();
    res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error in updating product` });
  }
};

const deleteProduct = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "Product ID required." });

  const product = await Product.findOne({ _id: req.body.id }).exec();
  if (!product) {
    return res
      .status(204)
      .json({ message: `No product ID matches ${req.body.id}.` });
  }
  const result = await product.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: "No products found" });
    }
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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

const getProduct = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Product ID is required." });

  if (!mongoose.isValidObjectId(req.params.id))
    return res
      .status(400)
      .json({ message: `No user ID matches ${req.params.id}.` });

  const product = await Product.findOne({ _id: req.params.id })
    .populate("category")
    .exec();
  // const product = await Product.findById(req.params.id).populate("category");
  // if (!product) {
  //   return res
  //     .status(204)
  //     .json({ message: `No product ID matches ${req.params.id}.` });
  // }
  res.json(product);
};

// const getUserProducts = async (req, res) => {
//   // const product = await Product.findOne({ _id: req.params.id })

//   try {
//     if (!mongoose.isValidObjectId(req.params.userid))
//       return res
//         .status(400)
//         .json({ message: `No user ID matches ${req.params.userid}.` });

//     const userProducts = await Product.find({ user: req.params.userid })
//       .populate("category")
//       .sort({ createdAt: -1 })
//       .exec();
//     if (!userProducts) {
//       return res.status(204).json({ message: "No Products Found." });
//     }
//     console.log(userProducts);
//     res.json(userProducts);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: `${error.message}` });
//   }
// };

const getUserProducts = async (req, res) => {
  try {
    const userid = req.params.userid;
    if (!mongoose.isValidObjectId(userid)) {
      return res.status(400).json({ message: `No user ID matches ${userid}.` });
    }
    const userProducts = await Product.find({ user: userid })
      .populate("category")
      .sort({ createdAt: -1 })
      .exec();
    if (!userProducts || userProducts.length === 0) {
      return res.status(204).json({ message: "No Products Found." });
    }
    console.log(userProducts);
    res.json(userProducts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `${error.message}` });
  }
};

const handleGalleryImages = async (req, res) => {
  try {
    // const userid = req.params.user;
    // if (!mongoose.isValidObjectId(userid)) {
    //   return res.status(400).json({ message: `No user ID matches ${userid}.` });
    // }
    const product = await Product.findOne({ _id: req.body.id }).exec();
    if (!product) {
      return res
        .status(400)
        .json({ message: `No product matches the ID ${req.body.id}.` });
    }
    const files = req.files;
    let imagePaths = [];

    if (!files) return res.status(400).json({ message: "No files detected." });
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.fileName}`);
      });
    }

    if (req?.body?.images) product.images = imagePaths;

    const result = await product.save();
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: `Error in uploading image gallery` });
  }
};

module.exports = {
  getAllProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
  getFeaturedProduct,
  getProductCategory,
  getProduct,
  getUserProducts,
  handleGalleryImages,
};

// 48 : 06

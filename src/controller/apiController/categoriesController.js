const mongoose = require("mongoose");
const {
  findCategory,
  findCategoryById,
  createCategoryFields,
  deleteCategoryField,
  updateAndSaveCategoryFields,
} = require("../../services/categoryUtils");
const {
  responseMessage,
  validMongooseId,
  serverErrorMessage,
} = require("../../services/utils");
const Product = require("../../model/apiModel/Product");
const Category = require("../../model/apiModel/Category");

const getAllCategories = async (req, res) => {
  // find all categories
  const categoryList = await findCategory();
  if (!categoryList)
    return responseMessage(res, 404, false, "No Categories Found.");

  //count categories
  const categoryCount = categoryList.length;

  res.json({ categoryCount, categoryList });
};

const createNewCategory = async (req, res) => {
  // check if name is provided.
  const { name } = req.body;
  if (!name) {
    return responseMessage(res, 400, false, "Name required to create category");
  }

  const duplicateCategory = await Category.find({ name: name });
  if (duplicateCategory) {
    return responseMessage(res, 400, false, `${name} category already exists.`);
  }
  try {
    // create category field
    const result = await createCategoryFields(req);
    res.status(201).json(result);
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.body;

  // check if ID is provided.
  if (!id) {
    return responseMessage(res, 400, false, "ID parameter is required");
  }

  //check if ID is valid.
  if (!validMongooseId(id))
    return responseMessage(res, 400, false, `No Category ID matches ${id}.`);

  // check if category exists.
  const category = await findCategoryById(id);

  if (!category)
    return responseMessage(
      res,
      404,
      false,
      `Category ID: ${id} does not exist.`
    );

  try {
    //update and save Category
    const result = await updateAndSaveCategoryFields(category, req);
    res.json(result);
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;

  // check if ID is provided.
  if (!id) return responseMessage(res, 400, false, "Category ID required.");

  // check if ID is valid.
  if (!validMongooseId(id))
    return responseMessage(res, 400, false, `No Category ID matches ${id}.`);

  // find category by ID.
  const category = await findCategoryById(id);
  if (!category) {
    return responseMessage(
      res,
      404,
      false,
      `No category ID matches ${req.body.id}.`
    );
  }

  // delete category
  const result = await deleteCategoryField(id);
  res.json(result);
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  // check if ID is provided.
  if (!id) return responseMessage(res, 204, false, "Category ID required.");

  // check if ID is valid.
  if (!validMongooseId(id))
    return responseMessage(res, 400, false, `No Category ID matches ${id}.`);

  // find category by ID.
  const category = await findCategoryById(id);
  if (!category) {
    return responseMessage(res, 404, false, `No Category ID matches ${id}.`);
  }

  const products = await Product.find({ category: id });
  const productCount = products.length;

  res.json({ productCount, category });
};

module.exports = {
  getAllCategories,
  createNewCategory,
  updateCategory,
  deleteCategory,
  getCategory,
};

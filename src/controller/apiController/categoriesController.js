const mongoose = require("mongoose");
const {
  findCategory,
  findCategoryById,
  createCategoryFields,
  deleteCategoryField,
  updateAndSaveCategoryFields,
} = require("../../services/categoryUtils");
const { responseMessage } = require("../../services/utils");

const getAllCategories = async (req, res) => {
  // find all categories
  const categoryList = await findCategory();
  if (!categoryList)
    return responseMessage(res, 204, false, "No Categories Found.");

  res.json(categoryList);
};

const createNewCategory = async (req, res) => {
  // check if name is provided.
  if (!req?.body?.name) {
    return responseMessage(res, 400, false, "Name required to create category");
  }
  try {
    // create category field
    const result = await createCategoryFields(req);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return responseMessage(
      res,
      400,
      false,
      `Error creating category: ${error.message}`
    );
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.body;

  // check if ID is provided.
  if (!id) {
    return responseMessage(res, 400, false, "ID parameter is required");
  }

  //check if ID is valid.
  if (!mongoose.isValidObjectId(id))
    return responseMessage(res, 400, false, `No Category ID matches ${id}.`);

  // check if category exists.
  const category = await findCategoryById(id);

  if (!category)
    return responseMessage(res, 204, false, `No category found with ID: ${id}`);

  try {
    //update and save Category
    const result = await updateAndSaveCategoryFields(category, req);
    res.json(result);
  } catch (error) {
    console.error(error);
    return responseMessage(
      res,
      400,
      false,
      `Error updating category: ${error.message}`
    );
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;

  // check if ID is provided.
  if (!id) return responseMessage(res, 400, false, "Category ID required.");

  // check if ID is valid.
  if (!mongoose.isValidObjectId(id))
    return responseMessage(res, 400, false, `No Category ID matches ${id}.`);

  // find category by ID.
  const category = await findCategoryById(id);
  if (!category) {
    return responseMessage(
      res,
      204,
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
  if (!mongoose.isValidObjectId(id))
    return responseMessage(res, 400, false, `No Category ID matches ${id}.`);

  // find category by ID.
  const category = await findCategoryById(id);
  if (!category) {
    return responseMessage(res, 204, false, `No Category ID matches ${id}.`);
  }
  res.json(category);
};

module.exports = {
  getAllCategories,
  createNewCategory,
  updateCategory,
  deleteCategory,
  getCategory,
};

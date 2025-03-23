const Category = require("../model/apiModel/Category");

const findCategory = async () => {
  return await Category.find();
};

const findCategoryById = async (catId) => {
  return await Category.findOne({ _id: catId }).exec();
};

const createCategoryFields = async (req) => {
  const { name, icon, color } = req.body;
  return await Category.create({
    name,
    icon,
    color,
  });
};

const deleteCategoryField = async (catId) => {
  return await Category.deleteOne({ _id: catId });
};

const updateAndSaveCategoryFields = async (foundCat, req) => {
  const { name, icon, color } = req.body;
  if (name) foundCat.name = name;
  if (icon) foundCat.icon = icon;
  if (color) foundCat.color = color;
  return await foundCat.save();
};

module.exports = {
  findCategory,
  findCategoryById,
  createCategoryFields,
  deleteCategoryField,
  updateAndSaveCategoryFields,
};

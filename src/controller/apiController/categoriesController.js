const Category = require("../../model/apiModel/Category");

const getAllCategories = async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList)
    return res.status(204).json({ message: "No Categoriess Found." });

  res.json(categoryList);
};

const createNewCategory = async (req, res) => {
  if (!req?.body?.name) {
    return res
      .status(400)
      .json({ message: "Name required to create category" });
  }
  try {
    const result = await Category.create({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
  }
};

const updateCategory = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID parameter is required" });
  }

  if (req.body?.name) category.name = req.body.name;
  if (req.body?.icon) category.icon = req.body.icon;
  if (req.body?.color) category.color = req.body.color;

  const result = await category.save();
  res.json(result);
};

const deleteCategory = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "Category ID required." });

  const category = await Category.findOne({ _id: req.body.id }).exec();
  if (!category) {
    return res
      .status(204)
      .json({ message: `No category ID matches ${req.body.id}.` });
  }
  const result = await category.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getCategory = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Category ID required." });

  const category = await Category.findOne({ _id: req.params.id }).exec();
  if (!category) {
    return res
      .status(204)
      .json({ message: `No Category ID matches ${req.params.id}.` });
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

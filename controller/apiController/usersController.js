const mongoose = require("mongoose");
const User = require("../../model/User");
const bcrypt = require("bcryptjs");

const getAllUser = async (req, res) => {
  const users = await User.find().select("-password");
  if (!users) return res.status(204).json({ message: "No Users found." });
  res.json(users);
};

const updateUser = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (req?.body?.username) {
    return res
      .status(403)
      .json({ message: "You can not change your username." });
  }

  if (!mongoose.isValidObjectId(req.body.id))
    return res
      .status(400)
      .json({ message: `No user ID matches ${req.body.id}.` });

  try {
    const user = await User.findOne({ _id: req.body.id }).exec();
    const hashedPwd = await bcrypt.hash(req.body.password, 10);

    if (req?.body?.password) user.password = hashedPwd;
    if (req?.body?.email) user.email = req.body.email;
    if (req?.body?.phone) user.phone = req.body.phone;
    if (req?.body?.street) user.street = req.body.street;
    if (req?.body?.apartment) user.apartment = req.body.apartment;
    if (req?.body?.zip) user.zip = req.body.zip;
    if (req?.body?.city) user.city = req.body.city;
    if (req?.body?.country) user.country = req.body.country;

    const result = await user.save();
    res.json(result);
  } catch (error) {
    return res.json({ message: `${error.message}` });
  }
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "User ID required." });
  }
  if (!mongoose.isValidObjectId(req.body.id))
    return res
      .status(400)
      .json({ message: `No user ID matches ${req.body.id}.` });

  const user = await User.findOne({ _id: req.body.id }).exec();
  const result = await user.deleteOne({ _id: req.body.id });

  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID is required." });

  if (!mongoose.isValidObjectId(req.params.id))
    return res
      .status(400)
      .json({ message: `No user ID matches ${req.params.id}.` });

  const user = await User.findOne({ _id: req.params.id })
    .select("-password")
    .exec();

  res.json(user);
};

const filterUsers = async (req, res) => {};

module.exports = {
  getAllUser,
  updateUser,
  deleteUser,
  getUser,
  filterUsers,
};

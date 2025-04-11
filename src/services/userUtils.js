const User = require("../model/User");
const bcrypt = require("bcryptjs");

const findUserById = async (userId) => {
  return await User.findOne({ _id: userId }).exec();
};

const findUserByEmailOrPhone = async (identifier) => {
  return await User.findOne({
    $or: [{ phone: identifier }, { email: identifier }],
  }).exec();
};

const checkDuplicateUser = async (username, roles) => {
  return await User.findOne({ username: username, roles: roles }).exec();
};

const encryptPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const createUserFields = async (req, hashedPwd, addressId) => {
  return await User.create({
    username: req.body.username,
    roles: req.body.roles,
    password: hashedPwd,
    email: req.body.email,
    phone: req.body.phone,
    address: addressId,
  });
};

const updateUserFields = async (req, user, pwd, addId) => {
  if (req?.body?.password) user.password = pwd;
  if (req?.body?.email) user.email = req.body.email;
  if (req?.body?.phone) user.phone = req.body.phone;
  if (req?.body?.address) user.address = addId;

  return await user.save();
};

const deleteUserFields = async (id) => {
  return await User.deleteOne(id);
};

const getPopulatedUser = async (userId) => {
  return await User.findOne({ _id: userId })
    .select("-password")
    .populate({
      path: "address",
      select: "-_id -createdAt -updatedAt -zip -apartment",
    })
    .exec();
};

module.exports = {
  findUserById,
  findUserByEmailOrPhone,
  checkDuplicateUser,
  encryptPassword,
  createUserFields,
  updateUserFields,
  deleteUserFields,
  getPopulatedUser,
};

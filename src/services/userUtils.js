const User = require("../model/User");

const checkDuplicateUser = async (username, roles) => {
  return await User.findOne({ username: username, roles: roles }).exec();
};

const createUser = async (userData, addressId) => {
  const { username, roles, password, email, phone } = userData;
  return await User.create({
    username,
    roles,
    password,
    email,
    phone,
    address: addressId,
  });
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
  checkDuplicateUser,
  createUser,
  getPopulatedUser,
};

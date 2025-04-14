const mongoose = require("mongoose");
const User = require("../../model/User");
const { serverErrorMessage } = require("../../services/utils");
const {
  findUserById,
  encryptPassword,
  updateUserFields,
  deleteUserFields,
} = require("../../services/userUtils");
const { responseMessage, validMongooseId } = require("../../services/utils");
const {
  findAddressById,
  createAddress,
  updateAddress,
} = require("../../services/addressUtils");

const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const count = await User.countDocuments();

    // Return both count and users as a JSON object
    res.json({ count, users });
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const updateUser = async (req, res) => {
  const { id, username, password, address } = req.body;
  if (!id) {
    return responseMessage(res, 400, false, "User ID is required.");
  }

  if (username) {
    return responseMessage(
      res,
      403,
      false,
      "You can not change your username."
    );
  }

  if (!validMongooseId(id))
    return responseMessage(
      res,
      400,
      false,
      `Invalid Mongoose ID: ${id} provided`
    );

  const user = await findUserById(id);
  if (!user) return responseMessage(res, 400, false, "User not found.");

  const existingAddress = await findAddressById(user.address);

  const addressDoc = existingAddress
    ? await updateAddress({ body: { ...address } }, existingAddress)
    : await createAddress({ body: { ...address } });

  try {
    let hashedPwd;
    if (password) {
      hashedPwd = await encryptPassword(password);
    }

    const result = await updateUserFields(req, user, hashedPwd, addressDoc._id);
    const populatedUser = await User.findOne({ _id: result.id })
      .populate("address")
      .exec();
    res.json(populatedUser);
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return responseMessage(res, 400, false, "User ID is required.");
  }

  if (!validMongooseId(id))
    return responseMessage(res, 400, false, `Invalid ID: ${id} provided.`);

  const user = await findUserById(id);
  if (!user) return responseMessage(res, 400, false, "User not found.");

  try {
    const result = await deleteUserFields(user._id);

    res.json(result);
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return responseMessage(res, 400, false, "User ID is required.");

  if (!validMongooseId(id))
    return responseMessage(res, 400, false, `Invalid ID: ${id} provided.`);

  const user = await User.findOne({ _id: id }).select("-password").exec();

  res.json(user);
};

const countUserRoles = async (req, res) => {
  const { role } = req.params;
  if (!role) return responseMessage(res, 400, false, "Role is required.");

  if (![2000, 1995, 5919].includes(Number(role)))
    return responseMessage(
      res,
      400,
      false,
      `Invalid role: ${role}. Valid roles are 2000, 1995, 5919.`
    );

  try {
    const count = await User.countDocuments({ roles: role });
    const users = await User.find({ roles: role }).select("-password").exec();
    console.log(users);

    return res.json({ count, users });
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

const suspendUser = async (req, res) => {
  const { id, isSuspended } = req.body;
  if (!id) return responseMessage(res, 400, false, "User ID is required.");

  if (!validMongooseId(id))
    return responseMessage(res, 400, false, `Invalid ID: ${id} provided.`);

  const user = await findUserById(id);
  if (!user) return responseMessage(res, 400, false, "User not found.");

  try {
    if (isSuspended !== undefined) user.isSuspended = isSuspended;
    await user.save();

    return isSuspended
      ? responseMessage(
          res,
          200,
          true,
          `User: ${user.username} has been suspended`
        )
      : responseMessage(
          res,
          200,
          true,
          `User: ${user.username} has been unsuspended`
        );
  } catch (error) {
    return serverErrorMessage(res, error);
  }
};

module.exports = {
  getAllUser,
  updateUser,
  deleteUser,
  getUser,
  countUserRoles,
  suspendUser,
};

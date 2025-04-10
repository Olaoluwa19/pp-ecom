const { validatePassword, responseMessage } = require("../services/utils");
const {
  checkDuplicateUser,
  createUserFields,
  encryptPassword,
  getPopulatedUser,
} = require("../services/userUtils");
const { createAddress } = require("../services/addressUtils");

const createNewUser = async (req, res) => {
  const { username, email, phone, password, address, roles } = req.body;

  // validate user roles
  if (![2000, 1995, 5919].includes(roles)) {
    return responseMessage(res, 400, false, "Invalid role selected");
  }

  //check for missing fields
  if (!username || !email || !phone || !password || !roles) {
    return responseMessage(res, 400, false, "Missing required fields");
  }

  // check if password length greater than 6
  if (password.length < 6) {
    return responseMessage(
      res,
      400,
      false,
      "Password must be at least 6 characters"
    );
  }

  // check if password matches regex
  if (!validatePassword(password)) {
    return responseMessage(
      res,
      400,
      false,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }

  // check for duplicate user

  const duplicate = await checkDuplicateUser(username, roles);

  if (duplicate) {
    return responseMessage(
      res,
      409,
      false,
      "User already exists. Please login."
    );
    // conflict
  }

  try {
    // create address document
    const addressDoc = await createAddress({ body: { ...address } });

    // encrypt the password
    const hashedPwd = await encryptPassword(password);

    // createUserFields document
    const newUser = await createUserFields(req, hashedPwd, addressDoc._id);

    const populatedUser = await getPopulatedUser(newUser._id);

    console.log(populatedUser);
    return res.status(201).json(populatedUser);
  } catch (error) {
    console.log(error);
    return responseMessage(
      res,
      400,
      false,
      `Error creating user: ${error.message}`
    );
  }
};

module.exports = { createNewUser };

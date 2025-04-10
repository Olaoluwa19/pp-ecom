const Address = require("../model/Address");

const findAddressById = async (id) => {
  return await Address.findById(id);
};

const createAddress = async (req) => {
  return await Address.create({
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
};

const updateAddress = async (req, address) => {
  if (req?.body?.street) address.street = req.body.street;
  if (req?.body?.apartment) address.apartment = req.body.apartment;
  if (req?.body?.zip) address.zip = req.body.zip;
  if (req?.body?.city) address.city = req.body.city;
  if (req?.body?.country) address.country = req.body.country;

  return await address.save();
};

module.exports = {
  findAddressById,
  createAddress,
  updateAddress,
};

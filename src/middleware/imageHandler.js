const express = require("express");
const multer = require("multer");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const FILE_TYPE_MAP = require("../config/file_type_map");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadFolder = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(uploadFolder)) {
      await fsPromises.mkdir(uploadFolder);
    }
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, uploadFolder);
  },
  filename: async (req, file, cb) => {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });
module.exports = { uploadOptions };

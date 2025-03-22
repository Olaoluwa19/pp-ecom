// const express = require("express");
// const multer = require("multer");
// // const upload = multer({"dest": "uploads/" })

// const fs = require("fs");
// const fsPromises = require("fs").promises;
// const path = require("path");

// const FILE_TYPE_MAP = {
//   "image/png": "png",
//   "image/jpeg": "jpeg",
//   "image/jpg": "png",
// };

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const isValid = FILE_TYPE_MAP[file.mimetype];
//     let uploadError = new Error("invalid image type");
//     if (isValid) {
//       uploadError = null;
//     }
//     cb(uploadError, "public/uploads");
//   },
//   filename: (req, file, cb) => {
//     const fileName = file.originalname.split(" ").join("-");
//     const extension = FILE_TYPE_MAP[file.mimetype];
//     cb(null, `${fileName}-${Date.now()}.${extension}`);
//   },
// });

// const uploadOptions = multer({ storage: storage });

// module.exports = uploadOptions;

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
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });
module.exports = uploadOptions;

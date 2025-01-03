const multer = require("multer");
const path = require("path");

// Configure Multer storage
const resources = multer({
  storage: multer.diskStorage({
    destination: "media/images",
    filename: (req, file, cb) => {
      const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(
        file.originalname
      )}`;
      cb(null, uniqueName);
    },
  }),
});

module.exports = resources;

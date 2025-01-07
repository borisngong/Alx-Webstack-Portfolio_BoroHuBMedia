const multer = require('multer');
const path = require('path');

/**
 * Multer configuration that handles file uploads
 * - Configures disk storage for uploaded files
 * - Saves files to the `media/images` directory
 * - Generates unique filenames using the fieldname, current timestamp, and original file extension
 * @constant {Object} resources
 * @property {Object} storage - Disk storage configuration for Multer.
 * @property {Function} storage.destination - Specifies the directory to save uploaded files
 * @property {Function} storage.filename - Generates a unique filename for each uploaded file
 */
const resources = multer({
  storage: multer.diskStorage({
    destination: 'media/images',
    filename: (req, file, cb) => {
      const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(
        file.originalname,
      )}`;
      cb(null, uniqueName);
    },
  }),
});

module.exports = resources;

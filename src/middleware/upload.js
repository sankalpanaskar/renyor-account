const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUpload = (folderPath) => {
  const fullPath = path.join(__dirname, folderPath);

  // create folder if not exists
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${file.fieldname}_${Date.now()}${ext}`;
      cb(null, uniqueName);
    }
  });

  return multer({ storage });
};

module.exports = createUpload;
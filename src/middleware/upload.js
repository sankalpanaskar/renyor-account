const multer = require('multer');
const path = require('path');
const fs = require('fs');

// folder where files will be saved
const uploadPath = path.join(__dirname, '../uploads/customers');

// create folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// multer instance
const upload = multer({ storage });

module.exports = upload;
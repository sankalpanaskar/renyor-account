const multer = require('multer');
const path = require('path');
const fs = require('fs');

const publicRoot = path.resolve(__dirname, '..', '..', 'public');

const normalizeUploadPath = (folderPath) =>
  folderPath
    .replace(/\\/g, '/')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '');

const createUpload = (folderPath) => {
  const uploadPath = normalizeUploadPath(folderPath);
  const fullPath = path.resolve(publicRoot, uploadPath);
  const normalizedFullPath = fullPath.toLowerCase();
  const normalizedPublicRoot = publicRoot.toLowerCase();

  if (
    normalizedFullPath !== normalizedPublicRoot &&
    !normalizedFullPath.startsWith(`${normalizedPublicRoot}${path.sep}`)
  ) {
    throw new Error('Invalid upload path');
  }

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

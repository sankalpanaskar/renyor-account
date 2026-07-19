const router = require('express').Router();
const SettingsController = require('../controllers/settings.controller');
const auth = require('../middleware/auth');
const multer = require('multer');

const upload = multer();

router.post(
  '/document-number-settings',
  auth,
  upload.none(),
  SettingsController.createDocumentNumberSettings
);

router.get(
  '/document-number-settings',
  auth,
  SettingsController.fetchDocumentNumberSettings
);

module.exports = router;

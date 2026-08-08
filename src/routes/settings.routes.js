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
  '/fetch-document-number-settings',
  auth,
  SettingsController.fetchDocumentNumberSettings
);

router.post(
  '/document-format-settings',
  auth,
  upload.none(),
  SettingsController.createDocumentFormatSettings
);

router.get(
  '/fetch-document-format-settings',
  auth,
  SettingsController.fetchDocumentFormatSettings
);

module.exports = router;

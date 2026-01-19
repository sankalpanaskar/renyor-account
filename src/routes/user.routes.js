const router = require('express').Router();
const UserController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const multer = require('multer');
const upload = multer();
router.post('/user-create', auth,upload.none(),UserController.create);
router.get('/fetch-user', auth, UserController.getAll);

module.exports = router;

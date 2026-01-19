const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const multer = require('multer');
const upload = multer();

router.post('/login',upload.none(),AuthController.login);

module.exports = router;

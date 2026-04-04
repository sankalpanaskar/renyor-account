const router = require('express').Router();
const menuontroller = require('../controllers/menu.controller');
const auth = require('../middleware/auth');


router.get('/fetch-menu', auth, menuontroller.fetchMenu);
router.post('/menu-Assign-On-Role', auth, menuontroller.menuAssignOnRole);


module.exports = router;
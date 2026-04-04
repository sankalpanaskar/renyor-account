const router = require('express').Router();
const customerController = require('../controllers/customer.controller');
const auth = require('../middleware/auth');


router.get('/fetch-customers', auth, customerController.fetchCustomers);
router.post('/create-customer', auth, customerController.createCustomer);


module.exports = router;
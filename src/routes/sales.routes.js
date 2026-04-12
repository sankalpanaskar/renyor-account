const router = require('express').Router();
const salesController = require('../controllers/sales.controller');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer();

const createUpload = require('../middleware/upload');

router.post(
  '/create-customer',
  auth,
  (req, res, next) => {
    const tenant_id = req.user?.tenant_id || 'common';

    const upload = createUpload(`../uploads/customers/${tenant_id}`);

    upload.fields([
      { name: 'document_1', maxCount: 1 },
      { name: 'document_2', maxCount: 1 }
    ])(req, res, next);
  },
  salesController.createCustomer
);


router.get('/fetch-customers', auth, salesController.fetchCustomers);
//router.post('/create-customer', auth, upload.none(),salesController.createCustomer);
router.get('/fetch-chartofaccounts-head-type', auth, salesController.getchartofaccountsHeadType);
router.post('/create-chartofaccounts', auth, upload.none(),salesController.createchartofaccounts);

router.get('/fetch-tds', auth, salesController.fetchTds);

router.get('/fetch-payment-terms', auth, salesController.fetchPaymentTerms);


module.exports = router;
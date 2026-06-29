const router = require('express').Router();
const salesController = require('../controllers/sales.controller');
const auth = require('../middleware/auth');
const authSuperadmin = require('../middleware/authSuperAdmin');
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

router.post(
  '/edit-customer',
  auth,
  (req, res, next) => {
    const tenant_id = req.user?.tenant_id || 'common';

    const upload = createUpload(`../uploads/customers/${tenant_id}`);

    upload.fields([
      { name: 'document_1', maxCount: 1 },
      { name: 'document_2', maxCount: 1 }
    ])(req, res, next);
  },
  salesController.editCustomer
);

router.post(
  '/create-vendor',
  auth,
  (req, res, next) => {
    const tenant_id = req.user?.tenant_id || 'common';

    const upload = createUpload(`../uploads/vendors/${tenant_id}`);

    upload.fields([
      { name: 'document_1', maxCount: 1 },
      { name: 'document_2', maxCount: 1 }
    ])(req, res, next);
  },
  salesController.createVendor
);

router.post(
  '/update-vendor',
  auth,
  (req, res, next) => {
    const tenant_id = req.user?.tenant_id || 'common';

    const upload = createUpload(`../uploads/vendors/${tenant_id}`);

    upload.fields([
      { name: 'document_1', maxCount: 1 },
      { name: 'document_2', maxCount: 1 }
    ])(req, res, next);
  },
  salesController.updateVendor
);

router.post(
  '/create-item',
  auth,
  (req, res, next) => {
    const tenant_id = req.user?.tenant_id || 'common';

    const upload = createUpload(`../uploads/items/${tenant_id}`);

    upload.fields([
      { name: 'item_image', maxCount: 1 },
    ])(req, res, next);
  },
  salesController.createItem
);




router.get('/fetch-customers', auth, salesController.fetchCustomers);
router.get('/fetch-vendors', auth, salesController.fetchVendors);
router.post('/document-number-settings', auth, upload.none(),salesController.documentNumberSettings);

router.get('/fetch-items', auth, salesController.fetchItems);
//router.post('/create-customer', auth, upload.none(),salesController.createCustomer);
router.get('/fetch-chartofaccounts-head-type', auth, salesController.getchartofaccountsHeadType);
router.post('/create-chartofaccounts', auth, upload.none(),salesController.createchartofaccounts);
router.post('/create-accounts-head-type', authSuperadmin, upload.none(),salesController.createAccountsheadtype);


router.get('/fetch-chartofaccounts-item', auth, salesController.getchartofaccountsItem);
router.post('/create-tds', auth, upload.none(), salesController.createTds);
router.get('/fetch-tds', auth, salesController.fetchTds);
router.post('/create-tds', auth, upload.none(), salesController.createTds);

router.post('/insert-payment-term', auth, upload.none(), salesController.insertPaymentTerm);
router.get('/fetch-payment-terms', auth, salesController.fetchPaymentTerms);
router.post('/create-tax-rate', auth, upload.none(), salesController.createTaxRate);

router.get('/fetch-tax-rate', auth, salesController.fetchTaxRate);


module.exports = router;

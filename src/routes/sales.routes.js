const router = require('express').Router();
const salesController = require('../controllers/sales.controller');
const auth = require('../middleware/auth');
const authSuperadmin = require('../middleware/authSuperAdmin');
const multer = require('multer');
const formDataUpload = multer();
const createTenantUpload = require('../middleware/upload');

const tenantUpload = (folder, fields) => (req, res, next) => {
  const tenant_id = req.user?.tenant_id || 'common';
  const uploader = createTenantUpload(`../uploads/${folder}/${tenant_id}`);
  uploader.fields(fields)(req, res, next);
};

router.post(
  '/create-customer',
  auth,
  tenantUpload('customers', [
    { name: 'document_1', maxCount: 1 },
    { name: 'document_2', maxCount: 1 }
  ]),
  salesController.createCustomer
);

router.post(
  '/edit-customer',
  auth,
  tenantUpload('customers', [
    { name: 'document_1', maxCount: 1 },
    { name: 'document_2', maxCount: 1 }
  ]),
  salesController.editCustomer
);

router.post(
  '/create-vendor',
  auth,
  tenantUpload('vendors', [
    { name: 'document_1', maxCount: 1 },
    { name: 'document_2', maxCount: 1 }
  ]),
  salesController.createVendor
);

router.post(
  '/update-vendor',
  auth,
  tenantUpload('vendors', [
    { name: 'document_1', maxCount: 1 },
    { name: 'document_2', maxCount: 1 }
  ]),
  salesController.updateVendor
);

router.post(
  '/create-item',
  auth,
  tenantUpload('items', [
    { name: 'item_image', maxCount: 1 }
  ]),
  salesController.createItem
);




router.get('/fetch-customers', auth, salesController.fetchCustomers);
router.get('/fetch-vendors', auth, salesController.fetchVendors);
router.post('/document-number-settings', auth, formDataUpload.none(),salesController.documentNumberSettings);

router.get('/fetch-items', auth, salesController.fetchItems);
//router.post('/create-customer', auth, upload.none(),salesController.createCustomer);
router.get('/fetch-chartofaccounts-head-type', auth, salesController.getchartofaccountsHeadType);
router.post('/create-chartofaccounts', auth, formDataUpload.none(),salesController.createchartofaccounts);
router.post('/create-accounts-head-type', authSuperadmin, formDataUpload.none(),salesController.createAccountsheadtype);


router.get('/fetch-chartofaccounts-item', auth, salesController.getchartofaccountsItem);
router.post('/create-tds', auth, formDataUpload.none(), salesController.createTds);
router.get('/fetch-tds', auth, salesController.fetchTds);

router.post('/insert-unit', auth, formDataUpload.none(), salesController.insertUnit);
router.get('/fetch-units', auth, salesController.fetchUnits);
router.post('/insert-payment-term', auth, formDataUpload.none(), salesController.insertPaymentTerm);
router.get('/fetch-payment-terms', auth, salesController.fetchPaymentTerms);
router.post('/create-tax-rate', auth, formDataUpload.none(), salesController.createTaxRate);
router.post('/create-invoice', auth, formDataUpload.none(), salesController.createInvoice);
router.post('/generate-pdf', auth, formDataUpload.none(), salesController.createDocumentPdf);
router.get('/demo-invoice-pdf', auth, salesController.createDemoInvoicePdf);
router.get('/demo-quotation-pdf', auth, salesController.createDemoQuotationPdf);
router.get('/demo-workorder-pdf', auth, salesController.createDemoWorkOrderPdf);

router.get('/fetch-tax-rate', auth, salesController.fetchTaxRate);


module.exports = router;

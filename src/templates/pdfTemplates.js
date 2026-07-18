const DOCUMENT_TYPE_CONFIG = {
  invoice: {
    label: 'Invoice',
    folder: 'invoices',
    filePrefix: 'invoice',
    billToLabel: 'Bill To',
    note: 'This is a demo invoice for testing purposes.'
  },
  quotation: {
    label: 'Quotation',
    folder: 'quotations',
    filePrefix: 'quotation',
    billToLabel: 'Quote To',
    note: 'This is a demo quotation for testing purposes.'
  },
  workorder: {
    label: 'Work Order',
    folder: 'workorders',
    filePrefix: 'workorder',
    billToLabel: 'Work To',
    note: 'This is a demo work order for testing purposes.'
  }
};

const normalizeDocumentType = (documentType) => {
  const normalized = String(documentType || 'invoice').toLowerCase().replace(/\s+/g, '');
  return DOCUMENT_TYPE_CONFIG[normalized] ? normalized : 'invoice';
};

const getDocumentConfig = (documentType) => DOCUMENT_TYPE_CONFIG[normalizeDocumentType(documentType)];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
});

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (value) => currencyFormatter.format(Number(value || 0));

const buildDemoDocumentData = (documentType = 'invoice') => {
  const config = getDocumentConfig(documentType);
  const items = [
    { name: 'Consulting Retainer', description: 'Monthly business advisory and process review', qty: 1, unit: 'Service', rate: 18000, taxRate: 18, hsn: '9983' },
    { name: 'ERP Configuration', description: 'Initial workflow setup and access control mapping', qty: 1, unit: 'Service', rate: 22000, taxRate: 18, hsn: '9983' },
    { name: 'Invoice Template Design', description: 'Branded PDF layout with header/footer and totals', qty: 2, unit: 'Hours', rate: 3500, taxRate: 18, hsn: '9983' },
    { name: 'Data Migration', description: 'Demo migration from legacy records', qty: 1, unit: 'Project', rate: 15000, taxRate: 18, hsn: '9983' },
    { name: 'Training Session', description: 'User onboarding and Q&A session', qty: 2, unit: 'Session', rate: 4500, taxRate: 18, hsn: '9983' },
    { name: 'Support Block', description: 'Priority support block for the finance team', qty: 4, unit: 'Hour', rate: 1200, taxRate: 18, hsn: '9983' },
    { name: 'GST Review', description: 'Tax validation and rate review', qty: 1, unit: 'Service', rate: 6000, taxRate: 12, hsn: '9983' },
    { name: 'Document Automation', description: 'Auto-numbering and workflow integration', qty: 1, unit: 'Project', rate: 12500, taxRate: 18, hsn: '9983' },
    { name: 'Quality Assurance', description: 'Testing of invoice and sales routes', qty: 3, unit: 'Hour', rate: 1800, taxRate: 18, hsn: '9983' },
    { name: 'Deployment Assistance', description: 'Production readiness support', qty: 1, unit: 'Service', rate: 8500, taxRate: 18, hsn: '9983' },
    { name: 'Account Review', description: 'Chart of accounts mapping validation', qty: 2, unit: 'Hour', rate: 3000, taxRate: 18, hsn: '9983' },
    { name: 'Reporting Pack', description: 'Invoice and sales summary report design', qty: 1, unit: 'Project', rate: 9000, taxRate: 18, hsn: '9983' },
    { name: 'Signature Setup', description: 'Digital signature placement for documents', qty: 1, unit: 'Service', rate: 2500, taxRate: 18, hsn: '9983' },
    { name: 'Final Review', description: 'Sign-off, corrections, and handover', qty: 1, unit: 'Service', rate: 4000, taxRate: 18, hsn: '9983' },
    { name: 'Buffer Adjustment', description: 'Rounding and contingency adjustment', qty: 1, unit: 'Adjustment', rate: 1500, taxRate: 0, hsn: '9983' }
  ];

  const totals = items.reduce(
    (acc, item) => {
      const base = Number(item.qty) * Number(item.rate);
      const tax = base * (Number(item.taxRate) / 100);
      acc.subtotal += base;
      acc.tax += tax;
      return acc;
    },
    { subtotal: 0, tax: 0 }
  );

  totals.grandTotal = totals.subtotal + totals.tax;

  return {
    company: {
      name: 'MSME Accounts Pvt. Ltd.',
      addressLine1: '123 Business Avenue, Hyderabad, Telangana 500081',
      addressLine2: 'GSTIN: 36ABCDE1234F1Z5 | support@msmeaccounts.com | +91 90000 00000'
    },
    customer: {
      name: 'Apex Retail Solutions',
      contact: 'Mr. Rohan Sharma',
      email: 'rohan.sharma@apexretail.example',
      phone: '+91 98765 43210',
      address: '45 Market Street, Pune, Maharashtra 411001'
    },
    document: {
      type: normalizeDocumentType(documentType),
      number: `${config.filePrefix.toUpperCase()}-DEMO-2026-001`,
      date: '12 July 2026',
      dueDate: '26 July 2026',
      reference: `TEST-${config.filePrefix.toUpperCase()}-3PAGE`,
      title: `${config.label} Demo`
    },
    items,
    totals
  };
};

const buildInvoiceRows = (rows) =>
  rows
    .map((row, index) => {
      const base = Number(row.qty) * Number(row.rate);
      const taxAmount = base * (Number(row.taxRate) / 100);
      const lineTotal = base + taxAmount;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(row.name)}</div>
            <div class="item-desc">${escapeHtml(row.description)}</div>
          </td>
          <td>${escapeHtml(row.hsn)}</td>
          <td class="text-right">${row.qty}</td>
          <td>${escapeHtml(row.unit)}</td>
          <td class="text-right">${formatMoney(row.rate)}</td>
          <td class="text-right">${row.taxRate}%</td>
          <td class="text-right">${formatMoney(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

const buildInvoicePage = (pageNumber, title, rows, options = {}) => `
  <section class="invoice-page ${options.lastPage ? 'last-page' : ''}">
    <div class="page-title-row">
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(options.subtitle || '')}</p>
      </div>
      <div class="page-badge">Page ${pageNumber}</div>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Item & Description</th>
          <th>HSN</th>
          <th class="text-right">Qty</th>
          <th>Unit</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Tax</th>
          <th class="text-right">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${buildInvoiceRows(rows)}
      </tbody>
    </table>
    ${options.summaryHtml || ''}
  </section>
`;

const buildHeaderTemplate = (data, documentType) => {
  const config = getDocumentConfig(documentType);
  const logoSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <rect width="56" height="56" rx="14" fill="#0f172a"/>
      <circle cx="28" cy="28" r="17" fill="#f59e0b"/>
      <path d="M21 33V23h5.6c3.2 0 5.4 1.6 5.4 4.8 0 3.3-2.2 5.2-5.6 5.2H21zm4.2-3.3h1.1c1.6 0 2.4-.7 2.4-2s-.8-2-2.4-2h-1.1v4z" fill="#0f172a"/>
    </svg>
  `);

  return `
    <div style="width:100%; box-sizing:border-box; padding:0 24px; font-family:Arial,sans-serif; color:#0f172a;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:1px solid #dbe3ee; padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="data:image/svg+xml;charset=UTF-8,${logoSvg}" style="width:44px; height:44px; border-radius:10px;" />
          <div>
            <div style="font-size:15px; font-weight:700;">${escapeHtml(data.company.name)}</div>
            <div style="font-size:9px; color:#475569; line-height:1.45;">${escapeHtml(data.company.addressLine1)}<br/>${escapeHtml(data.company.addressLine2)}</div>
          </div>
        </div>
        <div style="text-align:right; font-size:9px; line-height:1.45; max-width:280px;">
          <div style="font-size:13px; font-weight:700; color:#111827; margin-bottom:4px;">${escapeHtml(config.billToLabel)}</div>
          <div><strong>${escapeHtml(data.customer.name)}</strong></div>
          <div>${escapeHtml(data.customer.contact)}</div>
          <div>${escapeHtml(data.customer.email)}</div>
          <div>${escapeHtml(data.customer.phone)}</div>
          <div>${escapeHtml(data.customer.address)}</div>
        </div>
      </div>
    </div>
  `;
};

const buildFooterTemplate = (data) => `
  <div style="width:100%; box-sizing:border-box; padding:0 24px; font-family:Arial,sans-serif; color:#475569; font-size:9px;">
    <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #dbe3ee; padding-top:8px;">
      <div style="max-width:70%; line-height:1.45;">
        ${escapeHtml(data.company.addressLine1)}<br/>
        ${escapeHtml(data.company.addressLine2)}
      </div>
      <div style="text-align:right;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    </div>
  </div>
`;

const buildDocumentHtml = (data, documentType) => {
  const config = getDocumentConfig(documentType);
  const pageOneItems = data.items.slice(0, 5);
  const pageTwoItems = data.items.slice(5, 10);
  const pageThreeItems = data.items.slice(10);

  const pageOneSummary = `
    <div class="summary-card">
      <div class="summary-grid">
        <div><span>${escapeHtml(config.label)} Number</span><strong>${escapeHtml(data.document.number)}</strong></div>
        <div><span>${escapeHtml(config.label)} Date</span><strong>${escapeHtml(data.document.date)}</strong></div>
        <div><span>Due Date</span><strong>${escapeHtml(data.document.dueDate)}</strong></div>
        <div><span>Reference</span><strong>${escapeHtml(data.document.reference)}</strong></div>
      </div>
    </div>
  `;

  const pageTwoSummary = `
    <div class="note-box">
      <strong>Scope update:</strong> this page continues the line items for the same ${escapeHtml(config.label.toLowerCase())} and demonstrates a clean repeated layout on every page.
    </div>
  `;

  const pageThreeSummary = `
    <div class="totals-wrap">
      <div class="notes">
        <h3>Notes</h3>
        <p>Thanks for reviewing the demo ${escapeHtml(config.label.toLowerCase())} PDF. This page shows the totals, signature block, and footer repeat exactly like a real document.</p>
        <div class="terms">
          <strong>Terms:</strong> Payment due within 14 days. Prices are exclusive of applicable taxes. ${escapeHtml(config.note)}
        </div>
      </div>
      <div class="totals-card">
        <div class="total-line"><span>Subtotal</span><strong>${formatMoney(data.totals.subtotal)}</strong></div>
        <div class="total-line"><span>Tax</span><strong>${formatMoney(data.totals.tax)}</strong></div>
        <div class="total-line grand"><span>${escapeHtml(config.label)} Total</span><strong>${formatMoney(data.totals.grandTotal)}</strong></div>
      </div>
    </div>
    <div class="signature-row">
      <div class="signature-box">
        <div class="sig-line"></div>
        <span>Authorized Signatory</span>
      </div>
      <div class="signature-box">
        <div class="sig-line"></div>
        <span>Customer Acknowledgement</span>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #0f172a;
            background: #fff;
          }
          .document {
            padding: 0;
          }
          .invoice-page {
            padding: 0 24px 8px;
            page-break-after: always;
          }
          .last-page {
            page-break-after: auto;
          }
          .page-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 14px;
            padding-top: 8px;
          }
          .page-title-row h2 {
            margin: 0;
            font-size: 18px;
            color: #111827;
          }
          .page-title-row p {
            margin: 4px 0 0;
            font-size: 11px;
            color: #64748b;
          }
          .page-badge {
            background: #0f172a;
            color: #fff;
            border-radius: 999px;
            padding: 7px 12px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.03em;
            white-space: nowrap;
          }
          .summary-card,
          .note-box,
          .totals-card,
          .notes,
          .signature-box {
            border: 1px solid #dbe3ee;
            border-radius: 14px;
            background: #f8fafc;
          }
          .summary-card {
            padding: 14px 16px;
            margin-bottom: 14px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }
          .summary-grid span {
            display: block;
            font-size: 10px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .summary-grid strong {
            font-size: 12px;
            color: #111827;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            background: #fff;
            border: 1px solid #dbe3ee;
            border-radius: 14px;
            overflow: hidden;
          }
          .items-table thead th {
            background: #f1f5f9;
            color: #334155;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 10px 8px;
            text-align: left;
            border-bottom: 1px solid #dbe3ee;
          }
          .items-table td {
            font-size: 10.5px;
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }
          .items-table tbody tr:nth-child(even) td {
            background: #fbfdff;
          }
          .item-name {
            font-weight: 700;
            color: #111827;
            margin-bottom: 3px;
          }
          .item-desc {
            color: #64748b;
            font-size: 9px;
            line-height: 1.4;
          }
          .text-right { text-align: right; }
          .note-box {
            padding: 12px 14px;
            margin-top: 14px;
            font-size: 11px;
            color: #334155;
          }
          .totals-wrap {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 14px;
            margin-top: 14px;
          }
          .notes {
            padding: 14px 16px;
          }
          .notes h3 {
            margin: 0 0 8px;
            font-size: 14px;
          }
          .notes p {
            margin: 0 0 10px;
            font-size: 11px;
            line-height: 1.6;
            color: #334155;
          }
          .terms {
            font-size: 10.5px;
            line-height: 1.6;
            color: #475569;
          }
          .totals-card {
            padding: 14px 16px;
            height: fit-content;
            align-self: start;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 11px;
            padding: 8px 0;
            border-bottom: 1px dashed #cbd5e1;
          }
          .total-line:last-child {
            border-bottom: 0;
          }
          .grand {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
          }
          .signature-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
          }
          .signature-box {
            height: 110px;
            padding: 14px;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          }
          .sig-line {
            height: 1px;
            background: #94a3b8;
            margin-bottom: 8px;
          }
          .signature-box span {
            font-size: 10.5px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="document">
          ${buildInvoicePage(1, `${escapeHtml(config.label)} Overview`, pageOneItems, {
            subtitle: `Customer summary and the first batch of ${escapeHtml(config.label.toLowerCase())} items.`,
            summaryHtml: pageOneSummary
          })}
          ${buildInvoicePage(2, `Detailed ${escapeHtml(config.label)} Charges`, pageTwoItems, {
            subtitle: `Continued ${escapeHtml(config.label.toLowerCase())} line items with the same header and footer on the page.`,
            summaryHtml: pageTwoSummary
          })}
          ${buildInvoicePage(3, `${escapeHtml(config.label)} Totals and Sign-off`, pageThreeItems, {
            subtitle: `Final ${escapeHtml(config.label.toLowerCase())} totals, notes, and signatures.`,
            summaryHtml: pageThreeSummary,
            lastPage: true
          })}
        </div>
      </body>
    </html>
  `;
};

module.exports = {
  normalizeDocumentType,
  getDocumentConfig,
  buildDemoDocumentData,
  buildHeaderTemplate,
  buildFooterTemplate,
  buildDocumentHtml
};

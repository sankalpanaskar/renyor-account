const SettingsService = require('../services/settings.service');

exports.createDocumentNumberSettings = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.user.userId;

    const settings = await SettingsService.createDocumentNumberSettings(
      req.body,
      tenant_id,
      user_id
    );

    return res.success(
      200,
      'Document settings created successfully',
      settings
    );
  } catch (err) {
    if(err.code==='ER_DUP_ENTRY'){
        return res.error(
              409,
              "This document type has already been created by the same user for the same tenant"
            );
    }else{
      return res.error(
      400,
      err.message
       );
    }
  }
};

exports.fetchDocumentNumberSettings = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { document_type } = req.query;

    const settings = await SettingsService.fetchDocumentNumberSettings(
      tenant_id,
      document_type
    );

    return res.success(
      200,
      'Document settings fetched successfully',
      settings
    );
  } catch (err) {
    return res.error(
      500,
      err.message || 'Failed to fetch document settings'
    );
  }
};

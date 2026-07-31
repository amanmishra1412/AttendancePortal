import { OfficeSettings } from './office.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';

export const getOfficeSettings = async (req, res, next) => {
  try {
    let settings = await OfficeSettings.findOne();
    if (!settings) {
      settings = await OfficeSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateOfficeSettings = async (req, res, next) => {
  try {
    let settings = await OfficeSettings.findOne();
    if (!settings) {
      settings = await OfficeSettings.create(req.body);
    } else {
      settings = await OfficeSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    await logAudit({
      user: req.user._id,
      action: 'UPDATE_OFFICE_SETTINGS',
      module: 'Office',
      details: `Office settings updated (GPS: ${settings.latitude}, ${settings.longitude}, Radius: ${settings.allowedRadiusMeters}m)`,
      req,
    });

    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

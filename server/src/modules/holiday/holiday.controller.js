import { Holiday } from './holiday.model.js';
import { logAudit } from '../../common/utils/auditLogger.js';

// Predefined official Indian gazetted and festival holidays
const DEFAULT_HOLIDAYS = [
  // 2026 Holidays
  { name: "New Year's Day", date: '2026-01-01', type: 'Company', isPaid: true, description: 'New Year celebration' },
  { name: 'Makar Sankranti / Pongal', date: '2026-01-14', type: 'Festival', isPaid: true, description: 'Harvest festival' },
  { name: 'Republic Day', date: '2026-01-26', type: 'National', isPaid: true, description: 'National Republic Day holiday' },
  { name: 'Maha Shivratri', date: '2026-02-15', type: 'Festival', isPaid: true, description: 'Maha Shivratri festival' },
  { name: 'Holi', date: '2026-03-04', type: 'Festival', isPaid: true, description: 'Festival of Colors' },
  { name: 'Eid-ul-Fitr', date: '2026-03-21', type: 'Festival', isPaid: true, description: 'Eid-ul-Fitr celebration' },
  { name: 'Mahavir Jayanti', date: '2026-03-31', type: 'Gazetted', isPaid: true, description: 'Mahavir Jayanti holiday' },
  { name: 'Good Friday', date: '2026-04-03', type: 'Gazetted', isPaid: true, description: 'Good Friday holiday' },
  { name: 'Dr. B.R. Ambedkar Jayanti', date: '2026-04-14', type: 'Gazetted', isPaid: true, description: 'Ambedkar Jayanti' },
  { name: 'Buddha Purnima', date: '2026-05-31', type: 'Gazetted', isPaid: true, description: 'Buddha Purnima' },
  { name: 'Eid-ul-Adha (Bakrid)', date: '2026-05-28', type: 'Festival', isPaid: true, description: 'Bakrid celebration' },
  { name: 'Muharram', date: '2026-06-26', type: 'Gazetted', isPaid: true, description: 'Muharram holiday' },
  { name: 'Independence Day', date: '2026-08-15', type: 'National', isPaid: true, description: 'National Independence Day holiday' },
  { name: 'Milad-un-Nabi', date: '2026-08-26', type: 'Gazetted', isPaid: true, description: 'Milad-un-Nabi holiday' },
  { name: 'Raksha Bandhan', date: '2026-08-28', type: 'Festival', isPaid: true, description: 'Raksha Bandhan festival' },
  { name: 'Janmashtami', date: '2026-09-04', type: 'Festival', isPaid: true, description: 'Shree Krishna Janmashtami' },
  { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National', isPaid: true, description: 'Mahatma Gandhi Birthday' },
  { name: 'Dussehra (Maha Navami / Vijayadashami)', date: '2026-10-20', type: 'Festival', isPaid: true, description: 'Vijayadashami festival' },
  { name: 'Diwali (Deepavali)', date: '2026-11-08', type: 'Festival', isPaid: true, description: 'Festival of Lights' },
  { name: 'Govardhan Puja', date: '2026-11-09', type: 'Festival', isPaid: true, description: 'Govardhan Puja holiday' },
  { name: 'Bhai Dooj', date: '2026-11-10', type: 'Festival', isPaid: true, description: 'Bhai Dooj celebration' },
  { name: 'Chhath Puja', date: '2026-11-15', type: 'Festival', isPaid: true, description: 'Chhath Puja festival' },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'Gazetted', isPaid: true, description: 'Guru Nanak Gurpurab' },
  { name: 'Christmas Day', date: '2026-12-25', type: 'Festival', isPaid: true, description: 'Christmas celebration' },

  // 2025 Holidays
  { name: 'Republic Day', date: '2025-01-26', type: 'National', isPaid: true, description: 'National Republic Day holiday' },
  { name: 'Holi', date: '2025-03-14', type: 'Festival', isPaid: true, description: 'Festival of Colors' },
  { name: 'Independence Day', date: '2025-08-15', type: 'National', isPaid: true, description: 'National Independence Day holiday' },
  { name: 'Raksha Bandhan', date: '2025-08-09', type: 'Festival', isPaid: true, description: 'Raksha Bandhan festival' },
  { name: 'Gandhi Jayanti', date: '2025-10-02', type: 'National', isPaid: true, description: 'Mahatma Gandhi Birthday' },
  { name: 'Dussehra', date: '2025-10-02', type: 'Festival', isPaid: true, description: 'Dussehra festival' },
  { name: 'Diwali', date: '2025-10-20', type: 'Festival', isPaid: true, description: 'Festival of Lights' },
  { name: 'Christmas Day', date: '2025-12-25', type: 'Festival', isPaid: true, description: 'Christmas celebration' },
];

export const getHolidays = async (req, res, next) => {
  try {
    const { year, month, type } = req.query;

    // Auto-seed if database has no holidays yet
    const count = await Holiday.countDocuments();
    if (count === 0) {
      await Holiday.insertMany(DEFAULT_HOLIDAYS.map((h) => ({
        ...h,
        year: parseInt(h.date.split('-')[0], 10),
      })));
    }

    let query = {};
    if (year) {
      query.year = parseInt(year, 10);
    }
    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthStr}` };
    }
    if (type) {
      query.type = type;
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.status(200).json({ success: true, count: holidays.length, holidays });
  } catch (error) {
    next(error);
  }
};

export const createHoliday = async (req, res, next) => {
  try {
    const { name, date, type, isPaid, description } = req.body;

    if (!name || !date) {
      return res.status(400).json({ success: false, message: 'Holiday name and date (YYYY-MM-DD) are required' });
    }

    const year = parseInt(date.split('-')[0], 10);

    const existing = await Holiday.findOne({ date });
    if (existing) {
      return res.status(400).json({ success: false, message: `Holiday for date ${date} already exists (${existing.name})` });
    }

    const holiday = await Holiday.create({
      name,
      date,
      type: type || 'Festival',
      isPaid: isPaid !== undefined ? isPaid : true,
      description: description || '',
      year,
    });

    await logAudit({
      user: req.user._id,
      action: 'CREATE_HOLIDAY',
      module: 'Holiday',
      details: `Added holiday "${name}" on ${date} (${type || 'Festival'}, Paid: ${isPaid !== false})`,
      req,
    });

    res.status(201).json({ success: true, message: 'Holiday created successfully', holiday });
  } catch (error) {
    next(error);
  }
};

export const updateHoliday = async (req, res, next) => {
  try {
    const { name, date, type, isPaid, description } = req.body;
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    if (name) holiday.name = name;
    if (date) {
      holiday.date = date;
      holiday.year = parseInt(date.split('-')[0], 10);
    }
    if (type) holiday.type = type;
    if (isPaid !== undefined) holiday.isPaid = isPaid;
    if (description !== undefined) holiday.description = description;

    await holiday.save();

    await logAudit({
      user: req.user._id,
      action: 'UPDATE_HOLIDAY',
      module: 'Holiday',
      details: `Updated holiday "${holiday.name}" on ${holiday.date}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Holiday updated successfully', holiday });
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    await Holiday.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user._id,
      action: 'DELETE_HOLIDAY',
      module: 'Holiday',
      details: `Deleted holiday "${holiday.name}" (${holiday.date})`,
      req,
    });

    res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const seedDefaultHolidays = async (req, res, next) => {
  try {
    let addedCount = 0;
    for (const h of DEFAULT_HOLIDAYS) {
      const year = parseInt(h.date.split('-')[0], 10);
      const exists = await Holiday.findOne({ date: h.date });
      if (!exists) {
        await Holiday.create({ ...h, year });
        addedCount++;
      }
    }

    await logAudit({
      user: req.user._id,
      action: 'SEED_HOLIDAYS',
      module: 'Holiday',
      details: `Seeded ${addedCount} default Indian festivals & gazetted holidays`,
      req,
    });

    const allHolidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      message: `Successfully seeded ${addedCount} official holidays`,
      count: allHolidays.length,
      holidays: allHolidays,
    });
  } catch (error) {
    next(error);
  }
};

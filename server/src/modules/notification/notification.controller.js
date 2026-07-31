import { Notification } from './notification.model.js';

export const getNotifications = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { recipient: req.user._id },
        { targetRole: req.user.role },
        { targetRole: 'ALL' },
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

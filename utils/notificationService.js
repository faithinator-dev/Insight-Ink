const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, relatedEntityId, relatedEntityType, createdBy }) => {
    if (!userId) {
        return null;
    }

    return Notification.create({
        userId,
        type,
        title,
        message,
        relatedEntityId,
        relatedEntityType,
        createdBy,
    });
};

module.exports = {
    createNotification,
};
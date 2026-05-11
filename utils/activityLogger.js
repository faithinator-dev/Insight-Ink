const ActivityLog = require('../models/ActivityLog');

const recordActivity = async (details) => {
    try {
        await ActivityLog.create(details);
    } catch (error) {
        console.error('Activity log error:', error.message);
    }
};

module.exports = {
    recordActivity,
    
};
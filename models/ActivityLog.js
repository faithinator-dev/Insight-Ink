const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['page_view', 'auth', 'post', 'comment', 'system', 'visitor']
    },
    action: {
        type: String,
        required: true
    },
    method: String,
    path: String,
    statusCode: Number,
    message: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    role: String,
    entityType: String,
    entityId: String,
    entityName: String,
    ipAddress: String,
    userAgent: String,
    referrer: String,
    visitorId: String,
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
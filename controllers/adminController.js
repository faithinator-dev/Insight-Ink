const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { recordActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');
const transporter = require('../config/mailer');
const { buildAdminNoticeEmail } = require('../utils/emailTemplates');

exports.renderSuperAdminPortal = async (req, res) => {
    try {
        const [userCount, adminCount, superAdminCount, postCount, commentStats, recentUsers, recentPosts, recentActivities, visitorStats, adminUsers, allUsers, recentNotices] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'superadmin' }),
            Post.countDocuments(),
            Post.aggregate([
                {
                    $project: {
                        commentCount: { $size: { $ifNull: ['$comments', []] } },
                        likeCount: { $size: { $ifNull: ['$likes', []] } },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalComments: { $sum: '$commentCount' },
                        totalLikes: { $sum: '$likeCount' },
                    },
                },
            ]),
            User.find().sort({ createdAt: -1 }).limit(6).select('name email username role createdAt').lean(),
            Post.find().sort({ createdAt: -1 }).limit(6).select('title author createdAt comments likes excerpt').lean(),
            ActivityLog.find().sort({ createdAt: -1 }).limit(25).populate('userId', 'name email role username').lean(),
            ActivityLog.aggregate([
                {
                    $match: {
                        type: 'page_view',
                        createdAt: {
                            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
                {
                    $group: {
                        _id: '$ipAddress',
                    },
                },
                {
                    $count: 'uniqueVisitors',
                },
            ]),
            User.find({ role: 'admin' }).sort({ createdAt: -1 }).select('name email username role createdAt').lean(),
            User.find().sort({ createdAt: -1 }).select('name email username role createdAt').lean(),
            Notification.find({ type: 'admin_notice' })
                .sort({ createdAt: -1 })
                .limit(8)
                .populate('userId', 'name email username role')
                .lean(),
        ]);

        const totals = commentStats[0] || { totalComments: 0, totalLikes: 0 };
        const visitorCount = visitorStats[0]?.uniqueVisitors || 0;

        res.render('super-admin', {
            metrics: {
                userCount,
                adminCount,
                superAdminCount,
                postCount,
                totalComments: totals.totalComments || 0,
                totalLikes: totals.totalLikes || 0,
                visitorCount,
            },
            recentUsers,
            recentPosts,
            recentActivities,
            adminUsers,
            allUsers,
            recentNotices,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.promoteUserToAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const displayName = user.name || user.username || user.email || 'User';

        if (user.role === 'superadmin') {
            return res.status(400).json({ message: 'Super admin role cannot be changed.' });
        }

        await User.updateOne(
            { _id: user._id },
            { $set: { role: 'admin' } }
        );

        user.role = 'admin';

        try {
            await recordActivity({
                type: 'system',
                action: 'user_promoted_to_admin',
                userId: req.user._id,
                userName: req.user.name,
                role: req.user.role,
                entityType: 'user',
                entityId: String(user._id),
                entityName: displayName,
            });
        } catch (activityError) {
            console.error('promoteUserToAdmin activity error:', activityError);
        }

        try {
            await createNotification({
                userId: user._id,
                type: 'admin_promotion',
                title: 'You have been promoted to admin',
                message: `${req.user.name || 'An administrator'} promoted you to admin access.`,
                relatedEntityId: String(user._id),
                relatedEntityType: 'user',
                createdBy: req.user._id,
            });
        } catch (notificationError) {
            console.error('promoteUserToAdmin notification error:', notificationError);
        }

        res.json({ success: true, message: `${displayName} promoted to admin.` });
    } catch (error) {
        console.error('promoteUserToAdmin error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sendNoticeToUser = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.email) {
            return res.status(400).json({ message: 'This user does not have an email address on file.' });
        }

        const cleanSubject = String(subject).trim();
        const cleanMessage = String(message).trim();

        if (!cleanSubject || !cleanMessage) {
            return res.status(400).json({ message: 'Subject and message are required.' });
        }

        await createNotification({
            userId: user._id,
            type: 'admin_notice',
            title: cleanSubject,
            message: cleanMessage,
            relatedEntityId: String(user._id),
            relatedEntityType: 'user',
            createdBy: req.user._id,
        });

        let emailSent = false;
        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
        if (fromAddress) {
            try {
                const emailContent = buildAdminNoticeEmail({
                    recipientName: user.name || user.username || 'there',
                    senderName: req.user.name || 'An administrator',
                    subject: cleanSubject,
                    message: cleanMessage,
                    portalUrl: `${req.protocol}://${req.get('host')}/profile`,
                });

                await transporter.sendMail({
                    from: `Insight Ink <${fromAddress}>`,
                    to: user.email,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html,
                });
                emailSent = true;
            } catch (emailError) {
                console.error('sendNoticeToUser email error:', emailError);
            }
        }

        await recordActivity({
            type: 'system',
            action: 'admin_notice_sent',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'user',
            entityId: String(user._id),
            entityName: user.email,
            message: cleanSubject,
        });

        res.json({ success: true, emailSent, message: 'Notice sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sendGroupNotice = async (req, res) => {
    try {
        const { target, subject, message } = req.body;

        if (!target || !subject || !message) {
            return res.status(400).json({ message: 'Target group, subject and message are required.' });
        }

        let query = {};
        if (target === 'admins') {
            query = { role: { $in: ['admin', 'superadmin'] } };
        } else if (target === 'users') {
            query = { role: 'user' };
        } else if (target === 'all') {
            query = {};
        } else {
            return res.status(400).json({ message: 'Invalid target group.' });
        }

        const users = await User.find(query).select('name username email role');
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found in the selected group.' });
        }

        const cleanSubject = String(subject).trim();
        const cleanMessage = String(message).trim();

        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
        const results = {
            total: users.length,
            notificationsCreated: 0,
            emailsSent: 0
        };

        // For large groups, this should ideally be queued, but for this project we'll process it directly
        for (const user of users) {
            // Create in-app notification
            try {
                await createNotification({
                    userId: user._id,
                    type: 'admin_notice',
                    title: cleanSubject,
                    message: cleanMessage,
                    relatedEntityId: String(user._id),
                    relatedEntityType: 'user',
                    createdBy: req.user._id,
                });
                results.notificationsCreated++;
            } catch (err) {
                console.error(`Failed to create notification for ${user.email || user.username}:`, err);
            }

            // Send email if they have one
            if (user.email && fromAddress) {
                try {
                    const emailContent = buildAdminNoticeEmail({
                        recipientName: user.name || user.username || 'there',
                        senderName: req.user.name || 'An administrator',
                        subject: cleanSubject,
                        message: cleanMessage,
                        portalUrl: `${req.protocol}://${req.get('host')}/profile`,
                    });

                    await transporter.sendMail({
                        from: `Insight Ink <${fromAddress}>`,
                        to: user.email,
                        subject: emailContent.subject,
                        text: emailContent.text,
                        html: emailContent.html,
                    });
                    results.emailsSent++;
                } catch (emailError) {
                    console.error(`sendGroupNotice email error for ${user.email}:`, emailError);
                }
            }
        }

        await recordActivity({
            type: 'system',
            action: 'group_notice_sent',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'group',
            entityId: target,
            entityName: target,
            message: cleanSubject,
            metadata: { 
                recipientCount: users.length,
                emailsSent: results.emailsSent
            }
        });

        res.json({ 
            success: true, 
            ...results, 
            message: `Group notice sent to ${results.notificationsCreated} users and ${results.emailsSent} emails dispatched.` 
        });
    } catch (error) {
        console.error('sendGroupNotice error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
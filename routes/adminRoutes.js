const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { renderSuperAdminPortal, promoteUserToAdmin, sendNoticeToUser, sendGroupNotice } = require('../controllers/adminController');

router.get('/super-admin', protect, authorize('admin', 'superadmin'), renderSuperAdminPortal);
router.post('/super-admin/users/:id/promote', protect, authorize('admin', 'superadmin'), promoteUserToAdmin);
router.post('/super-admin/users/:id/notice', protect, authorize('superadmin'), sendNoticeToUser);
router.post('/super-admin/group-notice', protect, authorize('superadmin'), sendGroupNotice);

module.exports = router;
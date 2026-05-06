const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { renderSuperAdminPortal, promoteUserToAdmin } = require('../controllers/adminController');

router.get('/super-admin', protect, authorize('admin', 'superadmin'), renderSuperAdminPortal);
router.post('/super-admin/users/:id/promote', protect, authorize('admin', 'superadmin'), promoteUserToAdmin);

module.exports = router;
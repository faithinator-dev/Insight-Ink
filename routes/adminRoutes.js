const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { renderSuperAdminPortal, promoteUserToAdmin } = require('../controllers/adminController');

router.get('/super-admin', protect, authorize('superadmin'), renderSuperAdminPortal);
router.post('/super-admin/users/:id/promote', protect, authorize('superadmin'), promoteUserToAdmin);

module.exports = router;
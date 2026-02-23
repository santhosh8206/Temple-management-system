const express = require("express");
const router = express.Router();
const {
    getUsers,
    postUsers,
    getTotalAmount,
    exportPdfUsers,
    getKovils,
    filterUsers,
    getKovilTotal,
    getAuditLog,
    exportPdfAuditLog
} = require('../controller/usersController');

router.get('/users', getUsers);
router.post('/users', postUsers);
router.get('/total-amount', getTotalAmount);
router.get('/users/export/pdf', exportPdfUsers);
router.get('/kovils', getKovils);
router.get('/users/filter', filterUsers);
router.get('/kovil-total/:kovilId', getKovilTotal);
router.get('/audit-log', getAuditLog);
router.get('/audit-log/export/pdf', exportPdfAuditLog);

module.exports = router;
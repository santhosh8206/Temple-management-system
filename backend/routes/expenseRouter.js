const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addExpense, getExpenses, getKovilBalance, getSystemSummary, exportPdfExpenses } = require('../controller/expenseController');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/bills/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

router.post('/', upload.single('bill_image'), addExpense);
router.get('/', getExpenses);
router.get('/export/pdf', exportPdfExpenses);
router.get('/summary', getSystemSummary);
router.get('/:kovilId/balance', getKovilBalance);

module.exports = router;

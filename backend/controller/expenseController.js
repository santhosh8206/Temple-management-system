const pool = require('../config/db');
const PDFDocument = require('pdfkit');

const addExpense = async (req, res) => {
    try {
        const { item_name, amount, kovil_id, dates } = req.body;
        const bill_image = req.file ? `/uploads/bills/${req.file.filename}` : null;

        if (!item_name || !amount || !kovil_id || !bill_image || !dates) {
            return res.status(400).json({ message: 'Missing required fields or bill image' });
        }

        const query = `
      INSERT INTO expenses (item_name, amount, kovil_id, bill_image, dates)
      VALUES (?, ?, ?, ?, ?)
    `;
        const [result] = await pool.query(query, [item_name, amount, kovil_id, bill_image, dates]);

        res.status(201).json({
            message: 'Expense added successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getExpenses = async (req, res) => {
    try {
        const { kovil_id, year, date_range_start, date_range_end, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT e.*, k.kovil_name 
      FROM expenses e
      JOIN kovil k ON e.kovil_id = k.id
      WHERE 1=1
    `;
        let countQuery = `
      SELECT COUNT(*) as total
      FROM expenses e
      WHERE 1=1
    `;
        const params = [];

        if (kovil_id) {
            query += ' AND e.kovil_id = ?';
            countQuery += ' AND e.kovil_id = ?';
            params.push(kovil_id);
        }
        if (year) {
            query += ' AND YEAR(e.dates) = ?';
            countQuery += ' AND YEAR(e.dates) = ?';
            params.push(year);
        }
        if (date_range_start && date_range_end) {
            query += ' AND e.dates BETWEEN ? AND ?';
            countQuery += ' AND e.dates BETWEEN ? AND ?';
            params.push(date_range_start, date_range_end);
        }

        // Get total count
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Add pagination and ordering
        query += ' ORDER BY e.dates DESC LIMIT ? OFFSET ?';
        const queryParams = [...params, parseInt(limit), parseInt(offset)];

        const [rows] = await pool.query(query, queryParams);
        res.json({
            data: rows,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const exportPdfExpenses = async (req, res) => {
    try {
        const { kovil_id, year } = req.query;
        let query = `
      SELECT e.*, k.kovil_name 
      FROM expenses e
      JOIN kovil k ON e.kovil_id = k.id
      WHERE 1=1
    `;
        const params = [];

        if (kovil_id) {
            query += ' AND e.kovil_id = ?';
            params.push(kovil_id);
        }
        if (year) {
            query += ' AND YEAR(e.dates) = ?';
            params.push(year);
        }

        query += ' ORDER BY e.dates DESC';
        const [rows] = await pool.query(query, params);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=expenses_report.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Expenses Report', { align: 'center' });
        doc.moveDown(2);

        const tableTop = 150;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Item Name', 50, tableTop);
        doc.text('Amount (Rs)', 200, tableTop);
        doc.text('Date', 300, tableTop);
        doc.text('Temple', 400, tableTop);

        doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

        let yPosition = tableTop + 30;
        doc.font('Helvetica');

        rows.forEach((exp) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }
            doc.text(exp.item_name, 50, yPosition);
            doc.text(exp.amount.toString(), 200, yPosition);
            doc.text(new Date(exp.dates).toLocaleDateString(), 300, yPosition);
            doc.text(exp.kovil_name, 400, yPosition, { width: 150 });
            yPosition += 20;
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Server error generating PDF' });
    }
};

const getKovilBalance = async (req, res) => {
    try {
        const { kovilId } = req.params;
        const query = `
      SELECT 
        COALESCE((SELECT SUM(amount) FROM users WHERE kovil_id = ?), 0) AS total_donations,
        COALESCE((SELECT SUM(amount) FROM expenses WHERE kovil_id = ?), 0) AS total_expenses
    `;
        const [rows] = await pool.query(query, [kovilId, kovilId]);
        const { total_donations, total_expenses } = rows[0];
        const balance = parseFloat(total_donations) - parseFloat(total_expenses);

        res.json({
            kovil_id: kovilId,
            total_donations,
            total_expenses,
            balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSystemSummary = async (req, res) => {
    try {
        const query = `
      SELECT 
        COALESCE((SELECT SUM(amount) FROM users), 0) AS total_donations,
        COALESCE((SELECT SUM(amount) FROM expenses), 0) AS total_expenses
    `;
        const [rows] = await pool.query(query);
        const { total_donations, total_expenses } = rows[0];
        const balance = parseFloat(total_donations) - parseFloat(total_expenses);

        res.json({
            total_donations,
            total_expenses,
            balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addExpense, getExpenses, getKovilBalance, getSystemSummary, exportPdfExpenses };

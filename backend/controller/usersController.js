const pool = require('../config/db');
const PDFDocument = require('pdfkit');

// getusers
const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.firstname,
        u.lastname,
        u.amount,
        u.dates,
        k.kovil_name
      FROM users u
      JOIN kovil k ON u.kovil_id = k.id 
      ORDER BY u.id DESC
    `;
    const [row] = await pool.query(query);
    res.status(200).json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

const postUsers = async (req, res) => {
  try {
    const { firstname, lastname, amount, dates, kovil_id } = req.body;
    if (!firstname || !lastname || !amount || !dates || !kovil_id) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    const query = `
      INSERT INTO users(firstname,lastname,amount,dates,kovil_id,created_at)
      VALUES(?,?,?,?,?,NOW())
    `;
    const [result] = await pool.query(query, [firstname, lastname, amount, dates, kovil_id]);

    res.status(201).json({
      message: 'users insert successfully',
      user_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

const getTotalAmount = async (req, res) => {
  try {
    const { kovil_id, year } = req.query;
    let query = `SELECT SUM(amount) as total_amount FROM users WHERE 1=1`;
    const params = [];

    if (kovil_id) {
      query += ` AND kovil_id = ?`;
      params.push(kovil_id);
    }
    if (year) {
      query += ` AND YEAR(dates) = ?`;
      params.push(year);
    }

    const [row] = await pool.query(query, params);
    res.status(200).json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

const exportPdfUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.firstname, u.lastname, u.amount, u.dates, k.kovil_name
      FROM users u
      JOIN kovil k ON u.kovil_id = k.id
      ORDER BY u.id DESC;
    `;
    const [rows] = await pool.query(query);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=users_list.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Users Donation Report', { align: 'center' });
    doc.moveDown(2);

    const tableTop = 150;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('First Name', 50, tableTop);
    doc.text('Date', 150, tableTop);
    doc.text('Amount (Rs)', 250, tableTop);
    doc.text('Temple Name', 350, tableTop);

    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    let yPosition = tableTop + 30;
    doc.font('Helvetica');

    rows.forEach((user) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      doc.text(`${user.firstname} ${user.lastname}`, 50, yPosition, { width: 100 });
      doc.text(new Date(user.dates).toLocaleDateString(), 150, yPosition);
      doc.text(user.amount.toString(), 250, yPosition);
      doc.text(user.kovil_name, 350, yPosition, { width: 200 });
      yPosition += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
};

const getKovils = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, kovil_name FROM kovil");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching kovils" });
  }
};

const filterUsers = async (req, res) => {
  try {
    const { kovil_id, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.firstname, u.lastname, u.amount, u.dates, k.kovil_name
      FROM users u
      JOIN kovil k ON u.kovil_id = k.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      WHERE 1=1
    `;

    const params = [];
    if (kovil_id) {
      query += " AND u.kovil_id = ?";
      countQuery += " AND u.kovil_id = ?";
      params.push(kovil_id);
    }
    if (year) {
      query += " AND YEAR(u.dates) = ?";
      countQuery += " AND YEAR(u.dates) = ?";
      params.push(year);
    }

    // Get total count
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination and ordering
    query += " ORDER BY u.id DESC LIMIT ? OFFSET ?";
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
    res.status(500).json({ message: "Filter failed" });
  }
};

const getKovilTotal = async (req, res) => {
  try {
    const { kovilId } = req.params;
    const query = `
      SELECT COALESCE(SUM(amount), 0) AS total_amount
      FROM users
      WHERE kovil_id = ?
    `;
    const [rows] = await pool.query(query, [kovilId]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching kovil total" });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const { kovil_id, year } = req.query;
    let query = `
      SELECT 
        k.id,
        k.kovil_name,
        COALESCE((SELECT SUM(amount) FROM users WHERE kovil_id = k.id ${year ? 'AND YEAR(dates) = ?' : ''}), 0) as total_donations,
        COALESCE((SELECT SUM(amount) FROM expenses WHERE kovil_id = k.id ${year ? 'AND YEAR(dates) = ?' : ''}), 0) as total_expenses
      FROM kovil k
      WHERE 1=1
    `;
    const params = [];
    if (year) {
      params.push(year, year);
    }
    if (kovil_id) {
      query += ' AND k.id = ?';
      params.push(kovil_id);
    }

    const [rows] = await pool.query(query, params);

    let results = rows.map(r => ({
      ...r,
      total_donations: parseFloat(r.total_donations),
      total_expenses: parseFloat(r.total_expenses),
      balance: parseFloat(r.total_donations) - parseFloat(r.total_expenses)
    }));

    if (year || kovil_id) {
      results = results.filter(r => r.total_donations > 0 || r.total_expenses > 0);
    }

    results.sort((a, b) => b.balance - a.balance);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching audit log" });
  }
};

const exportPdfAuditLog = async (req, res) => {
  try {
    const { kovil_id, year } = req.query;
    let query = `
      SELECT 
        k.id,
        k.kovil_name,
        COALESCE((SELECT SUM(amount) FROM users WHERE kovil_id = k.id ${year ? 'AND YEAR(dates) = ?' : ''}), 0) as total_donations,
        COALESCE((SELECT SUM(amount) FROM expenses WHERE kovil_id = k.id ${year ? 'AND YEAR(dates) = ?' : ''}), 0) as total_expenses
      FROM kovil k
      WHERE 1=1
    `;
    const params = [];
    if (year) {
      params.push(year, year);
    }
    if (kovil_id) {
      query += ' AND k.id = ?';
      params.push(kovil_id);
    }

    const [rows] = await pool.query(query, params);

    let results = rows.map(r => ({
      ...r,
      total_donations: parseFloat(r.total_donations),
      total_expenses: parseFloat(r.total_expenses),
      balance: parseFloat(r.total_donations) - parseFloat(r.total_expenses)
    }));

    if (year || kovil_id) {
      results = results.filter(r => r.total_donations > 0 || r.total_expenses > 0);
    }

    results.sort((a, b) => b.balance - a.balance);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=audit_log_${year || 'full'}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(`Temple Audit Log Report ${year ? `(${year})` : ''}`, { align: 'center' });
    doc.moveDown(2);

    const tableTop = 150;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Temple Name', 50, tableTop);
    doc.text('Donations', 200, tableTop);
    doc.text('Expenses', 350, tableTop);
    doc.text('Balance', 480, tableTop);

    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    let yPosition = tableTop + 30;
    doc.font('Helvetica');

    if (results.length === 0) {
      doc.text('No audit logs found for the selected temple and year.', 50, tableTop + 30);
    } else {
      results.forEach((row) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.text(row.kovil_name, 50, yPosition);
        doc.text(row.total_donations.toLocaleString(), 200, yPosition);
        doc.text(row.total_expenses.toLocaleString(), 350, yPosition);
        doc.text(row.balance.toLocaleString(), 480, yPosition);
        yPosition += 20;
      });
    }

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
};

module.exports = { getUsers, postUsers, getTotalAmount, exportPdfUsers, getKovils, filterUsers, getKovilTotal, getAuditLog, exportPdfAuditLog };
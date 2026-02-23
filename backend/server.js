const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const usersroutes = require('./routes/usersRouter');
const expenseroutes = require('./routes/expenseRouter');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', usersroutes);
app.use('/api/expenses', expenseroutes);
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const KovilExpenses = () => {
  const { kovilId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [balanceData, setBalanceData] = useState({ total_donations: 0, total_expenses: 0, balance: 0 });
  const [kovilName, setKovilName] = useState('Temple');
  const [kovils, setKovils] = useState([]);
  
  // Filtering state
  const [selectedTemple, setSelectedTemple] = useState(kovilId || "");
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchData = async (tId = selectedTemple, sDate = selectedDate) => {
    try {
      let expenseUrl = `http://localhost:3000/api/expenses?`;
      if (tId) expenseUrl += `kovil_id=${tId}&`;
      if (sDate) {
        const year = new Date(sDate).getFullYear();
        expenseUrl += `year=${year}`;
      }

      const [expRes, balRes, kovilRes] = await Promise.all([
        axios.get(expenseUrl),
        axios.get(`http://localhost:3000/api/expenses/${tId || 0}/balance`), // Simple balance check
        axios.get('http://localhost:3000/api/kovils')
      ]);

      const expData = expRes.data;
      if (Array.isArray(expData)) {
          setExpenses(expData);
      } else if (expData && expData.data) {
          setExpenses(expData.data);
      } else {
          setExpenses([]);
      }

      setKovils(kovilRes.data || []);
      
      if (tId) {
        setBalanceData(balRes.data || { total_donations: 0, total_expenses: 0, balance: 0 });
        const kovil = (kovilRes.data || []).find(k => k.id === parseInt(tId));
        if (kovil) setKovilName(kovil.kovil_name);
      } else {
        setKovilName("All Temples");
        const summaryRes = await axios.get('http://localhost:3000/api/expenses/summary');
        setBalanceData(summaryRes.data || { total_donations: 0, total_expenses: 0, balance: 0 });
      }
    } catch (err) {
      console.error(err);
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchData(kovilId);
  }, [kovilId]);

  const handleSearch = () => {
    fetchData();
  };

  const handleExport = () => {
    let url = 'http://localhost:3000/api/expenses/export/pdf?';
    if (selectedTemple) url += `kovil_id=${selectedTemple}&`;
    if (selectedDate) {
      const year = new Date(selectedDate).getFullYear();
      url += `year=${year}`;
    }
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 4 }}>
        {kovilName} Expense History
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Total Donations</Typography>
              <Typography variant="h5">₹{parseFloat(balanceData?.total_donations || 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Total Expenses</Typography>
              <Typography variant="h5">₹{parseFloat(balanceData?.total_expenses || 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: (balanceData?.balance || 0) < 0 ? 'error.dark' : 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Available Balance</Typography>
              <Typography variant="h5">₹{parseFloat(balanceData?.balance || 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="medium">Expense List</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1 }}>
              <InputLabel>Temple</InputLabel>
              <Select
                value={selectedTemple}
                onChange={(e) => setSelectedTemple(e.target.value)}
                label="Temple"
              >
                <MenuItem value="">All</MenuItem>
                {(kovils || []).map(k => (
                  <MenuItem key={k.id} value={k.id}>{k.kovil_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Year"
                views={['year']}
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                slotProps={{ textField: { size: 'small', sx: { bgcolor: 'white', borderRadius: 1, width: 120 } } }}
              />
            </LocalizationProvider>

            <Button variant="contained" color="info" onClick={handleSearch} sx={{ fontWeight: 'bold' }}>
              Search
            </Button>
            
            <Button variant="contained" color="secondary" onClick={handleExport} sx={{ fontWeight: 'bold' }}>
              Export PDF
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Bill</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(expenses || []).map((exp) => (
                <TableRow key={exp.id} hover>
                  <TableCell>{exp.dates ? new Date(exp.dates).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{exp.item_name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>₹{exp.amount}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Bill">
                      <IconButton onClick={() => window.open(`http://localhost:3000${exp.bill_image}`, '_blank')}>
                        <Visibility color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {(expenses || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No expenses recorded for this temple.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default KovilExpenses;

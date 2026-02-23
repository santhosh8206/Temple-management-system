import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
  Pagination,
  Stack,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { Visibility, FileDownload } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const TempleRecords = () => {
  const { kovilId: urlKovilId } = useParams();
  const navigate = useNavigate();
  const [kovils, setKovils] = useState([]);
  const [selectedKovil, setSelectedKovil] = useState(urlKovilId || '');
  const [selectedDate, setSelectedDate] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Donations State
  const [donations, setDonations] = useState([]);
  const [donationTotal, setDonationTotal] = useState(0);
  const [donationPage, setDonationPage] = useState(1);
  const [donationLoading, setDonationLoading] = useState(false);

  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expensePage, setExpensePage] = useState(1);
  const [expenseLoading, setExpenseLoading] = useState(false);

  // Balance State
  const [balanceData, setBalanceData] = useState({ total_donations: 0, total_expenses: 0, balance: 0 });

  const LIMIT = 10;

  useEffect(() => {
    fetchKovils();
    fetchBalance(urlKovilId || '');
    fetchDonations(1, urlKovilId || '');
    fetchExpenses(1, urlKovilId || '');
  }, []);

  const fetchKovils = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/kovils');
      setKovils(res.data || []);
    } catch (err) {
      console.error('Error fetching kovils:', err);
    }
  };

  const fetchBalance = async (kId = selectedKovil) => {
    try {
      let url = 'http://localhost:3000/api/expenses/summary';
      if (kId) {
        url = `http://localhost:3000/api/expenses/${kId}/balance`;
      }
      const res = await axios.get(url);
      setBalanceData(res.data || { total_donations: 0, total_expenses: 0, balance: 0 });
    } catch (err) {
       console.error('Error fetching balance:', err);
    }
  };

  const fetchDonations = async (page = 1, kId = selectedKovil, date = selectedDate) => {
    setDonationLoading(true);
    try {
      let url = `http://localhost:3000/api/users/filter?page=${page}&limit=${LIMIT}`;
      if (kId) url += `&kovil_id=${kId}`;
      if (date) {
        const year = new Date(date).getFullYear();
        url += `&year=${year}`;
      }
      const res = await axios.get(url);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setDonations(resData || []);
        setDonationTotal(resData?.length || 0);
      } else if (resData && typeof resData === 'object') {
        setDonations(resData.data || []);
        setDonationTotal(resData.total || 0);
      } else {
        setDonations([]);
        setDonationTotal(0);
      }
      setDonationPage(page);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setDonations([]);
      setDonationTotal(0);
    } finally {
      setDonationLoading(false);
    }
  };

  const fetchExpenses = async (page = 1, kId = selectedKovil, date = selectedDate) => {
    setExpenseLoading(true);
    try {
      let url = `http://localhost:3000/api/expenses?page=${page}&limit=${LIMIT}`;
      if (kId) url += `&kovil_id=${kId}`;
      if (date) {
        const year = new Date(date).getFullYear();
        url += `&year=${year}`;
      }
      const res = await axios.get(url);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setExpenses(resData || []);
        setExpenseTotal(resData?.length || 0);
      } else if (resData && typeof resData === 'object') {
        setExpenses(resData.data || []);
        setExpenseTotal(resData.total || 0);
      } else {
        setExpenses([]);
        setExpenseTotal(0);
      }
      setExpensePage(page);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
      setExpenseTotal(0);
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleKovilChange = (e) => {
    const kId = e.target.value;
    setSelectedKovil(kId);
    setDonationPage(1);
    setExpensePage(1);
    fetchBalance(kId);
    fetchDonations(1, kId, selectedDate);
    fetchExpenses(1, kId, selectedDate);
    if (kId) {
        navigate(`/temple-records/${kId}`);
    } else {
        navigate(`/temple-records`);
    }
  };

  const handleSearch = () => {
    setDonationPage(1);
    setExpensePage(1);
    fetchBalance();
    fetchDonations(1);
    fetchExpenses(1);
  };

  const handleDonationPageChange = (event, value) => {
    fetchDonations(value);
  };

  const handleExpensePageChange = (event, value) => {
    fetchExpenses(value);
  };

  const handleExportPdf = () => {
    const type = tabValue === 0 ? 'users' : 'expenses';
    let url = `http://localhost:3000/api/${type}/export/pdf?`;
    if (selectedKovil) url += `kovil_id=${selectedKovil}&`;
    if (selectedDate) {
      const year = new Date(selectedDate).getFullYear();
      url += `year=${year}`;
    }
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 4 }}>
        Temple Records & Financial Audit
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="temple-select-label">Select Temple</InputLabel>
              <Select
                labelId="temple-select-label"
                value={kovils && kovils.some(k => k.id == selectedKovil) ? selectedKovil : ''}
                onChange={handleKovilChange}
                label="Select Temple"
              >
                <MenuItem value="">All Temples</MenuItem>
                {(kovils || []).map((k) => (
                  <MenuItem key={k.id} value={k.id}>{k.kovil_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by Year"
                views={['year']}
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button variant="contained" fullWidth onClick={handleSearch} sx={{ fontWeight: 'bold' }}>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<FileDownload />} 
                onClick={handleExportPdf}
                disabled={tabValue === 0 ? ((donations || []).length === 0) : ((expenses || []).length === 0)}
            >
              Export {tabValue === 0 ? 'Donations' : 'Expenses'} PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
              <Typography variant="overline">Net Balance</Typography>
              <Typography variant="h5">₹{parseFloat(balanceData?.balance || 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="fullWidth">
            <Tab label={`Donations (${donationTotal || 0})`} />
            <Tab label={`Expenses (${expenseTotal || 0})`} />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Donor Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Temple</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(donations || []).map((don) => (
                    <TableRow key={don.id} hover>
                      <TableCell>{don.firstname} {don.lastname}</TableCell>
                      <TableCell>{don.dates ? new Date(don.dates).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>₹{don.amount}</TableCell>
                      <TableCell>{don.kovil_name}</TableCell>
                    </TableRow>
                  ))}
                  {(donations || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No donations found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack spacing={2} sx={{ p: 2, alignItems: 'center' }}>
              <Pagination 
                count={Math.ceil((donationTotal || 0) / LIMIT) || 1} 
                page={donationPage} 
                onChange={handleDonationPageChange} 
                color="primary" 
              />
            </Stack>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Temple</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Bill</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(expenses || []).map((exp) => (
                    <TableRow key={exp.id} hover>
                      <TableCell>{exp.dates ? new Date(exp.dates).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{exp.item_name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>₹{exp.amount}</TableCell>
                      <TableCell>{exp.kovil_name}</TableCell>
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
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No expenses recorded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack spacing={2} sx={{ p: 2, alignItems: 'center' }}>
              <Pagination 
                count={Math.ceil((expenseTotal || 0) / LIMIT) || 1} 
                page={expensePage} 
                onChange={handleExpensePageChange} 
                color="primary" 
              />
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TempleRecords;

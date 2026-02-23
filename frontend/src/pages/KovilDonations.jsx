import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Breadcrumbs,
  Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const KovilDonations = () => {
  const { kovilId } = useParams();
  const [donations, setDonations] = useState([]);
  const [balanceData, setBalanceData] = useState({ total_donations: 0, total_expenses: 0, balance: 0 });
  const [kovilName, setKovilName] = useState('Temple');
  const [kovils, setKovils] = useState([]);
  
  // Filtering state
  const [selectedTemple, setSelectedTemple] = useState(kovilId || "");
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchData = async (tId = selectedTemple, sDate = selectedDate) => {
    try {
      let donationUrl = `http://localhost:3000/api/users/filter?`;
      if (tId) donationUrl += `kovil_id=${tId}&`;
      if (sDate) {
        const year = new Date(sDate).getFullYear();
        donationUrl += `year=${year}`;
      }

      const [donRes, balRes, kovilRes] = await Promise.all([
        axios.get(donationUrl),
        axios.get(tId ? `http://localhost:3000/api/expenses/${tId}/balance` : `http://localhost:3000/api/expenses/summary`),
        axios.get('http://localhost:3000/api/kovils')
      ]);

      const donData = donRes.data;
      if (Array.isArray(donData)) {
          setDonations(donData);
      } else if (donData && donData.data) {
          setDonations(donData.data);
      } else {
          setDonations([]);
      }

      setKovils(kovilRes.data || []);
      setBalanceData(balRes.data || { total_donations: 0, total_expenses: 0, balance: 0 });
      
      if (tId) {
        const kovil = (kovilRes.data || []).find(k => k.id === parseInt(tId));
        if (kovil) setKovilName(kovil.kovil_name);
      } else {
        setKovilName("All Temples");
      }
    } catch (err) {
      console.error(err);
      setDonations([]);
    }
  };

  useEffect(() => {
    fetchData(kovilId);
  }, [kovilId]);

  const handleSearch = () => {
    fetchData();
  };

  const handleExport = () => {
    let url = 'http://localhost:3000/api/users/export/pdf?';
    if (selectedTemple) url += `kovil_id=${selectedTemple}&`;
    if (selectedDate) {
      const year = new Date(selectedDate).getFullYear();
      url += `year=${year}`;
    }
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 1 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" to="/temple-records" style={{ textDecoration: 'none', color: '#666' }}>
            Temple Records
          </Link>
          <Typography color="text.primary">{kovilName}</Typography>
        </Breadcrumbs>
      </Box>

      <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        {kovilName} Donation History
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
              <Typography variant="overline">Temple Net Balance</Typography>
              <Typography variant="h5">₹{parseFloat(balanceData?.balance || 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="medium">Donation List</Typography>
          
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>First Name</TableCell>
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
      </Paper>
    </Container>
  );
};

export default KovilDonations;

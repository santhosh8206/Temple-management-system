import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function AddUser() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    amount: '',
    dates: null,
    kovil_id: '',
  });
  
  const [summaryData, setSummaryData] = useState({ total_donations: 0, total_expenses: 0, balance: 0 });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const [kovils, setKovils] = useState([]);
  
  // Total Donation Filters
  const [totalKovilFilter, setTotalKovilFilter] = useState('');

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'kovil_id') {
      setTotalKovilFilter(value);
    }
  };

  const fetchBalance = async () => {
    try {
      let url = 'http://localhost:3000/api/expenses/summary';
      if (totalKovilFilter) {
        url = `http://localhost:3000/api/expenses/${totalKovilFilter}/balance`;
      }

      const response = await axios.get(url);
      setSummaryData(response.data || { total_donations: 0, total_expenses: 0, balance: 0 });
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [totalKovilFilter]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/kovils')
      .then(res => setKovils(res.data || []))
      .catch(err => console.error('Error fetching kovils:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/users', formData);
      showNotification('User successfully added!', 'success');
      const submittedKovilId = formData.kovil_id;
      setFormData({ firstname: '', lastname: '', amount: '', dates: null, kovil_id: submittedKovilId });
      fetchBalance();
    } catch (err) {
      console.error('Error submitting user:', err);
      showNotification('Failed to add user. Check backend logs.', 'error');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 4 }}>
        Register New Donator
      </Typography>

      <Grid container spacing={4}>
        
        {/* LEFT COLUMN — FORM */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
              Donation Form
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Amount (₹)"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={formData.dates ? new Date(formData.dates) : null}
                      onChange={(newValue) =>
                        setFormData({
                          ...formData,
                          dates: newValue
                            ? newValue.toISOString().split("T")[0]
                            : "",
                        })
                      }
                      sx={{ width: "100%" }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel id="kovil-select-label">Kovil</InputLabel>
                    <Select
                      labelId="kovil-select-label"
                      name="kovil_id"
                      value={formData.kovil_id}
                      onChange={handleChange}
                      label="Kovil"
                    >
                      {(kovils || []).map((kovil) => (
                        <MenuItem key={kovil.id} value={kovil.id}>
                          {kovil.kovil_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ py: 1.5, fontWeight: "bold" }}
                  >
                    Donate
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN — BALANCE SUMMARY */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 350,
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                Available Balance
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                ₹{parseFloat(summaryData.balance || 0).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 1 }}>
                    <Typography variant="body2">Total Donations</Typography>
                    <Typography variant="body2" fontWeight="bold">₹{parseFloat(summaryData.total_donations || 0).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 1 }}>
                    <Typography variant="body2">Total Expenses</Typography>
                    <Typography variant="body2" fontWeight="bold">₹{parseFloat(summaryData.total_expenses || 0).toLocaleString()}</Typography>
                </Box>
            </Box>

            <Box sx={{ width: '100%', mt: 'auto' }}>
              <FormControl size="small" sx={{ bgcolor: 'white', borderRadius: 1, width: '100%' }}>
                <InputLabel>Filter by Temple</InputLabel>
                <Select
                  value={totalKovilFilter}
                  onChange={(e) => setTotalKovilFilter(e.target.value)}
                  label="Filter by Temple"
                >
                  <MenuItem value="">System-Wide Summary</MenuItem>
                  {(kovils || []).map((kovil) => (
                    <MenuItem key={kovil.id} value={kovil.id}>
                      {kovil.kovil_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

      </Grid>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%', boxShadow: 3 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddUser;

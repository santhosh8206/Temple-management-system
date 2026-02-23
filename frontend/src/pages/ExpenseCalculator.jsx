import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Grid
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function ExpenseCalculator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_name: '',
    amount: '',
    kovil_id: '',
    dates: null,
  });
  const [file, setFile] = useState(null);
  const [kovils, setKovils] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    axios.get('http://localhost:3000/api/kovils')
      .then(res => setKovils(res.data || []))
      .catch(err => console.error('Error fetching kovils:', err));
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
        setNotification({ open: true, message: 'Only JPG and PNG images are allowed!', severity: 'error' });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setNotification({ open: true, message: 'File size must be less than 5MB!', severity: 'error' });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setNotification({ open: true, message: 'Bill photo is mandatory!', severity: 'error' });
      return;
    }

    const data = new FormData();
    data.append('item_name', formData.item_name);
    data.append('amount', formData.amount);
    data.append('kovil_id', formData.kovil_id);
    data.append('dates', formData.dates || '');
    data.append('bill_image', file);

    try {
      await axios.post('http://localhost:3000/api/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNotification({ open: true, message: 'Expense added successfully! Redirecting...', severity: 'success' });
      setTimeout(() => navigate(`/temple-records/${formData.kovil_id}`), 2000);
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: 'Failed to add expense. Check logs.', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 4 }}>
        Expense Calculator
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Item Name"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Kovil</InputLabel>
                <Select
                  value={formData.kovil_id}
                  onChange={(e) => setFormData({ ...formData, kovil_id: e.target.value })}
                  label="Kovil"
                >
                  {(kovils || []).map((kovil) => (
                    <MenuItem key={kovil.id} value={kovil.id}>{kovil.kovil_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.dates ? new Date(formData.dates) : null}
                  onChange={(newValue) => setFormData({ ...formData, dates: newValue ? newValue.toISOString().split('T')[0] : '' })}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 2, borderStyle: 'dashed' }}
              >
                {file ? `Selected: ${file.name}` : 'Upload Mandatory Bill Photo'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Grid>
            <Grid size={12}>
              <Button type="submit" variant="contained" color="error" fullWidth size="large" sx={{ py: 1.5, fontWeight: 'bold' }}>
                Record Expense
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default ExpenseCalculator;

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Avatar,
  Chip,
  Grid
} from '@mui/material';
import { 
  History, 
  CheckCircle, 
  Person,
  Info,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function AuditLog() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kovils, setKovils] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchAuditLog = async (tId = selectedTemple, sDate = selectedDate) => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/api/audit-log?';
      if (tId) url += `kovil_id=${tId}&`;
      if (sDate) {
        const year = new Date(sDate).getFullYear();
        url += `year=${year}`;
      }
      
      const response = await axios.get(url);
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching audit log:', err);
      setError('Failed to load audit log data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
    axios.get('http://localhost:3000/api/kovils')
      .then(res => setKovils(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = () => {
    fetchAuditLog();
  };

  const handleExport = () => {
    let url = 'http://localhost:3000/api/audit-log/export/pdf?';
    if (selectedTemple) url += `kovil_id=${selectedTemple}&`;
    if (selectedDate) {
      const year = new Date(selectedDate).getFullYear();
      url += `year=${year}`;
    }
    window.open(url, '_blank');
  };

  const stats = {
    total_temples: data.length,
    net_balance: data.reduce((acc, curr) => acc + (curr.balance || 0), 0)
  };

  if (loading && data.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 4 }}>
        System Audit Logs
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><History /></Avatar>
            <Box>
              <Typography variant="h6">{stats.total_temples}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Temples Audited</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'secondary.main', color: 'white' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><CheckCircle /></Avatar>
            <Box>
              <Typography variant="h6">₹{stats.net_balance.toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Net Balance</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2, mb: 4 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="medium">
               Cumulative Temple Totals
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>Temple</InputLabel>
                <Select
                  value={selectedTemple}
                  onChange={(e) => setSelectedTemple(e.target.value)}
                  label="Temple"
                >
                  <MenuItem value="">All Temples</MenuItem>
                  {(kovils || []).map((kovil) => (
                    <MenuItem key={kovil.id} value={kovil.id}>
                      {kovil.kovil_name}
                    </MenuItem>
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

              <Button variant="contained" color="info" onClick={handleSearch} sx={{ height: 40, fontWeight: 'bold' }}>
                Search
              </Button>

              <Button variant="contained" color="secondary" onClick={handleExport} sx={{ height: 40, fontWeight: 'bold' }}>
                Export PDF
              </Button>
            </Box>
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Temple Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Donations</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Expenses</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Net Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data || []).map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{item.kovil_name}</TableCell>
                    <TableCell align="right" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                      ₹{parseFloat(item.total_donations || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      ₹{parseFloat(item.total_expenses || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: item.balance < 0 ? 'error.dark' : 'primary.main' }}>
                      ₹{parseFloat(item.balance || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(data || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No audit logs found for the selected temple and year.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default AuditLog;

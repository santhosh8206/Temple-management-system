import { useState, useEffect } from 'react';
import axios from 'axios';
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  TableSortLabel,
  Button,
  Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  
  const [kovils, setKovils] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('dates');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users from backend. Is the server running?');
    }
  };

  const handleSearch = async () => {
    try {
      let url = "http://localhost:3000/api/users/filter?";

      if (selectedTemple) {
        url += `kovil_id=${selectedTemple}&`;
      }

      if (selectedDate) {
        const year = new Date(selectedDate).getFullYear();
        url += `year=${year}`;
      }

      const res = await axios.get(url);
      const resData = res.data;
      if (Array.isArray(resData)) {
          setUsers(resData);
      } else if (resData && resData.data) {
          setUsers(resData.data);
      } else {
          setUsers([]);
      }
    } catch (err) {
      console.error('Error filtering users:', err);
      setError('Failed to filter users. Check backend logs.');
    }
  };

  useEffect(() => {
    fetchUsers();
    axios.get('http://localhost:3000/api/kovils')
      .then(res => setKovils(res.data || []))
      .catch(err => console.error('Error fetching kovils:', err));
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort and paginate data
  const sortedUsers = [...(users || [])].sort((a, b) => {
    if (orderBy === 'amount') {
      return order === 'asc' ? (a.amount || 0) - (b.amount || 0) : (b.amount || 0) - (a.amount || 0);
    }
    if (orderBy === 'dates') {
      const dateA = a.dates ? new Date(a.dates) : new Date(0);
      const dateB = b.dates ? new Date(b.dates) : new Date(0);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 4 }}>
        All Donations
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2, mb: 6 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="medium" sx={{ whiteSpace: 'nowrap' }}>
              Users List
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>Temple</InputLabel>
                <Select
                  value={selectedTemple}
                  onChange={(e) => setSelectedTemple(e.target.value)}
                  label="Temple"
                >
                  <MenuItem value="">All</MenuItem>
                  {(kovils || []).map((kovil) => (
                    <MenuItem key={kovil.id} value={kovil.id}>
                      {kovil.kovil_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={selectedDate ? new Date(selectedDate) : null}
                  onChange={(newValue) =>
                    setSelectedDate(
                      newValue ? newValue.toISOString().split("T")[0] : ""
                    )
                  }
                  slotProps={{ textField: { size: 'small', sx: { bgcolor: 'white', borderRadius: 1, minWidth: 200 } } }}
                />
              </LocalizationProvider>

              <Button
                variant="contained"
                onClick={handleSearch}
                color="info"
                sx={{ height: 40, fontWeight: "bold" }}
              >
                Search
              </Button>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => window.open('http://localhost:3000/api/users/export/pdf', '_blank')}
              sx={{ whiteSpace: 'nowrap', height: 40 }}
            >
              Export as PDF
            </Button>
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'dates'}
                      direction={orderBy === 'dates' ? order : 'asc'}
                      onClick={() => handleRequestSort('dates')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'amount'}
                      direction={orderBy === 'amount' ? order : 'asc'}
                      onClick={() => handleRequestSort('amount')}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Kovil Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {user.firstname} {user.lastname}
                      </TableCell>
                      <TableCell>{user.dates ? new Date(user.dates).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>₹{user.amount}</TableCell>
                      <TableCell>{user.kovil_name || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={(users || []).length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
}

export default UsersList;

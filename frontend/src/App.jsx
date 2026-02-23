import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AddUser from './pages/AddUser';
import UsersList from './pages/UsersList';
import AuditLog from './pages/AuditLog';
import ExpenseCalculator from './pages/ExpenseCalculator';
import KovilExpenses from './pages/KovilExpenses';
import TempleRecords from './pages/TempleRecords';
import KovilDonations from './pages/KovilDonations';
import {
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',  // Indigo
      dark: '#3730A3',
      light: '#818CF8',
    },
    secondary: {
      main: '#10B981',  // Emerald
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF',
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 4px 0 rgba(79, 70, 229, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 16px 0 rgba(79, 70, 229, 0.3)',
            transform: 'translateY(-2px)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease-in-out',
            backgroundColor: '#F9FAFB',
            '&:hover': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 4px 0 rgba(0,0,0,0.02)',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.1)',
            }
          }
        }
      }
    }
  }
});

function Navigation() {
  const location = useLocation();
  
  return (
    <AppBar position="static" sx={{ mb: 4 }} elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Temple Management System
        </Typography>
        <Button 
          color="inherit" 
          component={Link} 
          to="/" 
          sx={{ mr: 2, fontWeight: location.pathname === '/' ? 'bold' : 'normal', borderBottom: location.pathname === '/' ? '2px solid white' : 'none' }}
        >
          Dashboard
        </Button>
        <Button 
          color="inherit" 
          component={Link} 
          to="/temple-records"
          sx={{ mr: 2, fontWeight: location.pathname.startsWith('/temple-records') ? 'bold' : 'normal', borderBottom: location.pathname.startsWith('/temple-records') ? '2px solid white' : 'none' }}
        >
          Temple Records
        </Button>
        <Button 
          color="inherit" 
          component={Link} 
          to="/audit"
          sx={{ mr: 2, fontWeight: location.pathname === '/audit' ? 'bold' : 'normal', borderBottom: location.pathname === '/audit' ? '2px solid white' : 'none' }}
        >
          Audit Log
        </Button>
        <Button 
          color="inherit" 
          component={Link} 
          to="/add-expense"
          sx={{ mr: 2, fontWeight: location.pathname === '/add-expense' ? 'bold' : 'normal', borderBottom: location.pathname === '/add-expense' ? '2px solid white' : 'none' }}
        >
          Add Expense
        </Button>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<AddUser />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/temple-records" element={<TempleRecords />} />
            <Route path="/temple-records/:kovilId" element={<TempleRecords />} />
            <Route path="/donations/:kovilId" element={<KovilDonations />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/add-expense" element={<ExpenseCalculator />} />
            <Route path="/expenses/:kovilId" element={<KovilExpenses />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

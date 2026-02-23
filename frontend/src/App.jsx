import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AddUser from './pages/AddUser';
import UsersList from './pages/UsersList';
import AuditLog from './pages/AuditLog';
import ExpenseCalculator from './pages/ExpenseCalculator';
import KovilExpenses from './pages/KovilExpenses';
import TempleRecords from './pages/TempleRecords';
import KovilDonations from './pages/KovilDonations';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as TempleIcon,
  Assessment as AuditIcon,
  AddCircle as ExpenseIcon,
  People as UsersIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

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

const DRAWER_WIDTH = 280;

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Temple Records', icon: <TempleIcon />, path: '/temple-records' },
    { text: 'Audit Log', icon: <AuditIcon />, path: '/audit' },
    { text: 'Add Expense', icon: <ExpenseIcon />, path: '/add-expense' },
    { text: 'Users List', icon: <UsersIcon />, path: '/users' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'primary.dark',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TempleIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
        <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
          KMS Admin
        </Typography>
      </Box>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
      
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
            
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'secondary.main' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ mt: 'auto', p: 3 }}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'rgba(255,255,255,0.05)', 
            color: 'white', 
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 1 }}>
            Connected to 
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            Temple Backend v1.0
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
}

function TopHeader() {
  const location = useLocation();
  const getTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/temple-records')) return 'Temple Records';
    if (location.pathname === '/audit') return 'Financial Audit Log';
    if (location.pathname === '/add-expense') return 'Record New Expense';
    if (location.pathname === '/users') return 'Users Management';
    return 'Temple Management';
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.default', 
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 4
      }}
    >
      <Toolbar>
        <Typography variant="h5" fontWeight="bold">
          {getTitle()}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
            <TopHeader />
            <Box sx={{ px: 4, pb: 4 }}>
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
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

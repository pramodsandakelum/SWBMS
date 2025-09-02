import { useState } from "react";
import {
  CssBaseline, Box, Typography, AppBar, Toolbar, Container,
  Dialog, DialogContent, TextField, Button, IconButton, Snackbar, Alert,
  Tabs, Tab, ThemeProvider, createTheme
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Dashboard from "./components/Dashboard";
import RouteMap from "./components/RouteMap";
import { useMQTT } from "./hooks/useMQTT";
import {
  RecyclingOutlined, Dashboard as DashboardIcon,
  Close as CloseIcon, Add as AddIcon, Login as LoginIcon,
  AutoAwesome, Visibility
} from "@mui/icons-material";

// Minimal Supabase-inspired MUI theme
const supabaseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3ECF8E' },
    secondary: { main: '#1F2937' },
    background: { default: '#0F1419', paper: '#1A1A1A' },
    text: { primary: '#F8FAFC', secondary: '#94A3B8' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h4: { fontWeight: 600, fontSize: '1.75rem' },
    h6: { fontWeight: 600 }
  }
});

// Reusable dialog container component
const DialogContainer = ({ titleIcon, title, children, onClose }) => (
  <Dialog
    open={true}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{ className: "bg-slate-900 border border-slate-700 rounded-lg" }}
  >
    <DialogContent className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          {titleIcon}
          <Typography variant="h5" className="font-semibold">{title}</Typography>
        </div>
        <IconButton onClick={onClose} className="text-slate-400">
          <CloseIcon />
        </IconButton>
      </div>
      {children}
    </DialogContent>
  </Dialog>
);

function App() {
  const bins = useMQTT();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [newBin, setNewBin] = useState({ location_name: '', latitude: '', longitude: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [aiPredOpen, setAiPredOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);


  const ADMIN_CREDENTIALS = { username: 'admin', password: 'swbms2024' };

  const formatDate = (value) => value ? new Date(value).toLocaleString() : 'N/A';
  const formatDateOnly = (value) => value ? new Date(value).toLocaleDateString() : 'N/A';
  const formatWeight = (value) => typeof value === 'number' ? `${value.toFixed(2)} kg` : value;

  const latestPredictionsColumns = [
    { field: 'device_id', headerName: 'Bin ID', width: 300, renderCell: (p) => <span className="font-mono text-sm text-emerald-400 font-semibold">{p.value}</span> },
    { field: 'predicted_weight', headerName: 'Predicted Weight', width: 180, type: 'number', valueFormatter: (v) => formatWeight(v), renderCell: (p) => <span className="text-emerald-300 font-semibold">{formatWeight(p.value)}</span> },
    { field: 'predicted_for', headerName: 'Prediction Date', width: 150, valueFormatter: (v) => formatDateOnly(v) },
  ];

  const predictionHistoryColumns = [
    { field: 'device_id', headerName: 'Bin ID', width: 280, renderCell: (p) => <span className="font-mono text-sm text-emerald-400 font-semibold">{p.value}</span> },
    { field: 'predicted_weight', headerName: 'Weight', width: 130, type: 'number', valueFormatter: (v) => formatWeight(v), renderCell: (p) => <span className="text-emerald-300 font-semibold">{formatWeight(p.value)}</span> },
    { field: 'predicted_for', headerName: 'For Date', width: 120, valueFormatter: (v) => formatDateOnly(v) },
    { field: 'prediction_timestamp', headerName: 'Created At', width: 170, valueFormatter: (v) => formatDate(v) },
  ];

  const handleLogin = () => {
    if (loginData.username === ADMIN_CREDENTIALS.username && loginData.password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Invalid credentials!', severity: 'error' });
    }
  };

  const handleAddBin = () => {
    if (!newBin.location_name || !newBin.latitude || !newBin.longitude) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
      return;
    }
    const lat = parseFloat(newBin.latitude), lng = parseFloat(newBin.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSnackbar({ open: true, message: 'Invalid coordinates', severity: 'error' });
      return;
    }
    setSnackbar({ open: true, message: 'Bin added successfully!', severity: 'success' });
    setNewBin({ location_name: '', latitude: '', longitude: '' });
    setTimeout(() => {
      setSettingsOpen(false);
      setIsLoggedIn(false);
      setLoginData({ username: '', password: '' });
    }, 2000);
  };

  const fetchLatestPredictions = async () => {
    try {
      const res = await fetch("https://swbms-ai-predictor.onrender.com/latest_predictions");
      const data = await res.json();
      if (data.status === "success") setLatestPredictions(data.predictions.map((p, i) => ({ ...p, id: i + 1 })));
    } catch { setSnackbar({ open: true, message: 'Failed to fetch latest predictions', severity: 'error' }); }
  };

  const fetchPredictionHistory = async () => {
    try {
      const res = await fetch("https://swbms-ai-predictor.onrender.com/prediction_history");
      const data = await res.json();
      if (data.status === "success") setPredictionHistory(data.predictions.map((p, i) => ({ ...p, id: i + 1 })));
    } catch { setSnackbar({ open: true, message: 'Failed to fetch prediction history', severity: 'error' }); }
  };

  const handleAIPredOpen = () => {
    setAiPredOpen(true);
    setActiveTab(0);
    fetchLatestPredictions();
    fetchPredictionHistory();
  };

  return (
    <ThemeProvider theme={supabaseTheme}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="static" className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30">
        <Toolbar className="py-3 px-6 flex justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <RecyclingOutlined className="text-2xl text-emerald-400" />
              <Typography variant="h4" className="font-bold text-slate-50">SWBMS</Typography>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-400">
              <div className="flex items-center space-x-2 hover:text-emerald-400 cursor-pointer">
                <DashboardIcon className="text-lg" />
                <span>Dashboard</span>
              </div>
              <button onClick={() => setSettingsOpen(true)} className="hover:text-slate-50">Settings</button>
              <button onClick={handleAIPredOpen} className="flex items-center space-x-2 hover:text-emerald-400">
                <AutoAwesome className="text-lg" />
                <span>AI Predictions</span>
              </button>
              <button
                onClick={() => setRouteOpen(true)}
                className="flex items-center space-x-2 hover:text-emerald-400"
              >
                <DashboardIcon className="text-lg" />
                <span>Route Optimization</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-medium">Online</span>
          </div>
        </Toolbar>
      </AppBar>

      {/*Dashboard */}
      <Box className="min-h-screen">
        <Container maxWidth="xl" className="py-8">
          <div className="text-center mb-8">

            <Typography
              variant="h5"
              className="text-slate-500 w-full text-center px-4"
            >
              Real-time monitoring and AI-powered analytics for efficient waste management
            </Typography>

          </div>
          <Dashboard bins={bins} />
        </Container>

        {/* Footer */}
        <Box className="border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm py-6 mt-12">
          <Container maxWidth="xl" className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <span>© 2025 SWBMS. Smart waste management solutions.</span>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center text-emerald-400 space-x-1">
                <Visibility className="text-sm" />
                <span className="font-medium">{bins.length} bins connected</span>
              </div>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>
                <img
                  src="https://cronitor.io/badges/QZdCTY/production/tTOHKihdgbW3yEv9-GoHl-J13qo.svg"
                  alt="SWBMS AI Predictor"
                />
              </span>
            </div>
          </Container>
        </Box>
      </Box>

      {/* Settings Dialog */}
      {settingsOpen && (
        <DialogContainer
          titleIcon={isLoggedIn ? <AddIcon className="text-2xl text-emerald-400" /> : <LoginIcon className="text-2xl text-emerald-400" />}
          title={isLoggedIn ? "Add New Bin" : "Admin Access"}
          onClose={() => setSettingsOpen(false)}
        >
          {!isLoggedIn ? (
            <div className="space-y-4">
              <TextField label="Username" fullWidth value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
              <TextField label="Password" type="password" fullWidth value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
              <Button variant="contained" onClick={handleLogin} fullWidth size="large">Sign In</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <TextField label="Location Name" fullWidth value={newBin.location_name} onChange={(e) => setNewBin({ ...newBin, location_name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Latitude" type="number" inputProps={{ step: 'any' }} value={newBin.latitude} onChange={(e) => setNewBin({ ...newBin, latitude: e.target.value })} />
                <TextField label="Longitude" type="number" inputProps={{ step: 'any' }} value={newBin.longitude} onChange={(e) => setNewBin({ ...newBin, longitude: e.target.value })} />
              </div>
              <Button variant="contained" onClick={handleAddBin} fullWidth size="large">Add Bin</Button>
            </div>
          )}
        </DialogContainer>
      )}

      {/* AI Predictions Dialog */}
      {aiPredOpen && (
        <Dialog open onClose={() => setAiPredOpen(false)} maxWidth="lg" fullWidth PaperProps={{ className: "bg-slate-900 border border-slate-700 rounded-lg" }}>
          <DialogContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <AutoAwesome className="text-2xl text-emerald-400" />
                <Typography variant="h4" className="font-bold">AI Predictions</Typography>
              </div>
              <IconButton onClick={() => setAiPredOpen(false)} className="text-slate-400"><CloseIcon /></IconButton>
            </div>
            {/* Predict Now Button */}
            <div className="mb-4">
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch("https://swbms-ai-predictor.onrender.com/train", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                    const result = await res.json();
                    if (result.status === "success") {
                      alert(result.message);
                    } else {
                      alert("Prediction request failed: " + result.message);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Error sending prediction request");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? "Predicting..." : "Predict Now"}
              </Button>
            </div>

            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="fullWidth" indicatorColor="primary" className="border-b border-slate-700 mb-6">
              <Tab label="Latest Predictions" className="text-base font-medium" />
              <Tab label="Prediction History" className="text-base font-medium" />
            </Tabs>

            {activeTab === 0 && <DataGrid rows={latestPredictions} columns={latestPredictionsColumns} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[10, 25, 50]} disableSelectionOnClick getRowId={(row) => row.id} className="h-96" />}
            {activeTab === 1 && <DataGrid rows={predictionHistory} columns={predictionHistoryColumns} initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'prediction_timestamp', sort: 'desc' }] } }} pageSizeOptions={[25, 50, 100]} disableSelectionOnClick getRowId={(row) => row.id} className="h-96" />}
          </DialogContent>
        </Dialog>
      )}

      {/* RouteMap Dialog */}
      {routeOpen && (
        <Dialog
          open={true}
          onClose={() => setRouteOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ className: "bg-slate-900 border border-slate-700 rounded-lg" }}
        >
          <DialogContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <DashboardIcon className="text-2xl text-emerald-400" />
                <Typography variant="h4" className="font-bold">Route Optimization</Typography>
              </div>
              <IconButton onClick={() => setRouteOpen(false)} className="text-slate-400">
                <CloseIcon />
              </IconButton>
            </div>
            {/* RouteMap Component */}
            <RouteMap bins={bins} />
          </DialogContent>
        </Dialog>
      )}



      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} className="rounded-lg">{snackbar.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

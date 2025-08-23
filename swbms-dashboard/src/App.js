import React, { useState } from "react";
import {
  CssBaseline, Box, Typography, AppBar, Toolbar, Container, Dialog, DialogContent,
  TextField, Button, IconButton, Snackbar, Alert, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { useMQTT } from "./hooks/useMQTT";
import Dashboard from "./components/Dashboard";
import { RecyclingOutlined, Dashboard as DashboardIcon, Close as CloseIcon, Add as AddIcon, Login as LoginIcon } from "@mui/icons-material";

function App() {
  const bins = useMQTT(); // real-time MQTT updates
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [newBin, setNewBin] = useState({ location_name: '', latitude: '', longitude: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // AI Predictions Dialog
  const [aiPredOpen, setAiPredOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);

  // Hardcoded login credentials
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'swbms2024'
  };

  const handleLogin = () => {
    if (loginData.username === ADMIN_CREDENTIALS.username &&
      loginData.password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Invalid credentials!', severity: 'error' });
    }
  };

  const handleAddBin = async () => {
    if (!newBin.location_name || !newBin.latitude || !newBin.longitude) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
      return;
    }

    const lat = parseFloat(newBin.latitude);
    const lng = parseFloat(newBin.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSnackbar({ open: true, message: 'Please enter valid coordinates', severity: 'error' });
      return;
    }

    try {
      // Simulate adding bin (replace with real API call)
      setSnackbar({ open: true, message: 'Bin added successfully!', severity: 'success' });
      setNewBin({ location_name: '', latitude: '', longitude: '' });

      setTimeout(() => {
        setSettingsOpen(false);
        setIsLoggedIn(false);
        setLoginData({ username: '', password: '' });
      }, 2000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add bin. Please try again.', severity: 'error' });
    }
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
    setNewBin({ location_name: '', latitude: '', longitude: '' });
  };

  // AI Predictions Fetch
  const fetchLatestPredictions = async () => {
    try {
      const res = await fetch("https://your-backend.onrender.com/latest_predictions");
      const data = await res.json();
      if (data.status === "success") setLatestPredictions(data.predictions);
    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch latest predictions', severity: 'error' });
    }
  };

  const fetchPredictionHistory = async () => {
    try {
      const res = await fetch("https://your-backend.onrender.com/prediction_history");
      const data = await res.json();
      if (data.status === "success") setPredictionHistory(data.predictions);
    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch prediction history', severity: 'error' });
    }
  };

  const handleAIPredOpen = () => {
    setAiPredOpen(true);
    setActiveTab(0);
    fetchLatestPredictions();
    fetchPredictionHistory();
  };

  return (
    <>
      <CssBaseline />
      {/* AppBar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#24292f', borderBottom: '1px solid #30363d' }}>
        <Toolbar sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <RecyclingOutlined sx={{ fontSize: 28, mr: 1, color: '#f0f6fc' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f0f6fc', fontSize: '1.25rem' }}>SWBMS</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ color: '#f0f6fc', fontSize: '14px', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#7c8591' } }}>Dashboard</Typography>
              <Typography sx={{ color: '#7c8591', fontSize: '14px', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#f0f6fc' } }} onClick={() => setSettingsOpen(true)}>Settings</Typography>
              <Typography sx={{ color: '#7c8591', fontSize: '14px', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#f0f6fc' } }} onClick={handleAIPredOpen}>AI Predictions</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 8, height: 8, backgroundColor: '#238636', borderRadius: '50%', mr: 1, animation: 'pulse 2s infinite' }} />
            <Typography variant="body2" sx={{ color: '#7c8591', fontSize: '12px', fontWeight: 500 }}>Online</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ backgroundColor: "#0d1117", minHeight: "calc(100vh - 70px)" }}>
        <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
          <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid #30363d' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DashboardIcon sx={{ fontSize: 20, mr: 2, color: '#7c8591' }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#f0f6fc", fontSize: '24px' }}>Smart Waste Bin Management System</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "#7c8591", fontSize: '16px', fontWeight: 400 }}>Real-time monitoring and analytics for waste bin network management</Typography>
          </Box>

          <Box sx={{ '& .MuiPaper-root': { backgroundColor: '#161b22', border: '1px solid #30363d', color: '#f0f6fc' } }}>
            <Dashboard bins={bins} />
          </Box>
        </Container>

        <Box component="footer" sx={{ backgroundColor: '#161b22', borderTop: '1px solid #30363d', py: 4, mt: 6 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#7c8591', fontSize: '12px' }}>© 2024 SWBMS. Smart waste management solutions.</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: '#7c8591', fontSize: '12px' }}>{bins.length} bins connected</Typography>
                <Box sx={{ width: 4, height: 4, backgroundColor: '#30363d', borderRadius: '50%' }} />
                <Typography variant="body2" sx={{ color: '#7c8591', fontSize: '12px' }}>Last updated: {new Date().toLocaleTimeString()}</Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Settings Dialog (unchanged) */}
      <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: 3, color: '#f0f6fc' } }}>
        <DialogContent sx={{ p: 0 }}>
          {!isLoggedIn ? (
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}><LoginIcon sx={{ mr: 1, color: '#7c8591' }} /><Typography variant="h6" sx={{ color: '#f0f6fc', fontWeight: 600 }}>Admin Login</Typography></Box>
                <IconButton onClick={handleSettingsClose} sx={{ color: '#7c8591' }}><CloseIcon /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="Username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} fullWidth />
                <TextField label="Password" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} fullWidth />
                <Button variant="contained" onClick={handleLogin} fullWidth>Login</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}><AddIcon sx={{ mr: 1, color: '#7c8591' }} /><Typography variant="h6" sx={{ color: '#f0f6fc', fontWeight: 600 }}>Add New Bin</Typography></Box>
                <IconButton onClick={handleSettingsClose} sx={{ color: '#7c8591' }}><CloseIcon /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="Location Name" value={newBin.location_name} onChange={(e) => setNewBin({ ...newBin, location_name: e.target.value })} fullWidth />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="Latitude" value={newBin.latitude} onChange={(e) => setNewBin({ ...newBin, latitude: e.target.value })} fullWidth type="number" inputProps={{ step: 'any' }} />
                  <TextField label="Longitude" value={newBin.longitude} onChange={(e) => setNewBin({ ...newBin, longitude: e.target.value })} fullWidth type="number" inputProps={{ step: 'any' }} />
                </Box>
                <Button variant="contained" onClick={handleAddBin} fullWidth>Add Bin to System</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Predictions Dialog */}
      <Dialog open={aiPredOpen} onClose={() => setAiPredOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: 3, color: '#f0f6fc' } }}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#f0f6fc', fontWeight: 600 }}>AI Predictions</Typography>
            <IconButton onClick={() => setAiPredOpen(false)} sx={{ color: '#7c8591' }}><CloseIcon /></IconButton>
          </Box>

          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ borderBottom: 1, borderColor: '#30363d', mb: 2 }}>
            <Tab label="Latest Predictions" sx={{ color: activeTab === 0 ? '#238636' : '#7c8591' }} />
            <Tab label="Prediction History" sx={{ color: activeTab === 1 ? '#238636' : '#7c8591' }} />
          </Tabs>

          {activeTab === 0 && (
            <TableContainer component={Paper} sx={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bin ID</TableCell>
                    <TableCell>Predicted Weight</TableCell>
                    <TableCell>Predicted Fullness</TableCell>
                    <TableCell>For Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestPredictions.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.device_id}</TableCell>
                      <TableCell>{p.predicted_weight}</TableCell>
                      <TableCell>{p.predicted_fullness}</TableCell>
                      <TableCell>{new Date(p.predicted_for).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <TableContainer component={Paper} sx={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bin ID</TableCell>
                    <TableCell>Predicted Weight</TableCell>
                    <TableCell>Predicted Fullness</TableCell>
                    <TableCell>For Date</TableCell>
                    <TableCell>Prediction Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictionHistory.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.device_id}</TableCell>
                      <TableCell>{p.predicted_weight}</TableCell>
                      <TableCell>{p.predicted_fullness}</TableCell>
                      <TableCell>{new Date(p.predicted_for).toLocaleString()}</TableCell>
                      <TableCell>{new Date(p.prediction_timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}

export default App;

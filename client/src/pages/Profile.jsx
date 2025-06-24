import { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Avatar, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";
import { Navigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import axios from "axios";
import * as jwtDecode from "jwt-decode"; // Fixed import

export default function Profile() {
  const [username, setUsername] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  // Fetch user info and prediction history on component mount
  useEffect(() => {
    const fetchUserInfoAndPredictions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setRedirectToLogin(true);
        return;
      }

      try {
        // Fetch user info first
        let userInfo = null;
        try {
          const response = await axios.get("http://localhost:8000/users", {
            headers: { Authorization: `Bearer ${token}` }
          });
          userInfo = response.data;
        } catch (apiError) {
          console.log(apiError);
          try {
            // Decode token as a fallback
            const decodedToken = jwtDecode.jwtDecode(token);
            userInfo = { username: decodedToken.sub || decodedToken.username || "User" };
          } catch (decodeError) {
            console.error("Unable to get username:", decodeError);
            userInfo = { username: "User" };
          }
        }

        setUsername(userInfo.username);

        // Fetch prediction history
        const predictionResponse = await axios.get("http://localhost:8000/previous_predictions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPredictions(predictionResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user info or predictions:", error);
        setNotification({
          open: true,
          message: "Failed to load profile. Please try again.",
          severity: "error"
        });
        setLoading(false);
      }
    };

    fetchUserInfoAndPredictions();
  }, []);

  const handleLogout = () => {
    setNotification({
      open: true,
      message: "Logging out...",
      severity: "info"
    });

    // Clear the token from localStorage
    localStorage.removeItem("token");

    // Redirect to login page after a short delay
    setTimeout(() => {
      setRedirectToLogin(true);
    }, 1500);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (redirectToLogin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Box className="h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }
  
  const topHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    marginBottom: '20px',
  }

  const headerStyle={
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }

  const margin = {
    margin : "5px 0px"
  }

  return (
    <Container maxWidth="lg" className="py-12">
      {/* Page Header with more spacing */}
      <Box className="flex items-center justify-between mb-10" style={topHeaderStyle}>
        <Box className="flex items-center justify-center" style={headerStyle}>
          <TrendingUpIcon className="text-blue-600 mr-3" fontSize="large" />
          <Typography variant="h4" className="font-bold text-blue-600">
            StockSense
          </Typography>
        </Box>

        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout}
          size="large"
          className="border-red-400 text-red-500 hover:bg-red-50 px-6"
        >
          Logout
        </Button>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* User Profile Card with improved spacing */}
        <Card elevation={3} className="md:col-span-1" style={{marginBottom:"20px",padding:"20px"}}>
          <CardContent className="flex flex-col items-center p-8">
            <Avatar 
              className="bg-blue-600 w-28 h-28 mb-6 text-5xl"
              alt={username}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>

            <Typography variant="h5" className="font-bold mb-2" style={margin}>
              Hello {username}
            </Typography>

            <Typography variant="body1" className="text-lg">
                  Predictions Made: <span className="font-medium">{predictions.length}</span>
            </Typography>

          </CardContent>
        </Card>

        {/* Prediction History with improved spacing */}
        <Paper elevation={3} className="md:col-span-2 p-8"  style={{marginBottom:"20px",padding:"20px"}}>
          <Typography variant="h5" className="font-bold mb-6 flex items-center" style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"10px",marginBottom:"40px"}}>
            <HistoryIcon className="mr-3 text-blue-600" />
            Prediction History
          </Typography>

          {/* If no predictions are available, show message */}
          {predictions.length === 0 ? (
            <Typography variant="h6" className="text-gray-500 text-center">
              No predictions available
            </Typography>
          ) : (
            <TableContainer className="mb-6">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-100">
                  <TableCell className="font-bold py-4">Predicted At</TableCell>
                    <TableCell className="font-bold py-4">Ticker</TableCell>
                    <TableCell className="font-bold py-4">Batch Size</TableCell>
                    <TableCell className="font-bold py-4">Learning Rate</TableCell>
                    <TableCell className="font-bold py-4">Epochs</TableCell>
                    <TableCell className="font-bold py-4">Window Size</TableCell>
                    <TableCell className="font-bold py-4">MSE</TableCell>
                    <TableCell className="font-bold py-4">RMSE</TableCell>
                    <TableCell className="font-bold py-4">MAPE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell className="py-3 font-medium">{item.prediction_at}</TableCell>
                      <TableCell className="py-3 font-medium">{item.ticker}</TableCell>
                      <TableCell className="py-3">{item.batch_size}</TableCell>
                      <TableCell className="py-3">{item.learning_rate}</TableCell>
                      <TableCell className="py-3">{item.epochs}</TableCell>
                      <TableCell className="py-3">{item.window_size}</TableCell>
                      <TableCell className="py-3">{item.mse.toFixed(2)}</TableCell>
                      <TableCell className="py-3">{item.rmse.toFixed(2)}</TableCell>
                      <TableCell className="py-3">{item.mape.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </TableContainer>
          )}

          <Box className="mt-6 text-center">
            <Typography variant="body1" className="text-gray-600 italic" style={{marginTop:"20px"}}>
              Your recent prediction history is displayed above.
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} onClose={handleCloseNotification}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

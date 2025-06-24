import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Alert, 
  Snackbar, 
  Paper, 
  CircularProgress 
} from "@mui/material";
import { Navigate } from "react-router-dom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// eslint-disable-next-line react/prop-types
function Signup({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [redirect, setRedirect] = useState(false);

  const handleSignup = async () => {
    // Basic validation
    if (!username || !password) {
      setNotification({
        open: true,
        message: "Please fill in all fields",
        severity: "warning"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setNotification({
        open: true,
        message: "Passwords don't match",
        severity: "error"
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/signup", { username, password });
      setNotification({
        open: true,
        message: "Signup successful! Redirecting to login...",
        severity: "success"
      });
      
      // Redirect to login after short delay
      setTimeout(() => {
        setRedirect(true);
      }, 2000);
    } catch (error) {
      setNotification({
        open: true,
        message: `Signup failed: ${error.response?.data?.detail || "Unknown error"}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (redirect) {
    onSwitch();
    return null;
  }

  const signupFormContainerStyle = {
    width: '400px',
    height : '400px',
    margin: '10px auto',
    display: 'flex',
    justifyContent: 'center',
  }

  const signupFormStyle = {
    justifyContent : "center",
    gap : '16px'
  }

  const cursorPointer = {
    cursor : 'pointer',
  }


  return (
    <Paper elevation={12} className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl" style={signupFormContainerStyle}>
      <Box className="flex flex-col items-center gap-4" style={signupFormStyle}>

        <Typography variant="h4" className="font-bold text-gray-800 mb-4">
          Create Account
        </Typography>
        
        <TextField 
          label="Username" 
          variant="outlined" 
          fullWidth 
          className="mb-3"
          InputLabelProps={{ style: { color: "#4B5563" }}}
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        />
        
        <TextField 
          label="Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          className="mb-3"
          InputLabelProps={{ style: { color: "#4B5563" }}}
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <TextField 
          label="Confirm Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          className="mb-5"
          InputLabelProps={{ style: { color: "#4B5563" }}}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
        
        <Button 
          variant="contained" 
          fullWidth 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-3 text-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out" 
          onClick={handleSignup}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
        </Button>
        
        <Typography variant="body1" className="mt-4 text-gray-600">
          Already have an account? {" "}
          <span className="text-blue-600 font-medium" onClick={onSwitch} style={cursorPointer}>
            Login
          </span>
        </Typography>
      </Box>
      
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
    </Paper>
  );
}

// eslint-disable-next-line react/prop-types
function Login({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [redirectToHome, setRedirectToHome] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setNotification({
        open: true,
        message: "Please enter your username and password",
        severity: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/token", 
        new URLSearchParams({ username, password }), 
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      
      localStorage.setItem("token", response.data.access_token);
      setNotification({
        open: true,
        message: "Login successful! Redirecting to dashboard...",
        severity: "success"
      });
      
      // Redirect to home page after short delay
      setTimeout(() => {
        setRedirectToHome(true);
      }, 1500);
    } catch (error) {
      setNotification({
        open: true,
        message: `Login failed: ${error.response?.data?.detail || "Invalid credentials"}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (redirectToHome) {
    return <Navigate to="/" replace />;
  }

  const loginFormContainerStyle = {
    width: '400px',
    height : '400px',
    margin: '10px auto',
    display: 'flex',
    justifyContent: 'center',
  }

  const loginFormStyle = {
    justifyContent : "center",
    gap : '16px'
  }

  const cursorPointer = {
    cursor: 'pointer',
  }

  return (
    <Paper elevation={12} className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl" style={loginFormContainerStyle}>
      <Box className="flex flex-col" style={loginFormStyle}>

        <Typography variant="h4" className="font-bold text-gray-800 mb-4">
          Welcome Back
        </Typography>
        
        <TextField 
          label="Username" 
          variant="outlined" 
          fullWidth 
          className="mb-3"
          InputLabelProps={{ style: { color: "#4B5563" }}}
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        />
        
        <TextField 
          label="Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          className="mb-5"
          InputLabelProps={{ style: { color: "#4B5563" }}}
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <Button 
          variant="contained" 
          fullWidth 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-3 text-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out" 
          onClick={handleLogin}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
        
        <Typography variant="body1" className="mt-4 text-gray-600">
          Dont have an account? {" "}
          <span className="text-blue-600 font-medium cursor-pointer" onClick={onSwitch} style={cursorPointer}>
            Sign Up
          </span>
        </Typography>
      </Box>
      
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
    </Paper>
  );
}

export default function AuthApp() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to dashboard if token exists
      window.location.href = "/";
    } else {
      setIsAppLoading(false);
    }
  }, []);

  if (isAppLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <CircularProgress />
      </div>
    );
  }

  const styleTopHeadings = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginTop: "40px",
  }

  const styleTopHeadingsP = {
    justifyContent: "center",
    display: "flex",
    marginTop: "10px",
    marginBotton : "20px",
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Box className="flex flex-col items-center mb-8">
        <Box className="flex items-center mb-2" style={styleTopHeadings}>
          <TrendingUpIcon className="text-blue-600 mr-2" fontSize="large" />
          <Typography variant="h3" className="font-bold text-blue-600">
            StockSense
          </Typography>
        </Box>
        <Typography variant="h6" className="text-gray-600" style={styleTopHeadingsP}>
          Predict market trends with confidence
        </Typography>
      </Box>
      
      {isLogin ? 
        <Login onSwitch={() => setIsLogin(false)} /> : 
        <Signup onSwitch={() => setIsLogin(true)} />
      }
    </div>
  );
}

import { useState, useEffect } from "react";
import { 
  Container, 
  Grid, 
  Paper, 
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import Sidebar from "./Sidebar";
import StockForm from "./StockForm";
import StockEDA from "./StockEDA";
import axios from "axios";

function Home() {
  const [selectedTicker, setSelectedTicker] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setSelectedTicker("");
  };

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem("token");
    
    // Log token status for debugging
    console.log("Authentication check - Token exists:", !!token);
    
    if (!token) {
      console.log("No token found, redirecting to login");
      window.location.href = "/login";
      return;
    }
    
    // Set the token in axios default headers for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verify token with backend
    axios.get('/api/verify-token')
      .then((response) => {
        console.log("Token verified with server",response);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Token verification failed:", error);
        // Only redirect if the server explicitly says the token is invalid
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          // For other errors, still allow access but stop loading
          setIsLoading(false);
        }
      });
  }, []);

  // Show loading spinner until authentication is checked
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} style={{color:"black"}}>
        <CircularProgress />
      </Container>
    );
  }

  // Only render the actual content when authenticated and not loading
  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3} lg={2}>
          <Sidebar 
            onTickerSelect={setSelectedTicker}
            onSectorSelect={handleSectorSelect}
          />
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9} lg={10}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            {/* Search Bar at the top left */}
            <Box sx={{ mb: 2, maxWidth: 400 }}>
              <StockForm 
                selectedTicker={selectedTicker} 
                selectedSector={selectedSector}
                compact={true}
                searchOnly={true}
              />
            </Box>
            
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "medium" }}>
              {selectedTicker ? `${selectedTicker} Stock Prediction` : "Stock Prediction Tool (Hyperparameter tuned Model)"}
            </Typography>
            {selectedSector && !selectedTicker && (
              <Typography variant="subtitle1" color="text.secondary">
                Sector: {selectedSector}
              </Typography>
            )}
            
            {/* Stock Visualization and EDA Container */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} lg={selectedTicker ? 7 : 12}>
                <StockForm 
                  selectedTicker={selectedTicker} 
                  selectedSector={selectedSector}
                  compact={Boolean(selectedTicker)}
                  searchOnly={false}
                />
              </Grid>
              
              {/* EDA Section - Only show when a ticker is selected */}
              {selectedTicker && (
                <Grid item xs={12} lg={5}>
                  <Box>
                    <StockEDA ticker={selectedTicker} />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;
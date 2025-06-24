import { useState } from "react";
import { 
  Container, 
  Grid, 
  Paper, 
  Typography,
  Box,
  Breadcrumbs,
  Link
} from "@mui/material";
import Sidebar from "./Sidebar";
import StockEDA from "./StockEDA";

function EDAAnalysis() {
  const [selectedTicker, setSelectedTicker] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3} lg={2}>
          <Sidebar 
            onTickerSelect={setSelectedTicker} 
            onSectorSelect={setSelectedSector}
          />
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9} lg={10}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            {/* Breadcrumbs navigation */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
              <Link color="inherit" href="/">
                Home
              </Link>
              <Typography color="text.primary">Stock Analysis</Typography>
              {selectedTicker && (
                <Typography color="text.primary">{selectedTicker}</Typography>
              )}
            </Breadcrumbs>
            
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "medium" }}>
              {selectedTicker 
                ? `${selectedTicker} Exploratory Data Analysis` 
                : "Stock Exploratory Data Analysis"
              }
            </Typography>
            
            {selectedSector && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Sector: {selectedSector}
              </Typography>
            )}
            
            {!selectedTicker ? (
              <Box sx={{ 
                py: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                color: 'text.secondary'
              }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Select a ticker from the sidebar to view detailed analysis
                </Typography>
                <Typography variant="body1" align="center">
                  The exploratory data analysis will provide insights on historical price trends,
                  volatility, correlations, and key financial metrics.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {/* Full EDA content when a ticker is selected */}
                <StockEDA ticker={selectedTicker} fullView={true} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EDAAnalysis;
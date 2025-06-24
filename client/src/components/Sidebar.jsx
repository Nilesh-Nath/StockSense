import { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  Skeleton,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Chip,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";

// eslint-disable-next-line react/prop-types
function Sidebar({ onTickerSelect, onSectorSelect }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({});
  const [openCategories, setOpenCategories] = useState({});
  const [selectedTicker, setSelectedTicker] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  useEffect(() => {
    getTickers();
  }, []);

  async function getTickers() {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/get_available_tickers");
      
      // Group tickers by category/sector
      const grouped = response.data.reduce((acc, { ticker, sector }) => {
        if (!acc[sector]) {
          acc[sector] = [];
        }
        acc[sector].push(ticker);
        return acc;
      }, {});

      setCategories(grouped);
    } catch (error) {
      console.error("Error fetching tickers:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCategoryClick = (category) => {
    // Toggle the expansion state of the category
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
    
    // Set the selected sector and call the parent callback
    setSelectedSector(category);
    setSelectedTicker("");
    onSectorSelect(category);
  };

  const handleTickerClick = (ticker, sector) => {
    setSelectedTicker(ticker);
    setSelectedSector(sector);
    onTickerSelect(ticker);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2,
        height: "calc(100vh - 100px)",
        overflowY: "auto"
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "medium" }}>
        Sectors
      </Typography>
      
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rectangular" height={30} animation="wave" />
          <Skeleton variant="rectangular" height={30} animation="wave" />
          <Skeleton variant="rectangular" height={30} animation="wave" />
        </Box>
      ) : (
        <List component="nav" dense>
          {Object.keys(categories).map((category) => (
            <Box key={category} sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => handleCategoryClick(category)}
                selected={selectedSector === category && !selectedTicker}
                sx={{ 
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  }
                }}
              >
                <BusinessIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <ListItemText 
                  primary={category} 
                  primaryTypographyProps={{ 
                    fontWeight: "medium",
                    noWrap: true
                  }} 
                />
                <Chip 
                  label={categories[category].length} 
                  size="small" 
                  sx={{ mr: 1, height: 20 }}
                />
                {openCategories[category] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={openCategories[category]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                  {categories[category].map((ticker) => (
                    <ListItemButton 
                      key={ticker} 
                      sx={{ pl: 4, borderRadius: 1 }}
                      selected={ticker === selectedTicker}
                      onClick={() => handleTickerClick(ticker, category)}
                    >
                      <ListItemText 
                        primary={ticker} 
                        primaryTypographyProps={{ 
                          fontSize: "0.875rem",
                          noWrap: true
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default Sidebar;
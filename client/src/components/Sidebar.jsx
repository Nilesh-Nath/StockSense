import { 
    Paper, 
    Container,
    Typography,
    Skeleton
  } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

// eslint-disable-next-line react/prop-types
function Sidebar({ onTickerSelect }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
  
    const handleListItemClick = (index) => {
      setSelectedIndex(index);
      onTickerSelect(result[index]); // Set the ticker value in the form
    };
  
    useEffect(() => {
      getTicker();
    }, []);
  
    async function getTicker() {
        setLoading(true);
        try {
          const response = await axios.get('http://localhost:8000/get_available_tickers');
          console.log('Tickers:', response.data); // Debug log
          setResult(response.data);
        } catch (error) {
          console.error('Error fetching tickers:', error); // Debug log
        } finally {
          setLoading(false);
        }
      }
  
    function renderRow({ index, style }) {
      if (result.length === 0) {
        return <div style={style}>No data Available</div>;
      }
  
      return (
        <ListItem component="div" disablePadding style={style} key={index}>
          <ListItemButton
            selected={selectedIndex === index}
            onClick={() => handleListItemClick(index)}
            sx={{
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
              '&.Mui-selected': {
                backgroundColor: '#d1e3ff',
                color: '#1a73e8',
              },
              fontSize: '0.875rem',
              paddingY: 0.5, 
              paddingX: 1, 
            }}
          >
            <ListItemText primary={result[index]} />
          </ListItemButton>
        </ListItem>
      );
    }
  
    return (
      <Container>
        <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
          <Typography sx={{ mb: 2 }} variant="h6" component="div">
            Available Tickers
          </Typography>
          <Box
            sx={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
            }}
          >
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={46} animation="wave" count={10} />
            ) : (
              <FixedSizeList height={600} width="100%" itemSize={46} itemCount={result.length} overscanCount={5}>
                {renderRow}
              </FixedSizeList>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }
  
  export default Sidebar;
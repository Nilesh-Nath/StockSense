import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Paper, 
  Box, 
  Typography,
  Container,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingAnimation from './Loading'; 

// eslint-disable-next-line react/prop-types
function StockForm({ selectedTicker }) {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTicker) {
      setTicker(selectedTicker);
      fetchPrediction(selectedTicker);
    }
  }, [selectedTicker]);

  const fetchPrediction = async (ticker) => {
    setResult(null);
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/predict', { ticker });
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchPrediction(ticker);
  };

  const chartData = result?.predictions?.map((pred, index) => ({
    name: `Day ${index + 1}`,
    Predicted: Number(pred.toFixed(2)),
    Actual: Number(result.actual[index].toFixed(2))
  }));

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              fullWidth
              label="Stock Ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g., ADBL"
              variant="outlined"
            />
            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading}
              sx={{ px: 4 }}
            >
              Predict
            </Button>
          </Box>
        </form>

        {/* Error Message */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Loading Animation */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <LoadingAnimation />
          </Box>
        )}

        {/* Show results only when loading is false and result exists */}
        {!loading && result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Results for {result.ticker}
            </Typography>

            {/* Graph */}
            <Box sx={{ height: 400, mt: 4, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Predicted" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Actual" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ r: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Metrics */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 2,
              mt: 4 
            }}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">MSE</Typography>
                <Typography variant="h6">{result.metrics.MSE.toFixed(4)}</Typography>
              </Paper>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">RMSE</Typography>
                <Typography variant="h6">{result.metrics.RMSE.toFixed(4)}</Typography>
              </Paper>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">MAPE</Typography>
                <Typography variant="h6">{result.metrics.MAPE.toFixed(2)}%</Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default StockForm;

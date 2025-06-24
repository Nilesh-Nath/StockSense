import { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import LoadingAnimation from "./Loading";

// eslint-disable-next-line react/prop-types
function StockForm({ selectedTicker, selectedSector, compact = false, searchOnly = false }) {
  const [ticker, setTicker] = useState("");
  const [epochs, setEpochs] = useState("15");
  const [batchSize, setBatchSize] = useState("15");
  const [learningRate, setLearningRate] = useState("0.0014");
  const [windowSize, setWindowSize] = useState("6");
  const [result, setResult] = useState(null);
  const [normalLstmResult, setNormalLstmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [normalLstmLoading, setNormalLstmLoading] = useState(false);
  const [error, setError] = useState("");
  const [normalLstmError, setNormalLstmError] = useState("");

  useEffect(() => {
    if (selectedTicker && !searchOnly) {
      setTicker(selectedTicker);
      fetchPrediction(selectedTicker);
    } else if (selectedSector && !selectedTicker && !searchOnly) {
      fetchSectorPrediction(selectedSector);
    }
  }, [selectedTicker, selectedSector, searchOnly]);

  const fetchPrediction = async (tickerSymbol) => {
    setResult(null);
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:8000/predict", { ticker: tickerSymbol });
      console.log(response);
      setResult({
        ...response.data,
        ticker: tickerSymbol
      });
    } catch (error) {
      console.error("Prediction error:", error);
      setError(typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorPrediction = async (sector) => {
    setResult(null);
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:8000/get_sectorwise_prediction", { sector });
      setResult({
        ...response.data,
        ticker: `${sector} Sector`
      });
    } catch (error) {
      console.error("Sector prediction error:", error);
      setError(typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : "Failed to fetch sector prediction");
    } finally {
      setLoading(false);
    }
  };

  const fetchNormalLstmPrediction = async () => {
    setNormalLstmResult(null);
    setNormalLstmLoading(true);
    setNormalLstmError("");
    
    try {
      // Get the token from wherever you're storing it
      let token = localStorage.getItem('token'); 
      
      // Debugging
      console.log("Raw token:", token);
      
      // Handle case where token might already include "Bearer"
      if (token && !token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
      }
      
      console.log("Authorization header:", token);
      
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      const response = await axios.post(
        "http://localhost:8000/predict_with_normal_lstm", 
        { 
          ticker: ticker,
          window_size: parseInt(windowSize),
          learning_rate: parseFloat(learningRate),
          epochs: parseInt(epochs),
          batch_size: parseInt(batchSize)
        },
        {
          headers: {
            'Authorization': token
          }
        }
      );
      
      setNormalLstmResult({
        ...response.data,
        ticker: ticker
      });
    } catch (error) {
      console.error("Normal LSTM prediction error:", error);
      setNormalLstmError(
        error.message || 
        (typeof error.response?.data?.detail === 'string' 
          ? error.response.data.detail 
          : "Failed to fetch Normal LSTM prediction")
      );
    } finally {
      setNormalLstmLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      if (searchOnly) {
        // Handle the normal LSTM prediction when the form is used for searching
        fetchNormalLstmPrediction();
      } else {
        // Handle the regular prediction
        fetchPrediction(ticker);
      }
    }
  };

  // Safely prepare chart data
  const prepareChartData = (predictions, actual) => {
    if (!Array.isArray(predictions) || !Array.isArray(actual)) {
      return [];
    }
    
    return predictions.map((pred, index) => {
      if (index < actual.length) {
        return {
          name: `Day ${index + 1}`,
          Predicted: typeof pred === 'number' ? Number(pred.toFixed(2)) : 0,
          Actual: typeof actual[index] === 'number' ? Number(actual[index].toFixed(2)) : 0
        };
      }
      return {
        name: `Day ${index + 1}`,
        Predicted: typeof pred === 'number' ? Number(pred.toFixed(2)) : 0,
        Actual: 0
      };
    });
  };

  const chartData = result?.predictions && result?.actual 
    ? prepareChartData(result.predictions, result.actual)
    : [];

  const normalLstmChartData = normalLstmResult?.predictions && normalLstmResult?.actual
    ? prepareChartData(normalLstmResult.predictions, normalLstmResult.actual)
    : [];

  // Safely format metric values
  const formatMetric = (value) => {
    return typeof value === 'number' ? value.toFixed(4) : 'N/A';
  };

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';
  };

  // Only render the search form if searchOnly is true
  if (searchOnly) {
    return (
      <Box style={{width:"70vw"}}>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium" style={{marginBottom:"20px"}}>
            Predict with Custom LSTM ( Experiment With Hyperparameters )
          </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }} style={{ width: "100%" }}>
              <TextField
                size="small"
                label="Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g., AHPC"
                variant="outlined"
                sx={{ width: 180 }}
                required
              />
              <TextField
                size="small"
                label="Learning Rate"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                placeholder="e.g., 0.0014"
                variant="outlined"
                sx={{ width: 180 }}
                type="number"
                inputProps={{ step: 0.0001 }}
              />
              <TextField
                size="small"
                label="Epochs"
                value={epochs}
                onChange={(e) => setEpochs(e.target.value)}
                placeholder="e.g., 15"
                variant="outlined"
                sx={{ width: 180 }}
                type="number"
              />
              <TextField
                size="small"
                label="Batch Size"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                placeholder="e.g., 15"
                variant="outlined"
                sx={{ width: 180 }}
                type="number"
              />
              <TextField
                size="small"
                label="Window Size"
                value={windowSize}
                onChange={(e) => setWindowSize(e.target.value)}
                placeholder="e.g., 6"
                variant="outlined"
                sx={{ width: 180 }}
                type="number"
              />
              <Button
                variant="contained"
                type="submit"
                disabled={normalLstmLoading}
                size="small"
              >
                {normalLstmLoading ? <CircularProgress size={20} color="inherit" /> : "Predict"}
              </Button>
            </Box>
          </Box>
        </form>

        {normalLstmError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {normalLstmError.toString()}
          </Alert>
        )}

        {normalLstmLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <LoadingAnimation />
          </Box>
        )}

        {!normalLstmLoading && normalLstmResult && (
          <Box>

            {/* Graph */}
            {normalLstmChartData.length > 0 && (
              <Box sx={{ height: 400, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={normalLstmChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Predicted"
                      stroke="#ff7300"
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Actual"
                      stroke="#4caf50"
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Metrics */}
            {normalLstmResult.metrics && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                }}
              >
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                  <Typography variant="subtitle2" color="text.secondary">MSE</Typography>
                  <Typography variant="h6">{formatMetric(normalLstmResult.metrics.MSE)}</Typography>
                </Paper>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                  <Typography variant="subtitle2" color="text.secondary">RMSE</Typography>
                  <Typography variant="h6">{formatMetric(normalLstmResult.metrics.RMSE)}</Typography>
                </Paper>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                  <Typography variant="subtitle2" color="text.secondary">MAPE</Typography>
                  <Typography variant="h6">{formatPercentage(normalLstmResult.metrics.MAPE)}</Typography>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // Render the full component with chart if searchOnly is false
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.toString()}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <LoadingAnimation />
        </Box>
      )}

      {!loading && result && (
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            {result.ticker} Price Prediction
          </Typography>

          {/* Graph */}
          {chartData.length > 0 && (
            <Box sx={{ height: compact ? 300 : 400, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Predicted"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Actual"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Convergence Plot */}
          {result.convergence_plot && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Training Convergence
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  p: 2, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 1 
                }}
              >
                <img 
                  src={`data:image/png;base64,${result.convergence_plot}`} 
                  alt="Convergence Plot" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Box>
          )}

          {/* Metrics */}
          {result.metrics && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: compact 
                  ? "repeat(3, 1fr)" 
                  : "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                <Typography variant="subtitle2" color="text.secondary">MSE</Typography>
                <Typography variant="h6">{formatMetric(result.metrics.MSE)}</Typography>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                <Typography variant="subtitle2" color="text.secondary">RMSE</Typography>
                <Typography variant="h6">{formatMetric(result.metrics.RMSE)}</Typography>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                <Typography variant="subtitle2" color="text.secondary">MAPE</Typography>
                <Typography variant="h6">{formatPercentage(result.metrics.MAPE)}</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default StockForm;
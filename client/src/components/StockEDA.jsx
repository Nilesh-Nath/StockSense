import { useState, useEffect } from "react";
import React from "react";
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

// eslint-disable-next-line react/prop-types
function StockEDA({ ticker }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [edaData, setEdaData] = useState({
    statistics: {},
    missingValues: {},
    correlationMatrix: {},
    closingPricePlot: null,
    movingAvgPlot: null,
    heatmapPlot: null
  });
  
  // const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#8884d8', '#82ca9d'];

  useEffect(() => {
    // Fetch EDA data from the API
    setLoading(true);
    
    fetch(`http://localhost:8000/eda/${ticker}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Transform correlation matrix for visualization if needed
        const correlationData = [];
        if (data.correlation_matrix) {
          const columns = Object.keys(data.correlation_matrix);
          columns.forEach(col1 => {
            columns.forEach(col2 => {
              if (col1 !== col2) {
                correlationData.push({
                  x: col1,
                  y: col2,
                  z: data.correlation_matrix[col1][col2]
                });
              }
            });
          });
        }

        // Convert statistics to array for easier visualization
        const statsArray = [];
        if (data.statistics) {
          for (const [key, value] of Object.entries(data.statistics)) {
            statsArray.push({ name: key, value: value });
          }
        }

        // Convert missing values to array for visualization
        const missingValuesArray = [];
        if (data.missing_values) {
          for (const [key, value] of Object.entries(data.missing_values)) {
            missingValuesArray.push({ column: key, count: value });
          }
        }
        
        setEdaData({
          statistics: data.statistics || {},
          statsArray: statsArray,
          missingValues: data.missing_values || {},
          missingValuesArray: missingValuesArray,
          correlationMatrix: data.correlation_matrix || {},
          correlationData: correlationData,
          plots: data.plots || {}
        });
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching EDA data:', error);
        setLoading(false);
      });
  }, [ticker]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Function to render plots from base64 data
  const renderPlot = (plotData) => {
    if (!plotData) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
        <img 
          src={`data:image/png;base64,${plotData}`} 
          alt="Statistical plot"
          style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }}
        />
      </Box>
    );
  };

  return (
    <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        Exploratory Data Analysis for {ticker}
      </Typography>
      
      <Tabs 
        value={tabIndex} 
        onChange={handleTabChange}
        aria-label="EDA tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Statistics" />
        <Tab label="Missing Values" />
        <Tab label="Correlation" />
        <Tab label="Price Trends" />
        <Tab label="Moving Averages" />
      </Tabs>
      
      {loading ? (
        <Skeleton variant="rectangular" height={300} animation="wave" />
      ) : (
        <Box sx={{ minHeight: 300 }}>
          {tabIndex === 0 && (
            <Grid  spacing={2}>
              <Grid item >
                <TableContainer component={Paper} elevation={0} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Statistic</strong></TableCell>
                        <TableCell align="right"><strong>Value</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(edaData.statistics).map(([stat, value]) => {
                        // If the value is an object, render its key-value pairs
                        if (typeof value === 'object' && value !== null) {
                          return (
                            <React.Fragment key={stat}>
                              <TableRow>
                                <TableCell component="th" scope="row" colSpan={2}>
                                  <strong>{stat}</strong>
                                </TableCell>
                              </TableRow>
                              {Object.entries(value).map(([subStat, subValue]) => (
                                <TableRow key={`${stat}-${subStat}`}>
                                  <TableCell component="th" scope="row" sx={{ pl: 4 }}>
                                    {subStat}
                                  </TableCell>
                                  <TableCell align="right">
                                    {typeof subValue === 'number' ? subValue.toFixed(4) : subValue}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          );
                        }
                        // Otherwise, render the value directly
                        return (
                          <TableRow key={stat}>
                            <TableCell component="th" scope="row">{stat}</TableCell>
                            <TableCell align="right">
                              {typeof value === 'number' ? value.toFixed(4) : value}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
          {tabIndex === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} elevation={0} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Column</strong></TableCell>
                        <TableCell align="right"><strong>Missing Values</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(edaData.missingValues).map(([column, count]) => (
                        <TableRow key={column}>
                          <TableCell component="th" scope="row">{column}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                {edaData.missingValuesArray && edaData.missingValuesArray.length > 0 && (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={edaData.missingValuesArray}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="column" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" name="Missing Values" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Grid>
            </Grid>
          )}
          
          {tabIndex === 2 && (
            <Box sx={{ height: '100%' }}>
              {edaData.plots && edaData.plots.heatmap_plot ? (
                renderPlot(edaData.plots.heatmap_plot)
              ) : (
                edaData.correlationData && edaData.correlationData.length > 0 && (
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis dataKey="x" type="category" />
                      <YAxis dataKey="y" type="category" />
                      <ZAxis dataKey="z" range={[0, 500]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter
                        data={edaData.correlationData}
                        fill="#8884d8"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                )
              )}
            </Box>
          )}
          
          {tabIndex === 3 && (
            edaData.plots && edaData.plots.closing_price_plot ? (
              renderPlot(edaData.plots.closing_price_plot)
            ) : (
              <Typography variant="body2" color="text.secondary">
                No closing price plot data available.
              </Typography>
            )
          )}
          
          {tabIndex === 4 && (
            edaData.plots && edaData.plots.moving_avg_plot ? (
              renderPlot(edaData.plots.moving_avg_plot)
            ) : (
              <Typography variant="body2" color="text.secondary">
                No moving averages plot data available.
              </Typography>
            )
          )}
        </Box>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {tabIndex === 0 && "Key statistical measures summarizing the stock's performance."}
          {tabIndex === 1 && "Analysis of missing data points in the dataset."}
          {tabIndex === 2 && "Correlation between different metrics affecting the stock."}
          {tabIndex === 3 && "Historical closing price trends for the stock."}
          {tabIndex === 4 && "Moving averages indicate price trends over different time periods."}
        </Typography>
      </Box>
    </Paper>
  );
}

export default StockEDA;
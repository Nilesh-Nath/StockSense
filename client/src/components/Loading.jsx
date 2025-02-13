import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => {
  const loadingMessages = [
    "Crunching the numbers...",
    "Analyzing market trends...",
    "Consulting with our AI models...",
    "Processing market data...",
    "Calculating predictions...",
    "Reading the stock market tea leaves...",
    "Running advanced algorithms...",
    "Gathering historical data...",
    "Analyzing trading patterns...",
    "Making educated guesses..."
  ];

  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2000);

    return () => clearInterval(interval);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <CircularProgress />
      <p style={{ marginTop: '16px', color: '#374151' }}>{message}</p>
    </div>
  );
};

export default Loading;
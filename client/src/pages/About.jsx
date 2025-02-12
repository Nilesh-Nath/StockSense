import { Container, Paper, Box, Typography } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ padding: '20px' }}>
      <Box sx={{ marginBottom: '30px' }}>
        <Typography variant="h3" align="center" sx={{ marginBottom: '20px' }}>
          Stock Price Prediction Using LSTM
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary">
          A deep dive into how LSTM enhances stock price forecasting.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          1. Introduction to Stock Price Prediction
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Stock price prediction is an essential aspect of modern financial analysis. Accurately predicting stock prices can give investors valuable insights into market trends, helping them make better decisions. However, predicting stock prices is challenging due to the volatile and ever-changing nature of financial markets. Traditional methods may not always capture the complexity of the data, which is why we turn to advanced machine learning techniques.
          <br />
          <br />
          In our stock price prediction system, we use Long Short-Term Memory (LSTM) networks to forecast stock prices with a high degree of accuracy. This cutting-edge approach helps our model understand and predict future trends based on historical price movements.
        </Typography>
        <Box sx={{ my: 2, textAlign: 'center' }}>
            <img
              src="/LSTMImage.png"
              alt="LSTM Structure"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <Typography variant="caption" display="block">
              LSTM Cell Structure
            </Typography>
          </Box>
      </Paper>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          2. What is LSTM?
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Long Short-Term Memory (LSTM) is a type of Recurrent Neural Network (RNN) designed specifically to solve the problem of learning from sequential data. Unlike traditional feedforward neural networks, LSTMs are capable of processing sequences of data by maintaining an internal state, or memory, that allows them to remember important information over time. This makes LSTMs especially suitable for time-series forecasting tasks, such as predicting stock prices.
          <br />
          <br />
          Stock prices are influenced by past behavior, trends, and even news events. LSTM’s unique ability to learn from past time-series data makes it an ideal choice for predicting future stock movements.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          3. How Does LSTM Work?
        </Typography>
        <Typography variant="body1" color="textSecondary">
          LSTMs function by processing data in sequences and maintaining an internal memory cell. This memory cell helps the network remember relevant information over long periods, preventing the model from forgetting critical patterns in the data as it processes each new sequence.
          <br />
          <br />
          Key components of an LSTM are:
          <ul>
            <li><strong>Input Gate:</strong> Determines which information from the input should be stored in memory.</li>
            <li><strong>Forget Gate:</strong> Decides what information should be discarded from memory.</li>
            <li><strong>Output Gate:</strong> Controls what information should be output from memory to the next layer of the network.</li>
          </ul>
          By carefully managing memory, LSTM can learn long-term dependencies in time-series data, such as stock prices, and make predictions based on the sequential patterns it has identified.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          4. LSTM vs Linear Regression & ARIMA
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Traditional models like Linear Regression and ARIMA have limitations when dealing with sequential data such as stock prices.
          <br />
          <br />
          <ul>
            <li><strong>Linear Regression:</strong> Assumes a linear relationship between input variables and the target, making it unsuitable for the complex and non-linear patterns in stock prices. It cannot capture the sequential dependencies in time-series data.</li>
            <li><strong>ARIMA:</strong> A time-series model that uses past values to predict future ones, but ARIMA struggles with long-term dependencies and may not handle sudden changes in trends or volatility well. It also requires stationary data, making it less flexible than LSTM in real-world scenarios.</li>
          </ul>
          LSTM, however, can handle the sequential nature of stock prices and capture long-term dependencies, making it a superior choice for forecasting in such volatile environments.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          5. Why LSTM is Better for Stock Price Prediction
        </Typography>
        <Typography variant="body1" color="textSecondary">
          LSTM’s ability to learn from historical data, preserve important information over long periods, and handle sequential patterns makes it the ideal model for predicting stock prices. Here are some reasons why LSTM is superior to other alternatives:
          <ul>
            <li><strong>Memory Cells:</strong> Retain crucial patterns over time, helping forecast stock trends that evolve gradually.</li>
            <li><strong>Handling Sequential Data:</strong> Understands that current stock prices are influenced by previous prices.</li>
            <li><strong>Capturing Long-Term Dependencies:</strong> Remembers long-term trends, such as bull or bear markets.</li>
            <li><strong>Improved Forecasting Accuracy:</strong> More accurate than traditional methods due to its ability to learn from full sequences of historical data.</li>
          </ul>
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          6. Application of LSTM in Stock Price Prediction
        </Typography>
        <Typography variant="body1" color="textSecondary">
          In our stock price prediction app, we use LSTM networks to predict future stock prices based on past market data. By training our LSTM model on historical price data, it learns to identify patterns and make forecasts on the future movement of stock prices.
          <br />
          <br />
          The LSTM model considers several factors, such as:
          <ul>
            <li><strong>Historical Stock Data:</strong> Past stock prices, including open, close, high, and low prices.</li>
            <li><strong>Market Trends:</strong> Long-term price movements, such as uptrends or downtrends.</li>
            <li><strong>Volatility:</strong> Sudden spikes or drops in prices due to market news or events.</li>
          </ul>
          Once trained, the model predicts future stock prices, giving you an accurate estimate of where a stock might be headed.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '30px' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px' }}>
          7. Conclusion
        </Typography>
        <Typography variant="body1" color="textSecondary">
          LSTM networks offer a powerful solution to the complex problem of stock price prediction. Their ability to learn from historical data and capture long-term dependencies allows them to provide accurate and reliable forecasts that traditional models cannot match. By incorporating LSTM into our app, we are able to offer a robust prediction system that empowers users with valuable insights into the stock market, helping them make informed decisions.
          <br />
          <br />
          With LSTM’s strength in handling time-series data, we are confident that our stock price prediction system will provide users with actionable predictions to aid in their financial decision-making.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AboutPage;

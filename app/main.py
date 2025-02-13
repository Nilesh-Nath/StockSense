from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from models.lstm import LSTM
from models.stock import get_stock_data
from models.utils import mse, rmse, mape
from fastapi.middleware.cors import CORSMiddleware
import os 

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scaler = MinMaxScaler(feature_range=(-1, 1))

class StockPredictionRequest(BaseModel):
    ticker: str
    window_size: int = 6  # Default window size

class StockPredictionResponse(BaseModel):
    predictions: list
    actual: list
    metrics: dict

@app.post("/predict", response_model=StockPredictionResponse)
def predict(request: StockPredictionRequest):
    try:
        # Initialize model 
        model = LSTM(input_size=1, hidden_size=30, output_size=1, learning_rate=0.0014)
        df = get_stock_data(request.ticker)

        if(len(df)>1000):
            df = df.iloc[-1000::1,:]

        prices = df['close'].values.reshape(-1, 1)
        
        # Normalize
        scaled = scaler.fit_transform(prices)
        
        # Create sequences
        X, y = [], []
        window = request.window_size
        for i in range(window, len(scaled)):
            X.append(scaled[i-window:i])
            y.append(scaled[i])
        
        X, y = np.array(X), np.array(y)
        split = int(0.8 * len(X))
        X_train, y_train = X[:split], y[:split]
        X_test, y_test = X[split:], y[split:]
        
        # Train model
        model.train(X_train, y_train, epochs=20)
        
        # Test
        predictions = []
        for seq in X_test:
            y_pred, _ = model.forward(seq)
            predictions.append(y_pred[0][0])
            
        
        # Inverse transform
        predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        actual = scaler.inverse_transform(y_test.reshape(-1, 1))
        
        # Calculate metrics
        mse_val = mse(actual, predictions)
        rmse_val = rmse(actual, predictions)
        mape_val = mape(actual, predictions)
        
        return StockPredictionResponse(
            predictions=predictions.flatten().tolist(),
            actual=actual.flatten().tolist(),
            metrics={"MSE": mse_val, "RMSE": rmse_val, "MAPE": mape_val}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.get("/get_available_tickers")
async def get_available_tickers():

    list_of_tickers = os.listdir('./stock_data_csv')

    # Extract filenames without extensions
    tickers_without_extension = [os.path.splitext(ticker)[0] for ticker in list_of_tickers]

    return tickers_without_extension
    
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
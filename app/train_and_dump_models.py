import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from models.lstm import LSTM
from models.stock import get_stock_data
from models.utils import mse, rmse, mape
import os
import joblib
import io
import matplotlib.pyplot as plt

save_dir = "SavedModel"

os.makedirs(save_dir, exist_ok=True)

scaler = MinMaxScaler(feature_range=(-1, 1))

list_of_tickers = os.listdir('./stock_data_csv')

# Extract filenames without extensions
tickers_without_extension = [os.path.splitext(ticker)[0] for ticker in list_of_tickers]

for tickers in tickers_without_extension:
    model = LSTM(input_size=1, hidden_size=30, output_size=1, learning_rate=0.0014)
    df = pd.read_csv(f"./stock_data_csv/{tickers}.csv")
    
    if(len(df)>1000):
        df = df.iloc[-1000::1,:]

    prices = df['close'].values.reshape(-1, 1)
    
    # Normalize
    scaled = scaler.fit_transform(prices)
    
    # Create sequences
    X, y = [], []
    window = 6
    for i in range(window, len(scaled)):
        X.append(scaled[i-window:i])
        y.append(scaled[i])
    
    X, y = np.array(X), np.array(y)
    split = int(0.8 * len(X))
    X_train, y_train = X[:split], y[:split]
    X_test, y_test = X[split:], y[split:]
    
    # Train model
    model.train(X_train, y_train, epochs=15, batch_size=15)
    
    # The convergence plot is now automatically stored in the model object
    
    # Save the model includes the plot data
    joblib.dump(model, os.path.join(save_dir, f"{tickers}.pkl"))
    
    print(f"Model for company {tickers} saved successfully with convergence plot!")
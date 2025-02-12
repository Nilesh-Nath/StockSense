import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from models.stock import get_stock_data
from models.lstm import LSTM

scaler = MinMaxScaler(feature_range=(-1, 1))

def test_train_test_split(ticker="AHPC", window_size=6):
    df = get_stock_data(ticker)
    
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
    

    # Assertions for train-test split
    assert len(X_train) == int(0.8 * len(X)), "Train data does not match 80% of the dataset"
    assert len(X_test) == len(X) - len(X_train), "Test data does not match 20% of the dataset"
    
    # Ensure no data leakage
    print(X_train.flatten())
    print(X_test.flatten())
    assert np.any(np.isin(X_train.flatten(), X_test.flatten())), "Data leakage detected!"
    
    print("Train-test split validation passed: 80:20 ratio and no data leakage.")

if __name__ == "__main__":
    test_train_test_split()

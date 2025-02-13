import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from models.stock import get_stock_data
from models.utils import mape, mse, rmse

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
    for train_seq in X_train:
        for test_seq in X_test:
            if np.array_equal(train_seq, test_seq):
                raise ValueError(f"Data leakage detected! Sequence {train_seq.flatten()} is present in both train and test sets.")
    
    print("Test Passed: Train-test split validation passed - 80:20 ratio and no data leakage. ✅")
    
def test_get_stock_data():
    ticker = "AHPC" 
   
    try:
        df = get_stock_data(ticker)
        
        assert not df.empty, f"Data for {ticker} should not be empty."
        assert 'close' in df.columns, f"Column 'Close' not found in the data."
        print(f"Test passed: {ticker} data loaded successfully. ✅")
        
    except FileNotFoundError as e:
        print(e)

def test_mape(actual, prediction):
    try:
        result = mape(actual, prediction)
        expected_result = np.mean(np.abs((actual - prediction) / actual)) * 100
        
        assert np.isclose(result, expected_result), f"MAPE mismatch: {result} != {expected_result}"
        print(f"Test passed: MAPE is correct. ✅")
        
    except Exception as e:
        print(f"MAPE test failed: {e}")

def test_mse(actual, prediction):
    try:
        result = mse(actual, prediction)
        expected_result = np.mean((actual - prediction) ** 2)
        
        assert np.isclose(result, expected_result), f"MSE mismatch: {result} != {expected_result}"
        print(f"Test passed: MSE is correct. ✅")
        
    except Exception as e:
        print(f"MSE test failed: {e}")

def test_rmse(actual, prediction):
    try:
        result = rmse(actual, prediction)
        expected_result = np.sqrt(np.mean((actual - prediction) ** 2))
        
        assert np.isclose(result, expected_result), f"RMSE mismatch: {result} != {expected_result}"
        print(f"Test passed: RMSE is correct. ✅")
        
    except Exception as e:
        print(f"RMSE test failed: {e}")

actual = np.array([100, 150, 200, 250, 300])
prediction = np.array([110, 145, 195, 240, 310])

if __name__ == "__main__":
    test_train_test_split()
    test_get_stock_data()
    test_mape(actual, prediction)
    test_mse(actual, prediction)
    test_rmse(actual, prediction)
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from models.lstm import LSTM
from models.stock import get_stock_data
from models.utils import mse, rmse, mape
import os
import joblib

save_dir = "SavedModel"
os.makedirs(save_dir, exist_ok=True)

scaler = MinMaxScaler(feature_range=(-1, 1))

model = LSTM(input_size=1, hidden_size=30, output_size=1, learning_rate=0.0014)
df = pd.read_csv("./merged_sectorwise_data/merged_sector_data_latest_life insurance.csv")

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
model.train(X_train, y_train, epochs=20 , batch_size=15)

joblib.dump(model, os.path.join(save_dir, "life insurance.pkl"))
print("Model saved successfully!")
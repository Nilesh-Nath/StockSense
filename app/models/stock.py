from os import listdir
import pandas as pd

def get_stock_data(ticker):
    csv = ticker + ".csv"
    
    if csv in listdir(path="./stock_data_csv"):
        df = pd.read_csv("./stock_data_csv/" + csv)
    else:
        raise FileNotFoundError(f"The file for {ticker} is not found in the stock_data_csv folder.")
    
    return df

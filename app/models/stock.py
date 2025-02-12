from os import listdir
import pandas as pd
import datetime as dt
import matplotlib.pyplot as plt
import pandas_datareader.data as web
import numpy as np

def get_stock_data(ticker):
    csv = ticker + ".csv"
    try:
        # load csv file if in current directory
        if csv in listdir(path="./stock_data_csv"):
            df = pd.read_csv("./stock_data_csv/" + csv)
            
        
        # download csv from yahoo finance
        else:
            start = dt.datetime(2018, 12, 26)
            end = dt.datetime(2019, 12, 31)
            df = web.DataReader(ticker, 'yahoo', start, end)
            # save csv file
            df.to_csv("./stock_data_csv/" + csv)

    except FileNotFoundError:
        # load csv file if in current directory
        if csv in listdir(path="stock_data_csv/"):
            df = pd.read_csv("stock_data_csv/" + csv)
        
        # download csv from yahoo finance
        else:
            start = dt.datetime(2018, 12, 26)
            end = dt.datetime(2019, 12, 31)
            df = web.DataReader(ticker, 'yahoo', start, end)
            # save csv file
            df.to_csv("stock_data_csv/" + csv)
        
    return df

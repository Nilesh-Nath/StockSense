## Adding Sector/Category in dataset

import csv

file_path = './stock_data_csv/BPCL.csv'

with open(file_path, 'r', newline='') as csvinput:
    reader = list(csv.reader(csvinput))

if reader:
    reader[0].append('Category')  
    for row in reader[1:]: 
        row.append('Hydropower')

with open(file_path, 'w', newline='') as csvoutput:
    writer = csv.writer(csvoutput)
    writer.writerows(reader)

## Sector wise merging dataset for sector wise prediction

import pandas as pd
import glob

file_paths = glob.glob("./stock_data_csv/*.csv")  

dfs = []  

for f in file_paths:  
    df = pd.read_csv(f)  
    df.columns = df.columns.str.strip().str.lower()  

    # Ensure required columns exist
    missing = [col for col in ['published_date', 'close', 'category'] if col not in df.columns]
    if missing:
        print(f"Skipping {f} (missing columns: {', '.join(missing)})")
        continue  # Skip this file

    
    if df['category'].str.strip().str.lower().eq("hydropower").any():
        df = df[['published_date', 'close']]  # Drop 'category' since we don't need it in aggregation
        df['published_date'] = pd.to_datetime(df['published_date'])  
        dfs.append(df)
    else:
        print(f"Skipping {f} (does not contain 'hydropower' in 'category')")

# Merge all data
if dfs:
    sector_df = pd.concat(dfs, axis=0).groupby('published_date').mean(numeric_only=True)

    # Sort and take last 1000 entries safely
    sector_df = sector_df.sort_index().iloc[-min(len(sector_df), 1000):]

    # Save to CSV
    sector_df.to_csv("./merged_sectorwise_data/merged_sector_data_latest_hydropower.csv")
    print(sector_df.tail())
else:
    print("No valid data found.")

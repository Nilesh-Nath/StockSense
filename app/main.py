from fastapi import FastAPI, HTTPException , Depends , status
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from models.lstm import LSTM
from models.stock import get_stock_data
from models.utils import mse, rmse, mape
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os 
import joblib
import io
import base64
from sqlalchemy import create_engine, Column, Integer, String , Float , ForeignKey , DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session , relationship
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from typing import List
from sqlalchemy.orm import joinedload


# Constants
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class PredictionResult(Base):
    __tablename__ = "prediction_results"
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String)
    batch_size = Column(Integer)
    learning_rate = Column(Float)
    epochs = Column(Integer)
    window_size = Column(Integer)
    mse = Column(Float)
    rmse = Column(Float)
    mape = Column(Float)
    prediction_at = Column(String)
    user_id = Column(Integer, ForeignKey("users.id")) 
    user = relationship("User", back_populates="prediction_results")
    
# Update the User class to link with predictions
User.prediction_results = relationship("PredictionResult", back_populates="user")

Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
class PredictionResultResponseModel(BaseModel):
    id: int
    ticker: str
    batch_size: int
    learning_rate: float
    epochs: int
    window_size: int
    mse: float
    rmse: float
    mape: float
    prediction_at : str
    user_id: int

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# Routes
@app.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token({"sub": user.username}, timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user.username}, timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"message": "Protected route accessed!"}

scaler = MinMaxScaler(feature_range=(-1, 1))

class StockPredictionRequest(BaseModel):
    ticker: str
    window_size: int = 6  # Default window size
    batch_size : int = 15
    
class StockPredictionResponse(BaseModel):
    predictions: list
    actual: list
    metrics: dict
    convergence_plot: str = None  # Base64 encoded plot
    
class SectorWisePredictionResponse(BaseModel):
    predictions: list
    actual: list
    metrics: dict

class SectorWisePredictionRequest(BaseModel):
    sector: str

class NormalLstmRequestModel(BaseModel):
    ticker: str
    window_size: int = 6
    learning_rate : float = 0.0014 
    epochs : int = 15
    batch_size : int = 15
    
class NormalLstmResponseModel(BaseModel):
    predictions: list
    actual: list
    metrics: dict
    
# Dependency to get the current user
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
    
@app.post("/predict_with_normal_lstm", response_model=NormalLstmResponseModel)
def predict_with_normal_lstm(request: NormalLstmRequestModel, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        print(f"Received token: {token}")
        # Decode the token to get the current user's username (sub in token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Fetch the user from the database
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Initialize model 
        model = LSTM(input_size=1, hidden_size=30, output_size=1, learning_rate=request.learning_rate)
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
        model.train(X_train, y_train, epochs=request.epochs, batch_size=request.batch_size)
        
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
        
        # Store the prediction result in the database
        prediction_result = PredictionResult(
            ticker=request.ticker,
            batch_size=request.batch_size,
            learning_rate=request.learning_rate,
            epochs=request.epochs,
            window_size=request.window_size,
            mse=mse_val,
            rmse=rmse_val,
            mape=mape_val,
            prediction_at = datetime.now().strftime("%Y-%m-%d %H:%M"),
            user_id=user.id 
        )
        db.add(prediction_result)
        db.commit()
        db.refresh(prediction_result)
        
        return {
            "predictions": predictions.flatten().tolist(),
            "actual": actual.flatten().tolist(),
            "metrics": {"MSE": mse_val, "RMSE": rmse_val, "MAPE": mape_val}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.post("/predict", response_model=StockPredictionResponse)
def predict(request: StockPredictionRequest):
    try:
        loaded_model = joblib.load(os.path.join("SavedModel", f"{request.ticker}.pkl"))
        
        df = pd.read_csv(f"./stock_data_csv/{request.ticker}.csv")
        
        if(len(df)>1000):
            df = df.iloc[-1000::1,:]
        
        prices = df['close'].values.reshape(-1, 1)

        scaled = scaler.fit_transform(prices)

        X, y = [], []
        window = 6
        for i in range(window, len(scaled)):
            X.append(scaled[i-window:i])
            y.append(scaled[i])

        X, y = np.array(X), np.array(y)
        split = int(0.8 * len(X))
        X_test, y_test = X[split:], y[split:]

        predictions = []
        for seq in X_test:
            y_pred, _ = loaded_model.forward(seq)
            predictions.append(y_pred[0][0])

        predictions = np.array(predictions).reshape(-1, 1)
        
        predictions_original = scaler.inverse_transform(predictions)
        actual_original = scaler.inverse_transform(y_test)

        mse_val = mse(actual_original, predictions_original)
        rmse_val = rmse(actual_original, predictions_original)
        mape_val = mape(actual_original, predictions_original)
        
        # Get the convergence plot if available
        plot_data = None
        if hasattr(loaded_model, 'get_convergence_plot'):
            plot_data = loaded_model.get_convergence_plot()
            if plot_data:
                plot_data = base64.b64encode(plot_data).decode('utf-8')
        
        return {
            "predictions": predictions_original.flatten().tolist(),
            "actual": actual_original.flatten().tolist(),
            "metrics": {"MSE": mse_val, "RMSE": rmse_val, "MAPE": mape_val},
            "convergence_plot": plot_data
        }

    except Exception as e:
        print(f"Error details: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/get_available_tickers")
async def get_available_tickers():

    list_of_tickers = os.listdir('./stock_data_csv')

    # Extract filenames without extensions
    tickers_without_extension = [os.path.splitext(ticker)[0] for ticker in list_of_tickers]

    tickers_with_category = []

    for ticker in tickers_without_extension:
        df = pd.read_csv(f"./stock_data_csv/{ticker}.csv")
        df = df['Category'][0]
        tickers_with_category.append((ticker,df))
        
    return JSONResponse(content=[{"ticker": t[0], "sector": t[1]} for t in tickers_with_category])
    
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/get_sectorwise_prediction", response_model=SectorWisePredictionResponse)
def get_sectorwise_prediction(request: SectorWisePredictionRequest):
    try:
        loaded_model = joblib.load(os.path.join("SavedModel", f"{request.sector}.pkl"))
        
        df = pd.read_csv(f"./merged_sectorwise_data/merged_sector_data_latest_{request.sector}.csv")
        
        prices = df['close'].values.reshape(-1, 1)

        scaled = scaler.fit_transform(prices)

        X, y = [], []
        window = 6
        for i in range(window, len(scaled)):
            X.append(scaled[i-window:i])
            y.append(scaled[i])

        X, y = np.array(X), np.array(y)
        split = int(0.8 * len(X))
        X_test, y_test = X[split:], y[split:]
        
        split = int(0.8 * len(X))
        X_test = X[split:]
        y_test = y[split:]

        predictions = []
        for seq in X_test:
            y_pred, _ = loaded_model.forward(seq)
            predictions.append(y_pred[0][0])

        predictions = np.array(predictions).reshape(-1, 1)
        
        predictions_original = scaler.inverse_transform(predictions)
        actual_original = scaler.inverse_transform(y_test)

        mse_val = mse(actual_original, predictions_original)
        rmse_val = rmse(actual_original, predictions_original)
        mape_val = mape(actual_original, predictions_original)

        return SectorWisePredictionResponse(
            predictions=predictions_original.flatten().tolist(),
            actual=actual_original.flatten().tolist(),
            metrics={"MSE": mse_val, "RMSE": rmse_val, "MAPE": mape_val}
        )

    except Exception as e:
        print(f"Error details: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/eda/{ticker}")
def get_eda_results(ticker: str):
    try:
        eda_results = joblib.load(f"./EDA/EDA_Results/eda_results_{ticker}.joblib")

        # Convert pandas Series/DataFrame to dictionaries
        statistics = eda_results.get("eda_statistics", pd.Series()).to_dict()
        missing_values = eda_results.get("missing_values", pd.Series()).to_dict()
        correlation_matrix = eda_results.get("correlation_matrix", pd.DataFrame()).to_dict()

        # Convert Timestamp objects to strings and NaN values to null
        def convert_for_json(data):
            if isinstance(data, dict):
                return {key: convert_for_json(value) for key, value in data.items()}
            elif isinstance(data, (list, tuple)):
                return [convert_for_json(item) for item in data]
            elif isinstance(data, pd.Timestamp):
                return data.isoformat()  # Convert Timestamp to ISO format string
            elif isinstance(data, (float, np.floating)) and np.isnan(data):
                return None  # Replace NaN with null
            else:
                return data

        statistics = convert_for_json(statistics)
        missing_values = convert_for_json(missing_values)
        correlation_matrix = convert_for_json(correlation_matrix)

        # Process plots
        plots = {}
        for plot_name in ["closing_price_plot", "moving_avg_plot", "heatmap_plot"]:
            img_stream = eda_results.get(plot_name)
            if img_stream:
                img_stream.seek(0)
                plots[plot_name] = base64.b64encode(img_stream.read()).decode("utf-8")
        
        return JSONResponse(content={
            "statistics": statistics,
            "missing_values": missing_values,
            "correlation_matrix": correlation_matrix,
            "plots": plots
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/previous_predictions", response_model=List[PredictionResultResponseModel])
def previous_predictions(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Fetch user
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch predictions
        predictions = db.query(PredictionResult).options(joinedload(PredictionResult.user)).filter(PredictionResult.user_id == user.id).all()

        if not predictions:
            raise HTTPException(status_code=404, detail="No predictions found for this user")

        return predictions

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"JWT Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
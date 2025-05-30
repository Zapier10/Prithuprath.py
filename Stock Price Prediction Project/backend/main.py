from fastapi import FastAPI
import yfinance as yf
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_usd_to_inr():
    response = requests.get("https://api.exchangerate-api.com/v4/latest/USD")
    data = response.json()
    return data["rates"]["INR"]

@app.get("/predict/")
def predict_stock(symbols: str):
    stock_symbols = symbols.split(",")  # Support multiple stocks
    usd_to_inr = get_usd_to_inr()

    all_stocks_data = {}

    for symbol in stock_symbols:
        stock = yf.Ticker(symbol)
        data = stock.history(period="7d")

        if data.empty:
            all_stocks_data[symbol] = {"error": f"No data available for {symbol}"}
            continue

        all_stocks_data[symbol] = {
            "dates": data.index.strftime("%Y-%m-%d").tolist(),
            "open": (data["Open"] * usd_to_inr).tolist(),
            "high": (data["High"] * usd_to_inr).tolist(),
            "low": (data["Low"] * usd_to_inr).tolist(),
            "close": (data["Close"] * usd_to_inr).tolist(),
            "latest_price": round(data["Close"].iloc[-1] * usd_to_inr, 2),
        }

    return all_stocks_data

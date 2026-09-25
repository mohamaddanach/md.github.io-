import MetaTrader5 as mt5
import pandas as pd
import numpy as np

def fetch_historical_candles(symbol="EURUSD", timeframe=mt5.TIMEFRAME_M1, count=30000):
    """Fetches historical candles from MT5 and returns a DataFrame."""
    if not mt5.initialize():
        print("❌ MT5 connection failed.")
        return None

    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, count)
    if rates is None or len(rates) == 0:
        print("❌ Failed to pull historical rates.")
        return None

    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    return df

def normalize_pattern(series):
    """Normalizes price series into percentage move starting from 0."""
    return (series - series[0]) / series[0]

def predict_market_direction(df, lookback=30, top_matches_count=50, prediction_horizon=10):
    """Matches current 30-candle pattern against history using Euclidean Distance."""
    closes = df['close'].values
    total_candles = len(closes)

    current_pattern = normalize_pattern(closes[-lookback:])
    distances = []
    indices = []

    for i in range(0, total_candles - lookback - prediction_horizon):
        hist_pattern = normalize_pattern(closes[i : i + lookback])
        distance = np.linalg.norm(current_pattern - hist_pattern)
        distances.append(distance)
        indices.append(i)

    sorted_pairs = sorted(zip(distances, indices))[:top_matches_count]

    bullish_outcomes = 0
    bearish_outcomes = 0

    for dist, idx in sorted_pairs:
        entry_price = closes[idx + lookback - 1]
        future_price = closes[idx + lookback + prediction_horizon - 1]

        if future_price > entry_price:
            bullish_outcomes += 1
        else:
            bearish_outcomes += 1

    win_rate_buy = (bullish_outcomes / top_matches_count) * 100
    win_rate_sell = (bearish_outcomes / top_matches_count) * 100

    if win_rate_buy >= 60.0:
        return "BUY", win_rate_buy
    elif win_rate_sell >= 60.0:
        return "SELL", win_rate_sell
    else:
        return "NEUTRAL", max(win_rate_buy, win_rate_sell)

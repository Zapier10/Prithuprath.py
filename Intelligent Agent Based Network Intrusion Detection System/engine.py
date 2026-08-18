import numpy as np
from sklearn.ensemble import IsolationForest
import warnings

warnings.filterwarnings("ignore")

class MLEngine:
    def __init__(self):
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.history = []
        self.is_calibrated = False

    def extract_features(self, packet_flow):
        # We don't need this synthetic generator anymore since app.py reads the CSV
        pass

    def predict_hybrid(self, features):
        X = [features['entropy'], features['velocity']]
        
        # --- ONLINE CALIBRATION PHASE ---
        # Watch the first 50 packets to learn what "Normal" actually looks like on this specific network
        if not self.is_calibrated:
            self.history.append(X)
            if len(self.history) >= 50:
                self.iso_forest.fit(np.array(self.history))
                self.is_calibrated = True
            return 0.1 # Return a low risk score while warming up

        # --- ACTIVE HUNTING PHASE ---
        # Once calibrated, start predicting anomalies
        anomaly_score = self.iso_forest.decision_function([X])[0]
        p_attack = 1.0 / (1.0 + np.exp(anomaly_score * 5)) 
        return p_attack

class RiskEngine:
    def __init__(self, asset_value=8, k_factor=3.0, alpha=0.15):
        self.asset_value = asset_value
        self.k = k_factor
        self.alpha = alpha  
        self.ewma_mu = 0.1
        self.ewma_var = 0.01

    def calculate_risk(self, p_attack, velocity, impact=1.0):
        normalized_velocity = np.log1p(velocity) / np.log1p(1000)
        current_risk = p_attack * impact * normalized_velocity * (self.asset_value / 10)
        current_risk = min(current_risk, 1.0)
        
        # Anti-Poisoning: Only adapt to normal traffic
        if p_attack < 0.6: 
            diff = current_risk - self.ewma_mu
            self.ewma_mu = self.ewma_mu + self.alpha * diff
            self.ewma_var = (1 - self.alpha) * (self.ewma_var + self.alpha * (diff ** 2))
            
        return current_risk

    def get_adaptive_threshold(self):
        sigma = np.sqrt(self.ewma_var)
        threshold = self.ewma_mu + (self.k * sigma)
        return min(threshold, 0.98)
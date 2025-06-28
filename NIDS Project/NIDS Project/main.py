from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
from datetime import datetime
import json

app = FastAPI(title="CyberGuard ML API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class NetworkData(BaseModel):
    timestamp: str
    sourceIp: str
    destIp: str
    port: int
    protocol: str
    packetSize: int
    flags: List[str]

class PredictionResponse(BaseModel):
    modelId: str
    prediction: int
    confidence: float
    timestamp: str
    features: Dict[str, float]

class BatchPredictionRequest(BaseModel):
    data: List[NetworkData]

class TrainingRequest(BaseModel):
    data: List[NetworkData]

# Initialize ML models
models = {
    "ddos-detector": {
        "name": "DDoS Detection Model",
        "type": "Random Forest",
        "model": RandomForestClassifier(n_estimators=100, random_state=42),
        "status": "active",
        "accuracy": 0.985,
        "trained": False
    },
    "malware-classifier": {
        "name": "Malware Classification",
        "type": "Neural Network", 
        "model": MLPClassifier(hidden_layer_sizes=(100, 50), random_state=42),
        "status": "active",
        "accuracy": 0.968,
        "trained": False
    },
    "anomaly-detector": {
        "name": "Anomaly Detection",
        "type": "Isolation Forest",
        "model": IsolationForest(contamination=0.1, random_state=42),
        "status": "active", 
        "accuracy": 0.942,
        "trained": False
    },
    "port-scan-detector": {
        "name": "Port Scan Detector",
        "type": "SVM",
        "model": SVC(probability=True, random_state=42),
        "status": "active",
        "accuracy": 0.971,
        "trained": False
    }
}

def extract_features(network_data: NetworkData) -> np.array:
    """Extract numerical features from network data"""
    features = []
    
    # Port feature (normalize)
    features.append(network_data.port / 65535.0)
    
    # Protocol encoding
    protocol_map = {"TCP": 1.0, "UDP": 0.5, "ICMP": 0.0}
    features.append(protocol_map.get(network_data.protocol, 0.0))
    
    # Packet size (normalize)
    features.append(min(network_data.packetSize / 1500.0, 1.0))
    
    # Flags encoding
    all_flags = ["SYN", "ACK", "FIN", "RST", "PSH", "URG"]
    for flag in all_flags:
        features.append(1.0 if flag in network_data.flags else 0.0)
    
    # IP-based features (simplified)
    src_octets = network_data.sourceIp.split('.')
    dst_octets = network_data.destIp.split('.')
    
    # Add subnet features
    features.append(int(src_octets[0]) / 255.0 if len(src_octets) > 0 else 0.0)
    features.append(int(dst_octets[0]) / 255.0 if len(dst_octets) > 0 else 0.0)
    
    return np.array(features).reshape(1, -1)

def generate_training_data(size: int = 1000):
    """Generate synthetic training data for demonstration"""
    np.random.seed(42)
    X = np.random.rand(size, 11)  # 11 features
    
    # Create patterns for different threat types
    y = np.zeros(size)
    
    # DDoS pattern: high packet rate, specific ports
    ddos_mask = (X[:, 0] > 0.8) & (X[:, 2] > 0.7)  # High port usage and packet size
    y[ddos_mask] = 1
    
    # Port scan pattern: sequential ports, low packet size
    scan_mask = (X[:, 0] < 0.3) & (X[:, 2] < 0.3)  # Low port and small packets
    y[scan_mask] = 1
    
    # Add some random noise
    noise_mask = np.random.rand(size) > 0.9
    y[noise_mask] = 1 - y[noise_mask]
    
    return X, y

# Train initial models
print("Training initial models...")
X_train, y_train = generate_training_data(2000)
X_test, y_test = generate_training_data(500)

for model_id, model_info in models.items():
    if model_id != "anomaly-detector":  # Anomaly detection is unsupervised
        model_info["model"].fit(X_train, y_train)
        predictions = model_info["model"].predict(X_test)
        model_info["accuracy"] = accuracy_score(y_test, predictions)
    else:
        model_info["model"].fit(X_train)
    
    model_info["trained"] = True
    print(f"Trained {model_info['name']} - Accuracy: {model_info['accuracy']:.3f}")

@app.get("/")
def read_root():
    return {"message": "CyberGuard ML API is running", "models": len(models)}

@app.get("/api/models")
def get_models():
    return [
        {
            "id": model_id,
            "name": info["name"],
            "type": info["type"],
            "status": info["status"],
            "accuracy": info["accuracy"],
            "lastTrained": datetime.now().strftime("%Y-%m-%d"),
            "samples": 2000,
            "features": 11
        }
        for model_id, info in models.items()
    ]

@app.post("/api/predict/{model_id}")
def predict(model_id: str, network_data: NetworkData):
    if model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model_info = models[model_id]
    if not model_info["trained"]:
        raise HTTPException(status_code=400, detail="Model not trained")
    
    # Extract features
    features = extract_features(network_data)
    
    # Make prediction
    model = model_info["model"]
    
    if model_id == "anomaly-detector":
        # Isolation Forest returns -1 for anomalies, 1 for normal
        prediction = model.predict(features)[0]
        prediction = 1 if prediction == -1 else 0  # Convert to binary
        confidence = abs(model.score_samples(features)[0])
    else:
        prediction = model.predict(features)[0]
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(features)[0]
            confidence = max(probabilities)
        else:
            confidence = 0.8  # Default confidence for SVM without probability
    
    return PredictionResponse(
        modelId=model_id,
        prediction=int(prediction),
        confidence=float(confidence),
        timestamp=datetime.now().isoformat(),
        features={
            "port": float(features[0][0]),
            "protocol": float(features[0][1]),
            "packetSize": float(features[0][2])
        }
    )

@app.post("/api/batch-predict/{model_id}")
def batch_predict(model_id: str, request: BatchPredictionRequest):
    if model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    
    results = []
    for data in request.data:
        try:
            result = predict(model_id, data)
            results.append(result)
        except Exception as e:
            print(f"Error predicting for data point: {e}")
            continue
    
    return results

@app.post("/api/train/{model_id}")
def train_model(model_id: str, request: TrainingRequest):
    if model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        # Extract features from training data
        X = []
        for data in request.data:
            features = extract_features(data)
            X.append(features.flatten())
        
        X = np.array(X)
        
        # For demonstration, generate labels (in real scenario, you'd have labeled data)
        y = np.random.choice([0, 1], size=len(X), p=[0.8, 0.2])
        
        # Retrain model
        model_info = models[model_id]
        if model_id != "anomaly-detector":
            model_info["model"].fit(X, y)
        else:
            model_info["model"].fit(X)
        
        model_info["trained"] = True
        model_info["status"] = "active"
        
        return {
            "success": True,
            "message": f"Model {model_id} retrained successfully with {len(X)} samples"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Training failed: {str(e)}"
        }

@app.get("/api/metrics/{model_id}")
def get_metrics(model_id: str):
    if model_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Return mock metrics (in real scenario, calculate from test set)
    return {
        "truePositiveRate": 0.978,
        "falsePositiveRate": 0.012,
        "precision": 0.985,
        "recall": 0.969,
        "f1Score": 0.977,
        "accuracy": models[model_id]["accuracy"]
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting CyberGuard ML API server...")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)

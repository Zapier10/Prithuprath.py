export interface MLModel {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'training' | 'offline';
  accuracy: number;
  lastTrained: string;
  samples: number;
  features: number;
}

export interface ModelPrediction {
  modelId: string;
  prediction: number;
  confidence: number;
  timestamp: string;
  features: Record<string, number>;
}

export interface NetworkData {
  timestamp: string;
  sourceIp: string;
  destIp: string;
  port: number;
  protocol: string;
  packetSize: number;
  flags: string[];
  [key: string]: any;
}

class MLService {
  private apiUrl: string;
  private models: MLModel[] = [];

  constructor(apiUrl = 'http://localhost:8000') {
    this.apiUrl = apiUrl;
  }

  // Load available models from backend
  async loadModels(): Promise<MLModel[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/models`);
      if (!response.ok) {
        // Fallback to mock data if backend is not available
        return this.getMockModels();
      }
      this.models = await response.json();
      return this.models;
    } catch (error) {
      console.log('Backend not available, using mock data');
      return this.getMockModels();
    }
  }

  // Make predictions on network data
  async predict(modelId: string, networkData: NetworkData): Promise<ModelPrediction> {
    try {
      const response = await fetch(`${this.apiUrl}/api/predict/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(networkData),
      });
      
      if (!response.ok) {
        throw new Error('Prediction failed');
      }
      
      return await response.json();
    } catch (error) {
      console.log('Using mock prediction:', error);
      return this.getMockPrediction(modelId, networkData);
    }
  }

  // Batch predictions for multiple data points
  async batchPredict(modelId: string, networkDataBatch: NetworkData[]): Promise<ModelPrediction[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/batch-predict/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: networkDataBatch }),
      });
      
      if (!response.ok) {
        throw new Error('Batch prediction failed');
      }
      
      return await response.json();
    } catch (error) {
      console.log('Using mock batch predictions:', error);
      return networkDataBatch.map(data => this.getMockPrediction(modelId, data));
    }
  }

  // Train or retrain a model
  async trainModel(modelId: string, trainingData: NetworkData[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/train/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: trainingData }),
      });
      
      return await response.json();
    } catch (error) {
      console.log('Training request failed:', error);
      return { success: false, message: 'Backend not available' };
    }
  }

  // Get model performance metrics
  async getModelMetrics(modelId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/api/metrics/${modelId}`);
      return await response.json();
    } catch (error) {
      console.log('Using mock metrics:', error);
      return this.getMockMetrics();
    }
  }

  // Mock data for when backend is not available
  private getMockModels(): MLModel[] {
    return [
      {
        id: 'ddos-detector',
        name: 'DDoS Detection Model',
        type: 'Random Forest',
        status: 'active',
        accuracy: 98.5,
        lastTrained: '2024-01-10',
        samples: 150000,
        features: 32,
      },
      {
        id: 'malware-classifier',
        name: 'Malware Classification',
        type: 'Neural Network',
        status: 'active',
        accuracy: 96.8,
        lastTrained: '2024-01-12',
        samples: 85000,
        features: 64,
      },
      {
        id: 'anomaly-detector',
        name: 'Anomaly Detection',
        type: 'Isolation Forest',
        status: 'training',
        accuracy: 94.2,
        lastTrained: '2024-01-14',
        samples: 200000,
        features: 28,
      },
      {
        id: 'port-scan-detector',
        name: 'Port Scan Detector',
        type: 'SVM',
        status: 'active',
        accuracy: 97.1,
        lastTrained: '2024-01-11',
        samples: 95000,
        features: 16,
      },
    ];
  }

  private getMockPrediction(modelId: string, networkData: NetworkData): ModelPrediction {
    const isThreat = Math.random() > 0.85; // 15% chance of threat
    return {
      modelId,
      prediction: isThreat ? 1 : 0,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      timestamp: new Date().toISOString(),
      features: {
        packetSize: networkData.packetSize,
        port: networkData.port,
        protocolScore: networkData.protocol === 'TCP' ? 0.8 : 0.3,
      },
    };
  }

  private getMockMetrics() {
    return {
      truePositiveRate: 0.978,
      falsePositiveRate: 0.012,
      precision: 0.985,
      recall: 0.969,
      f1Score: 0.977,
    };
  }
}

export const mlService = new MLService();

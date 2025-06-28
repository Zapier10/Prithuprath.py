
import { useState, useEffect, useCallback } from 'react';
import { mlService, type ModelPrediction, type NetworkData } from '@/services/mlService';

export const useMLPredictions = () => {
  const [predictions, setPredictions] = useState<ModelPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time network data
  const generateNetworkData = useCallback((): NetworkData => {
    const protocols = ['TCP', 'UDP', 'ICMP'];
    const commonPorts = [80, 443, 22, 21, 25, 53, 3389, 8080];
    
    return {
      timestamp: new Date().toISOString(),
      sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      destIp: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      port: commonPorts[Math.floor(Math.random() * commonPorts.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      packetSize: Math.floor(Math.random() * 1500) + 64,
      flags: ['SYN', 'ACK', 'FIN'].filter(() => Math.random() > 0.7),
    };
  }, []);

  // Make predictions on network data
  const makePrediction = useCallback(async (modelId: string, networkData?: NetworkData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = networkData || generateNetworkData();
      const prediction = await mlService.predict(modelId, data);
      
      setPredictions(prev => [...prev.slice(-19), prediction]); // Keep last 20 predictions
      return prediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [generateNetworkData]);

  // Auto-generate predictions for active monitoring
  useEffect(() => {
    const interval = setInterval(async () => {
      const models = ['ddos-detector', 'malware-classifier', 'anomaly-detector'];
      const randomModel = models[Math.floor(Math.random() * models.length)];
      await makePrediction(randomModel);
    }, 3000); // Make a prediction every 3 seconds

    return () => clearInterval(interval);
  }, [makePrediction]);

  return {
    predictions,
    isLoading,
    error,
    makePrediction,
    generateNetworkData,
  };
};

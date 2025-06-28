import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Shield, AlertTriangle, Brain } from "lucide-react";
import { useMLPredictions } from "@/hooks/useMLPredictions";

const NetworkMonitor = () => {
  const [networkStats, setNetworkStats] = useState({
    activeConnections: 0,
    bandwidth: 0,
    packetsPerSecond: 0,
    threatsBlocked: 0,
  });

  const { predictions, isLoading, makePrediction } = useMLPredictions();

  // Simulate real-time network data
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats({
        activeConnections: Math.floor(Math.random() * 500) + 200,
        bandwidth: Math.floor(Math.random() * 100) + 20,
        packetsPerSecond: Math.floor(Math.random() * 10000) + 5000,
        threatsBlocked: Math.floor(Math.random() * 50) + 10,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getThreatLevel = (confidence: number) => {
    if (confidence > 0.8) return { color: "destructive" as const, text: "High" };
    if (confidence > 0.6) return { color: "secondary" as const, text: "Medium" };
    return { color: "default" as const, text: "Low" };
  };

  const getModelName = (modelId: string) => {
    const names: Record<string, string> = {
      'ddos-detector': 'DDoS',
      'malware-classifier': 'Malware',
      'anomaly-detector': 'Anomaly',
      'port-scan-detector': 'Port Scan',
    };
    return names[modelId] || modelId;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{networkStats.activeConnections}</div>
            <p className="text-xs text-slate-400">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Bandwidth Usage</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{networkStats.bandwidth}%</div>
            <Progress value={networkStats.bandwidth} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Packets/Second</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{networkStats.packetsPerSecond.toLocaleString()}</div>
            <p className="text-xs text-slate-400">Real-time monitoring</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">ML Predictions</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{predictions.length}</div>
            <p className="text-xs text-slate-400">
              {isLoading ? 'Processing...' : 'Live analysis'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time ML Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">ML Threat Detection</CardTitle>
            <CardDescription className="text-slate-400">
              Real-time machine learning predictions on network traffic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {predictions.slice(-10).map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-slate-400">
                      {new Date(prediction.timestamp).toLocaleTimeString()}
                    </div>
                    <Badge variant={prediction.prediction === 1 ? "destructive" : "default"}>
                      {getModelName(prediction.modelId)}
                    </Badge>
                    <Badge variant={getThreatLevel(prediction.confidence).color}>
                      {Math.round(prediction.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {prediction.prediction === 1 && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-slate-300">
                      {prediction.prediction === 1 ? 'THREAT' : 'SAFE'}
                    </span>
                  </div>
                </div>
              ))}
              {predictions.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Initializing ML models...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Security Status</CardTitle>
            <CardDescription className="text-slate-400">
              Current security posture and ML model performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Firewall Status</span>
                <Badge variant="default" className="bg-green-600">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">IDS/IPS Engine</span>
                <Badge variant="default" className="bg-green-600">Running</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">ML Detection Models</span>
                <Badge variant="default" className="bg-blue-600">4 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">DDoS Protection</span>
                <Badge variant="default" className="bg-green-600">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Real-time Analysis</span>
                <Badge variant="default" className={isLoading ? "bg-yellow-600" : "bg-green-600"}>
                  {isLoading ? 'Processing' : 'Active'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMonitor;

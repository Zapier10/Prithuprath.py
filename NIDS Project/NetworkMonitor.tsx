import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Shield, AlertTriangle } from "lucide-react";

const NetworkMonitor = () => {
  const [networkStats, setNetworkStats] = useState({
    activeConnections: 0,
    bandwidth: 0,
    packetsPerSecond: 0,
    threatsBlocked: 0,
  });

  const [realtimeData, setRealtimeData] = useState([]);

  // Simulate real-time network data
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats({
        activeConnections: Math.floor(Math.random() * 500) + 200,
        bandwidth: Math.floor(Math.random() * 100) + 20,
        packetsPerSecond: Math.floor(Math.random() * 10000) + 5000,
        threatsBlocked: Math.floor(Math.random() * 50) + 10,
      });

      setRealtimeData(prev => {
        const newData = {
          timestamp: new Date().toLocaleTimeString(),
          traffic: Math.floor(Math.random() * 100),
          threats: Math.floor(Math.random() * 10),
          anomalies: Math.random() > 0.8 ? 1 : 0,
        };
        return [...prev.slice(-20), newData];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTreatLevel = (value: number) => {
    if (value > 70) return { color: "destructive" as const, text: "High" };
    if (value > 40) return { color: "secondary" as const, text: "Medium" };
    return { color: "default" as const, text: "Low" };
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
            <CardTitle className="text-sm font-medium text-slate-200">Threats Blocked</CardTitle>
            <Shield className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{networkStats.threatsBlocked}</div>
            <p className="text-xs text-slate-400">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Network Traffic Monitor</CardTitle>
            <CardDescription className="text-slate-400">
              Real-time network activity and anomaly detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realtimeData.slice(-10).map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-slate-400">{data.timestamp}</div>
                    <Badge 
                      variant={getTreatLevel(data.traffic).color}
                    >
                      Traffic: {data.traffic}%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {data.anomalies > 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-slate-300">
                      {data.threats} threats detected
                    </span>
                  </div>
                </div>
              ))}
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
                <span className="text-slate-300">ML Detection Model</span>
                <Badge variant="default" className="bg-blue-600">98.5% Accuracy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">DDoS Protection</span>
                <Badge variant="default" className="bg-green-600">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Malware Scanner</span>
                <Badge variant="default" className="bg-green-600">Updated</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMonitor;

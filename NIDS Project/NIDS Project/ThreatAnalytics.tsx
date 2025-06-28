import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, Zap, Bug, Globe } from "lucide-react";

const ThreatAnalytics = () => {
  const threatTypes = [
    { name: "DDoS Attacks", count: 45, severity: "high", icon: Zap, percentage: 35 },
    { name: "Port Scanning", count: 128, severity: "medium", icon: Globe, percentage: 25 },
    { name: "Malware Attempts", count: 23, severity: "high", icon: Bug, percentage: 20 },
    { name: "Brute Force", count: 67, severity: "medium", icon: Shield, percentage: 15 },
    { name: "SQL Injection", count: 12, severity: "high", icon: AlertTriangle, percentage: 5 },
  ];

  const recentIncidents = [
    {
      id: 1,
      type: "DDoS Attack",
      source: "185.220.101.42",
      target: "Web Server",
      severity: "high",
      status: "blocked",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      type: "Port Scan",
      source: "192.168.1.100",
      target: "Internal Network",
      severity: "medium",
      status: "monitoring",
      timestamp: "5 minutes ago",
    },
    {
      id: 3,
      type: "Malware Download",
      source: "malicious-site.com",
      target: "Workstation-05",
      severity: "high",
      status: "quarantined",
      timestamp: "12 minutes ago",
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "blocked":
        return "bg-red-600";
      case "quarantined":
        return "bg-orange-600";
      case "monitoring":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Threat Distribution</CardTitle>
          <CardDescription className="text-slate-400">
            Analysis of detected threats by type and severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {threatTypes.map((threat, index) => {
              const Icon = threat.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">{threat.name}</h4>
                      <p className="text-sm text-slate-400">{threat.count} incidents detected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <Progress value={threat.percentage} className="h-2" />
                      <span className="text-xs text-slate-400">{threat.percentage}%</span>
                    </div>
                    <Badge variant={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Incidents */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Security Incidents</CardTitle>
          <CardDescription className="text-slate-400">
            Latest detected threats and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="flex items-center space-x-4">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="text-white font-medium">{incident.type}</h4>
                    <p className="text-sm text-slate-400">
                      From: {incident.source} → Target: {incident.target}
                    </p>
                    <p className="text-xs text-slate-500">{incident.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getSeverityColor(incident.severity)}>
                    {incident.severity}
                  </Badge>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ML Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">Detection Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">98.5%</div>
            <Progress value={98.5} className="mt-2" />
            <p className="text-xs text-slate-400 mt-1">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">False Positives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">1.2%</div>
            <Progress value={1.2} className="mt-2" />
            <p className="text-xs text-slate-400 mt-1">-0.3% improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">15ms</div>
            <p className="text-xs text-slate-400 mt-1">Average detection latency</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreatAnalytics;

import { useState } from "react";
import { Shield, Activity, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NetworkMonitor from "@/components/NetworkMonitor";
import ThreatAnalytics from "@/components/ThreatAnalytics";
import AlertsDashboard from "@/components/AlertsDashboard";
import MLModelStatus from "@/components/MLModelStatus";

const Index = () => {
  const [activeTab, setActiveTab] = useState("monitor");

  const tabs = [
    { id: "monitor", label: "Network Monitor", icon: Activity },
    { id: "analytics", label: "Threat Analytics", icon: BarChart3 },
    { id: "alerts", label: "Security Alerts", icon: AlertTriangle },
    { id: "models", label: "ML Models", icon: Shield },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "monitor":
        return <NetworkMonitor />;
      case "analytics":
        return <ThreatAnalytics />;
      case "alerts":
        return <AlertsDashboard />;
      case "models":
        return <MLModelStatus />;
      default:
        return <NetworkMonitor />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">CyberGuard NIDS</h1>
                <p className="text-slate-400">Network Intrusion Detection System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-none border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-400 bg-blue-600/20 text-blue-300"
                      : "border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { Input } from "../Input";
import { Badge } from "../Badge";
import { AgentManager } from "../../lib/ai-agents";
import { Brain, TrendingUp, Package, MessageSquare, Settings } from "lucide-react";

interface AIAssistantProps {
  openaiApiKey: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ openaiApiKey }) => {
  const [agentManager, setAgentManager] = useState<AgentManager | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analytics" | "inventory">("chat");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [currentFramework, setCurrentFramework] = useState<"langchain" | "crewai">("langchain");

  useEffect(() => {
    if (openaiApiKey) {
      const manager = new AgentManager({
        openaiApiKey,
        preferredFramework: currentFramework,
      });
      setAgentManager(manager);
    }
  }, [openaiApiKey, currentFramework]);

  const handleSendMessage = async () => {
    if (!message.trim() || !agentManager) return;

    setLoading(true);
    const userMessage = { role: "user", content: message };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await agentManager.handleCustomerSupport(message);
      const assistantMessage = { role: "assistant", content: response };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const analyzeSalesData = async () => {
    if (!agentManager) return;
    
    setLoading(true);
    try {
      // Mock sales data - in real app, this would come from your database
      const salesData = [
        { id: 1, product: "PET Bottle 500ml", quantity: 100, revenue: 5000, date: "2024-01-01" },
        { id: 2, product: "PET Bottle 1L", quantity: 50, revenue: 3000, date: "2024-01-02" },
        { id: 3, product: "PET Preform", quantity: 200, revenue: 8000, date: "2024-01-03" },
      ];
      
      const analysis = await agentManager.analyzeSalesData(salesData);
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: `📊 Sales Analysis:\n\n${analysis}` 
      }]);
    } catch (error) {
      console.error("Error analyzing sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeInventory = async () => {
    if (!agentManager) return;
    
    setLoading(true);
    try {
      // Mock inventory data - in real app, this would come from your database
      const inventoryData = {
        products: [
          { name: "PET Bottle 500ml", stock: 1500, minStock: 500, maxStock: 2000, turnoverRate: 0.8 },
          { name: "PET Bottle 1L", stock: 800, minStock: 300, maxStock: 1500, turnoverRate: 0.6 },
          { name: "PET Preform", stock: 2500, minStock: 1000, maxStock: 3000, turnoverRate: 0.9 },
        ],
        warehouseCapacity: 10000,
        currentUtilization: 0.75,
      };
      
      const optimization = await agentManager.optimizeInventory(inventoryData);
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: `📦 Inventory Optimization:\n\n${optimization}` 
      }]);
    } catch (error) {
      console.error("Error optimizing inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchFramework = (framework: "langchain" | "crewai") => {
    setCurrentFramework(framework);
    if (agentManager) {
      agentManager.switchFramework(framework);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={currentFramework === "langchain" ? "default" : "info"}>
              LangChain
            </Badge>
            <Badge variant={currentFramework === "crewai" ? "default" : "info"}>
              CrewAI
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchFramework(currentFramework === "langchain" ? "crewai" : "langchain")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Switch Framework
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "chat" ? "primary" : "outline"}
            onClick={() => setActiveTab("chat")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={activeTab === "analytics" ? "primary" : "outline"}
            onClick={() => setActiveTab("analytics")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "inventory" ? "primary" : "outline"}
            onClick={() => setActiveTab("inventory")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Inventory
          </Button>
        </div>

        {activeTab === "chat" && (
          <div className="space-y-4">
            <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-2">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-100 ml-auto max-w-[80%]"
                      : "bg-gray-100 mr-auto max-w-[80%]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="bg-gray-100 mr-auto max-w-[80%] p-3 rounded-lg">
                  <p className="text-sm">Thinking...</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                placeholder="Ask me anything about your business..."
                onKeyPress={(e: React.KeyboardEvent) => e.key === "Enter" && handleSendMessage()}
                disabled={loading}
              />
              <Button onClick={handleSendMessage} disabled={loading}>
                Send
              </Button>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="h-96 overflow-y-auto border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Business Analytics</h3>
              <div className="space-y-2">
                {chatHistory
                  .filter(msg => msg.content.includes("📊"))
                  .map((msg, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
              </div>
            </div>
            <Button onClick={analyzeSalesData} disabled={loading} className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Sales Data
            </Button>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="h-96 overflow-y-auto border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Inventory Optimization</h3>
              <div className="space-y-2">
                {chatHistory
                  .filter(msg => msg.content.includes("📦"))
                  .map((msg, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
              </div>
            </div>
            <Button onClick={optimizeInventory} disabled={loading} className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Optimize Inventory
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

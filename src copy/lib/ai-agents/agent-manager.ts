import { LangChainAgent } from "./langchain-agent";
import { CrewAIAgent } from "./crewai-agent";

export interface AgentManagerConfig {
  openaiApiKey: string;
  preferredFramework?: "langchain" | "crewai";
}

export class AgentManager {
  private langChainAgent: LangChainAgent;
  private crewAIAgent: CrewAIAgent;
  private config: AgentManagerConfig;

  constructor(config: AgentManagerConfig) {
    this.config = {
      preferredFramework: "langchain",
      ...config,
    };

    this.langChainAgent = new LangChainAgent({
      openaiApiKey: config.openaiApiKey,
    });

    this.crewAIAgent = new CrewAIAgent({
      openaiApiKey: config.openaiApiKey,
      agents: [],
      tasks: [],
    });
  }

  async analyzeSalesData(salesData: any[]): Promise<string> {
    const framework = this.config.preferredFramework;
    
    if (framework === "crewai") {
      return await this.crewAIAgent.analyzeBusinessData({
        type: "sales",
        data: salesData,
      });
    } else {
      return await this.langChainAgent.generateSalesReport(salesData);
    }
  }

  async optimizeInventory(inventoryData: any): Promise<string> {
    const framework = this.config.preferredFramework;
    
    if (framework === "crewai") {
      return await this.crewAIAgent.inventoryManagementOptimization(inventoryData);
    } else {
      return await this.langChainAgent.suggestInventoryOptimization(inventoryData);
    }
  }

  async handleCustomerSupport(query: string, context?: any): Promise<string> {
    return await this.langChainAgent.customerSupportResponse(query, context);
  }

  async analyzeCRMData(data: any): Promise<string> {
    const framework = this.config.preferredFramework;
    
    if (framework === "crewai") {
      return await this.crewAIAgent.analyzeBusinessData({
        type: "crm",
        data,
      });
    } else {
      return await this.langChainAgent.analyzeCRMData(data);
    }
  }

  async optimizeSalesTeam(salesData: any): Promise<string> {
    return await this.crewAIAgent.salesTeamOptimization(salesData);
  }

  async automateCustomerService(customerData: any): Promise<string> {
    return await this.crewAIAgent.customerServiceAutomation(customerData);
  }

  switchFramework(framework: "langchain" | "crewai"): void {
    this.config.preferredFramework = framework;
  }

  getCurrentFramework(): string {
    return this.config.preferredFramework || "langchain";
  }
}

export default AgentManager;

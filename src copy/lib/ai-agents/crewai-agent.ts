import { Agent, Task, Crew } from "crewai-ts";

export interface CrewAgentConfig {
  openaiApiKey: string;
  agents: AgentDefinition[];
  tasks: TaskDefinition[];
}

export interface AgentDefinition {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools?: string[];
}

export interface TaskDefinition {
  name: string;
  description: string;
  expectedOutput: string;
  agent: string;
}

export class CrewAIAgent {
  private config: CrewAgentConfig;

  constructor(config: CrewAgentConfig) {
    this.config = config;
    // Config stored for future use in agent customization
  }

  async analyzeBusinessData(data: any): Promise<string> {
    const agents = [
      new Agent({
        role: "Business Data Analyst",
        goal: "Analyze business data and provide actionable insights",
        backstory: "You are an experienced business analyst with expertise in CRM, sales, and inventory data analysis.",
        tools: [],
      }),
      new Agent({
        role: "Business Strategy Advisor",
        goal: "Provide strategic recommendations based on data analysis",
        backstory: "You are a strategic business consultant who helps companies optimize their operations based on data insights.",
        tools: [],
      }),
    ];

    const tasks = [
      new Task({
        description: `Analyze the following business data: ${JSON.stringify(data, null, 2)}`,
        expectedOutput: "Comprehensive analysis of the data with key insights and patterns",
        agent: agents[0],
      }),
      new Task({
        description: "Based on the data analysis, provide strategic recommendations for business improvement",
        expectedOutput: "Actionable strategic recommendations with implementation steps",
        agent: agents[1],
      }),
    ];

    const crew = new Crew({
      agents,
      tasks,
      verbose: true,
    });

    const result = await crew.kickoff();
    return result.toString();
  }

  async salesTeamOptimization(salesData: any): Promise<string> {
    const agents = [
      new Agent({
        role: "Sales Performance Specialist",
        goal: "Analyze sales team performance and identify optimization opportunities",
        backstory: "You are a sales performance expert with deep knowledge of sales metrics and team optimization strategies.",
        tools: [],
      }),
      new Agent({
        role: "Sales Training Specialist",
        goal: "Develop training recommendations based on performance analysis",
        backstory: "You are a sales training expert who creates effective training programs to improve team performance.",
        tools: [],
      }),
    ];

    const tasks = [
      new Task({
                description: `Analyze sales team performance data: ${JSON.stringify(salesData, null, 2)}`,
        expectedOutput: "Detailed performance analysis with strengths, weaknesses, and improvement areas",
        agent: agents[0],
      }),
      new Task({
                description: "Create specific training recommendations to address performance gaps",
        expectedOutput: "Comprehensive training plan with specific modules and expected outcomes",
        agent: agents[1],
      }),
    ];

    const crew = new Crew({
      agents,
      tasks,
      verbose: true,
    });

    const result = await crew.kickoff();
    return result.toString();
  }

  async inventoryManagementOptimization(inventoryData: any): Promise<string> {
    const agents = [
      new Agent({
        role: "Inventory Management Specialist",
        goal: "Analyze inventory data and identify optimization opportunities",
        backstory: "You are an inventory management expert with deep knowledge of supply chain optimization and stock management.",
        tools: [],
      }),
      new Agent({
        role: "Procurement Strategy Advisor",
        goal: "Develop procurement strategies based on inventory analysis",
        backstory: "You are a procurement expert who optimizes purchasing strategies to reduce costs and improve efficiency.",
        tools: [],
      }),
    ];

    const tasks = [
      new Task({
                description: `Analyze inventory data: ${JSON.stringify(inventoryData, null, 2)}`,
        expectedOutput: "Comprehensive inventory analysis with stock level recommendations",
        agent: agents[0],
      }),
      new Task({
                description: "Develop procurement strategies based on inventory analysis",
        expectedOutput: "Strategic procurement recommendations with cost-saving opportunities",
        agent: agents[1],
      }),
    ];

    const crew = new Crew({
      agents,
      tasks,
      verbose: true,
    });

    const result = await crew.kickoff();
    return result.toString();
  }

  async customerServiceAutomation(customerData: any): Promise<string> {
    const agents = [
      new Agent({
        role: "Customer Experience Specialist",
        goal: "Analyze customer data and identify service improvement opportunities",
        backstory: "You are a customer experience expert who focuses on improving customer satisfaction and loyalty.",
        tools: [],
      }),
      new Agent({
        role: "Service Automation Expert",
        goal: "Identify automation opportunities in customer service",
        backstory: "You are an automation expert who identifies processes that can be automated to improve efficiency.",
        tools: [],
      }),
    ];

    const tasks = [
      new Task({
                description: `Analyze customer data: ${JSON.stringify(customerData, null, 2)}`,
        expectedOutput: "Customer behavior analysis with service improvement opportunities",
        agent: agents[0],
      }),
      new Task({
                description: "Identify specific automation opportunities in customer service processes",
        expectedOutput: "Detailed automation recommendations with implementation steps",
        agent: agents[1],
      }),
    ];

    const crew = new Crew({
      agents,
      tasks,
      verbose: true,
    });

    const result = await crew.kickoff();
    return result.toString();
  }
}

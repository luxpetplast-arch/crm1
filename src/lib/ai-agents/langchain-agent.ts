import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";

export interface AgentConfig {
  openaiApiKey: string;
  model?: string;
  temperature?: number;
}

export class LangChainAgent {
  private model: ChatOpenAI;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = {
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      ...config,
    };
    
    this.model = new ChatOpenAI({
      openAIApiKey: this.config.openaiApiKey,
      modelName: this.config.model,
      temperature: this.config.temperature,
    });
  }

  async analyzeCRMData(data: any): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a CRM data analysis expert. Analyze the provided data and give insights about:\n    1. Sales trends\n    2. Customer behavior patterns\n    3. Product performance\n    4. Recommendations for improvement"],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    const chain = RunnableSequence.from([
      {
        history: () => [],
        input: (input: any) => input,
      },
      prompt,
      this.model,
      new StringOutputParser(),
    ]);

    return await chain.invoke({
      input: `Data: ${JSON.stringify(data, null, 2)}`,
    });
  }

  async generateSalesReport(salesData: any[]): Promise<string> {
    const prompt = `
    As a sales analyst, generate a comprehensive sales report based on this data:
    ${JSON.stringify(salesData, null, 2)}
    
    Include:
    1. Total sales summary
    2. Top performing products
    3. Customer insights
    4. Trends and patterns
    5. Actionable recommendations
    `;

    const response = await this.model.invoke([
      new SystemMessage("You are a professional sales analyst."),
      new HumanMessage(prompt),
    ]);

    return response.content as string;
  }

  async suggestInventoryOptimization(inventoryData: any): Promise<string> {
    const prompt = `
    Analyze this inventory data and provide optimization suggestions:
    ${JSON.stringify(inventoryData, null, 2)}
    
    Consider:
    1. Stock levels and reorder points
    2. Slow-moving vs fast-moving items
    3. Seasonal trends
    4. Storage optimization
    5. Cost reduction opportunities
    `;

    const response = await this.model.invoke([
      new SystemMessage("You are an inventory management expert."),
      new HumanMessage(prompt),
    ]);

    return response.content as string;
  }

  async customerSupportResponse(customerQuery: string, context?: any): Promise<string> {
    const prompt = `
    Customer Query: ${customerQuery}
    
    Context: ${context ? JSON.stringify(context, null, 2) : "No additional context"}
    
    Provide a helpful, professional response that addresses the customer's needs.
    If you need more information, ask clarifying questions.
    `;

    const response = await this.model.invoke([
      new SystemMessage("You are a helpful customer service representative for LUX PET PLAST."),
      new HumanMessage(prompt),
    ]);

    return response.content as string;
  }
}

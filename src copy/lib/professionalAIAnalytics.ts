// Professional AI/ML Analytics and Prediction System

// Prediction Types
export enum PredictionType {
  SALES_FORECAST = 'sales_forecast',
  INVENTORY_OPTIMIZATION = 'inventory_optimization',
  CUSTOMER_CHURN = 'customer_churn',
  PRICE_OPTIMIZATION = 'price_optimization',
  DEMAND_PLANNING = 'demand_planning',
  ANOMALY_DETECTION = 'anomaly_detection',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  RECOMMENDATION_ENGINE = 'recommendation_engine',
}

// Model Types
export enum ModelType {
  LINEAR_REGRESSION = 'linear_regression',
  RANDOM_FOREST = 'random_forest',
  NEURAL_NETWORK = 'neural_network',
  TIME_SERIES = 'time_series',
  CLUSTERING = 'clustering',
  CLASSIFICATION = 'classification',
  ENSEMBLE = 'ensemble',
  DEEP_LEARNING = 'deep_learning',
}

// Prediction Result
export interface PredictionResult {
  id: string;
  type: PredictionType;
  modelType: ModelType;
  timestamp: Date;
  confidence: number; // 0-1
  accuracy: number;   // 0-1
  prediction: any;
  features: Record<string, number>;
  metadata: {
    trainingDataSize: number;
    validationScore: number;
    modelVersion: string;
    lastTrained: Date;
    features: string[];
  };
  explanation?: string;
  recommendations?: string[];
}

// AI Model Configuration
export interface AIModelConfig {
  type: ModelType;
  algorithm: string;
  hyperparameters: Record<string, any>;
  features: string[];
  target: string;
  trainingData: any[];
  validationSplit: number;
  crossValidation: number;
  featureEngineering: {
    scaling: boolean;
    encoding: string;
    selection: string;
    dimensionalityReduction?: string;
  };
  optimization: {
    algorithm: string;
    iterations: number;
    learningRate: number;
    regularization: number;
  };
}

// Anomaly Detection Result
export interface AnomalyResult {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'pattern' | 'outlier';
  value: number;
  expected: number;
  deviation: number;
  confidence: number;
  context: Record<string, any>;
  explanation: string;
  recommendations: string[];
}

// Sentiment Analysis Result
export interface SentimentResult {
  id: string;
  timestamp: Date;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  keywords: string[];
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  language: string;
}

// Recommendation Result
export interface RecommendationResult {
  id: string;
  timestamp: Date;
  userId?: string;
  type: 'product' | 'content' | 'action' | 'price';
  items: Array<{
    id: string;
    name: string;
    score: number;
    confidence: number;
    reason: string;
    metadata: Record<string, any>;
  }>;
  algorithm: string;
  context: Record<string, any>;
}

// AI Analytics Configuration
export interface AIAnalyticsConfig {
  enablePredictions: boolean;
  enableAnomalyDetection: boolean;
  enableSentimentAnalysis: boolean;
  enableRecommendations: boolean;
  models: {
    [key in PredictionType]?: AIModelConfig;
  };
  scheduling: {
    retrainInterval: number; // hours
    predictionInterval: number; // minutes
    anomalyCheckInterval: number; // minutes
  };
  thresholds: {
    minConfidence: number;
    minAccuracy: number;
    anomalySensitivity: number;
    recommendationScore: number;
  };
  notifications: {
    enabled: boolean;
    channels: ('email' | 'sms' | 'webhook' | 'in_app')[];
    recipients: string[];
  };
}

// Professional AI Analytics Manager
export class ProfessionalAIAnalyticsManager {
  private static instance: ProfessionalAIAnalyticsManager;
  private config: AIAnalyticsConfig;
  private models: Map<PredictionType, AIModelConfig> = new Map();
  private predictions: PredictionResult[] = [];
  private anomalies: AnomalyResult[] = [];
  private sentiments: SentimentResult[] = [];
  private recommendations: RecommendationResult[] = [];
  private isTraining = false;
  private isPredicting = false;

  constructor(config: AIAnalyticsConfig) {
    this.config = config;
    this.initializeModels();
    this.loadHistoricalData();
  }

  static getInstance(config?: AIAnalyticsConfig): ProfessionalAIAnalyticsManager {
    if (!ProfessionalAIAnalyticsManager.instance) {
      if (!config) {
        throw new Error('AI Analytics config required for first initialization');
      }
      ProfessionalAIAnalyticsManager.instance = new ProfessionalAIAnalyticsManager(config);
    }
    return ProfessionalAIAnalyticsManager.instance;
  }

  // Initialize AI models
  private initializeModels(): void {
    // Sales Forecast Model
    this.models.set(PredictionType.SALES_FORECAST, {
      type: ModelType.TIME_SERIES,
      algorithm: 'ARIMA',
      hyperparameters: {
        p: 1,
        d: 1,
        q: 1,
        seasonal: true,
        seasonalPeriod: 12
      },
      features: ['sales', 'date', 'month', 'year', 'day_of_week', 'holidays', 'promotions'],
      target: 'sales',
      trainingData: [],
      validationSplit: 0.2,
      crossValidation: 5,
      featureEngineering: {
        scaling: true,
        encoding: 'one_hot',
        selection: 'recursive_feature_elimination'
      },
      optimization: {
        algorithm: 'grid_search',
        iterations: 100,
        learningRate: 0.01,
        regularization: 0.1
      }
    });

    // Customer Churn Model
    this.models.set(PredictionType.CUSTOMER_CHURN, {
      type: ModelType.RANDOM_FOREST,
      algorithm: 'RandomForestClassifier',
      hyperparameters: {
        n_estimators: 100,
        max_depth: 10,
        min_samples_split: 5,
        min_samples_leaf: 2
      },
      features: ['purchase_frequency', 'avg_order_value', 'days_since_last_purchase', 'complaints', 'support_tickets'],
      target: 'churned',
      trainingData: [],
      validationSplit: 0.25,
      crossValidation: 10,
      featureEngineering: {
        scaling: true,
        encoding: 'label_encoding',
        selection: 'chi_square'
      },
      optimization: {
        algorithm: 'random_search',
        iterations: 50,
        learningRate: 0.1,
        regularization: 0.01
      }
    });

    // Price Optimization Model
    this.models.set(PredictionType.PRICE_OPTIMIZATION, {
      type: ModelType.LINEAR_REGRESSION,
      algorithm: 'ElasticNet',
      hyperparameters: {
        alpha: 0.1,
        l1_ratio: 0.5,
        max_iter: 1000
      },
      features: ['competitor_price', 'demand', 'season', 'product_quality', 'brand_reputation'],
      target: 'optimal_price',
      trainingData: [],
      validationSplit: 0.3,
      crossValidation: 5,
      featureEngineering: {
        scaling: true,
        encoding: 'one_hot',
        selection: 'lasso'
      },
      optimization: {
        algorithm: 'bayesian_optimization',
        iterations: 200,
        learningRate: 0.05,
        regularization: 0.5
      }
    });

    // Anomaly Detection Model
    this.models.set(PredictionType.ANOMALY_DETECTION, {
      type: ModelType.CLUSTERING,
      algorithm: 'IsolationForest',
      hyperparameters: {
        n_estimators: 100,
        contamination: 0.1,
        max_features: 1.0
      },
      features: ['sales', 'traffic', 'errors', 'response_time', 'cpu_usage'],
      target: 'anomaly_score',
      trainingData: [],
      validationSplit: 0.2,
      crossValidation: 3,
      featureEngineering: {
        scaling: true,
        encoding: 'none',
        selection: 'variance_threshold'
      },
      optimization: {
        algorithm: 'grid_search',
        iterations: 50,
        learningRate: 0.1,
        regularization: 0.01
      }
    });
  }

  // Load historical data
  private loadHistoricalData(): void {
    // In a real implementation, this would load from database
    console.log('Loading historical data for AI models...');
  }

  // Train model
  async trainModel(type: PredictionType): Promise<PredictionResult> {
    if (this.isTraining) {
      throw new Error('Model training already in progress');
    }

    this.isTraining = true;
    const modelConfig = this.models.get(type);
    
    if (!modelConfig) {
      throw new Error(`Model configuration not found for type: ${type}`);
    }

    try {
      console.log(`Training ${type} model...`);
      
      // Simulate training process
      await this.simulateTraining(modelConfig);
      
      // Generate mock training result
      const result: PredictionResult = {
        id: `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        modelType: modelConfig.type,
        timestamp: new Date(),
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        accuracy: Math.random() * 0.2 + 0.8,  // 0.8-1.0
        prediction: this.generateMockPrediction(type),
        features: this.extractFeatures(type),
        metadata: {
          trainingDataSize: Math.floor(Math.random() * 10000) + 1000,
          validationScore: Math.random() * 0.2 + 0.8,
          modelVersion: 'v1.0.0',
          lastTrained: new Date(),
          features: modelConfig.features
        },
        explanation: this.generateExplanation(type),
        recommendations: this.generateRecommendations(type)
      };

      this.predictions.push(result);
      return result;

    } catch (error) {
      console.error(`Failed to train ${type} model:`, error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  // Simulate training process
  private async simulateTraining(config: AIModelConfig): Promise<void> {
    const trainingTime = config.hyperparameters.iterations * 10; // Simulated training time
    await new Promise(resolve => setTimeout(resolve, Math.min(trainingTime, 10000)));
  }

  // Generate mock prediction
  private generateMockPrediction(type: PredictionType): any {
    switch (type) {
      case PredictionType.SALES_FORECAST:
        return {
          next_month: Math.floor(Math.random() * 50000000) + 100000000, // 100M-150M UZS
          next_quarter: Math.floor(Math.random() * 150000000) + 300000000, // 300M-450M UZS
          confidence_interval: {
            lower: 0.85,
            upper: 1.15
          },
          trend: 'increasing',
          seasonality: 'strong'
        };

      case PredictionType.CUSTOMER_CHURN:
        return {
          churn_probability: Math.random() * 0.3 + 0.1, // 10-40%
          at_risk_customers: Math.floor(Math.random() * 50) + 10,
          retention_cost: Math.floor(Math.random() * 5000000) + 1000000,
          potential_revenue_loss: Math.floor(Math.random() * 20000000) + 5000000
        };

      case PredictionType.PRICE_OPTIMIZATION:
        return {
          optimal_price: Math.floor(Math.random() * 5000) + 10000, // 10k-15k UZS
          expected_demand: Math.floor(Math.random() * 1000) + 500,
          revenue_impact: Math.random() * 0.2 - 0.1, // -10% to +10%
          price_elasticity: -Math.random() * 2 - 0.5 // -0.5 to -2.5
        };

      case PredictionType.INVENTORY_OPTIMIZATION:
        return {
          optimal_stock: Math.floor(Math.random() * 10000) + 5000,
          reorder_point: Math.floor(Math.random() * 2000) + 1000,
          safety_stock: Math.floor(Math.random() * 1000) + 500,
          holding_cost: Math.random() * 100000 + 50000
        };

      case PredictionType.DEMAND_PLANNING:
        return {
          forecast_demand: Math.floor(Math.random() * 5000) + 2000,
          demand_trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
          seasonal_factors: [1.2, 0.8, 1.1, 0.9, 1.3, 0.7],
          confidence_level: Math.random() * 0.2 + 0.8
        };

      default:
        return { prediction: 'mock_data' };
    }
  }

  // Extract features
  private extractFeatures(type: PredictionType): Record<string, number> {
    const modelConfig = this.models.get(type);
    if (!modelConfig) return {};

    const features: Record<string, number> = {};
    modelConfig.features.forEach(feature => {
      features[feature] = Math.random() * 100;
    });
    return features;
  }

  // Generate explanation
  private generateExplanation(type: PredictionType): string {
    switch (type) {
      case PredictionType.SALES_FORECAST:
        return 'Sales forecast based on historical trends, seasonal patterns, and market conditions. Model shows strong seasonal correlation with holiday periods.';
      case PredictionType.CUSTOMER_CHURN:
        return 'Customer churn prediction based on purchase frequency, order value, and engagement metrics. Recent purchases and higher order values reduce churn risk.';
      case PredictionType.PRICE_OPTIMIZATION:
        return 'Price optimization considers competitor pricing, demand elasticity, and market positioning. Optimal price balances revenue maximization with market share.';
      case PredictionType.INVENTORY_OPTIMIZATION:
        return 'Inventory optimization based on demand forecasting, lead times, and holding costs. Recommends safety stock to prevent stockouts.';
      case PredictionType.DEMAND_PLANNING:
        return 'Demand planning uses time series analysis with seasonal decomposition. Accounts for promotions, holidays, and market trends.';
      default:
        return 'AI prediction based on machine learning model analysis.';
    }
  }

  // Generate recommendations
  private generateRecommendations(type: PredictionType): string[] {
    switch (type) {
      case PredictionType.SALES_FORECAST:
        return [
          'Increase marketing budget during predicted high-demand periods',
          'Adjust inventory levels based on seasonal forecasts',
          'Consider promotional activities during low-demand periods'
        ];
      case PredictionType.CUSTOMER_CHURN:
        return [
          'Implement retention programs for high-risk customers',
          'Offer personalized discounts to at-risk segments',
          'Improve customer service response times'
        ];
      case PredictionType.PRICE_OPTIMIZATION:
        return [
          'Monitor competitor pricing changes weekly',
          'Test price elasticity with A/B testing',
          'Consider dynamic pricing for different segments'
        ];
      case PredictionType.INVENTORY_OPTIMIZATION:
        return [
          'Implement just-in-time inventory system',
          'Negotiate better terms with suppliers',
          'Consider safety stock for critical items'
        ];
      case PredictionType.DEMAND_PLANNING:
        return [
          'Align production schedules with demand forecasts',
          'Maintain buffer stock for high-demand items',
          'Monitor leading indicators for demand changes'
        ];
      default:
        return ['Monitor model performance regularly'];
    }
  }

  // Detect anomalies
  async detectAnomalies(data: Record<string, number>): Promise<AnomalyResult[]> {
    const anomalies: AnomalyResult[] = [];
    const modelConfig = this.models.get(PredictionType.ANOMALY_DETECTION);
    
    if (!modelConfig) return anomalies;

    // Simulate anomaly detection
    Object.entries(data).forEach(([key, value]) => {
      const expected = this.calculateExpectedValue(key, value);
      const deviation = Math.abs(value - expected) / expected;
      
      if (deviation > this.config.thresholds.anomalySensitivity) {
        const anomaly: AnomalyResult = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          severity: deviation > 0.5 ? 'critical' : deviation > 0.3 ? 'high' : deviation > 0.2 ? 'medium' : 'low',
          type: value > expected ? 'spike' : 'drop',
          value,
          expected,
          deviation,
          confidence: Math.random() * 0.3 + 0.7,
          context: { metric: key, threshold: this.config.thresholds.anomalySensitivity },
          explanation: this.generateAnomalyExplanation(key, value, expected),
          recommendations: this.generateAnomalyRecommendations(key, value, expected)
        };
        
        anomalies.push(anomaly);
      }
    });

    this.anomalies.push(...anomalies);
    return anomalies;
  }

  // Calculate expected value
  private calculateExpectedValue(metric: string, actual: number): number {
    // Simulate expected value calculation
    const baseValues: Record<string, number> = {
      'sales': 100000000,
      'traffic': 10000,
      'errors': 50,
      'response_time': 200,
      'cpu_usage': 60
    };
    
    const base = baseValues[metric] || 100;
    const variation = Math.random() * 0.2 - 0.1; // ±10% variation
    return base * (1 + variation);
  }

  // Generate anomaly explanation
  private generateAnomalyExplanation(metric: string, actual: number, expected: number): string {
    const deviation = ((actual - expected) / expected * 100).toFixed(1);
    const direction = actual > expected ? 'higher' : 'lower';
    return `${metric} is ${deviation}% ${direction} than expected value of ${expected.toFixed(2)}. This deviation may indicate unusual system behavior or external factors affecting performance.`;
  }

  // Generate anomaly recommendations
  private generateAnomalyRecommendations(metric: string, actual: number, expected: number): string[] {
    const recommendations = [];
    
    if (actual > expected) {
      recommendations.push(`Investigate potential causes for increased ${metric}`);
      recommendations.push('Check for system overload or unusual activity');
      recommendations.push('Monitor related metrics for correlation');
    } else {
      recommendations.push(`Investigate potential causes for decreased ${metric}`);
      recommendations.push('Check for system issues or external factors');
      recommendations.push('Verify data collection and reporting accuracy');
    }
    
    recommendations.push('Set up alerts for future anomalies');
    recommendations.push('Document findings for trend analysis');
    
    return recommendations;
  }

  // Analyze sentiment
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Simulate sentiment analysis
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    const result: SentimentResult = {
      id: `sentiment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      text,
      sentiment,
      confidence: Math.random() * 0.3 + 0.7,
      emotions: {
        joy: Math.random(),
        anger: Math.random(),
        fear: Math.random(),
        sadness: Math.random(),
        surprise: Math.random()
      },
      keywords: this.extractKeywords(text),
      entities: this.extractEntities(text),
      language: 'uz' // Uzbek language
    };

    this.sentiments.push(result);
    return result;
  }

  // Extract keywords
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['va', 'ham', 'bunda', 'uchun', 'bilan', 'to\'g\'risida'];
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }

  // Extract entities
  private extractEntities(text: string): Array<{ text: string; type: string; confidence: number }> {
    // Simple entity extraction
    const entities = [];
    
    // Extract numbers (prices, quantities)
    const numbers = text.match(/\d+/g);
    if (numbers) {
      numbers.forEach(num => {
        entities.push({
          text: num,
          type: 'number',
          confidence: Math.random() * 0.3 + 0.7
        });
      });
    }
    
    return entities.slice(0, 5);
  }

  // Generate recommendations
  async generateRecommendations(
    type: 'product' | 'content' | 'action' | 'price',
    userId?: string,
    context?: Record<string, any>
  ): Promise<RecommendationResult> {
    // Simulate recommendation generation
    const items = this.generateMockRecommendations(type, 5);
    
    const result: RecommendationResult = {
      id: `recommendation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      type,
      items,
      algorithm: 'collaborative_filtering',
      context: context || {}
    };

    this.recommendations.push(result);
    return result;
  }

  // Generate mock recommendations
  private generateMockRecommendations(type: string, count: number): Array<{
    id: string;
    name: string;
    score: number;
    confidence: number;
    reason: string;
    metadata: Record<string, any>;
  }> {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      items.push({
        id: `item_${i}`,
        name: `Recommended ${type} ${i + 1}`,
        score: Math.random() * 0.5 + 0.5,
        confidence: Math.random() * 0.3 + 0.7,
        reason: `Based on your previous ${type} interactions`,
        metadata: {
          category: type,
          popularity: Math.random() * 100,
          rating: Math.random() * 2 + 3
        }
      });
    }
    
    return items.sort((a, b) => b.score - a.score);
  }

  // Get predictions
  getPredictions(type?: PredictionType): PredictionResult[] {
    if (type) {
      return this.predictions.filter(p => p.type === type);
    }
    return this.predictions;
  }

  // Get anomalies
  getAnomalies(severity?: 'low' | 'medium' | 'high' | 'critical'): AnomalyResult[] {
    if (severity) {
      return this.anomalies.filter(a => a.severity === severity);
    }
    return this.anomalies;
  }

  // Get sentiments
  getSentiments(sentiment?: 'positive' | 'negative' | 'neutral'): SentimentResult[] {
    if (sentiment) {
      return this.sentiments.filter(s => s.sentiment === sentiment);
    }
    return this.sentiments;
  }

  // Get recommendations
  getRecommendations(type?: 'product' | 'content' | 'action' | 'price'): RecommendationResult[] {
    if (type) {
      return this.recommendations.filter(r => r.type === type);
    }
    return this.recommendations;
  }

  // Get AI analytics dashboard
  getAnalyticsDashboard(): {
    models: {
      [key in PredictionType]?: {
        trained: boolean;
        accuracy: number;
        lastTrained?: Date;
        predictions: number;
      };
    };
    predictions: {
      total: number;
      averageConfidence: number;
      averageAccuracy: number;
      byType: Record<PredictionType, number>;
    };
    anomalies: {
      total: number;
      bySeverity: Record<string, number>;
      byType: Record<string, number>;
      recent: AnomalyResult[];
    };
    sentiments: {
      total: number;
      distribution: Record<string, number>;
      averageConfidence: number;
      recent: SentimentResult[];
    };
    recommendations: {
      total: number;
      byType: Record<string, number>;
      averageScore: number;
      recent: RecommendationResult[];
    };
  } {
    const models: any = {};
    
    // Initialize models data
    Object.values(PredictionType).forEach(type => {
      const modelPredictions = this.predictions.filter(p => p.type === type);
      models[type] = {
        trained: modelPredictions.length > 0,
        accuracy: modelPredictions.length > 0 
          ? modelPredictions.reduce((sum, p) => sum + p.accuracy, 0) / modelPredictions.length 
          : 0,
        lastTrained: modelPredictions.length > 0 
          ? new Date(Math.max(...modelPredictions.map(p => p.timestamp.getTime())))
          : undefined,
        predictions: modelPredictions.length
      };
    });

    // Calculate predictions statistics
    const predictionsByType: Record<PredictionType, number> = {} as any;
    Object.values(PredictionType).forEach(type => {
      predictionsByType[type] = this.predictions.filter(p => p.type === type).length;
    });

    // Calculate anomalies statistics
    const anomaliesBySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    const anomaliesByType: Record<string, number> = {};
    
    this.anomalies.forEach(anomaly => {
      anomaliesBySeverity[anomaly.severity]++;
      anomaliesByType[anomaly.type] = (anomaliesByType[anomaly.type] || 0) + 1;
    });

    // Calculate sentiments statistics
    const sentimentsDistribution: Record<string, number> = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    this.sentiments.forEach(sentiment => {
      sentimentsDistribution[sentiment.sentiment]++;
    });

    // Calculate recommendations statistics
    const recommendationsByType: Record<string, number> = {};
    
    this.recommendations.forEach(rec => {
      recommendationsByType[rec.type] = (recommendationsByType[rec.type] || 0) + 1;
    });

    return {
      models,
      predictions: {
        total: this.predictions.length,
        averageConfidence: this.predictions.length > 0 
          ? this.predictions.reduce((sum, p) => sum + p.confidence, 0) / this.predictions.length 
          : 0,
        averageAccuracy: this.predictions.length > 0 
          ? this.predictions.reduce((sum, p) => sum + p.accuracy, 0) / this.predictions.length 
          : 0,
        byType: predictionsByType
      },
      anomalies: {
        total: this.anomalies.length,
        bySeverity: anomaliesBySeverity,
        byType: anomaliesByType,
        recent: this.anomalies.slice(-10)
      },
      sentiments: {
        total: this.sentiments.length,
        distribution: sentimentsDistribution,
        averageConfidence: this.sentiments.length > 0 
          ? this.sentiments.reduce((sum, s) => sum + s.confidence, 0) / this.sentiments.length 
          : 0,
        recent: this.sentiments.slice(-10)
      },
      recommendations: {
        total: this.recommendations.length,
        byType: recommendationsByType,
        averageScore: this.recommendations.length > 0 
          ? this.recommendations.reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.score, 0) / r.items.length, 0) / this.recommendations.length 
          : 0,
        recent: this.recommendations.slice(-10)
      }
    };
  }

  // Test AI system
  async testAISystem(): Promise<{
    modelTraining: boolean;
    anomalyDetection: boolean;
    sentimentAnalysis: boolean;
    recommendations: boolean;
  }> {
    console.log('Testing AI system...');
    
    const results = {
      modelTraining: false,
      anomalyDetection: false,
      sentimentAnalysis: false,
      recommendations: false,
    };

    try {
      // Test model training
      await this.trainModel(PredictionType.SALES_FORECAST);
      results.modelTraining = true;
      
      // Test anomaly detection
      await this.detectAnomalies({ sales: 150000000, traffic: 15000 });
      results.anomalyDetection = true;
      
      // Test sentiment analysis
      await this.analyzeSentiment('Bu mahsulot juda yaxshi va sifatli');
      results.sentimentAnalysis = true;
      
      // Test recommendations
      await this.generateRecommendations('product', 'user123');
      results.recommendations = true;
      
    } catch (error) {
      console.error('AI system test failed:', error);
    }

    return results;
  }
}

// Create singleton instance
export const aiAnalytics = ProfessionalAIAnalyticsManager.getInstance;

// Convenience functions
export const trainModel = async (type: PredictionType) => {
  const manager = ProfessionalAIAnalyticsManager.getInstance();
  return await manager.trainModel(type);
};

export const detectAnomalies = async (data: Record<string, number>) => {
  const manager = ProfessionalAIAnalyticsManager.getInstance();
  return await manager.detectAnomalies(data);
};

export const analyzeSentiment = async (text: string) => {
  const manager = ProfessionalAIAnalyticsManager.getInstance();
  return await manager.analyzeSentiment(text);
};

export const generateRecommendations = async (
  type: 'product' | 'content' | 'action' | 'price',
  userId?: string,
  context?: Record<string, any>
) => {
  const manager = ProfessionalAIAnalyticsManager.getInstance();
  return await manager.generateRecommendations(type, userId, context);
};

export default ProfessionalAIAnalyticsManager;

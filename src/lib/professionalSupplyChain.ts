// Professional Supply Chain Management System

// Supplier Status
export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

// Order Status
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

// Priority Level
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Supplier Information
export interface Supplier {
  id: string;
  name: string;
  code: string;
  status: SupplierStatus;
  contact: {
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    website?: string;
  };
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    sku: string;
    unit: string;
    price: number;
    leadTime: number; // days
    minOrderQuantity: number;
  }>;
  performance: {
    onTimeDelivery: number; // percentage
    qualityScore: number; // 1-10
    responseTime: number; // hours
    orderAccuracy: number; // percentage
    totalOrders: number;
    totalValue: number;
  };
  contracts: Array<{
    id: string;
    type: 'framework' | 'spot' | 'long_term';
    startDate: Date;
    endDate: Date;
    terms: string;
    conditions: string[];
    value: number;
  }>;
  certifications: Array<{
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    document: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Order
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: Priority;
  supplierId: string;
  supplierName: string;
  requestedBy: string;
  approvedBy?: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    expectedDeliveryDate: Date;
    warehouse: string;
    notes?: string;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  delivery: {
    address: string;
    city: string;
    country: string;
    expectedDate: Date;
    instructions?: string;
  };
  payment: {
    terms: string;
    method: string;
    dueDate: Date;
    currency: string;
  };
  timeline: {
    created: Date;
    submitted?: Date;
    approved?: Date;
    confirmed?: Date;
    shipped?: Date;
    delivered?: Date;
    received?: Date;
  };
  documents: Array<{
    type: 'quotation' | 'purchase_order' | 'invoice' | 'delivery_note' | 'receipt';
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Movement
export interface InventoryMovement {
  id: string;
  type: 'purchase' | 'sale' | 'transfer' | 'adjustment' | 'return' | 'damage';
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  referenceId?: string; // PO ID, Sale ID, etc.
  referenceType?: string;
  reason: string;
  performedBy: string;
  performedAt: Date;
  cost?: number;
  batchNumber?: string;
  expiryDate?: Date;
}

// Shipment Tracking
export interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  status: 'preparing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  origin: {
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  destination: {
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  timeline: Array<{
    status: string;
    location: string;
    timestamp: Date;
    description: string;
  }>;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cost: number;
  insurance: boolean;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Quality Inspection
export interface QualityInspection {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  inspectedQuantity: number;
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'conditional_acceptance';
  criteria: Array<{
    name: string;
    specification: string;
    result: 'pass' | 'fail' | 'na';
    measurement?: number;
    unit?: string;
    tolerance?: { min: number; max: number };
    notes?: string;
  }>;
  overallResult: {
    passed: number;
    failed: number;
    percentage: number;
  };
  inspector: string;
  inspectedAt: Date;
  actions: Array<{
    type: 'accept' | 'reject' | 'rework' | 'return';
    description: string;
    quantity: number;
    performedBy: string;
    performedAt: Date;
  }>;
  photos: Array<{
    url: string;
    description: string;
    takenAt: Date;
  }>;
  notes?: string;
  createdAt: Date;
}

// Supply Chain Configuration
export interface SupplyChainConfig {
  defaultLeadTime: number; // days
  safetyStockPercentage: number;
  reorderPointFormula: string;
  approvalThreshold: number; // amount requiring approval
  qualityInspectionRequired: boolean;
  autoReorderEnabled: boolean;
  preferredSuppliers: string[];
  defaultPaymentTerms: string;
  defaultCurrency: string;
  warehouses: Array<{
    id: string;
    name: string;
    location: string;
    capacity: number;
    manager: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    parent?: string;
  }>;
  notifications: {
    lowStock: boolean;
    delayedDelivery: boolean;
    qualityIssues: boolean;
    priceChanges: boolean;
    supplierUpdates: boolean;
  };
}

// Professional Supply Chain Manager
export class ProfessionalSupplyChainManager {
  private static instance: ProfessionalSupplyChainManager;
  private config: SupplyChainConfig;
  private suppliers: Map<string, Supplier> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private inventoryMovements: Map<string, InventoryMovement> = new Map();
  private shipments: Map<string, Shipment> = new Map();
  private qualityInspections: Map<string, QualityInspection> = new Map();

  constructor(config: SupplyChainConfig) {
    this.config = config;
    this.initializeData();
  }

  static getInstance(config?: SupplyChainConfig): ProfessionalSupplyChainManager {
    if (!ProfessionalSupplyChainManager.instance) {
      if (!config) {
        throw new Error('Supply Chain config required for first initialization');
      }
      ProfessionalSupplyChainManager.instance = new ProfessionalSupplyChainManager(config);
    }
    return ProfessionalSupplyChainManager.instance;
  }

  // Initialize sample data
  private initializeData(): void {
    // Sample suppliers
    const sampleSuppliers: Supplier[] = [
      {
        id: 'supplier_1',
        name: 'Plastic Raw Materials Ltd',
        code: 'PRM001',
        status: SupplierStatus.ACTIVE,
        contact: {
          email: 'info@prmltd.com',
          phone: '+998712345678',
          address: 'Industrial Zone, Tashkent',
          city: 'Tashkent',
          country: 'Uzbekistan',
          website: 'www.prmltd.com',
        },
        categories: ['raw_materials', 'plastic_resin'],
        products: [
          {
            id: 'product_1',
            name: 'PET Resin',
            sku: 'PET-001',
            unit: 'kg',
            price: 2500,
            leadTime: 7,
            minOrderQuantity: 1000,
          },
          {
            id: 'product_2',
            name: 'HDPE Resin',
            sku: 'HDPE-001',
            unit: 'kg',
            price: 2200,
            leadTime: 10,
            minOrderQuantity: 500,
          },
        ],
        performance: {
          onTimeDelivery: 92,
          qualityScore: 8.5,
          responseTime: 4,
          orderAccuracy: 95,
          totalOrders: 45,
          totalValue: 125000000,
        },
        contracts: [
          {
            id: 'contract_1',
            type: 'framework',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            terms: 'NET 30',
            conditions: ['Quality guarantee', 'On-time delivery'],
            value: 200000000,
          },
        ],
        certifications: [
          {
            name: 'ISO 9001',
            issuedBy: 'SGS',
            issuedDate: new Date('2023-06-01'),
            expiryDate: new Date('2026-06-01'),
            document: 'iso_9001_cert.pdf',
          },
        ],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'supplier_2',
        name: 'Packaging Solutions Inc',
        code: 'PSI002',
        status: SupplierStatus.ACTIVE,
        contact: {
          email: 'sales@packsolutions.com',
          phone: '+998901234567',
          address: 'Business Center, Tashkent',
          city: 'Tashkent',
          country: 'Uzbekistan',
        },
        categories: ['packaging', 'labels'],
        products: [
          {
            id: 'product_3',
            name: 'Preform Labels',
            sku: 'LBL-001',
            unit: 'pcs',
            price: 150,
            leadTime: 5,
            minOrderQuantity: 10000,
          },
        ],
        performance: {
          onTimeDelivery: 88,
          qualityScore: 7.8,
          responseTime: 6,
          orderAccuracy: 92,
          totalOrders: 28,
          totalValue: 45000000,
        },
        contracts: [],
        certifications: [],
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2024-02-01'),
      },
    ];

    sampleSuppliers.forEach(supplier => {
      this.suppliers.set(supplier.id, supplier);
    });
  }

  // Supplier Management
  createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
    const newSupplier: Supplier = {
      ...supplier,
      id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.suppliers.set(newSupplier.id, newSupplier);
    console.log(`Supplier created: ${newSupplier.name}`);
    return newSupplier;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier {
    const supplier = this.suppliers.get(id);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const updatedSupplier = {
      ...supplier,
      ...updates,
      updatedAt: new Date(),
    };

    this.suppliers.set(id, updatedSupplier);
    console.log(`Supplier updated: ${updatedSupplier.name}`);
    return updatedSupplier;
  }

  getSuppliers(status?: SupplierStatus): Supplier[] {
    const suppliers = Array.from(this.suppliers.values());
    return status ? suppliers.filter(s => s.status === status) : suppliers;
  }

  getSupplier(id: string): Supplier | undefined {
    return this.suppliers.get(id);
  }

  // Purchase Order Management
  createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): PurchaseOrder {
    const orderNumber = `PO-${Date.now()}`;
    const newOrder: PurchaseOrder = {
      ...order,
      id: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.purchaseOrders.set(newOrder.id, newOrder);
    console.log(`Purchase order created: ${orderNumber}`);
    return newOrder;
  }

  updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): PurchaseOrder {
    const order = this.purchaseOrders.get(id);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    const updatedOrder = {
      ...order,
      ...updates,
      updatedAt: new Date(),
    };

    this.purchaseOrders.set(id, updatedOrder);
    console.log(`Purchase order updated: ${updatedOrder.orderNumber}`);
    return updatedOrder;
  }

  approvePurchaseOrder(id: string, approvedBy: string): PurchaseOrder {
    const order = this.purchaseOrders.get(id);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (order.status !== OrderStatus.PENDING_APPROVAL) {
      throw new Error('Order is not pending approval');
    }

    const approvedOrder = this.updatePurchaseOrder(id, {
      status: OrderStatus.APPROVED,
      approvedBy,
      timeline: {
        ...order.timeline,
        approved: new Date(),
      },
    });

    console.log(`Purchase order approved: ${approvedOrder.orderNumber} by ${approvedBy}`);
    return approvedOrder;
  }

  getPurchaseOrders(status?: OrderStatus): PurchaseOrder[] {
    const orders = Array.from(this.purchaseOrders.values());
    return status ? orders.filter(o => o.status === status) : orders;
  }

  getPurchaseOrder(id: string): PurchaseOrder | undefined {
    return this.purchaseOrders.get(id);
  }

  // Inventory Movement
  recordInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'performedAt'>): InventoryMovement {
    const newMovement: InventoryMovement = {
      ...movement,
      id: `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performedAt: new Date(),
    };

    this.inventoryMovements.set(newMovement.id, newMovement);
    console.log(`Inventory movement recorded: ${newMovement.type} - ${newMovement.productName}`);
    return newMovement;
  }

  getInventoryMovements(productId?: string, type?: string): InventoryMovement[] {
    const movements = Array.from(this.inventoryMovements.values());
    return movements.filter(m => {
      if (productId && m.productId !== productId) return false;
      if (type && m.type !== type) return false;
      return true;
    });
  }

  // Shipment Management
  createShipment(shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Shipment {
    const newShipment: Shipment = {
      ...shipment,
      id: `shipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.shipments.set(newShipment.id, newShipment);
    console.log(`Shipment created: ${newShipment.trackingNumber}`);
    return newShipment;
  }

  updateShipmentStatus(id: string, status: Shipment['status'], location?: string, description?: string): Shipment {
    const shipment = this.shipments.get(id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const updatedShipment = {
      ...shipment,
      status,
      timeline: [
        ...shipment.timeline,
        {
          status,
          location: location || 'Unknown',
          timestamp: new Date(),
          description: description || `Status updated to ${status}`,
        },
      ],
      updatedAt: new Date(),
    };

    if (status === 'delivered') {
      updatedShipment.actualDelivery = new Date();
    }

    this.shipments.set(id, updatedShipment);
    console.log(`Shipment status updated: ${updatedShipment.trackingNumber} - ${status}`);
    return updatedShipment;
  }

  getShipments(status?: Shipment['status']): Shipment[] {
    const shipments = Array.from(this.shipments.values());
    return status ? shipments.filter(s => s.status === status) : shipments;
  }

  // Quality Inspection
  createQualityInspection(inspection: Omit<QualityInspection, 'id' | 'createdAt'>): QualityInspection {
    const newInspection: QualityInspection = {
      ...inspection,
      id: `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.qualityInspections.set(newInspection.id, newInspection);
    console.log(`Quality inspection created: ${newInspection.productName}`);
    return newInspection;
  }

  updateQualityInspection(id: string, updates: Partial<QualityInspection>): QualityInspection {
    const inspection = this.qualityInspections.get(id);
    if (!inspection) {
      throw new Error('Quality inspection not found');
    }

    const updatedInspection = {
      ...inspection,
      ...updates,
    };

    this.qualityInspections.set(id, updatedInspection);
    console.log(`Quality inspection updated: ${updatedInspection.productName}`);
    return updatedInspection;
  }

  getQualityInspections(status?: QualityInspection['status']): QualityInspection[] {
    const inspections = Array.from(this.qualityInspections.values());
    return status ? inspections.filter(i => i.status === status) : inspections;
  }

  // Analytics and Reporting
  getSupplierPerformance(): Array<{
    supplier: Supplier;
    metrics: {
      totalOrders: number;
      totalValue: number;
      averageOrderValue: number;
      onTimeDeliveryRate: number;
      qualityScore: number;
      responseTime: number;
    };
  }> {
    const suppliers = this.getSuppliers(SupplierStatus.ACTIVE);
    
    return suppliers.map(supplier => ({
      supplier,
      metrics: {
        totalOrders: supplier.performance.totalOrders,
        totalValue: supplier.performance.totalValue,
        averageOrderValue: supplier.performance.totalValue / supplier.performance.totalOrders,
        onTimeDeliveryRate: supplier.performance.onTimeDelivery,
        qualityScore: supplier.performance.qualityScore,
        responseTime: supplier.performance.responseTime,
      },
    })).sort((a, b) => b.metrics.totalValue - a.metrics.totalValue);
  }

  getOrderStatistics(startDate?: Date, endDate?: Date): {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByPriority: Record<Priority, number>;
    topSuppliers: Array<{
      supplierId: string;
      supplierName: string;
      orderCount: number;
      totalValue: number;
    }>;
  } {
    let orders = Array.from(this.purchaseOrders.values());

    if (startDate || endDate) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        return true;
      });
    }

    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, order) => sum + order.totals.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    const ordersByPriority = orders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    const supplierStats = new Map<string, { orderCount: number; totalValue: number }>();
    orders.forEach(order => {
      const existing = supplierStats.get(order.supplierId) || { orderCount: 0, totalValue: 0 };
      supplierStats.set(order.supplierId, {
        orderCount: existing.orderCount + 1,
        totalValue: existing.totalValue + order.totals.total,
      });
    });

    const topSuppliers = Array.from(supplierStats.entries())
      .map(([supplierId, stats]) => ({
        supplierId,
        supplierName: orders.find(o => o.supplierId === supplierId)?.supplierName || 'Unknown',
        orderCount: stats.orderCount,
        totalValue: stats.totalValue,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    return {
      totalOrders,
      totalValue,
      averageOrderValue,
      ordersByStatus,
      ordersByPriority,
      topSuppliers,
    };
  }

  getInventoryAnalytics(): {
    totalMovements: number;
    movementsByType: Record<string, number>;
    topProducts: Array<{
      productId: string;
      productName: string;
      movementCount: number;
      totalQuantity: number;
    }>;
    recentMovements: InventoryMovement[];
  } {
    const movements = Array.from(this.inventoryMovements.values());
    const totalMovements = movements.length;

    const movementsByType = movements.reduce((acc, movement) => {
      acc[movement.type] = (acc[movement.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const productStats = new Map<string, { movementCount: number; totalQuantity: number; name: string }>();
    movements.forEach(movement => {
      const existing = productStats.get(movement.productId) || { movementCount: 0, totalQuantity: 0, name: movement.productName };
      productStats.set(movement.productId, {
        movementCount: existing.movementCount + 1,
        totalQuantity: existing.totalQuantity + Math.abs(movement.quantity),
        name: movement.productName,
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        movementCount: stats.movementCount,
        totalQuantity: stats.totalQuantity,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    const recentMovements = movements
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
      .slice(0, 10);

    return {
      totalMovements,
      movementsByType,
      topProducts,
      recentMovements,
    };
  }

  // Test supply chain system
  async testSupplyChain(): Promise<{
    suppliers: boolean;
    purchaseOrders: boolean;
    inventoryMovements: boolean;
    shipments: boolean;
    qualityInspections: boolean;
  }> {
    console.log('Testing Supply Chain system...');
    
    const results = {
      suppliers: false,
      purchaseOrders: false,
      inventoryMovements: false,
      shipments: false,
      qualityInspections: false,
    };

    try {
      // Test suppliers
      const suppliers = this.getSuppliers();
      results.suppliers = suppliers.length > 0;

      // Test purchase orders
      const order = this.createPurchaseOrder({
        status: OrderStatus.DRAFT,
        priority: Priority.MEDIUM,
        supplierId: 'supplier_1',
        supplierName: 'Test Supplier',
        requestedBy: 'Test User',
        items: [
          {
            productId: 'product_1',
            productName: 'Test Product',
            sku: 'TEST-001',
            quantity: 100,
            unitPrice: 1000,
            totalPrice: 100000,
            expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            warehouse: 'main',
          },
        ],
        totals: {
          subtotal: 100000,
          tax: 12000,
          shipping: 5000,
          discount: 0,
          total: 117000,
        },
        delivery: {
          address: 'Test Address',
          city: 'Test City',
          country: 'Test Country',
          expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        payment: {
          terms: 'NET 30',
          method: 'Bank Transfer',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          currency: 'UZS',
        },
        timeline: {
          created: new Date(),
        },
        documents: [],
      });
      results.purchaseOrders = order.id !== undefined;

      // Test inventory movements
      const movement = this.recordInventoryMovement({
        type: 'purchase',
        productId: 'product_1',
        productName: 'Test Product',
        sku: 'TEST-001',
        quantity: 100,
        referenceId: order.id,
        referenceType: 'purchase_order',
        reason: 'Purchase receipt',
        performedBy: 'Test User',
        cost: 1000,
      });
      results.inventoryMovements = movement.id !== undefined;

      // Test shipments
      const shipment = this.createShipment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        carrier: 'Test Carrier',
        trackingNumber: 'TRACK123',
        status: 'preparing',
        origin: {
          address: 'Origin Address',
          city: 'Origin City',
          country: 'Origin Country',
        },
        destination: {
          address: 'Destination Address',
          city: 'Destination City',
          country: 'Destination Country',
        },
        timeline: [],
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        weight: 100,
        dimensions: {
          length: 50,
          width: 30,
          height: 20,
        },
        cost: 5000,
        insurance: false,
      });
      results.shipments = shipment.id !== undefined;

      // Test quality inspections
      const inspection = this.createQualityInspection({
        orderId: order.id,
        productId: 'product_1',
        productName: 'Test Product',
        batchNumber: 'BATCH001',
        quantity: 100,
        inspectedQuantity: 100,
        status: 'passed',
        criteria: [
          {
            name: 'Visual Inspection',
            specification: 'No defects',
            result: 'pass',
          },
        ],
        overallResult: {
          passed: 1,
          failed: 0,
          percentage: 100,
        },
        inspector: 'Test Inspector',
        inspectedAt: new Date(),
        actions: [],
        photos: [],
      });
      results.qualityInspections = inspection.id !== undefined;

    } catch (error) {
      console.error('Supply Chain test failed:', error);
    }

    return results;
  }
}

// Create singleton instance
export const supplyChain = ProfessionalSupplyChainManager.getInstance;

// Convenience functions
export const createSupplier = (supplier: any) => {
  const sc = ProfessionalSupplyChainManager.getInstance();
  return sc.createSupplier(supplier);
};

export const createPurchaseOrder = (order: any) => {
  const sc = ProfessionalSupplyChainManager.getInstance();
  return sc.createPurchaseOrder(order);
};

export const recordInventoryMovement = (movement: any) => {
  const sc = ProfessionalSupplyChainManager.getInstance();
  return sc.recordInventoryMovement(movement);
};

export default ProfessionalSupplyChainManager;

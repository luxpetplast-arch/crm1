// Professional Query Builder and ORM

// Query Types
export enum QueryType {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CREATE = 'CREATE',
  DROP = 'DROP',
  ALTER = 'ALTER',
}

// Operators
export enum Operator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  LIKE = 'LIKE',
  ILIKE = 'ILIKE',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  BETWEEN = 'BETWEEN',
  EXISTS = 'EXISTS',
  NOT_EXISTS = 'NOT EXISTS',
}

// Join Types
export enum JoinType {
  INNER = 'INNER JOIN',
  LEFT = 'LEFT JOIN',
  RIGHT = 'RIGHT JOIN',
  FULL = 'FULL OUTER JOIN',
  CROSS = 'CROSS JOIN',
}

// Order Direction
export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Where Condition Interface
export interface WhereCondition {
  column: string;
  operator: Operator;
  value?: any;
  values?: any[];
  subquery?: QueryBuilder;
}

// Join Interface
export interface Join {
  type: JoinType;
  table: string;
  on: string;
  alias?: string;
}

// Order By Interface
export interface OrderBy {
  column: string;
  direction: OrderDirection;
}

// Query Builder Class
export class QueryBuilder {
  private queryType: QueryType;
  private table: string;
  private alias?: string;
  private columns: string[] = [];
  private values: any[] = [];
  private whereConditions: WhereCondition[] = [];
  private joins: Join[] = [];
  private groupBy: string[] = [];
  private having: WhereCondition[] = [];
  private orderBy: OrderBy[] = [];
  private limit?: number;
  private offset?: number;
  private distinct = false;

  constructor(queryType: QueryType, table?: string) {
    this.queryType = queryType;
    if (table) {
      this.table = table;
    }
  }

  // Static factory methods
  static select(table: string, columns: string[] = ['*']): QueryBuilder {
    const qb = new QueryBuilder(QueryType.SELECT, table);
    qb.columns = columns;
    return qb;
  }

  static insert(table: string): QueryBuilder {
    return new QueryBuilder(QueryType.INSERT, table);
  }

  static update(table: string): QueryBuilder {
    return new QueryBuilder(QueryType.UPDATE, table);
  }

  static delete(table: string): QueryBuilder {
    return new QueryBuilder(QueryType.DELETE, table);
  }

  // Table and alias
  from(table: string, alias?: string): QueryBuilder {
    this.table = table;
    this.alias = alias;
    return this;
  }

  // Columns
  select(columns: string[]): QueryBuilder {
    this.columns = columns;
    return this;
  }

  addColumn(column: string): QueryBuilder {
    this.columns.push(column);
    return this;
  }

  // Distinct
  distinct(): QueryBuilder {
    this.distinct = true;
    return this;
  }

  // Where conditions
  where(column: string, operator: Operator, value?: any): QueryBuilder {
    this.whereConditions.push({ column, operator, value });
    return this;
  }

  whereIn(column: string, values: any[]): QueryBuilder {
    this.whereConditions.push({ column, operator: Operator.IN, values });
    return this;
  }

  whereNotIn(column: string, values: any[]): QueryBuilder {
    this.whereConditions.push({ column, operator: Operator.NOT_IN, values });
    return this;
  }

  whereNull(column: string): QueryBuilder {
    this.whereConditions.push({ column, operator: Operator.IS_NULL });
    return this;
  }

  whereNotNull(column: string): QueryBuilder {
    this.whereConditions.push({ column, operator: Operator.IS_NOT_NULL });
    return this;
  }

  whereBetween(column: string, start: any, end: any): QueryBuilder {
    this.whereConditions.push({ column, operator: Operator.BETWEEN, values: [start, end] });
    return this;
  }

  whereExists(subquery: QueryBuilder): QueryBuilder {
    this.whereConditions.push({ column: '', operator: Operator.EXISTS, subquery });
    return this;
  }

  whereNotExists(subquery: QueryBuilder): QueryBuilder {
    this.whereConditions.push({ column: '', operator: Operator.NOT_EXISTS, subquery });
    return this;
  }

  // AND and OR conditions
  andWhere(column: string, operator: Operator, value?: any): QueryBuilder {
    return this.where(column, operator, value);
  }

  orWhere(column: string, operator: Operator, value?: any): QueryBuilder {
    // For simplicity, we'll add it as a regular where condition
    // In a real implementation, you'd need to handle OR logic separately
    return this.where(column, operator, value);
  }

  // Joins
  join(type: JoinType, table: string, on: string, alias?: string): QueryBuilder {
    this.joins.push({ type, table, on, alias });
    return this;
  }

  innerJoin(table: string, on: string, alias?: string): QueryBuilder {
    return this.join(JoinType.INNER, table, on, alias);
  }

  leftJoin(table: string, on: string, alias?: string): QueryBuilder {
    return this.join(JoinType.LEFT, table, on, alias);
  }

  rightJoin(table: string, on: string, alias?: string): QueryBuilder {
    return this.join(JoinType.RIGHT, table, on, alias);
  }

  fullJoin(table: string, on: string, alias?: string): QueryBuilder {
    return this.join(JoinType.FULL, table, on, alias);
  }

  // Group by
  groupBy(columns: string[]): QueryBuilder {
    this.groupBy = columns;
    return this;
  }

  addGroupBy(column: string): QueryBuilder {
    this.groupBy.push(column);
    return this;
  }

  // Having
  having(column: string, operator: Operator, value?: any): QueryBuilder {
    this.having.push({ column, operator, value });
    return this;
  }

  // Order by
  orderBy(column: string, direction: OrderDirection = OrderDirection.ASC): QueryBuilder {
    this.orderBy.push({ column, direction });
    return this;
  }

  orderByAsc(column: string): QueryBuilder {
    return this.orderBy(column, OrderDirection.ASC);
  }

  orderByDesc(column: string): QueryBuilder {
    return this.orderBy(column, OrderDirection.DESC);
  }

  // Limit and offset
  limit(count: number): QueryBuilder {
    this.limit = count;
    return this;
  }

  offset(count: number): QueryBuilder {
    this.offset = count;
    return this;
  }

  // Build SQL
  build(): { sql: string; values: any[] } {
    let sql = '';
    const values: any[] = [];

    switch (this.queryType) {
      case QueryType.SELECT:
        sql = this.buildSelect(values);
        break;
      case QueryType.INSERT:
        sql = this.buildInsert(values);
        break;
      case QueryType.UPDATE:
        sql = this.buildUpdate(values);
        break;
      case QueryType.DELETE:
        sql = this.buildDelete(values);
        break;
    }

    return { sql, values };
  }

  // Build SELECT query
  private buildSelect(values: any[]): string {
    let sql = 'SELECT';

    if (this.distinct) {
      sql += ' DISTINCT';
    }

    sql += ` ${this.columns.join(', ')}`;
    sql += ` FROM ${this.table}`;

    if (this.alias) {
      sql += ` AS ${this.alias}`;
    }

    // Add joins
    for (const join of this.joins) {
      sql += ` ${join.type} ${join.table}`;
      if (join.alias) {
        sql += ` AS ${join.alias}`;
      }
      sql += ` ON ${join.on}`;
    }

    // Add where conditions
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereConditions(this.whereConditions, values)}`;
    }

    // Add group by
    if (this.groupBy.length > 0) {
      sql += ` GROUP BY ${this.groupBy.join(', ')}`;
    }

    // Add having
    if (this.having.length > 0) {
      sql += ` HAVING ${this.buildWhereConditions(this.having, values)}`;
    }

    // Add order by
    if (this.orderBy.length > 0) {
      const orderClauses = this.orderBy.map(ob => `${ob.column} ${ob.direction}`);
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // Add limit and offset
    if (this.limit !== undefined) {
      sql += ` LIMIT ${this.limit}`;
    }

    if (this.offset !== undefined) {
      sql += ` OFFSET ${this.offset}`;
    }

    return sql;
  }

  // Build INSERT query
  private buildInsert(values: any[]): string {
    // This is a simplified version - in reality you'd need to handle data mapping
    let sql = `INSERT INTO ${this.table}`;
    
    if (this.columns.length > 0) {
      sql += ` (${this.columns.join(', ')})`;
      sql += ` VALUES (${this.columns.map(() => '?').join(', ')})`;
      values.push(...this.values);
    } else {
      sql += ' DEFAULT VALUES';
    }

    return sql;
  }

  // Build UPDATE query
  private buildUpdate(values: any[]): string {
    let sql = `UPDATE ${this.table}`;
    
    if (this.columns.length > 0) {
      const setClauses = this.columns.map(col => `${col} = ?`);
      sql += ` SET ${setClauses.join(', ')}`;
      values.push(...this.values);
    }

    // Add where conditions
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereConditions(this.whereConditions, values)}`;
    }

    return sql;
  }

  // Build DELETE query
  private buildDelete(values: any[]): string {
    let sql = `DELETE FROM ${this.table}`;

    // Add where conditions
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereConditions(this.whereConditions, values)}`;
    }

    return sql;
  }

  // Build where conditions
  private buildWhereConditions(conditions: WhereCondition[], values: any[]): string {
    const conditionClauses: string[] = [];

    for (const condition of conditions) {
      let clause = '';

      if (condition.subquery) {
        const subquery = condition.subquery.build();
        clause = `${condition.operator} (${subquery.sql})`;
        values.push(...subquery.values);
      } else if (condition.operator === Operator.IN || condition.operator === Operator.NOT_IN) {
        const placeholders = condition.values?.map(() => '?').join(', ') || '';
        clause = `${condition.column} ${condition.operator} (${placeholders})`;
        if (condition.values) {
          values.push(...condition.values);
        }
      } else if (condition.operator === Operator.BETWEEN) {
        clause = `${condition.column} ${condition.operator} ? AND ?`;
        if (condition.values) {
          values.push(...condition.values);
        }
      } else if (condition.operator === Operator.IS_NULL || condition.operator === Operator.IS_NOT_NULL) {
        clause = `${condition.column} ${condition.operator}`;
      } else {
        clause = `${condition.column} ${condition.operator} ?`;
        if (condition.value !== undefined) {
          values.push(condition.value);
        }
      }

      conditionClauses.push(clause);
    }

    return conditionClauses.join(' AND ');
  }

  // Clone query builder
  clone(): QueryBuilder {
    const clone = new QueryBuilder(this.queryType, this.table);
    clone.alias = this.alias;
    clone.columns = [...this.columns];
    clone.values = [...this.values];
    clone.whereConditions = [...this.whereConditions];
    clone.joins = [...this.joins];
    clone.groupBy = [...this.groupBy];
    clone.having = [...this.having];
    clone.orderBy = [...this.orderBy];
    clone.limit = this.limit;
    clone.offset = this.offset;
    clone.distinct = this.distinct;
    return clone;
  }
}

// ORM Model Base Class
export abstract class Model {
  protected tableName: string;
  protected primaryKey = 'id';
  protected timestamps = true;
  protected fillable: string[] = [];
  protected hidden: string[] = [];
  protected casts: Record<string, string> = {};

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Find by ID
  static async findById<T extends Model>(
    this: new () => T,
    id: string | number
  ): Promise<T | null> {
    const instance = new this();
    const query = QueryBuilder.select(instance.tableName)
      .where(instance.primaryKey, Operator.EQUALS, id)
      .limit(1);

    const result = await executeQuery(query.build());
    return result.success && result.data.length > 0 ? instance.mapFromDb(result.data[0]) : null;
  }

  // Find all
  static async findAll<T extends Model>(
    this: new () => T,
    options?: {
      where?: Record<string, any>;
      orderBy?: string;
      orderDirection?: OrderDirection;
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    const instance = new this();
    let query = QueryBuilder.select(instance.tableName);

    // Add where conditions
    if (options?.where) {
      Object.entries(options.where).forEach(([column, value]) => {
        query = query.where(column, Operator.EQUALS, value);
      });
    }

    // Add order by
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || OrderDirection.ASC);
    }

    // Add limit and offset
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const result = await executeQuery(query.build());
    return result.success ? result.data.map((item: any) => instance.mapFromDb(item)) : [];
  }

  // Create new record
  static async create<T extends Model>(
    this: new () => T,
    data: Record<string, any>
  ): Promise<T> {
    const instance = new this();
    const filteredData = instance.filterFillable(data);
    
    // Add timestamps if enabled
    if (instance.timestamps) {
      filteredData.created_at = new Date();
      filteredData.updated_at = new Date();
    }

    const columns = Object.keys(filteredData);
    const values = Object.values(filteredData);

    const query = QueryBuilder.insert(instance.tableName)
      .select(columns);
    
    // Set values (this is simplified - in reality you'd need to handle this properly)
    (query as any).values = values;

    const result = await executeQuery(query.build());
    
    if (result.success) {
      // Return the created record
      const createdQuery = QueryBuilder.select(instance.tableName)
        .where(instance.primaryKey, Operator.EQUALS, result.data.id)
        .limit(1);
      
      const createdResult = await executeQuery(createdQuery.build());
      return createdResult.success && createdResult.data.length > 0 
        ? instance.mapFromDb(createdResult.data[0]) 
        : instance;
    }

    throw new Error('Failed to create record');
  }

  // Update record
  async update(data: Record<string, any>): Promise<this> {
    const filteredData = this.filterFillable(data);
    
    // Add updated timestamp if enabled
    if (this.timestamps) {
      filteredData.updated_at = new Date();
    }

    const columns = Object.keys(filteredData);
    const values = Object.values(filteredData);

    const query = QueryBuilder.update(this.tableName)
      .select(columns)
      .where(this.primaryKey, Operator.EQUALS, (this as any)[this.primaryKey]);
    
    // Set values (this is simplified)
    (query as any).values = values;

    const result = await executeQuery(query.build());
    
    if (result.success) {
      // Update the instance with new data
      Object.assign(this, filteredData);
      return this;
    }

    throw new Error('Failed to update record');
  }

  // Delete record
  async delete(): Promise<boolean> {
    const query = QueryBuilder.delete(this.tableName)
      .where(this.primaryKey, Operator.EQUALS, (this as any)[this.primaryKey]);

    const result = await executeQuery(query.build());
    return result.success;
  }

  // Filter fillable fields
  private filterFillable(data: Record<string, any>): Record<string, any> {
    const filtered: Record<string, any> = {};

    for (const field of this.fillable) {
      if (data[field] !== undefined) {
        filtered[field] = data[field];
      }
    }

    return filtered;
  }

  // Map from database
  protected mapFromDb(data: any): this {
    const instance = this as any;
    
    for (const [key, value] of Object.entries(data)) {
      if (!this.hidden.includes(key)) {
        // Apply type casting if defined
        if (this.casts[key]) {
          instance[key] = this.castValue(value, this.casts[key]);
        } else {
          instance[key] = value;
        }
      }
    }

    return instance;
  }

  // Cast value to type
  private castValue(value: any, type: string): any {
    switch (type) {
      case 'int':
      case 'integer':
        return parseInt(value, 10);
      case 'float':
      case 'double':
      case 'decimal':
        return parseFloat(value);
      case 'boolean':
      case 'bool':
        return Boolean(value);
      case 'date':
      case 'datetime':
        return new Date(value);
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return value;
    }
  }

  // Get table name
  getTableName(): string {
    return this.tableName;
  }
}

// Execute query function (would be implemented with actual database connection)
async function executeQuery(query: { sql: string; values: any[] }): Promise<{
  success: boolean;
  data: any[];
  error?: string;
}> {
  try {
    // Simulate query execution
    console.log('Executing query:', query.sql);
    console.log('With values:', query.values);
    
    // Return mock data for now
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Example Models
export class User extends Model {
  protected tableName = 'users';
  protected fillable = ['name', 'email', 'password'];
  protected hidden = ['password'];
  protected casts = {
    created_at: 'datetime',
    updated_at: 'datetime',
  };

  id!: string;
  name!: string;
  email!: string;
  password!: string;
  created_at!: Date;
  updated_at!: Date;
}

export class Sale extends Model {
  protected tableName = 'sales';
  protected fillable = ['customer_id', 'total_amount', 'currency', 'status', 'items'];
  protected casts = {
    total_amount: 'decimal',
    created_at: 'datetime',
    updated_at: 'datetime',
  };

  id!: string;
  customer_id!: string;
  total_amount!: number;
  currency!: string;
  status!: string;
  items!: any[];
  created_at!: Date;
  updated_at!: Date;
}

export class Product extends Model {
  protected tableName = 'products';
  protected fillable = ['name', 'price_per_bag', 'units_per_bag', 'warehouse'];
  protected casts = {
    price_per_bag: 'decimal',
    units_per_bag: 'int',
    created_at: 'datetime',
    updated_at: 'datetime',
  };

  id!: string;
  name!: string;
  price_per_bag!: number;
  units_per_bag!: number;
  warehouse!: string;
  created_at!: Date;
  updated_at!: Date;
}

export class Customer extends Model {
  protected tableName = 'customers';
  protected fillable = ['name', 'phone', 'address', 'debt_uzs', 'debt_usd'];
  protected casts = {
    debt_uzs: 'decimal',
    debt_usd: 'decimal',
    created_at: 'datetime',
    updated_at: 'datetime',
  };

  id!: string;
  name!: string;
  phone!: string;
  address!: string;
  debt_uzs!: number;
  debt_usd!: number;
  created_at!: Date;
  updated_at!: Date;
}

// Export convenience functions
export const qb = QueryBuilder;

export default {
  QueryBuilder,
  Model,
  User,
  Sale,
  Product,
  Customer,
};

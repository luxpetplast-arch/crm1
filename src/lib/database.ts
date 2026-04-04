import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import api from './api';

// Platform detection
const isNative = Capacitor.isNativePlatform();
const isMobile = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';
const isDesktop = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;
const isWeb = !isNative && !isDesktop;

// Device ID
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || `device_${Date.now()}`;
const DEVICE_NAME = import.meta.env.VITE_DEVICE_NAME || 'Unknown Device';

// SQLite instance for mobile
let sqliteConnection: SQLiteConnection | null = null;
let dbConnection: SQLiteDBConnection | null = null;

// Initialize database
export async function initDatabase(): Promise<void> {
  if (isMobile) {
    // Mobile - Capacitor SQLite
    sqliteConnection = new SQLiteConnection();
    const ret = await sqliteConnection.checkConnectionsConsistency();
    const isConn = (await ret).result;
    
    if (!isConn) {
      dbConnection = await sqliteConnection.createConnection(
        'zavod_db',
        false,
        'no-encryption',
        1,
        false
      );
      await dbConnection.open();
      
      // Create tables
      await createMobileTables();
    }
  } else if (isDesktop) {
    // Desktop - Use existing Prisma/Express API
    console.log('Desktop: Using local Express API');
  } else {
    // Web - Use IndexedDB or localStorage
    console.log('Web: Using browser storage');
  }
  
  // Save device info
  await Preferences.set({
    key: 'device_info',
    value: JSON.stringify({ id: DEVICE_ID, name: DEVICE_NAME })
  });
}

// Create tables for mobile
async function createMobileTables(): Promise<void> {
  if (!dbConnection) return;
  
  // Products table
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      device_id TEXT
    )
  `);
  
  // Sales table
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      customer_name TEXT,
      total_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'UZS',
      payment_status TEXT DEFAULT 'UNPAID',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      device_id TEXT
    )
  `);
  
  // Sale items table
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT,
      product_id TEXT,
      product_name TEXT,
      quantity INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    )
  `);
  
  // Customers table
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      device_id TEXT
    )
  `);
  
  // Sync queue table
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      action TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      retry_count INTEGER DEFAULT 0
    )
  `);
  
  // Settings table
  await dbConnection.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Generic query function
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  if (isMobile && dbConnection) {
    const result = await dbConnection.query(sql, params);
    return result.values || [];
  } else if (isDesktop || isWeb) {
    // Use API for desktop/web
    const { data } = await api.post('/api/query', { sql, params });
    return data;
  }
  return [];
}

// Generic execute function
export async function execute(sql: string, params?: any[]): Promise<void> {
  if (isMobile && dbConnection) {
    await dbConnection.execute(sql, params);
  } else if (isDesktop || isWeb) {
    await api.post('/api/execute', { sql, params });
  }
}

// CRUD Operations
export const database = {
  // Get all records from table
  async getAll<T>(table: string, options?: { orderBy?: string; limit?: number }): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    
    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    
    return query<T>(sql);
  },
  
  // Get single record by ID
  async getById<T>(table: string, id: string): Promise<T | null> {
    const results = await query<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return results[0] || null;
  },
  
  // Insert record
  async insert<T extends Record<string, any>>(table: string, data: T): Promise<T> {
    const id = data.id || `${DEVICE_ID}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      ...data,
      id,
      device_id: DEVICE_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    const keys = Object.keys(record);
    const placeholders = keys.map(() => '?').join(',');
    const values = Object.values(record);
    
    await execute(
      `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`,
      values
    );
    
    // Add to sync queue
    await addToSyncQueue(table, 'insert', record);
    
    return record as T;
  },
  
  // Update record
  async update<T extends Record<string, any>>(table: string, id: string, data: Partial<T>): Promise<T> {
    const record = {
      ...data,
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    const keys = Object.keys(record);
    const setClause = keys.map(k => `${k} = ?`).join(',');
    const values = [...Object.values(record), id];
    
    await execute(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      values
    );
    
    // Add to sync queue
    await addToSyncQueue(table, 'update', { id, ...record });
    
    return this.getById(table, id) as Promise<T>;
  },
  
  // Delete record
  async delete(table: string, id: string): Promise<void> {
    await execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
    
    // Add to sync queue
    await addToSyncQueue(table, 'delete', { id });
  },
  
  // Search records
  async search<T>(table: string, column: string, value: string): Promise<T[]> {
    return query<T>(`SELECT * FROM ${table} WHERE ${column} LIKE ?`, [`%${value}%`]);
  },
  
  // Get pending sync records
  async getPendingSync(table: string): Promise<any[]> {
    return query(`SELECT * FROM ${table} WHERE sync_status = 'pending'`);
  },
  
  // Mark as synced
  async markAsSynced(table: string, id: string): Promise<void> {
    await execute(
      `UPDATE ${table} SET sync_status = 'synced' WHERE id = ?`,
      [id]
    );
  },
  
  // Get sync queue
  async getSyncQueue(): Promise<any[]> {
    return query('SELECT * FROM sync_queue ORDER BY created_at ASC');
  },
  
  // Clear sync queue item
  async clearSyncQueueItem(id: number): Promise<void> {
    await execute('DELETE FROM sync_queue WHERE id = ?', [id]);
  }
};

// Add to sync queue
async function addToSyncQueue(table: string, action: string, data: any): Promise<void> {
  if (isMobile && dbConnection) {
    await dbConnection.execute(
      'INSERT INTO sync_queue (table_name, action, data) VALUES (?, ?, ?)',
      [table, action, JSON.stringify(data)]
    );
  }
  
  // Also save to Preferences for persistence
  const queue = await getOfflineQueue();
  queue.push({ table, action, data, timestamp: Date.now() });
  await Preferences.set({ key: 'sync_queue', value: JSON.stringify(queue) });
}

// Get offline queue from Preferences
export async function getOfflineQueue(): Promise<any[]> {
  const { value } = await Preferences.get({ key: 'sync_queue' });
  return value ? JSON.parse(value) : [];
}

// Clear offline queue
export async function clearOfflineQueue(): Promise<void> {
  await Preferences.set({ key: 'sync_queue', value: '[]' });
}

// Save to local cache (for web)
export async function saveToCache<T>(key: string, data: T): Promise<void> {
  await Preferences.set({ key: `cache_${key}`, value: JSON.stringify(data) });
}

// Get from local cache
export async function getFromCache<T>(key: string): Promise<T | null> {
  const { value } = await Preferences.get({ key: `cache_${key}` });
  return value ? JSON.parse(value) : null;
}

// Export functions
export { DEVICE_ID, DEVICE_NAME, isMobile, isDesktop, isWeb, isNative };
export default database;

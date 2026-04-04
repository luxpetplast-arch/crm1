import { supabase } from './supabase';
import database, { 
  getOfflineQueue, 
  clearOfflineQueue, 
  DEVICE_ID, 
  DEVICE_NAME,
  isMobile,
  initDatabase 
} from './database';

// Sync configuration - FAqat muhim jadvallar
const SYNC_TABLES = [
  'products',      // Mahsulotlar - muhim
  'customers',     // Mijozlar - muhim
  'sales',         // Sotuvlar - muhim
  'orders',        // Buyurtmalar - muhim
  // QUYIDAGILAR SYNC QILINMAYDI (localda turadi):
  // 'audit_logs',     // Katta hajmli
  // 'stock_movements', // Localda yetarli
  // 'notifications',   // Vaqtinchalik
];

const SYNC_INTERVAL = 60000; // 60 sekund (kamroq murojaat)
const BATCH_SIZE = 25; // Kichikroq batch (kamroq yozuv)

// Sync state
interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingCount: number;
}

let syncState: SyncState = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  pendingCount: 0
};

// Listeners
const listeners: ((state: SyncState) => void)[] = [];

// Subscribe to sync state changes
export function onSyncStateChange(callback: (state: SyncState) => void): () => void {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
}

// Notify listeners
function notifyListeners(): void {
  listeners.forEach(callback => callback({ ...syncState }));
}

// Check network status
export function checkOnlineStatus(): boolean {
  return navigator.onLine;
}

// Initialize sync
export async function initSync(): Promise<void> {
  // Initialize database
  await initDatabase();
  
  // Setup network listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial sync
  if (checkOnlineStatus()) {
    await syncWithCloud();
  }
  
  // Start periodic sync
  startPeriodicSync();
  
  // Setup realtime subscriptions
  setupRealtimeSubscriptions();
}

// Handle coming online
async function handleOnline(): Promise<void> {
  syncState.isOnline = true;
  notifyListeners();
  console.log('[Sync] Online - starting sync');
  await syncWithCloud();
}

// Handle going offline
function handleOffline(): void {
  syncState.isOnline = false;
  notifyListeners();
  console.log('[Sync] Offline - working in local mode');
}

// Start periodic sync
function startPeriodicSync(): void {
  setInterval(async () => {
    if (checkOnlineStatus() && !syncState.isSyncing) {
      await syncWithCloud();
    }
  }, SYNC_INTERVAL);
}

// Main sync function
export async function syncWithCloud(): Promise<boolean> {
  if (syncState.isSyncing || !checkOnlineStatus()) {
    return false;
  }
  
  syncState.isSyncing = true;
  notifyListeners();
  
  try {
    // Step 1: Upload local changes to cloud
    await uploadLocalChanges();
    
    // Step 2: Download cloud changes
    await downloadCloudChanges();
    
    // Step 3: Sync device status
    await updateDeviceStatus();
    
    syncState.lastSync = new Date().toISOString();
    syncState.pendingCount = 0;
    
    console.log('[Sync] Completed successfully');
    return true;
  } catch (error) {
    console.error('[Sync] Error:', error);
    return false;
  } finally {
    syncState.isSyncing = false;
    notifyListeners();
  }
}

// Upload local changes to Supabase (FAqat SYNC_TABLES dagilarni)
async function uploadLocalChanges(): Promise<void> {
  for (const table of SYNC_TABLES) {  // Faqat tanlangan jadvallar
    const pendingRecords = await database.getPendingSync(table);
    
    if (pendingRecords.length === 0) continue;
    
    console.log(`[Sync] Uploading ${pendingRecords.length} records from ${table}`);
    
    // Upload in batches
    for (let i = 0; i < pendingRecords.length; i += BATCH_SIZE) {
      const batch = pendingRecords.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from(table)
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`[Sync] Error uploading ${table}:`, error);
        continue;
      }
      
      // Mark as synced
      for (const record of batch) {
        await database.markAsSynced(table, record.id);
      }
    }
  }
  
  // Also check offline queue (for mobile)
  const offlineQueue = await getOfflineQueue();
  if (offlineQueue.length > 0) {
    console.log(`[Sync] Processing ${offlineQueue.length} offline queue items`);
    
    for (const item of offlineQueue) {
      const { error } = await supabase
        .from(item.table)
        .upsert(item.data);
      
      if (error) {
        console.error('[Sync] Error processing queue item:', error);
      }
    }
    
    await clearOfflineQueue();
  }
}

// Download cloud changes
async function downloadCloudChanges(): Promise<void> {
  const lastSync = syncState.lastSync || '1970-01-01T00:00:00Z';
  const tables = ['products', 'sales', 'customers', 'orders'];
  
  for (const table of tables) {
    // Get records updated since last sync from other devices
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .gt('updated_at', lastSync)
      .neq('device_id', DEVICE_ID);
    
    if (error) {
      console.error(`[Sync] Error downloading ${table}:`, error);
      continue;
    }
    
    if (!data || data.length === 0) continue;
    
    console.log(`[Sync] Downloading ${data.length} records to ${table}`);
    
    // Save to local database
    for (const record of data) {
      try {
        // Check if exists locally
        const existing = await database.getById(table, record.id);
        
        if (existing) {
          // Update
          await database.update(table, record.id, { 
            ...record, 
            sync_status: 'synced',
            updated_at: new Date().toISOString()
          });
        } else {
          // Insert
          await database.insert(table, { 
            ...record, 
            sync_status: 'synced' 
          });
        }
      } catch (err) {
        console.error(`[Sync] Error saving record ${record.id}:`, err);
      }
    }
  }
}

// Update device status in Supabase
async function updateDeviceStatus(): Promise<void> {
  const { error } = await supabase
    .from('device_status')
    .upsert({
      device_id: DEVICE_ID,
      device_name: DEVICE_NAME,
      last_sync: new Date().toISOString(),
      is_online: true,
      platform: isMobile ? 'mobile' : 'desktop'
    });
  
  if (error) {
    console.error('[Sync] Error updating device status:', error);
  }
}

// Setup realtime subscriptions
function setupRealtimeSubscriptions(): void {
  const tables = ['products', 'sales', 'customers', 'orders'];
  
  for (const table of tables) {
    supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        async (payload) => {
          console.log(`[Realtime] ${table} change:`, payload);
          
          // Don't process own changes
          if (payload.new?.device_id === DEVICE_ID) return;
          
          // Apply change to local database
          if (payload.eventType === 'INSERT') {
            try {
              await database.insert(table, { 
                ...payload.new, 
                sync_status: 'synced' 
              });
            } catch (err) {
              // May already exist
            }
          } else if (payload.eventType === 'UPDATE') {
            await database.update(table, payload.new.id, {
              ...payload.new,
              sync_status: 'synced'
            });
          } else if (payload.eventType === 'DELETE') {
            await database.delete(table, payload.old.id);
          }
        }
      )
      .subscribe();
  }
}

// Get sync status
export function getSyncStatus(): SyncState {
  return { ...syncState };
}

// Force sync
export async function forceSync(): Promise<boolean> {
  return syncWithCloud();
}

// Get pending count
export async function getPendingCount(): Promise<number> {
  const tables = ['products', 'sales', 'customers', 'orders'];
  let count = 0;
  
  for (const table of tables) {
    const pending = await database.getPendingSync(table);
    count += pending.length;
  }
  
  return count;
}

// Export sync functions
export default {
  initSync,
  syncWithCloud,
  forceSync,
  getSyncStatus,
  getPendingCount,
  onSyncStateChange,
  checkOnlineStatus
};

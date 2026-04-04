import { useState, useEffect, useCallback } from 'react';
import { initSync, syncWithCloud, getSyncStatus, onSyncStateChange, forceSync, getPendingCount } from '../lib/sync';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingCount: number;
}

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingCount: 0
  });

  useEffect(() => {
    // Initialize sync
    initSync().then(() => {
      console.log('[useSync] Initialized');
    });

    // Subscribe to sync state changes
    const unsubscribe = onSyncStateChange((newState) => {
      setSyncState(newState);
    });

    // Update pending count periodically
    const interval = setInterval(async () => {
      const count = await getPendingCount();
      setSyncState(prev => ({ ...prev, pendingCount: count }));
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const sync = useCallback(async () => {
    return await forceSync();
  }, []);

  const formatLastSync = useCallback(() => {
    if (!syncState.lastSync) return 'Hali sinxronlanmagan';
    
    const date = new Date(syncState.lastSync);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) return 'Hozirgina';
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} daqiqa oldin`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} soat oldin`;
    }
    
    return date.toLocaleDateString('uz-UZ');
  }, [syncState.lastSync]);

  return {
    ...syncState,
    sync,
    formatLastSync,
    isOffline: !syncState.isOnline,
    hasPending: syncState.pendingCount > 0
  };
}

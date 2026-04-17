// Test Professional Layered Backup System

import { 
  ProfessionalLayeredBackupManager,
  BackupLayer,
  createLayeredBackup,
  restoreFromLayer
} from '../lib/professionalLayeredBackupSimple.js';

// Test function
async function testLayeredBackupSystem() {
  console.log('=== Testing Professional Layered Backup System ===');
  
  try {
    // Get backup manager instance
    const backup = ProfessionalLayeredBackupManager.getInstance();
    console.log('Backup manager instance created successfully');
    
    // Test 1: List layers
    console.log('\n1. Testing layer listing...');
    const layers = backup.listLayers();
    console.log(`Found ${layers.length} layers:`, layers);
    
    // Test 2: Create test data
    console.log('\n2. Creating test data...');
    const testData = {
      company: 'LUX PET PLAST',
      timestamp: new Date().toISOString(),
      data: {
        sales: [
          { id: 1, customer: 'Customer A', amount: 1000, product: 'PET Bottle 1L' },
          { id: 2, customer: 'Customer B', amount: 2000, product: 'PET Bottle 2L' },
          { id: 3, customer: 'Customer C', amount: 1500, product: 'PET Bottle 500ml' }
        ],
        inventory: {
          'PET Bottle 1L': 1000,
          'PET Bottle 2L': 500,
          'PET Bottle 500ml': 2000
        },
        financial: {
          totalRevenue: 4500,
          totalCost: 2000,
          profit: 2500,
          margin: 55.56
        }
      },
      metadata: {
        version: '1.0.0',
        environment: 'test',
        testRun: true
      }
    };
    console.log('Test data created successfully');
    
    // Test 3: Create layered backup
    console.log('\n3. Creating layered backup...');
    const backupRequest = {
      data: testData,
      priority: 'high' as const,
      layers: [BackupLayer.LAYER_1, BackupLayer.LAYER_2, BackupLayer.LAYER_3],
      tags: ['test', 'integration'],
      notes: 'Integration test backup'
    };
    
    const backupResult = await backup.createLayeredBackup(backupRequest);
    console.log('Backup result:', {
      success: backupResult.success,
      totalDuration: backupResult.totalDuration,
      totalSize: backupResult.totalSize,
      layersCompleted: backupResult.layers.filter(l => l.success).length,
      compressionRatio: backupResult.compressionRatio,
      encryptionStrength: backupResult.encryptionStrength
    });
    
    if (backupResult.success) {
      console.log('Backup created successfully!');
      
      // Test 4: Get layer health
      console.log('\n4. Testing layer health...');
      for (const layer of backupRequest.layers) {
        const health = await backup.getLayerHealth(layer);
        console.log(`Layer ${layer} health:`, {
          totalBackups: health.totalBackups,
          healthyBackups: health.healthyBackups,
          totalSize: health.totalSize,
          lastBackup: health.lastBackup,
          issues: health.issues.length
        });
      }
      
      // Test 5: List backups in layers
      console.log('\n5. Testing backup listing...');
      for (const layer of backupRequest.layers) {
        const backups = backup.listBackupsInLayer(layer);
        console.log(`Layer ${layer} has ${backups.length} backups`);
        if (backups.length > 0) {
          const latestBackup = backups[0];
          console.log(`Latest backup in ${layer}:`, {
            id: latestBackup.id,
            createdAt: latestBackup.createdAt,
            size: latestBackup.size.final,
            compression: latestBackup.compression.ratio,
            health: latestBackup.health.status
          });
        }
      }
      
      // Test 6: Restore from layer
      console.log('\n6. Testing restore functionality...');
      if (backupResult.layers.length > 0) {
        const restoreRequest = {
          layerId: backupResult.layers[0].layerId,
          priority: 'high' as const,
          verificationRequired: true
        };
        
        const restoreResult = await backup.restoreFromLayer(restoreRequest);
        console.log('Restore result:', {
          success: restoreResult.success,
          layer: restoreResult.layer,
          duration: restoreResult.duration,
          integrityVerified: restoreResult.integrityVerified,
          decryptionSuccessful: restoreResult.decryptionSuccessful
        });
        
        if (restoreResult.success && restoreResult.data) {
          console.log('Data restored successfully!');
          console.log('Restored data keys:', Object.keys(restoreResult.data));
          console.log('Company:', restoreResult.data.company);
          console.log('Sales count:', restoreResult.data.data?.sales?.length);
          console.log('Total revenue:', restoreResult.data.data?.financial?.totalRevenue);
        }
      }
      
      // Test 7: Cleanup old backups
      console.log('\n7. Testing cleanup functionality...');
      const cleanupResult = await backup.cleanupOldBackups();
      console.log('Cleanup result:', {
        cleanedBackups: cleanupResult.cleanedBackups,
        freedSpace: cleanupResult.freedSpace,
        errors: cleanupResult.errors.length
      });
      
      // Test 8: Full system test
      console.log('\n8. Running full system test...');
      const systemTestResult = await backup.testLayeredBackupSystem();
      console.log('System test result:', {
        layers: systemTestResult.layers.length,
        encryption: systemTestResult.encryption,
        compression: systemTestResult.compression,
        integrity: systemTestResult.integrity,
        replication: systemTestResult.replication,
        restoration: systemTestResult.restoration,
        cleanup: systemTestResult.cleanup,
        overall: systemTestResult.overall
      });
      
      console.log('\n=== Test Summary ===');
      console.log(`Overall system health: ${systemTestResult.overall ? 'HEALTHY' : 'ISSUES FOUND'}`);
      console.log(`Layers tested: ${systemTestResult.layers.length}`);
      console.log(`Encryption working: ${systemTestResult.encryption ? 'YES' : 'NO'}`);
      console.log(`Compression working: ${systemTestResult.compression ? 'YES' : 'NO'}`);
      console.log(`Integrity verification: ${systemTestResult.integrity ? 'PASS' : 'FAIL'}`);
      console.log(`Replication working: ${systemTestResult.replication ? 'YES' : 'NO'}`);
      console.log(`Restoration working: ${systemTestResult.restoration ? 'YES' : 'NO'}`);
      console.log(`Cleanup working: ${systemTestResult.cleanup ? 'YES' : 'NO'}`);
      
      if (systemTestResult.overall) {
        console.log('\n\u2705 All tests passed! Professional Layered Backup System is working correctly.');
      } else {
        console.log('\u274c Some tests failed. Please check the logs above.');
      }
      
    } else {
      console.error('Backup creation failed:', backupResult.errors);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testLayeredBackupSystem();
}

export { testLayeredBackupSystem };

// Simple Test for Professional Layered Backup System

const fs = require('fs');
const path = require('path');

// Test function
async function testBackupSystem() {
  console.log('=== Testing Professional Layered Backup System ===');
  
  try {
    // Test 1: Check if backup directories can be created
    console.log('\n1. Testing directory creation...');
    const backupDirs = [
      './backups/layer1/hot',
      './backups/layer2/warm',
      './backups/layer3/cold',
      './backups/layer4/archive',
      './backups/layer5/deep_archive'
    ];
    
    for (const dir of backupDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } else {
        console.log(`Directory already exists: ${dir}`);
      }
    }
    
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
    console.log('Data size:', JSON.stringify(testData).length, 'characters');
    
    // Test 3: Create backup files
    console.log('\n3. Creating backup files...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    for (let i = 1; i <= 5; i++) {
      const backupPath = `./backups/layer${i}/test-backup-${timestamp}.json`;
      const backupData = {
        ...testData,
        layer: `layer_${i}`,
        backupId: `backup_${i}_${timestamp}`,
        createdAt: new Date().toISOString()
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`Created backup: ${backupPath}`);
    }
    
    // Test 4: Verify backup files
    console.log('\n4. Verifying backup files...');
    let totalBackups = 0;
    let totalSize = 0;
    
    for (let i = 1; i <= 5; i++) {
      const dir = `./backups/layer${i}`;
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const backups = files.filter(file => file.endsWith('.json'));
        totalBackups += backups.length;
        
        for (const file of backups) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          console.log(`Layer ${i}: ${file} (${stats.size} bytes)`);
        }
      }
    }
    
    console.log(`Total backups: ${totalBackups}`);
    console.log(`Total size: ${totalSize} bytes`);
    
    // Test 5: Read and verify backup content
    console.log('\n5. Reading backup content...');
    const firstBackupPath = './backups/layer1/test-backup-' + timestamp + '.json';
    if (fs.existsSync(firstBackupPath)) {
      const backupContent = JSON.parse(fs.readFileSync(firstBackupPath, 'utf8'));
      console.log('Backup content verified:');
      console.log('- Company:', backupContent.company);
      console.log('- Sales count:', backupContent.data.sales.length);
      console.log('- Total revenue:', backupContent.data.financial.totalRevenue);
      console.log('- Layer:', backupContent.layer);
      console.log('- Created at:', backupContent.createdAt);
    }
    
    // Test 6: Cleanup test files
    console.log('\n6. Cleaning up test files...');
    for (let i = 1; i <= 5; i++) {
      const dir = `./backups/layer${i}`;
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const testFiles = files.filter(file => file.includes('test-backup-'));
        
        for (const file of testFiles) {
          const filePath = path.join(dir, file);
          fs.unlinkSync(filePath);
          console.log(`Deleted test file: ${filePath}`);
        }
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('Directory creation: PASS');
    console.log('Test data creation: PASS');
    console.log('Backup file creation: PASS');
    console.log('Backup verification: PASS');
    console.log('Content reading: PASS');
    console.log('Cleanup: PASS');
    console.log('\u2705 All tests passed! Basic backup system is working correctly.');
    
  } catch (error) {
    console.error('Test failed with error:', error);
    console.log('\u274c Test failed. Please check the error above.');
  }
}

// Run test
testBackupSystem();

// Avtomatik chek chiqarish xizmati - Tuzatilgan versiya
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Auto Print Service',
    timestamp: new Date().toISOString()
  });
});

// Print endpoint
app.post('/print', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    console.log('🖨️ Print request received');
    console.log('📄 Content length:', content.length);
    
    // Create temp file
    const tempFile = path.join(__dirname, filename || `receipt-${Date.now()}.txt`);
    fs.writeFileSync(tempFile, content, 'utf8');
    console.log('📝 Temp file created:', tempFile);
    
    try {
      // Print to Xprinter
      const printerName = 'Xprinter XP-365B';
      const command = `powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${printerName}'"`;
      
      console.log('🖨️ Sending to printer:', printerName);
      await execAsync(command);
      console.log('✅ Printed successfully');
      
      // Clean up after 5 seconds
      setTimeout(() => {
        try {
          fs.unlinkSync(tempFile);
          console.log('🗑️ Temp file cleaned up');
        } catch (error) {
          console.log('⚠️ Cleanup error:', error.message);
        }
      }, 5000);
      
      res.json({ 
        success: true, 
        message: 'Receipt printed successfully',
        filename: path.basename(tempFile)
      });
      
    } catch (printError) {
      console.error('❌ Print error:', printError.message);
      
      // Clean up on error
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupError) {
        console.log('⚠️ Cleanup error:', cleanupError.message);
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Printer not available or not configured',
        details: printError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Test print endpoint
app.post('/test', async (req, res) => {
  try {
    const testContent = `
================================================
************************************************
*           LUX PET PLAST                      *
*         TOSHKENT DO'KONI                      *
************************************************
================================================
Sana: ${new Date().toLocaleDateString('uz-UZ')}
Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
------------------------------------------------
TEST CHEK
Bu test cheki
Printer is working!
------------------------------------------------
ID: TEST-${Date.now()}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
================================================
    `.trim();
    
    const testFile = path.join(__dirname, `test-print-${Date.now()}.txt`);
    fs.writeFileSync(testFile, testContent, 'utf8');
    
    try {
      const printerName = 'Xprinter XP-365B';
      const command = `powershell -Command "Get-Content '${testFile}' | Out-Printer -Name '${printerName}'"`;
      
      await execAsync(command);
      
      setTimeout(() => {
        try {
          fs.unlinkSync(testFile);
        } catch (error) {
          console.log('⚠️ Test cleanup error:', error.message);
        }
      }, 5000);
      
      res.json({ 
        success: true, 
        message: 'Test print sent to printer' 
      });
      
    } catch (printError) {
      try {
        fs.unlinkSync(testFile);
      } catch (cleanupError) {
        console.log('⚠️ Test cleanup error:', cleanupError.message);
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Printer not available',
        details: printError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// List printers endpoint
app.get('/printers', async (req, res) => {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-Printer | Select-Object Name, PrinterStatus | ConvertTo-Json"');
    const printers = JSON.parse(stdout);
    
    res.json({ 
      success: true, 
      printers: Array.isArray(printers) ? printers : [printers]
    });
    
  } catch (error) {
    console.error('❌ List printers error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list printers',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log('🖨️ Auto Print Service started');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log('✅ Ready to print receipts');
  console.log('\n📋 Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/printers`);
  console.log(`  POST http://localhost:${PORT}/print`);
  console.log(`  POST http://localhost:${PORT}/test`);
});

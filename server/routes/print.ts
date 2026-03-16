import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

router.use(authenticate);

// Print receipt endpoint
router.post('/receipt', async (req: AuthRequest, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content || !filename) {
      return res.status(400).json({ 
        error: 'Content and filename are required' 
      });
    }

    console.log('🖨️ Print request received:', filename);
    
    // Create temporary file
    const tempFile = `./${filename}`;
    fs.writeFileSync(tempFile, content, 'utf8');
    console.log(`📄 Receipt file created: ${tempFile}`);
    
    try {
      // Send to printer
      await execAsync(`powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
      console.log('✅ Receipt sent to printer successfully');
      
      // Clean up temp file after delay
      setTimeout(() => {
        try {
          fs.unlinkSync(tempFile);
          console.log('🗑️ Temp file cleaned up');
        } catch (error) {
          console.log('Temp file cleanup error:', (error as Error).message);
        }
      }, 5000);
      
      res.json({ 
        success: true, 
        message: 'Receipt printed successfully' 
      });
      
    } catch (printError) {
      console.log('⚠️ Printer error:', (printError as Error).message);
      
      // Clean up temp file on error
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupError) {
        console.log('Cleanup error:', (cleanupError as Error).message);
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Printer not available or not configured',
        details: (printError as Error).message 
      });
    }
    
  } catch (error) {
    console.error('Print endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Test printer endpoint
router.post('/test', async (req: AuthRequest, res) => {
  try {
    const testContent = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: ${new Date().toLocaleDateString('uz-UZ')}  Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
Test Chek
Kassir: ${req.user?.name || 'Admin'}
----------------------------------------
Bu test cheki
Printer is working!
****************************************
ID: TEST-${Date.now()}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
            `.trim();
    
    const testFile = `./test-print-${Date.now()}.txt`;
    fs.writeFileSync(testFile, testContent, 'utf8');
    
    try {
      await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
      
      setTimeout(() => {
        try {
          fs.unlinkSync(testFile);
        } catch (error) {
          console.log('Test file cleanup error:', (error as Error).message);
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
        console.log('Test cleanup error:', (cleanupError as Error).message);
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Printer not available',
        details: (printError as Error).message 
      });
    }
    
  } catch (error) {
    console.error('Test print error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;

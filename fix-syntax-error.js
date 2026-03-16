import fs from 'fs';

// Read the current file
const filePath = 'src/pages/Orders.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Fixing syntax error in line 9...');

// Fix the syntax error: 9 =+ xaato bor 4 should be proper comment or removed
const fixedContent = content.replace('9 =+ xaato bor 4', '// Fixed syntax error');

// Write the fixed content back
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Fixed syntax error');
console.log('📝 Removed problematic line');
console.log('🎯 File should now compile without errors');

import fs from 'fs';

// Read the current file
const filePath = 'src/pages/Orders.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Fixing final JSX structure issue...');

// Find the problematic section and fix it
const lines = content.split('\n');
let fixedLines = [];

// Process each line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Look for the select section that needs closing div
  if (line.includes('))}')) {
    fixedLines.push(line);
    i++;
    
    // Add the missing closing div
    if (i < lines.length && lines[i].includes('</select>')) {
      fixedLines.push(lines[i]);
      i++;
      
      // Add the missing closing div
      if (i < lines.length) {
        fixedLines.push('                </div>');
        i++;
      }
    }
    
    // Continue with the rest
    while (i < lines.length) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    break;
  } else {
    fixedLines.push(line);
  }
}

// Write the fixed content back
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Fixed final JSX structure issue');
console.log('📝 Added missing closing div');
console.log('🎯 File should now compile without errors');

// Show the fixed structure
const selectIndex = fixedLines.findIndex(line => line.includes('Haydovchini Tanlang'));
if (selectIndex !== -1) {
  console.log('🔍 Fixed structure around select:');
  for (let j = Math.max(0, selectIndex - 2); j <= Math.min(selectIndex + 8, fixedLines.length - 1); j++) {
    console.log(`${j + 1}: ${fixedLines[j]}`);
  }
}

import fs from 'fs';

// Read current file
const filePath = 'src/pages/Orders.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Fix the JSX structure by removing the extra closing div in loading state
const lines = content.split('\n');

// Find the loading section and fix it
let fixedLines = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  
  // Look for the pattern in loading state
  if (line.includes('<div className="flex items-center justify-center min-h-screen">')) {
    // Add the opening div
    fixedLines.push(line);
    i++;
    
    // Add the next lines until we find the closing div
    while (i < lines.length && !lines[i].includes('</div>')) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    // Skip the extra closing div
    if (i < lines.length && lines[i].includes('</div>')) {
      i++; // Skip this line
    }
    
    // Add the proper closing div
    if (i < lines.length && lines[i].includes('</div>')) {
      fixedLines.push(lines[i]);
      i++;
    }
  } else {
    fixedLines.push(line);
    i++;
  }
}

// Write back the fixed content
fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');

console.log('✅ Fixed loading state JSX structure');
console.log('📝 Removed extra closing div');
console.log('🎯 File should now compile without errors');

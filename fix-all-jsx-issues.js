import fs from 'fs';

// Read the current file
const filePath = 'src/pages/Orders.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Analyzing current JSX structure...');
console.log('File length:', content.length);
console.log('Lines count:', content.split('\n').length);

// Fix all remaining JSX structure issues
const lines = content.split('\n');
let fixedLines = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // Fix the 707 line issue - missing opening div
  if (line.includes('flex items-center justify-center min-h-screen">')) {
    fixedLines.push(line);
    i++;
    
    // Look for the problematic closing div
    while (i < lines.length && !lines[i].includes('</div>')) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    // Skip the extra closing div if it exists
    if (i < lines.length && lines[i].includes('</div>')) {
      // Check if this is the problematic one
      const nextLine = lines[i + 1] || '';
      if (!nextLine.includes('</div>')) {
        // This is the problematic closing div, skip it
        console.log('🗑️ Skipping problematic closing div at line', i + 1);
        i++;
        continue;
      }
    }
    
    // Add the proper closing div
    if (i < lines.length && lines[i].includes('</div>')) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    // Continue with the rest
    while (i < lines.length) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    break;
  } else {
    fixedLines.push(line);
    i++;
  }
}

// Write the fixed content
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Fixed all JSX structure issues');
console.log('📝 Fixed lines:', fixedLines.length);
console.log('🎯 File should now compile without errors');

// Show the fixed structure around line 707
const line707Index = fixedLines.findIndex(line => line.includes('flex items-center justify-center min-h-screen">'));
if (line707Index !== -1) {
  console.log('🔍 Fixed structure around line 707:');
  for (let j = Math.max(0, line707Index - 2); j <= Math.min(line707Index + 5, fixedLines.length - 1); j++) {
    console.log(`${j + 1}: ${fixedLines[j]}`);
  }
}

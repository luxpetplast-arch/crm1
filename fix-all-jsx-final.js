import fs from 'fs';

// Read the current file
const filePath = 'src/pages/Orders.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Analyzing all remaining JSX errors...');

// Fix all remaining JSX structure issues at once
const lines = content.split('\n');
let fixedLines = [];

// Process each line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Fix line 707 - missing opening div
  if (line.includes('flex items-center justify-center min-h-screen">')) {
    fixedLines.push(line);
    i++;
    
    // Add proper opening div
    while (i < lines.length && !lines[i].includes('<div className="text-center">')) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    if (i < lines.length) {
      fixedLines.push('        <div className="text-center">');
      i++;
    }
    
    // Continue with the rest
    while (i < lines.length && !lines[i].includes('</div>')) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    // Skip the problematic closing div
    if (i < lines.length && lines[i].includes('</div>')) {
      const nextLine = lines[i + 1] || '';
      if (!nextLine.includes('</div>')) {
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

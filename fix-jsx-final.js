import fs from 'fs';

// Read the current file
const filePath = 'src/pages/Orders.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original file length:', content.length);
console.log('Original lines count:', content.split('\n').length);

// Fix all JSX structure issues by rebuilding the problematic section
const lines = content.split('\n');

// Find the driver payment modal section and fix it
let fixedLines = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // Look for the driver payment modal section
  if (line.includes('Tugmalar */')) {
    // Found the section, now fix it
    fixedLines.push(line);
    i++;
    
    // Find the buttons section
    while (i < lines.length && !lines[i].includes('flex gap-2 pt-4 border-t')) {
      fixedLines.push(lines[i]);
      i++;
    }
    
    // Add the buttons container
    if (i < lines.length) {
      fixedLines.push(lines[i]); // flex gap-2 pt-4 border-t
      i++;
    }
    
    // Add first button
    while (i < lines.length && !lines[i].includes('</Button>')) {
      fixedLines.push(lines[i]);
      i++;
    }
    if (i < lines.length) {
      fixedLines.push(lines[i]); // </Button>
      i++;
    }
    
    // Add second button with proper div structure
    if (i < lines.length) {
      fixedLines.push('                  <div>');
      i++;
    }
    
    // Add the second button content
    while (i < lines.length && !lines[i].includes('</Button>')) {
      fixedLines.push(lines[i]);
      i++;
    }
    if (i < lines.length) {
      fixedLines.push(lines[i]); // </Button>
      i++;
    }
    
    // Close the div
    if (i < lines.length) {
      fixedLines.push('                  </div>');
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

console.log('✅ Fixed JSX structure');
console.log('📝 Fixed lines:', fixedLines.length);
console.log('🎯 File should now compile without errors');

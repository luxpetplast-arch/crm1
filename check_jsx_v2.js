
import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\tilav\\Desktop\\zavod tizimi\\src\\pages\\Cashbox.tsx', 'utf8');

const lines = content.split('\n');
let tagStack = [];
let blockDepth = 0;

const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Find all tags in line
  const tagMatches = line.matchAll(/<(\/?[a-zA-Z0-9.]+)(\s+[^>]*)?(\/?)>/g);
  for (const match of tagMatches) {
    const fullTag = match[0];
    const tagName = match[1];
    const isClosing = tagName.startsWith('/');
    const isSelfClosing = match[3] === '/' || voidTags.includes(tagName.toLowerCase());

    if (isSelfClosing) {
      // console.log(`Line ${i + 1}: Self-closing tag <${tagName} />`);
    } else if (isClosing) {
      const actualName = tagName.substring(1);
      const lastTag = tagStack.pop();
      if (lastTag !== actualName) {
        console.log(`Line ${i + 1}: ERROR! Closing tag </${actualName}> does not match stack <${lastTag}>`);
        tagStack.push(lastTag); // restore
      } else {
        // console.log(`Line ${i + 1}: Closed tag </${actualName}>`);
      }
    } else {
      // console.log(`Line ${i + 1}: Opened tag <${tagName}>`);
      tagStack.push(tagName);
    }
  }

  // Count braces
  const openBlocks = (line.match(/\{/g) || []).length;
  const closeBlocks = (line.match(/\}/g) || []).length;
  blockDepth += openBlocks - closeBlocks;
  
  if (blockDepth < 0) {
    console.log(`Line ${i + 1}: ERROR! blockDepth is negative: ${blockDepth}`);
  }
}

console.log('Final tagStack:', tagStack);
console.log('Final blockDepth:', blockDepth);

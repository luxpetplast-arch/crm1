
import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\tilav\\Desktop\\zavod tizimi\\src\\pages\\Cashbox.tsx', 'utf8');

let tagDepth = 0;
let blockDepth = 0;
const lines = content.split('\n');
let inReturn = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('return (')) {
    inReturn = true;
    console.log(`Line ${i + 1}: return ( starts`);
    continue;
  }
  if (inReturn) {
    const openTags = (line.match(/<(div|form|table|thead|tbody|tr|th|td|h1|h2|h3|h4|p|span|button|select|option)([ >])/g) || []).length;
    const closeTags = (line.match(/<\/(div|form|table|thead|tbody|tr|th|td|h1|h2|h3|h4|p|span|button|select|option)>/g) || []).length;
    const openBlocks = (line.match(/\{/g) || []).length;
    const closeBlocks = (line.match(/\}/g) || []).length;

    tagDepth += openTags - closeTags;
    blockDepth += openBlocks - closeBlocks;

    if (tagDepth !== 0 || blockDepth !== 0) {
      // console.log(`Line ${i + 1}: tagDepth=${tagDepth}, blockDepth=${blockDepth} | ${line.trim()}`);
    }
    
    if (line.includes(');')) {
      console.log(`Line ${i + 1}: return ends, tagDepth: ${tagDepth}, blockDepth: ${blockDepth}`);
      inReturn = false;
    }
  }
}

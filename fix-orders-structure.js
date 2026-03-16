import fs from 'fs';

// Read the current file
const filePath = 'src/pages/Orders.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Fix the structure by removing the extra closing div
const fixedContent = content.replace(
  '</div>\n              </CardContent>\n            </Card>\n          </div>\n        </div>\n      )}\n    </div>\n</div>\n  );\n}',
  '</CardContent>\n            </Card>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}'
);

// Write the fixed content back
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Fixed Orders.tsx structure');
console.log('📝 Removed extra closing div tag');
console.log('🎯 File should now compile without errors');

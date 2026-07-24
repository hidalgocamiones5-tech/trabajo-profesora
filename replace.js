const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/components/KPIDetailsModal.tsx',
  'frontend/src/components/TaskDrawer.tsx',
  'frontend/src/hooks/useCompliance.ts',
  'frontend/src/hooks/useDashboard.ts',
  'frontend/src/views/Dashboard.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/mockApi/g, 'api');
    fs.writeFileSync(filePath, content);
    console.log(`Replaced mockApi with api in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

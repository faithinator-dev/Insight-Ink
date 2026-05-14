const { execSync } = require('child_process');
const path = require('path');

const blogDir = 'c:\\Users\\HomePC\\Desktop\\claude\\blog';
process.chdir(blogDir);

try {
  console.log('Resetting to commit e1ddbfae983cf0f522731cdcc3d7dc3bd6126b70...');
  const result = execSync('git reset --soft e1ddbfae983cf0f522731cdcc3d7dc3bd6126b70', { encoding: 'utf-8' });
  console.log('Reset successful!');
  console.log(result);
  
  console.log('\nCurrent git status:');
  const status = execSync('git status', { encoding: 'utf-8' });
  console.log(status);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

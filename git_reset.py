import subprocess
import os

os.chdir('c:\\Users\\HomePC\\Desktop\\claude\\blog')

try:
    print('Resetting to commit e1ddbfae983cf0f522731cdcc3d7dc3bd6126b70...')
    result = subprocess.run(
        ['git', 'reset', '--soft', 'e1ddbfae983cf0f522731cdcc3d7dc3bd6126b70'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print('✅ Reset successful!')
    else:
        print(f'Error: {result.stderr}')
    
    print('\n=== Current git status ===')
    status = subprocess.run(['git', 'status'], capture_output=True, text=True)
    print(status.stdout)
    
except Exception as e:
    print(f'Error: {e}')

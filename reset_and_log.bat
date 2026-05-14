@echo off
cd /d c:\Users\HomePC\Desktop\claude\blog
echo === Git Log ===
git log --oneline -20
echo.
echo === Current Status ===
git status
echo.
echo === Resetting to e1ddbfa ===
git reset --soft e1ddbfae983cf0f522731cdcc3d7dc3bd6126b70
echo.
echo Done! Your changes are staged.
pause

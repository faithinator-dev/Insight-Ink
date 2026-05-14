@echo off
cd /d c:\Users\HomePC\Desktop\claude\blog
echo === Verifying reset ===
git log --oneline -5
echo.
echo === Git Status ===
git status
echo.
echo ✅ Reset to e1ddbfa complete!

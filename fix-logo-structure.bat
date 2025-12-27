@echo off
echo Fixing logo file structure...
if not exist "public\assets" mkdir public\assets
if exist "public\unpuzzle-logo.png" (
    copy /Y "public\unpuzzle-logo.png" "public\assets\unpuzzle-logo.png"
    echo Logo copied to public\assets\unpuzzle-logo.png
)
if exist "public\public\assets\unpuzzle-logo.png" (
    copy /Y "public\public\assets\unpuzzle-logo.png" "public\assets\unpuzzle-logo.png"
    echo Logo copied from nested folder to public\assets\unpuzzle-logo.png
)
echo Done! Logo should now be at: public\assets\unpuzzle-logo.png
pause


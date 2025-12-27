@echo off
echo Setting up logo file structure...
echo.

REM Create assets folder if it doesn't exist
if not exist "public\assets" (
    echo Creating public\assets folder...
    mkdir public\assets
)

REM Copy logo from various possible locations to the correct location
if exist "public\unpuzzle-logo.png" (
    echo Copying logo from public\unpuzzle-logo.png...
    copy /Y "public\unpuzzle-logo.png" "public\assets\unpuzzle-logo.png"
)

if exist "public\public\assets\unpuzzle-logo.png" (
    echo Copying logo from nested folder...
    copy /Y "public\public\assets\unpuzzle-logo.png" "public\assets\unpuzzle-logo.png"
)

if exist "earlier reference\websitiev0.0\public\assets\unpuzzle-logo.png" (
    echo Copying logo from reference folder...
    copy /Y "earlier reference\websitiev0.0\public\assets\unpuzzle-logo.png" "public\assets\unpuzzle-logo.png"
)

echo.
if exist "public\assets\unpuzzle-logo.png" (
    echo SUCCESS: Logo file is now at public\assets\unpuzzle-logo.png
) else (
    echo ERROR: Logo file was not found or copied!
)
echo.
pause


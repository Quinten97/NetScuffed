# start.ps1
$chromePath = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
if (-Not (Test-Path $chromePath)) {
    $chromePath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
}

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Start-Process -FilePath $chromePath -ArgumentList "--kiosk --no-first-run --disable-infobars --disable-session-crashed-bubble http://localhost:3000"


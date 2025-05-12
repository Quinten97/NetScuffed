# Ensure script is running as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole('Administrator')) {
    Write-Warning "Please run this script as Administrator."
    exit 1
}

Write-Output "`n==== Installing Chocolatey (if not present)...`n"
# Install Chocolatey (if missing)
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

Write-Output "`n==== Installing Dependencies...`n"
choco install -y git
choco install -y nodejs --version=20.15.1
choco install -y wireshark --params "/NoWinPcap"
choco install -y nmap
choco install -y chromium

# Define paths and variables
$repoUrl = "https://github.com/yourusername/your-repo-name.git"  # Replace with your repo URL
$targetPath = "C:\kiosk-app"
$chromiumPath = "C:\ProgramData\chocolatey\lib\chromium\tools\chromium.exe"

Write-Output "`n==== Cloning Application Repo...`n"
if (!(Test-Path $targetPath)) {
    git clone $repoUrl $targetPath
} else {
    Write-Output "Repo already exists at $targetPath, skipping clone."
}

Write-Output "`n==== Running npm install...`n"
cd $targetPath
npm install

# Schedule Task: Start Node.js Server
Write-Output "`n==== Creating Task to Launch Node.js Server on Login...`n"
$nodeScriptPath = Join-Path $targetPath "index.js"  # Update if your entry file is different
$nodeTaskAction = New-ScheduledTaskAction -Execute "node.exe" -Argument "`"$nodeScriptPath`""
$nodeTaskTrigger = New-ScheduledTaskTrigger -AtLogOn
$nodeTaskPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive
Register-ScheduledTask -TaskName "StartNodeKioskApp" -Action $nodeTaskAction -Trigger $nodeTaskTrigger -Principal $nodeTaskPrincipal -Description "Start Node.js Kiosk App on login" -Force

# Schedule Task: Launch Chromium Kiosk
Write-Output "`n==== Creating Task to Launch Chromium in Kiosk Mode...`n"
$kioskUrl = "http://localhost:3000"
$kioskArgs = "--kiosk $kioskUrl"
$chromeTaskAction = New-ScheduledTaskAction -Execute $chromiumPath -Argument $kioskArgs
$chromeTaskTrigger = New-ScheduledTaskTrigger -AtLogOn
$chromeTaskPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive
Register-ScheduledTask -TaskName "LaunchKioskBrowser" -Action $chromeTaskAction -Trigger $chromeTaskTrigger -Principal $chromeTaskPrincipal -Description "Launch Chromium in kiosk mode on login" -Force

Write-Output "`n✅ Setup complete! Reboot the system to test kiosk mode.`n"

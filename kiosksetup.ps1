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
Write-Output "`n==== Installing native build tools for Node.js...`n"
choco install -y visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --quiet"
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
$nodeScriptPath = Join-Path $targetPath "server.js"  # Update if your entry file is different
$nodeTaskAction = New-ScheduledTaskAction -Execute "node.exe" -Argument "`"$nodeScriptPath`""
$nodeTaskTrigger = New-ScheduledTaskTrigger -AtLogOn
$nodeTaskPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive
Register-ScheduledTask -TaskName "StartNodeKioskApp" -Action $nodeTaskAction -Trigger $nodeTaskTrigger -Principal $nodeTaskPrincipal -Description "Start Node.js Kiosk App on login" -Force

# Create Kiosk User if not exists
$kioskUser = "kiosk"  # The username of your kiosk account
$kioskPassword = "yourPassword"  # The password of the kiosk account (consider encryption for security)

# Check if the kiosk user already exists
$userExists = Get-LocalUser -Name $kioskUser -ErrorAction SilentlyContinue
if ($null -eq $userExists) {
    Write-Output "`n==== Creating Kiosk User...`n"
    # Create the kiosk user
    New-LocalUser -Name $kioskUser -Password (ConvertTo-SecureString $kioskPassword -AsPlainText -Force) -FullName "Kiosk User" -Description "User account for Kiosk mode"
    Add-LocalGroupMember -Group "Users" -Member $kioskUser
}

# Set Auto Login for the Kiosk User
Write-Output "`n==== Configuring Auto-Login...`n"
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name 'AutoAdminLogon' -Value '1'
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name 'DefaultUsername' -Value $kioskUser
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name 'DefaultPassword' -Value $kioskPassword
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name 'DefaultDomainName' -Value 'YourComputerName'

# Replace Explorer Shell with PowerShell Kiosk Script
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name 'Shell' -Value 'powershell.exe -NoLogo -WindowStyle Hidden -Command C:\\kiosk-app\\launch.ps1'

Write-Output "`n✅ Setup complete! Reboot the system to test kiosk mode.`n"

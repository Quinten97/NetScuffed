# Get current SSID (active Wi-Fi network)
$currentSSID = ''
$wlanInfo = netsh wlan show interfaces
foreach ($line in $wlanInfo) {
    if ($line -match '^\s*SSID\s+:\s+(.*)') {
        $currentSSID = $matches[1].Trim()
        break
    }
}

# Disconnect from current network
netsh wlan disconnect | Out-Null
Start-Sleep -Seconds 2 | Out-Null

# Scan networks
$wifiData = netsh wlan show networks mode=bssid

$accessPoints = @()

$ssid = ""
$encryption = ""
$bssid = ""
$signal = ""
$channel = ""

foreach ($line in $wifiData) {
    if ($line -match '^SSID\s+\d+\s+:\s+(.*)') {
        $ssid = $matches[1].Trim()
        $encryption = ""
    } elseif ($line -match '^\s*Authentication\s+:\s+(.*)') {
        $encryption = $matches[1].Trim()
    } elseif ($line -match '^\s*BSSID\s+\d+\s+:\s+(.*)') {
        $bssid = $matches[1].Trim()
    } elseif ($line -match '^\s*Signal\s+:\s+(\d+)%') {
        $signal = [int]$matches[1]
    } elseif ($line -match '^\s*Channel\s+:\s+(\d+)') {
        $channel = [int]$matches[1]

        # Determine Band
        $band = switch ($channel) {
            { $_ -ge 1 -and $_ -le 14 }   { "2.4GHz"; break }
            { $_ -ge 36 -and $_ -le 165 } { "5GHz"; break }
            { $_ -ge 180 }                { "6GHz"; break }
            default                       { "Unknown" }
        }

        # Create object for each BSSID
        $accessPoints += [PSCustomObject]@{
            SSID          = $ssid
            SignalPercent = $signal
            dBm           = [math]::Round(($signal / 2) - 100)
            Channel       = $channel
            Band          = $band
            Encryption    = $encryption
            MACAddress    = $bssid
        }
    }
}

# Reconnect to the original SSID
if ($currentSSID) {
    netsh wlan connect name="$currentSSID" | Out-Null
} else {
    Write-Warning "No previously connected SSID found. Skipping reconnect."
}

# Output as pretty JSON
$accessPoints | Sort-Object SSID, SignalPercent -Descending | ConvertTo-Json -Depth 2
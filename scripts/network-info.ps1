$interfaces = Get-NetIPConfiguration | Where-Object { $_.IPv4Address -ne $null }

$result = @()

foreach ($iface in $interfaces) {
    $wifiInfo = $null
    $ssid = $null
    $bssid = $null

    if ($iface.InterfaceDescription -match "Wireless|Wi-Fi") {
        try {
            $wifiInfo = netsh wlan show interfaces
            $ssid = ($wifiInfo | Select-String '^\s*SSID\s*:\s*(.+)$').Matches.Groups[1].Value
            $bssid = ($wifiInfo | Select-String '^\s*BSSID\s*:\s*(.+)$').Matches.Groups[1].Value
        } catch {}
    }

    $result += [pscustomobject]@{
        Interface = $iface.InterfaceAlias
        Type = if ($iface.InterfaceDescription -match "Wireless|Wi-Fi") { "Wi-Fi" } else { "Ethernet" }
        IP = $iface.IPv4Address.IPAddress
        MAC = $iface.MacAddress
        Netmask = $iface.IPv4Address.PrefixLength
        Gateway = $iface.IPv4DefaultGateway.NextHop
        SSID = $ssid
        BSSID = $bssid
    }
}

$result | ConvertTo-Json -Depth 3

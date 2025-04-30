$duration = 30  # Reduced if possible

$tsharkOutput = tshark -i Ethernet -f "ether proto 0x88cc" -T fields `
    -e lldp.chassis.id.mac `
    -e lldp.port.id `
    -e lldp.tlv.system.name `
    -c 1 `
    -a duration:$duration

$lldpEntries = New-Object System.Collections.Generic.List[Object]

foreach ($line in $tsharkOutput) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $fields = $line -split "`t"

    $entry = [PSCustomObject]@{
        ChassisID  = $fields[0]
        PortID     = $fields[1]
        SystemName = $fields[2]
    }

    $lldpEntries.Add($entry)
}

$netAdapterInfo = Get-NetAdapter -Name Ethernet | Select-Object LinkSpeed, FullDuplex

$output = [PSCustomObject]@{
    LLDPInfo       = $lldpEntries
    NetworkAdapter = $netAdapterInfo
}

$output | ConvertTo-Json -Depth 3

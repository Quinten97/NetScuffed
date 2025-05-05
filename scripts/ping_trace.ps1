param (
  [string]$target
)

$pingOutput = ping -n 4 $target
$responseTimes = @()

foreach ($line in $pingOutput) {
    if ($line -match "time[=<](\d+)\s*ms") {
        $responseTimes += [int]$matches[1]
    }
}

$avgResponseTime = if ($responseTimes.Count -gt 0) {
    [math]::Round(($responseTimes | Measure-Object -Average).Average, 2)
} else {
    $null
}

$packetLossLine = $pingOutput | Where-Object { $_ -match "Lost = (\d+)" }
$loss = if ($packetLossLine -match "Lost = (\d+)") {
    ([int]$matches[1] / 4) * 100
} else {
    100
}

$pingResults = @{
    responseTime = $avgResponseTime
    packetLoss   = $loss
}

$trace = tracert $target 2>&1

# Filter out empty lines and lines that aren't actual hops
$cleanTrace = $trace | Where-Object {
    $_ -match "^\s*\d+\s+.*"  # Only include lines that start with a hop number
}

$result = @{
    ping = $pingResults
    traceroute = $cleanTrace
}

$result | ConvertTo-Json -Depth 4

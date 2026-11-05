Get-PnpDevice -Class Ports, USB | Where-Object { $_.Status -eq "OK" -and $_.FriendlyName -notmatch "Root Hub|Host Controller|Generic USB Hub" } | Select-Object FriendlyName, Class | Format-Table -AutoSize
[System.IO.Ports.SerialPort]::GetPortNames() | ForEach-Object {
  Write-Host "COM Port Available: $_"
}

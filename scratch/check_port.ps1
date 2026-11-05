try {
  $port = New-Object System.IO.Ports.SerialPort "COM5", 115200, [System.IO.Ports.Parity]::None, 8, [System.IO.Ports.StopBits]::One
} catch {}
try {
  $port = New-Object System.IO.Ports.SerialPort "COM5", 115200, "None", 8, "One"
  $port.ReadTimeout = 1500
  $port.Open()
  Write-Host "SUCCESS: COM5 opened. Listening for 2 seconds..."
  $start = Get-Date
  $received = 0
  while (((Get-Date) - $start).TotalSeconds -lt 2) {
    if ($port.BytesToRead -gt 0) {
      $line = $port.ReadLine()
      Write-Host "ESP32 -> " $line
      $received++
    } else {
      Start-Sleep -Milliseconds 50
    }
  }
  if ($received -eq 0) {
    Write-Host "INFO: COM5 is open and ready (no incoming data at this moment)."
  }
  $port.Close()
  Write-Host "SUCCESS: COM5 closed."
} catch {
  Write-Host "ERROR: " $_.Exception.Message
}

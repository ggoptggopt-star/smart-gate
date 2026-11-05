Get-PnpDevice -PresentOnly | Where-Object { $_.InstanceId -match "^USB" } | Select-Object FriendlyName, Class, InstanceId | Format-Table -AutoSize

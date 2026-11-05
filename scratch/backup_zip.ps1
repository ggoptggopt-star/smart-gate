$tempDir = Join-Path $env:TEMP ('smartgate_bk_' + [System.Guid]::NewGuid().ToString().Substring(0,8))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Copy-Item -Path '.' -Destination $tempDir -Recurse -Force -Exclude ('node_modules', '.git')
Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath 'C:\Users\Admin\Desktop\LLL.zip' -Force
Remove-Item -Path $tempDir -Recurse -Force
Write-Host 'Backup LLL.zip updated successfully!'

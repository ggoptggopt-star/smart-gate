const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetZip = 'C:\\Users\\Admin\\Desktop\\LLL.zip';
console.log('Building backup at:', targetZip);

// Run powershell to create zip excluding node_modules and .git
const psCmd = `
$temp = Join-Path $env:TEMP ('smartgate_bk_' + [System.Guid]::NewGuid().ToString().Substring(0,8))
New-Item -ItemType Directory -Path $temp -Force | Out-Null
Get-ChildItem -Path . -Exclude 'node_modules', '.git' | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $temp $_.Name) -Recurse -Force
}
Compress-Archive -Path (Join-Path $temp '*') -DestinationPath '${targetZip}' -Force
Remove-Item -Path $temp -Recurse -Force
Write-Host 'Backup archive created successfully.'
`;

execSync(`powershell -ExecutionPolicy Bypass -Command "${psCmd.replace(/\n/g, '; ')}"`, { stdio: 'inherit' });

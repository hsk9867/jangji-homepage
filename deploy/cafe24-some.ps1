# 바뀐 파일만 카페24에 올리기 (전체 업로드는 img 수백 개라 오래 걸림)
# 사용법: powershell -ExecutionPolicy Bypass -File deploy\cafe24-some.ps1 index.html css/style.css js/common.js
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'cafe24.local.ps1')
$user = $env:CAFE24_FTP_USER; $pass = $env:CAFE24_FTP_PASS
$ftpHost = if ($env:CAFE24_FTP_HOST) { $env:CAFE24_FTP_HOST } else { "$user.cafe24.com" }
$remoteDir = if ($null -ne $env:CAFE24_REMOTE_DIR) { $env:CAFE24_REMOTE_DIR.Trim('/') } else { '' }
$base = if ($remoteDir) { "ftp://$ftpHost/$remoteDir" } else { "ftp://$ftpHost" }
$curl = Join-Path $env:SystemRoot 'System32\curl.exe'
$netrc = New-TemporaryFile
"machine $ftpHost login $user password $pass" | Set-Content -Path $netrc.FullName -Encoding ascii
$fail = 0
try {
  foreach ($f in $args) {
    & $curl --silent --show-error --netrc-file $netrc.FullName --ftp-create-dirs --connect-timeout 20 -T (Join-Path $root $f) "$base/$f"
    if ($LASTEXITCODE -ne 0) { Write-Host "  실패  $f"; $fail++ } else { Write-Host "  올림  $f" }
  }
} finally { Remove-Item $netrc.FullName -Force -ErrorAction SilentlyContinue }
if ($fail) { exit 1 }

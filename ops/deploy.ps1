$ErrorActionPreference = 'Stop'

$sshAlias = 'ozerishi-contabo'
$remoteRoot = '/var/www/caloritrack'
$release = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
$remoteRelease = "$remoteRoot/releases/$release"
$rootFiles = @(
  'index.html', 'style.css', 'app.js', 'auth.js', 'voice.js', 'sw.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', 'CaloriTrack-debug.apk', 'package.json'
)
$serverFiles = @('server.js', 'index.js', 'cli.js')

node --test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed; deployment stopped.' }

ssh $sshAlias "mkdir -p '$remoteRelease/server'"
if ($LASTEXITCODE -ne 0) { throw 'Could not create the remote release directory.' }

scp @rootFiles "${sshAlias}:${remoteRelease}/"
if ($LASTEXITCODE -ne 0) { throw 'Could not upload the web assets.' }

$serverSourceFiles = $serverFiles | ForEach-Object { "server\$_" }
scp @serverSourceFiles "${sshAlias}:${remoteRelease}/server/"
if ($LASTEXITCODE -ne 0) { throw 'Could not upload the API server files.' }

ssh $sshAlias "mkdir -p '$remoteRelease/ops'"
if ($LASTEXITCODE -ne 0) { throw 'Could not create the remote operations directory.' }
scp ops\caloritrack.service "${sshAlias}:${remoteRelease}/ops/"
if ($LASTEXITCODE -ne 0) { throw 'Could not upload the systemd service unit.' }
scp ops\set-gemini-key.sh "${sshAlias}:${remoteRelease}/ops/"
if ($LASTEXITCODE -ne 0) { throw 'Could not upload the credential provisioning utility.' }

ssh $sshAlias "chown -R root:root '$remoteRelease' && find '$remoteRelease' -type d -exec chmod 0755 {} + && find '$remoteRelease' -type f -exec chmod 0644 {} + && ln -sfn '$remoteRelease' '$remoteRoot/current'"
if ($LASTEXITCODE -ne 0) { throw 'Could not activate the uploaded release.' }

ssh $sshAlias "install -o root -g root -m 0644 '$remoteRelease/ops/caloritrack.service' /etc/systemd/system/caloritrack.service && install -o root -g root -m 0750 '$remoteRelease/ops/set-gemini-key.sh' /usr/local/sbin/caloritrack-set-gemini-key && systemctl daemon-reload && nginx -t && systemctl restart caloritrack.service && systemctl --quiet is-active caloritrack.service"
if ($LASTEXITCODE -ne 0) { throw 'Could not restart and verify the CaloriTrack API service.' }

$body = (& curl.exe --fail --silent --show-error 'https://caloritrack.144.91.96.77.sslip.io/' | Out-String)
if ($LASTEXITCODE -ne 0 -or $body -notmatch 'auth-gate') {
  throw 'HTTPS website check failed.'
}
Write-Host "Uploaded release $release and verified the HTTPS website and certificate."

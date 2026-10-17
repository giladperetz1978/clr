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

scp ops\server-setup.sh "${sshAlias}:/tmp/"
if ($LASTEXITCODE -ne 0) { throw 'Could not upload server setup files.' }
ssh $sshAlias "cd '$remoteRelease' && bash /tmp/server-setup.sh"
if ($LASTEXITCODE -ne 0) { throw 'Server setup or HTTPS provisioning failed.' }

$response = Invoke-WebRequest -Uri 'https://caloritrack.144.91.96.77.sslip.io/' -TimeoutSec 20
if ($response.StatusCode -ne 200 -or $response.Content -notmatch 'auth-gate') {
  throw 'HTTPS website check failed.'
}
Write-Host "Uploaded release $release and verified the HTTPS website and certificate."

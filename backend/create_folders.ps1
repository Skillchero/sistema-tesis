$basePath = 'C:\Users\William\Documents\sistema tesis\backend\src'
$folders = @(
    'config',
    'controllers',
    'middleware',
    'routes',
    'services',
    'services/ai',
    'services/auth',
    'prisma',
    'utils',
    'types'
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path (Join-Path $basePath $folder) | Out-Null
    Write-Host "Created: $folder"
}

Write-Host "Done! Backend folders created."

$basePath = 'C:\Users\William\Documents\sistema tesis\frontend\src'
$folders = @(
    'components/common',
    'components/child/activities',
    'components/child/ui',
    'components/teacher/dashboard',
    'components/teacher/students',
    'components/teacher/reports',
    'components/layout',
    'pages/child',
    'pages/teacher',
    'pages/auth',
    'hooks',
    'stores',
    'services/api',
    'services/ai',
    'services/audio',
    'utils',
    'types',
    'constants',
    'assets/images',
    'assets/sounds'
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path (Join-Path $basePath $folder) | Out-Null
    Write-Host "Created: $folder"
}

Write-Host "Done! All folders created."

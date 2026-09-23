"""Package source, Docker deployment, and optional CI without local secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[2]
destination = root / 'kid-learning-platform.zip'
platform = root / 'platform'
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(platform.rglob('*')):
        relative = path.relative_to(platform)
        if not path.is_file() or any(part in ('site', '__pycache__', '.update-lock', '.git') for part in relative.parts):
            continue
        if path.name == '.env' or path.suffix == '.zip':
            continue
        archive.write(path, 'kid-learning/' + path.relative_to(root).as_posix())
    for path in (root / '.github/workflows/container.yml', root / '.gitignore', root / '.gitattributes', root / 'deploy-linux.sh', root / 'start-linux.sh'):
        archive.write(path, 'kid-learning/' + path.relative_to(root).as_posix())
with ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert 'kid-learning/.github/workflows/container.yml' in archive.namelist()
print(f'{destination}: {destination.stat().st_size / 1024 / 1024:.1f} MB; archive verified')

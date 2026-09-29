"""Package reproducible source without credentials, runtime state, or generated output."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
root=Path(__file__).resolve().parents[1]
excluded={'node_modules','.git','.wrangler','.sites-runtime','.next','dist','outputs','work','.agents','.codex'}
target=root/'public'/'NurseReady-source.zip'
with ZipFile(target,'w',ZIP_DEFLATED) as z:
    for p in root.rglob('*'):
        rel=p.relative_to(root)
        if not p.is_file() or any(part in excluded for part in rel.parts): continue
        if p==target or p.name.endswith('.tsbuildinfo') or p.name.startswith('.env'): continue
        if rel.as_posix()=='.openai/hosting.json':
            z.writestr('NurseReady/'+rel.as_posix(),json.dumps({'d1':'DB','r2':'BUCKET'},indent=2))
        else: z.write(p,'NurseReady/'+rel.as_posix())
print(f'Source package ready: {target.stat().st_size} bytes')

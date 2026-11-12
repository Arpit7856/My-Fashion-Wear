from pathlib import Path

base = Path('c:/Users/Harshit/Desktop/DTI')
dataset_dir = base / 'backend/model/Viton_project/VITON-HD'
src_test = dataset_dir / 'datasets' / 'test'

person = '00013_00.jpg'
stem = Path(person).stem

checks = {
    'image':          src_test / 'image' / person,
    'image-parse':    src_test / 'image-parse' / (stem + '.png'),
    'openpose-img':   src_test / 'openpose-img' / (stem + '_rendered.png'),
    'openpose-json':  src_test / 'openpose-json' / (stem + '_keypoints.json'),
    'parse-agnostic': src_test / 'image-parse-agnostic-v3.2' / (stem + '.png'),
    'agnostic-v3.2':  src_test / 'agnostic-v3.2' / (stem + '.jpg'),
}

all_ok = True
for name, p in checks.items():
    ok = p.exists()
    if not ok:
        all_ok = False
    status = 'OK' if ok else 'MISSING'
    print(status + ' ' * (8 - len(status)) + name)
    print('         ' + str(p))

print()
print('ALL OK!' if all_ok else 'STILL HAS MISSING FILES')

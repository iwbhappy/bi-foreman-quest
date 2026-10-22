import json
from pathlib import Path
import pymupdf

directory = Path(__file__).resolve().parents[1] / 'artifacts/scene'
with pymupdf.open(directory / 'skin-profile.pdf') as doc:
    assert 1 <= len(doc) <= 2
    text = ''.join(page.get_text() for page in doc)
    for heading in ['Сильные стороны', 'Зоны роста', 'Рекомендации', 'План на 30 дней']:
        assert heading in text
    doc[0].get_pixmap(matrix=pymupdf.Matrix(1.4, 1.4)).save(directory / 'skin-print-page-1.png')
    result = {'file': 'skin-profile.pdf', 'pages': len(doc), 'headingsPresent': True}
(directory / 'skin-pdf-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result))

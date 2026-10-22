"""Optional visual QA helper; requires PyMuPDF. Does not affect app/runtime tests."""
import json
from pathlib import Path
import pymupdf

directory = Path(__file__).resolve().parents[1] / 'artifacts'
report = []
for file in sorted(directory.glob('result-*.pdf')):
    with pymupdf.open(file) as doc:
        text = ''.join(page.get_text() for page in doc)
        assert 1 <= len(doc) <= 2, (file.name, len(doc))
        for button in ['Скачать PDF', 'Сохранить JSON', 'Пройти ещё раз']:
            assert button not in text, (file.name, button)
        for required in ['Сильные стороны', 'Зоны роста', 'Рекомендации', 'План на 30 дней', 'Профиль — дополнительный ориентир']:
            assert required in text, (file.name, required)
        report.append({'file': file.name, 'pages': len(doc), 'textCharacters': len(text), 'buttonsAbsent': True})
        if file.name == 'result-1440.pdf':
            for i, page in enumerate(doc):
                page.get_pixmap(matrix=pymupdf.Matrix(1.4, 1.4)).save(directory / f'print-page-{i + 1}.png')
(directory / 'pdf-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=True, indent=2))

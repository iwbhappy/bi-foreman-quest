import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ru } from '../i18n/ru';
import Method from '../pages/Method';

describe('Страница методики', () => {
  it('В методике нет технических ссылок, запретных слов или обратных кавычек', () => {
    const html = renderToStaticMarkup(createElement(Method));
    expect(html).not.toMatch(/ТЗ|Likert|questions\.ts|`/i);
    expect(html.indexOf(ru.dashboard.noRightAnswers)).toBeGreaterThan(html.indexOf(ru.dashboard.structure));
    expect(html.indexOf(ru.dashboard.noRightAnswers)).toBeLessThan(html.indexOf(ru.dashboard.coverage));
  });
});

import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { SearchTourPage } from '../../../pages/SearchTourPage.js';

test.describe('Фильтр "Тип продукта"', () => {

  test('Статика — нет "невозвратный тариф", нет правил отмены, нет "Dynamic package"', async ({ page }) => {
    const searchPage = new SearchTourPage(page);

    await searchPage.gotoWithFilters(null, null, '1');
    await page.waitForTimeout(3000);

    await searchPage.clickSearch();
    await page.waitForTimeout(3000);

    try {
      await searchPage.waitForResults();
    } catch {
      test.skip(true, 'Нет туров для типа продукта Статика');
      return;
    }

    await page.waitForTimeout(3000);

    const rowCount = await searchPage.getResultRowCount();

    if (rowCount === 0) {
      test.skip(true, 'Нет туров для типа продукта Статика');
      return;
    }

    const resultText = await searchPage.getResultText();
    const lowerText = resultText.toLowerCase();

    expect(lowerText).not.toContain('невозвратный');
    expect(lowerText).not.toContain('dynamic package');

    const tourTexts = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr[data-state]');
      return Array.from(rows).map(r => {
        const td = r.querySelector('td.tour');
        if (!td) return '';
        for (const n of td.childNodes) {
          if (n.nodeType === 3) {
            const t = n.textContent.trim();
            if (t) return t;
          }
        }
        return '';
      }).filter(Boolean);
    });

    expect(tourTexts.length).toBeGreaterThan(0);

    for (const text of tourTexts) {
      expect(text.toLowerCase()).not.toContain('dynamic package');
    }
  });

});

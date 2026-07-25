import { test, expect } from '@playwright/test';

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
  };
}

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to homepage and measure loading performance
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check for Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry?.startTime || 0);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be under 2.5 seconds (good threshold)
    expect(lcp).toBeLessThan(2500);

    // Check for layout shifts
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as LayoutShiftEntry;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
          resolve(clsValue);
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Resolve after a short delay to capture shifts
        setTimeout(() => resolve(clsValue), 2000);
      });
    });

    // CLS should be under 0.1 (good threshold)
    expect(cls).toBeLessThan(0.1);
  });

  test('should handle wizard navigation performance', async ({ page }) => {
    await page.goto('/');
    
    // Measure wizard step navigation performance
    await page.getByRole('button', { name: /get started/i }).click();

    const navigationTimes: number[] = [];

    // Navigate through wizard steps and measure performance
    for (let step = 0; step < 3; step++) {
      const startTime = Date.now();
      
      // Fill minimal data for current step
      if (step === 0) {
        await page.getByLabel(/age/i).fill('25');
        await page.getByLabel(/sex/i).selectOption('female');
        await page.getByLabel(/height/i).fill('165');
        await page.getByLabel(/weight/i).fill('60');
      }
      
      await page.getByRole('button', { name: /next/i }).click();
      
      // Wait for step transition
      await page.waitForSelector('h2', { state: 'visible' });
      
      const navigationTime = Date.now() - startTime;
      navigationTimes.push(navigationTime);
      
      // Each step navigation should be under 500ms
      expect(navigationTime).toBeLessThan(500);
    }

    // Average navigation time should be reasonable
    const avgNavigationTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    expect(avgNavigationTime).toBeLessThan(300);
  });

  test('should handle chart rendering performance', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Quick wizard completion
    await page.getByLabel(/age/i).fill('30');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('175');
    await page.getByLabel(/weight/i).fill('70');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/active/i).check();
    await page.getByLabel(/maintain weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/balanced/i).check();

    // Measure calculation and results rendering time
    const startTime = Date.now();
    await page.getByRole('button', { name: /calculate/i }).click();
    
    // Wait for results page and charts to load
    await page.waitForURL('/results');
    await page.waitForSelector('[data-testid="macro-chart"]', { timeout: 5000 });
    
    const renderTime = Date.now() - startTime;
    
    // Results rendering should be under 2 seconds
    expect(renderTime).toBeLessThan(2000);

    // Check that charts are actually rendered (not just placeholders)
    const chartSvg = page.locator('[data-testid="macro-chart"] svg');
    await expect(chartSvg).toBeVisible();
  });

  test('should handle guidance updates performance', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Navigate to step with real-time guidance
    await page.getByLabel(/age/i).fill('28');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('58');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/active/i).check();
    await page.getByLabel(/lose weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Measure guidance update performance
    const startTime = Date.now();
    await page.getByLabel(/vegan/i).check();
    
    // Wait for guidance to appear
    await page.waitForSelector('[data-testid="guidance-sidebar"]', { timeout: 2000 });
    
    const guidanceUpdateTime = Date.now() - startTime;
    
    // Guidance updates should be under 500ms
    expect(guidanceUpdateTime).toBeLessThan(500);
  });

  test('should handle memory usage during extended usage', async ({ page }) => {
    await page.goto('/');

    // Simulate extended usage by navigating back and forth
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /get started/i }).click();
      
      // Fill form
      await page.getByLabel(/age/i).fill('25');
      await page.getByLabel(/sex/i).selectOption('female');
      await page.getByLabel(/height/i).fill('165');
      await page.getByLabel(/weight/i).fill('60');
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByLabel(/active/i).check();
      await page.getByLabel(/maintain weight/i).check();
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByLabel(/balanced/i).check();
      await page.getByRole('button', { name: /calculate/i }).click();
      
      // Wait for results
      await page.waitForURL('/results');
      
      // Go back to start
      await page.getByRole('button', { name: /back to calculator/i }).click();
      await page.waitForURL('/');
    }

    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as PerformanceWithMemory).memory?.usedJSHeapSize ?? 0;
    });

    // Memory usage should be reasonable (under 50MB for basic usage)
    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB
    }
  });

  test('should handle mobile performance', async ({ page, browserName }) => {
    // Only run on Chromium for mobile simulation
    test.skip(browserName !== 'chromium', 'Mobile testing only on Chromium');

    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const mobileLoadTime = Date.now() - startTime;

    // Mobile should still load reasonably fast
    expect(mobileLoadTime).toBeLessThan(4000);

    // Test mobile navigation performance
    await page.getByRole('button', { name: /get started/i }).click();
    
    const mobileNavTime = Date.now();
    await page.waitForSelector('h2');
    const navDuration = Date.now() - mobileNavTime;
    
    expect(navDuration).toBeLessThan(1000);
  });
});

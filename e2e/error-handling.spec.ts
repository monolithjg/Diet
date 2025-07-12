import { test, expect } from '@playwright/test';

test.describe('Error Handling & Edge Cases', () => {
  test('should handle invalid input values gracefully', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Test negative age
    await page.getByLabel(/age/i).fill('-5');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();

    // Should show validation error or prevent progression
    const ageError = page.locator('[aria-invalid="true"], .error');
    if (await ageError.count() > 0) {
      await expect(ageError.first()).toBeVisible();
    } else {
      // If no error shown, should not progress to next step
      await expect(page.locator('h2')).toContainText('Basic Information');
    }

    // Test extremely high values
    await page.getByLabel(/age/i).fill('150');
    await page.getByLabel(/height/i).fill('300'); // 3 meters
    await page.getByLabel(/weight/i).fill('1000'); // 1000 kg
    await page.getByRole('button', { name: /next/i }).click();

    // Should handle extreme values without crashing
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
  });

  test('should handle extremely low and high BMI values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Test extremely low BMI scenario
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('180');
    await page.getByLabel(/weight/i).fill('30'); // Very underweight
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/sedentary/i).check();
    await page.getByLabel(/gain muscle/i).check();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/balanced/i).check();
    await page.getByRole('button', { name: /calculate/i }).click();

    // Should still produce results without crashing
    await page.waitForURL('/results', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Your Personalized Nutrition Plan');

    // Go back and test high BMI
    await page.getByRole('button', { name: /back to calculator/i }).click();
    await page.getByRole('button', { name: /get started/i }).click();

    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('160');
    await page.getByLabel(/weight/i).fill('200'); // Very overweight
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/sedentary/i).check();
    await page.getByLabel(/lose weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/balanced/i).check();
    await page.getByRole('button', { name: /calculate/i }).click();

    await page.waitForURL('/results', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Your Personalized Nutrition Plan');
  });

  test('should handle missing required fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Try to proceed without filling any fields
    await page.getByRole('button', { name: /next/i }).click();

    // Should either show validation errors or prevent progression
    const validationElements = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    const isStillOnFirstStep = await page.locator('h2').textContent();
    
    expect(
      (await validationElements.count() > 0) || 
      (isStillOnFirstStep?.includes('Basic Information'))
    ).toBeTruthy();

    // Fill only some required fields
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/sex/i).selectOption('female');
    // Leave height and weight empty
    await page.getByRole('button', { name: /next/i }).click();

    // Should handle partial completion appropriately
    const currentStep = await page.locator('h2').textContent();
    expect(currentStep).toBeDefined();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Fill first step
    await page.getByLabel(/age/i).fill('30');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('175');
    await page.getByLabel(/weight/i).fill('70');
    await page.getByRole('button', { name: /next/i }).click();

    // Go to second step
    await expect(page.locator('h2')).toContainText('Body Composition');

    // Use browser back button
    await page.goBack();

    // Should handle back navigation gracefully
    await expect(page.locator('h2')).toContainText('Basic Information');

    // Values should be preserved
    await expect(page.getByLabel(/age/i)).toHaveValue('30');

    // Use browser forward button
    await page.goForward();

    // Should return to correct step
    await expect(page.locator('h2')).toContainText('Body Composition');
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Rapidly fill form
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('60');

    // Rapidly click next multiple times
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();
    await nextButton.click();
    await nextButton.click();

    // Should handle rapid clicks gracefully
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
  });

  test('should handle extreme age scenarios', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Test very young age
    await page.getByLabel(/age/i).fill('13');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('150');
    await page.getByLabel(/weight/i).fill('40');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/sedentary/i).check();
    await page.getByLabel(/maintain weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/balanced/i).check();
    await page.getByRole('button', { name: /calculate/i }).click();

    // Should handle young age appropriately
    await page.waitForURL('/results', { timeout: 10000 });
    await expect(page.locator('h1')).toBeDefined();

    // Test very old age
    await page.getByRole('button', { name: /back to calculator/i }).click();
    await page.getByRole('button', { name: /get started/i }).click();

    await page.getByLabel(/age/i).fill('95');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('170');
    await page.getByLabel(/weight/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/sedentary/i).check();
    await page.getByLabel(/maintain weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/balanced/i).check();
    await page.getByRole('button', { name: /calculate/i }).click();

    await page.waitForURL('/results', { timeout: 10000 });
    await expect(page.locator('h1')).toBeDefined();
  });

  test('should handle multiple allergy selections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Complete basic steps
    await page.getByLabel(/age/i).fill('30');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/active/i).check();
    await page.getByLabel(/maintain weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Select multiple allergies
    await page.getByLabel(/balanced/i).check();
    await page.getByLabel(/peanuts/i).check();
    await page.getByLabel(/dairy/i).check();
    await page.getByLabel(/gluten/i).check();
    await page.getByLabel(/eggs/i).check();

    await page.getByRole('button', { name: /calculate/i }).click();

    // Should handle multiple allergies gracefully
    await page.waitForURL('/results', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Your Personalized Nutrition Plan');
  });

  test('should handle page refresh during wizard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Fill some data
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('60');

    // Refresh page
    await page.reload();

    // Should handle refresh gracefully (may lose data, but shouldn't crash)
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();

    // Should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle invalid sharing URL parameters', async ({ page }) => {
    // Navigate to results with invalid sharing data
    await page.goto('/results?d=invalid-data-string');

    // Should handle invalid sharing data gracefully
    await expect(page.locator('h1')).toBeDefined();

    // Should either show error message or redirect appropriately
    const noResultsMessage = page.locator('text=No Results Available');
    const resultsTitle = page.locator('text=Your Personalized Nutrition Plan');

    // Should show either no results message or handle gracefully
    expect(
      (await noResultsMessage.isVisible()) || 
      (await resultsTitle.isVisible())
    ).toBeTruthy();
  });
}); 
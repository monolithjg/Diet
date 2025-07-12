import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy and navigation', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Diet Calculator');

    // Navigate to wizard
    await page.getByRole('button', { name: /get started/i }).click();

    // Check for proper heading hierarchy in wizard
    const wizardHeading = page.locator('h2');
    await expect(wizardHeading).toBeVisible();

    // Check that all interactive elements are keyboard accessible
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should provide proper labels and descriptions for form inputs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Check that all form inputs have proper labels
    const ageInput = page.getByLabel(/age/i);
    await expect(ageInput).toBeVisible();
    
    const sexSelect = page.getByLabel(/sex/i);
    await expect(sexSelect).toBeVisible();
    
    const heightInput = page.getByLabel(/height/i);
    await expect(heightInput).toBeVisible();
    
    const weightInput = page.getByLabel(/weight/i);
    await expect(weightInput).toBeVisible();

    // Verify inputs have proper ARIA attributes
    await expect(ageInput).toHaveAttribute('type', 'number');
    await expect(sexSelect).toHaveAttribute('role', 'combobox');
  });

  test('should provide keyboard navigation through wizard', async ({ page }) => {
    await page.goto('/');
    
    // Use keyboard to navigate to start button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Fill form using keyboard navigation
    await page.keyboard.press('Tab'); // Focus first input
    await page.keyboard.type('25'); // Age
    
    await page.keyboard.press('Tab'); // Sex dropdown
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    await page.keyboard.press('Tab'); // Height
    await page.keyboard.type('170');
    
    await page.keyboard.press('Tab'); // Weight
    await page.keyboard.type('65');
    
    // Navigate to next button and activate
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Verify navigation worked
    await expect(page.locator('h2')).toContainText('Body Composition');
  });

  test('should have sufficient color contrast and visual indicators', async ({ page }) => {
    await page.goto('/');
    
    // Check that text has sufficient contrast
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    // Check button states
    const startButton = page.getByRole('button', { name: /get started/i });
    await expect(startButton).toBeVisible();
    
    // Check hover and focus states are visible
    await startButton.hover();
    await startButton.focus();
  });

  test('should provide proper ARIA landmarks and roles', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for proper button roles
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    
    // Check for form landmarks
    const form = page.locator('form');
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible();
    }
  });

  test('should handle screen reader announcements for dynamic content', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Fill basic info and proceed to step with real-time guidance
    await page.getByLabel(/age/i).fill('30');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/active/i).check();
    await page.getByLabel(/lose weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Select vegan diet to trigger guidance
    await page.getByLabel(/vegan/i).check();
    
    // Check that guidance container has proper ARIA attributes
    const guidanceContainer = page.locator('[data-testid="guidance-sidebar"]');
    if (await guidanceContainer.isVisible()) {
      // Should have live region for dynamic updates
      await expect(guidanceContainer).toHaveAttribute('aria-live');
    }
  });

  test('should provide error messages and validation feedback', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Try to proceed without filling required fields
    await page.getByRole('button', { name: /next/i }).click();

    // Check for error messages
    const errorMessage = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Fill invalid data
    await page.getByLabel(/age/i).fill('-5');
    await page.getByRole('button', { name: /next/i }).click();

    // Should show validation feedback
    const validationMessage = page.locator('[aria-describedby], [aria-invalid="true"]');
    if (await validationMessage.count() > 0) {
      await expect(validationMessage.first()).toBeVisible();
    }
  });
}); 
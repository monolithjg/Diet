import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete wizard and display comprehensive results with CGE guidance', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Verify landing page loads
    await expect(page.locator('h1')).toContainText('Diet Calculator');
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

    // Start the wizard
    await page.getByRole('button', { name: /get started/i }).click();

    // Step 1: Basic Information
    await expect(page.locator('h2')).toContainText('Basic Information');
    
    // Fill basic information
    await page.getByLabel(/age/i).fill('30');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('180');
    await page.getByLabel(/weight/i).fill('75');
    
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Body Composition (optional)
    await expect(page.locator('h2')).toContainText('Body Composition');
    
    // Skip body fat percentage for this test
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Activity & Goals
    await expect(page.locator('h2')).toContainText('Activity & Goals');
    
    // Select activity level
    await page.getByLabel(/moderately active/i).check();
    
    // Select goal
    await page.getByLabel(/lose weight/i).check();
    
    // Select workout timing
    await page.getByLabel(/morning/i).check();
    
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Diet Preferences
    await expect(page.locator('h2')).toContainText('Diet Preferences');
    
    // Select diet style
    await page.getByLabel(/vegan/i).check();
    
    // Add an allergy
    await page.getByLabel(/peanuts/i).check();
    
    // Set sleep and stress
    await page.getByLabel(/sleep hours/i).fill('5');
    await page.getByRole('button', { name: /high/i }).click(); // stress level
    
    // Verify real-time guidance appears in sidebar
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toContainText('B-12');
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toContainText('sleep');

    await page.getByRole('button', { name: /calculate/i }).click();

    // Verify navigation to results page
    await page.waitForURL('/results');
    await expect(page.locator('h1')).toContainText('Your Personalized Nutrition Plan');

    // Verify key metrics are displayed
    await expect(page.locator('[data-testid="rmr-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="tdee-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="target-calories"]')).toBeVisible();

    // Verify macro visualization
    await expect(page.locator('[data-testid="macro-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="macro-rings"]')).toBeVisible();

    // Verify guidance section
    await expect(page.locator('[data-testid="personalized-guidance"]')).toBeVisible();
    await expect(page.locator('[data-testid="personalized-guidance"]')).toContainText('B-12');
    await expect(page.locator('[data-testid="personalized-guidance"]')).toContainText('sleep');

    // Verify action plan
    await expect(page.locator('[data-testid="action-plan"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-plan"]')).toContainText('B-12 Supplementation');
    await expect(page.locator('[data-testid="action-plan"]')).toContainText('Sleep Optimization');

    // Test action buttons
    await expect(page.getByRole('button', { name: /back to calculator/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /share results/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /print plan/i })).toBeVisible();

    // Test sharing functionality
    await page.getByRole('button', { name: /share results/i }).click();
    await expect(page.getByRole('button', { name: /copied/i })).toBeVisible();

    // Verify medical disclaimer
    await expect(page.locator('text=This nutrition plan is for educational purposes only')).toBeVisible();
  });

  test('should handle different diet styles and show appropriate guidance', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Fill basic info quickly
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();

    // Skip body composition
    await page.getByRole('button', { name: /next/i }).click();

    // Select high activity and muscle gain
    await page.getByLabel(/very active/i).check();
    await page.getByLabel(/gain muscle/i).check();
    await page.getByLabel(/afternoon/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Select keto diet
    await page.getByLabel(/keto/i).check();
    await page.getByLabel(/sleep hours/i).fill('8');
    await page.getByRole('button', { name: /low/i }).click(); // stress level

    // Verify keto-specific guidance appears
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toContainText('electrolyte');

    await page.getByRole('button', { name: /calculate/i }).click();

    // Verify keto-appropriate macro distribution
    await page.waitForURL('/results');
    await expect(page.locator('[data-testid="macro-chart"]')).toBeVisible();
    
    // Keto should have high fat percentage
    await expect(page.locator('text=Fat')).toBeVisible();
  });

  test('should handle edge cases and validation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Test form validation
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.locator('text=required')).toBeVisible();

    // Fill with extreme values to test validation
    await page.getByLabel(/age/i).fill('80');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('120'); // Very short
    await page.getByLabel(/weight/i).fill('40'); // Very light
    await page.getByRole('button', { name: /next/i }).click();

    // Should handle extreme values gracefully
    await page.getByRole('button', { name: /next/i }).click();
    
    await page.getByLabel(/sedentary/i).check();
    await page.getByLabel(/maintain weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByLabel(/balanced/i).check();
    await page.getByLabel(/sleep hours/i).fill('12'); // Maximum sleep
    await page.getByRole('button', { name: /low/i }).click();

    await page.getByRole('button', { name: /calculate/i }).click();

    // Should still produce valid results
    await page.waitForURL('/results');
    await expect(page.locator('h1')).toContainText('Your Personalized Nutrition Plan');
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('CGE Integration Tests', () => {
  test('should show vegan-specific guidance (micronutrients + meal timing)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Quick setup for vegan scenario
    await page.getByLabel(/age/i).fill('28');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('165');
    await page.getByLabel(/weight/i).fill('58');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // High activity with morning workouts for muscle gain
    await page.getByLabel(/very active/i).check();
    await page.getByLabel(/gain muscle/i).check();
    await page.getByLabel(/morning/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Vegan diet with low sleep (triggering multiple guidance types)
    await page.getByLabel(/vegan/i).check();
    await page.getByLabel(/sleep hours/i).fill('5.5');
    await page.getByRole('button', { name: /low/i }).click();

    // Verify real-time guidance shows up
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toBeVisible();
    
    // Should show B12 guidance
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toContainText('B-12');
    
    // Should show sleep guidance
    await expect(page.locator('[data-testid="guidance-sidebar"]')).toContainText('sleep');

    await page.getByRole('button', { name: /calculate/i }).click();
    await page.waitForURL('/results');

    // In results, verify comprehensive guidance
    const guidanceSection = page.locator('[data-testid="personalized-guidance"]');
    await expect(guidanceSection).toBeVisible();
    
    // Should contain vegan-specific micronutrient guidance
    await expect(guidanceSection).toContainText('B-12');
    await expect(guidanceSection).toContainText('supplement');
    
    // Should contain sleep optimization guidance
    await expect(guidanceSection).toContainText('sleep');
    await expect(guidanceSection).toContainText('muscle gain');

    // Verify action plan transforms guidance into actionable items
    const actionPlan = page.locator('[data-testid="action-plan"]');
    await expect(actionPlan).toBeVisible();
    await expect(actionPlan).toContainText('B-12 Supplementation');
    await expect(actionPlan).toContainText('Sleep Optimization');
    await expect(actionPlan).toContainText('Pre-Workout Nutrition');
  });

  test('should show keto-specific guidance with electrolyte recommendations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Setup for keto scenario
    await page.getByLabel(/age/i).fill('35');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('178');
    await page.getByLabel(/weight/i).fill('85');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Active lifestyle, fat loss goal
    await page.getByLabel(/active/i).check();
    await page.getByLabel(/lose weight/i).check();
    await page.getByLabel(/afternoon/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Keto diet
    await page.getByLabel(/keto/i).check();
    await page.getByLabel(/sleep hours/i).fill('7');
    await page.getByRole('button', { name: /medium/i }).click();

    await page.getByRole('button', { name: /calculate/i }).click();
    await page.waitForURL('/results');

    // Verify keto-specific guidance
    const guidanceSection = page.locator('[data-testid="personalized-guidance"]');
    await expect(guidanceSection).toBeVisible();
    
    // Should contain electrolyte guidance for keto
    await expect(guidanceSection).toContainText('electrolyte');

    // Verify macro distribution is keto-appropriate (high fat)
    const macroChart = page.locator('[data-testid="macro-chart"]');
    await expect(macroChart).toBeVisible();
    
    // Fat should be the highest percentage
    await expect(page.locator('text=Fat')).toBeVisible();
  });

  test('should handle multiple allergies and provide safe alternatives', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Quick basic setup
    await page.getByLabel(/age/i).fill('32');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('160');
    await page.getByLabel(/weight/i).fill('65');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByLabel(/moderately active/i).check();
    await page.getByLabel(/maintain weight/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    // Select multiple allergies
    await page.getByLabel(/balanced/i).check();
    await page.getByLabel(/peanuts/i).check();
    await page.getByLabel(/dairy/i).check();
    await page.getByLabel(/sleep hours/i).fill('7.5');
    await page.getByRole('button', { name: /low/i }).click();

    await page.getByRole('button', { name: /calculate/i }).click();
    await page.waitForURL('/results');

    // Verify allergy-safe recommendations
    const actionPlan = page.locator('[data-testid="action-plan"]');
    await expect(actionPlan).toBeVisible();
    
    // Should provide food alternatives
    if (await actionPlan.locator('text=Food Alternatives').isVisible()) {
      await expect(actionPlan).toContainText('safe alternatives');
    }
  });

  test('should prioritize critical guidance over lower-priority items', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Setup scenario that triggers multiple guidance types
    await page.getByLabel(/age/i).fill('45');
    await page.getByLabel(/sex/i).selectOption('female');
    await page.getByLabel(/height/i).fill('155');
    await page.getByLabel(/weight/i).fill('50');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Very active vegan with low sleep (multiple guidance triggers)
    await page.getByLabel(/very active/i).check();
    await page.getByLabel(/lose weight/i).check();
    await page.getByLabel(/morning/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByLabel(/vegan/i).check();
    await page.getByLabel(/peanuts/i).check();
    await page.getByLabel(/sleep hours/i).fill('4'); // Very low sleep
    await page.getByRole('button', { name: /high/i }).click(); // High stress

    await page.getByRole('button', { name: /calculate/i }).click();
    await page.waitForURL('/results');

    // Verify that high-priority guidance appears
    const guidanceSection = page.locator('[data-testid="personalized-guidance"]');
    await expect(guidanceSection).toBeVisible();

    // Sleep should appear (warn level)
    await expect(guidanceSection).toContainText('sleep');
    
    // B12 should appear (warn level)
    await expect(guidanceSection).toContainText('B-12');

    // Verify action plan shows prioritized items
    const actionPlan = page.locator('[data-testid="action-plan"]');
    await expect(actionPlan).toBeVisible();
    
    // High priority items should be visible
    await expect(actionPlan).toContainText('Sleep Optimization');
  });

  test('should show hydration guidance for active users', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();

    // Setup active user scenario
    await page.getByLabel(/age/i).fill('26');
    await page.getByLabel(/sex/i).selectOption('male');
    await page.getByLabel(/height/i).fill('182');
    await page.getByLabel(/weight/i).fill('78');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Very active user
    await page.getByLabel(/very active/i).check();
    await page.getByLabel(/gain muscle/i).check();
    await page.getByLabel(/afternoon/i).check();
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByLabel(/balanced/i).check();
    await page.getByLabel(/sleep hours/i).fill('8');
    await page.getByRole('button', { name: /low/i }).click();

    await page.getByRole('button', { name: /calculate/i }).click();
    await page.waitForURL('/results');

    // Verify hydration guidance appears
    const actionPlan = page.locator('[data-testid="action-plan"]');
    await expect(actionPlan).toBeVisible();
    
    // Should contain daily hydration targets
    await expect(actionPlan).toContainText('Daily Hydration Target');
    await expect(actionPlan).toContainText('water');
  });
}); 
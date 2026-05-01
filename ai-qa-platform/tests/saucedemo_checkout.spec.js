const { test, expect } = require('@playwright/test');

test.describe('SauceDemo E2E Cart Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
  });

  test('SDC1: Complete checkout flow successfully', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    await expect(page.locator('.summary_total_label')).toContainText('Total: $');
    await page.click('[data-test="finish"]');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('SDC2: Checkout fails due to incorrect price validation @bug', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'Jane');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '54321');
    await page.click('[data-test="continue"]');
    
    // Intentional failure for AI analysis - simulating a subtle calculation bug
    const totalLabel = page.locator('.summary_total_label');
    console.log('Validating total price...');
    // Actual is $10.79, we expect $10.80 to simulate a bug
    await expect(totalLabel).toHaveText('Total: $10.80'); 
  });
});

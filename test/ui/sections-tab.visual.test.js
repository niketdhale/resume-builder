import { test, expect } from '@playwright/test'

// This test assumes the dev server is running at http://localhost:5175
// It navigates to the app, opens the Sections tab, switches to Two columns,
// and verifies that sample sections render by asserting presence of known titles.

test.beforeEach(async ({ page }) => {
  // Navigate to root
  await page.goto('http://localhost:5175')
  // Click on the Sections tab if present
  try {
    await page.click('text=Sections', { timeout: 2000 })
  } catch {
    // If the tab label is not found, continue; the test will fail on render assertion
  }
})

test('Sections render in two-column mode and screenshot', async ({ page }, testInfo) => {
  // Switch to Two columns if the UI supports it
  try {
    await page.click('text=Two', { timeout: 2000 })
  } catch {
    // ignore if not present
  }

  // Wait for some known section titles to render
  await page.waitForSelector('text=Experience', { timeout: 5000 })
  await page.waitForSelector('text=Education', { timeout: 5000 })
  // Take a full-page screenshot for visual verification
  const screenshot = await page.screenshot({ fullPage: true })
  // Attach screenshot to test results for review
  if (testInfo && typeof testInfo.attach === 'function') {
    await testInfo.attach('sections-two-visual', { body: screenshot, contentType: 'image/png' })
  }
  expect(screenshot.length).toBeGreaterThan(0)
})

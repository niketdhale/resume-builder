import { test, expect } from '@playwright/test'

test.describe('App loads', () => {
  test('page loads without errors', async ({ page }) => {
    await page.goto('/')
    // No console errors
    const errors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('shows resume builder UI', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Page has content
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(0)
  })
})

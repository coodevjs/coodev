import { afterAll, beforeAll, describe, test, expect } from 'vitest'
import { CoodevTestManager } from '@coodev/test'

describe('basic', async () => {
  let manager: CoodevTestManager

  beforeAll(async () => {
    manager = new CoodevTestManager()

    await manager.launchBrowser()
  })

  afterAll(async () => {
    await manager.close()
  })

  test('should change page when link clicked on dev mode', async () => {
    const url = await manager.startApp({ dev: true })
    const page = await manager.newPage()
    await page.goto(url)
    const homePageTitleElement = await page.querySelector('h1')
    const homePageTitle = await homePageTitleElement.textContent()
    expect(homePageTitle).toBe('Home')

    const link = await page.querySelector('a')
    await link.click()
    const otherPageTitleElement = await page.querySelector('h1')

    const otherPageTitle = await otherPageTitleElement.textContent()
    expect(otherPageTitle).toBe('Other')

    await manager.stopApp()
    await page.close()
  })

  test('should change page when link clicked after build', async () => {
    const url = await manager.startApp({ dev: false })
    const page = await manager.newPage()

    await page.goto(url)
    const homePageTitleElement = await page.querySelector('h1')
    const homePageTitle = await homePageTitleElement.textContent()
    expect(homePageTitle).toBe('Home')

    const link = await page.querySelector('a')
    await link.click()
    const otherPageTitleElement = await page.querySelector('h1')

    const otherPageTitle = await otherPageTitleElement.textContent()
    expect(otherPageTitle).toBe('Other')

    await manager.stopApp()
    await page.close()
  })
})

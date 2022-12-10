import { afterAll, beforeAll, describe, test, expect } from 'vitest'
import { CoodevTestManager, CoodevPage } from '@coodev/test'

describe('basic', async () => {
  let manager: CoodevTestManager
  let page: CoodevPage

  beforeAll(async () => {
    manager = new CoodevTestManager()

    await manager.launchBrowser()
    page = await manager.newPage()
  })

  afterAll(async () => {
    await manager.close()
  })

  test('should change page when link clicked on dev mode', async () => {
    const url = await manager.startApp({ dev: true })
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
  })

  test('should change page when link clicked after build', async () => {
    const url = await manager.startApp({ dev: false })
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
  })
})

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

  test(
    'document title should be customized title on dev mode',
    async () => {
      const url = await manager.startApp({ dev: true })
      const page = await manager.newPage()
      await page.goto(url)

      const title = await page.title()
      expect(title).toBe('Custom document title')

      await manager.stopApp()
      await page.close()
    },
    {
      timeout: 10000,
    },
  )

  test(
    'document title should be customized title after build',
    async () => {
      const url = await manager.startApp({ dev: false })
      const page = await manager.newPage()
      await page.goto(url)

      const title = await page.title()
      expect(title).toBe('Custom document title')

      await manager.stopApp()
      await page.close()
    },
    {
      timeout: 20000,
    },
  )
})

import { Browser, chromium } from 'playwright-core'
import { CoodevPage } from './page'

export class CoodevBrowser {
  private browser: Browser | null = null

  constructor() {
    this.browser = null
  }

  async launch() {
    this.browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
    })
  }

  async close() {
    await this.browser?.close()
  }

  public async newPage() {
    if (!this.browser) {
      throw new Error('Browser is not started')
    }
    const page = await this.browser.newPage()

    return new CoodevPage({ page })
  }
}

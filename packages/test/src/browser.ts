import { Browser, chromium, LaunchOptions } from 'playwright-core'
import { type } from 'os'
import { CoodevPage } from './page'

export class CoodevBrowser {
  private browser: Browser | null = null

  constructor() {
    this.browser = null
  }

  async launch() {
    const options: LaunchOptions = {
      headless: true,
    }
    if (type() === 'Windows_NT') {
      options.executablePath =
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    } else {
      options.channel = 'chrome'
    }
    this.browser = await chromium.launch(options)
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

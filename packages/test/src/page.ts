import { Page } from 'playwright-core'
import { CoodevElement } from './element'

export interface CoodevPageOptions {
  page: Page
}

export class CoodevPage {
  private readonly page: Page
  constructor(options: CoodevPageOptions) {
    this.page = options.page
  }

  public async goto(url: string) {
    await this.page.goto(url)
  }

  public async querySelector(selector: string) {
    const element = await this.page.$(selector)

    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }
    return new CoodevElement({ element })
  }

  public async querySelectorAll(selector: string) {
    const elements = await this.page.$$(selector)

    return elements.map(element => new CoodevElement({ element }))
  }
}

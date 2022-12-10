import { ElementHandle } from 'playwright-core'

export interface CoodevElementOptions<T = Node> {
  element: ElementHandle<T>
}

export class CoodevElement<T = Node> {
  private readonly element: ElementHandle<T>
  constructor(options: CoodevElementOptions<T>) {
    this.element = options.element
  }

  public async textContent() {
    const text = await this.element.textContent()

    return text
  }

  public async click() {
    await this.element.click()
  }

  public async querySelector(selector: string) {
    const element = await this.element.$(selector)

    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    return new CoodevElement({ element })
  }

  public async querySelectorAll(selector: string) {
    const elements = await this.element.$$(selector)

    return elements.map(element => new CoodevElement({ element }))
  }

  public async waitForSelector(selector: string) {
    await this.element.waitForSelector(selector)
  }
}

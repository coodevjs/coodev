import * as DomUtils from 'domutils'
import { parseDocument, ElementType } from 'htmlparser2'
import { Element, Text } from 'domhandler'
import renderElementToString, { DomSerializerOptions } from 'dom-serializer'

export interface IHTMLElement {
  getElementByTagName(tagName: string): IHTMLElement | null
  getElementById(elementId: string): IHTMLElement | null
  appendChild(child: IHTMLElement): void
  toHtml(options?: DomSerializerOptions): string
}

class HTMLElement implements IHTMLElement {
  public readonly element: Element

  constructor(el: Element) {
    this.element = el
  }

  public getElementById(elementId: string): HTMLElement | null {
    const element = DomUtils.getElementById(elementId, this.element)
    return element ? new HTMLElement(element) : null
  }

  public getElementByTagName(tagName: string): HTMLElement | null {
    const elements = DomUtils.getElementsByTagName(tagName, this.element)
    return elements.length ? new HTMLElement(elements[0]) : null
  }

  public appendChild(child: HTMLElement): void {
    DomUtils.appendChild(this.element, (child as HTMLElement).element)
  }

  public toHtml(
    options: DomSerializerOptions = { decodeEntities: false },
  ): string {
    return renderElementToString(this.element, options)
  }
}

export class HTMLDocument extends HTMLElement {
  constructor(html: string) {
    const element = parseDocument(html)
    super(element as Element)
  }
}

export interface HTMLScriptElementAttributes {
  id?: string
  type?: string
  src?: string
}

export class HTMLScriptElement extends HTMLElement {
  constructor(
    attributes: HTMLScriptElementAttributes = {},
    innerHTML?: string,
  ) {
    const element = new Element(
      ElementType.Script,
      attributes as any,
      innerHTML ? [new Text(innerHTML)] : undefined,
    )
    super(element)
  }
}

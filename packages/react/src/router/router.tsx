import { createBrowserHistory, createMemoryHistory, Blocker } from 'history'

declare module globalThis {
  export const __COODEV_ROUTER__: Coodev.Router
}

const history =
  typeof window !== 'undefined' ? createBrowserHistory() : createMemoryHistory()

let router: Coodev.Router = globalThis.__COODEV_ROUTER__

if (!router) {
  router = {
    get action() {
      return history.action
    },
    get location() {
      return history.location
    },
    go(delta: number) {
      return history.go(delta)
    },
    forward() {
      return history.forward()
    },
    back() {
      return history.back()
    },
    createHref(to: string) {
      return history.createHref(to)
    },
    push(to: string, state?: any) {
      // onBeforeRouteUpdate(to, state)
      history.push(to, state)
    },
    replace(to: string, state?: any) {
      // onBeforeRouteUpdate(to, state)
      history.push(to, state)
    },
    listen(listener: Coodev.RouteUpdateListener) {
      return history.listen(listener)
    },
    block(blocker: Blocker) {
      return history.block(blocker)
    },
    onBeforeRouteUpdate() {},
  }

  // readonly
  Object.defineProperty(globalThis, '__COODEV_ROUTER__', {
    value: router,
    enumerable: true,
    configurable: false,
  })
}

export { router }

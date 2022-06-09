interface Callback<T> {
  name: string
  fn: (arg: T) => T
}

export class SyncWaterfallHook<T> implements Coodev.SyncWaterfallHook<T> {
  private readonly callbacks: Callback<T>[] = []

  tap(name: string, fn: (...args: T[]) => any): SyncWaterfallHook<T> {
    this.callbacks.push({
      name,
      fn,
    })
    return this
  }

  call(arg: T): T {
    let index = 0
    let result: T = arg
    try {
      while (index < this.callbacks.length && result !== undefined) {
        const callback = this.callbacks[index]
        result = callback.fn(result)
        index++
      }
    } catch (error) {
      console.error(`[${this.callbacks[index].name}]`, error)
    }
    return result
  }
}

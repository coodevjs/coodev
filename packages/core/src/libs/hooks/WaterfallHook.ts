interface Callback<T, Options = {}> {
  name: string
  fn: (arg: T, o: Options) => Promise<T> | T | undefined
}

export class WaterfallHook<T, Options = {}>
  implements Coodev.WaterfallHook<T, Options>
{
  private readonly callbacks: Callback<T, Options>[] = []

  tap(
    name: string,
    fn: (arg: T, o: Options) => Promise<T> | T | undefined,
  ): WaterfallHook<T, Options> {
    this.callbacks.push({
      name,
      fn,
    })
    return this
  }

  async call(arg: T, o: Options): Promise<T> {
    let index = 0
    let result: T | undefined = arg
    try {
      while (index < this.callbacks.length && result !== undefined) {
        const callback = this.callbacks[index]
        result = await callback.fn(result, o ?? ({} as Options))
        index++
      }
    } catch (error) {
      console.error(`[${this.callbacks[index].name}]`, error)
    }
    return result as T
  }
}

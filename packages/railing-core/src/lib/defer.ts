export interface Defer<T = void> {
  resolve(T?: T | PromiseLike<T>): void
  reject(err: any): void
  pending: boolean
  promise: Promise<T>
}

export function createDefer<T>(): Defer<T> {
  const defer = {
    resolve: null,
    reject: null,
    pending: true,
  } as any as Defer<T>

  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = (value: T) => {
      defer.pending = false
      resolve(value)
    }

    defer.reject = (error: any) => {
      defer.pending = false
      reject(error)
    }
  })

  return defer
}

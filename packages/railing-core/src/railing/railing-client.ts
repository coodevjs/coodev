import Railing from './base'

class RailingClient extends Railing {

  public get middlewares() {
    return {} as any
  }

  public get railingConfig() {
    return {} as any
  }

  public start() {

  }
}

export default RailingClient
import coodevConfig from '__COODEV__/react/config'
import { COODEV_DATA_ID } from '../constants'
import type { GlobalData } from '../types'

export function getGlobalData() {
  let globalData: GlobalData = {
    publicPath: coodevConfig.publicPath,
    pageProps: {},
    runtimeConfig: {},
  }
  const scriptElement = document.getElementById(COODEV_DATA_ID)

  if (scriptElement) {
    globalData = JSON.parse(scriptElement!.innerText)
  }

  return globalData
}

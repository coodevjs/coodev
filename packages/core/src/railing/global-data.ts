import { IGlobalData } from '@railing/types'
import { GLOBAL_DATA_ELEMENT_ID } from '../constants'

let globalData: IGlobalData | null = null

export function getClientGlobalData(): IGlobalData {
  if (!globalData) {
    try {
      const str = document.getElementById(GLOBAL_DATA_ELEMENT_ID)?.innerText
      globalData = str ? JSON.parse(str) : {}
    } catch (error) {
      throw new Error('Something wrong happened with parse railing global data')
    }
  }
  return globalData as IGlobalData
}

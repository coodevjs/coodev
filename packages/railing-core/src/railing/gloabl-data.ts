import { IGlobalData } from '@railing/types'
import { GLOBAL_DATA_ELEMENT_ID } from '../constants'

let gloablData: IGlobalData | null = null

export function getClientGlobalData(): IGlobalData {
  if (!gloablData) {
    try {
      const str = document.getElementById(GLOBAL_DATA_ELEMENT_ID)?.innerText
      gloablData = str ? JSON.parse(str) : {}
    } catch (error) {
      throw new Error('Something wrong happend with parse railing global data')
    }
  }
  return gloablData as IGlobalData
}

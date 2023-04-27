import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// dirname will be @coodev/react/lib/coodev
export const COODEV_REACT_SOURCE_DIR = resolve(__dirname, '../../src')

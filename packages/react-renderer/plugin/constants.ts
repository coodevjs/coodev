import * as path from 'path'

export const railingSourceDir = path.resolve(__dirname, '..', '..', 'src')

export const userSourceDir = path.resolve(process.cwd(), 'src')

export const CONTENT_REPLACEMENT = '__RAILING_SSR_OUTLET__'

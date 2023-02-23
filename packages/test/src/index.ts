import { spawn, ChildProcess } from 'child_process'
import { getPortPromise } from 'portfinder'
import { CoodevBrowser } from './browser'

export interface StartAppOptions {
  dev?: boolean
  port?: number
}

export class CoodevTestManager {
  private readonly browser: CoodevBrowser
  private runningChildProcess: ChildProcess | null

  constructor() {
    this.runningChildProcess = null
    this.browser = new CoodevBrowser()
  }

  public async launchBrowser() {
    await this.browser.launch()
  }

  // return app running url
  public async startApp({
    dev = false,
    port,
  }: StartAppOptions): Promise<string> {
    if (!port) {
      port = await getPortPromise({
        port: 37483,
      })
    }

    const resolveOnServerStarted = (data: string) => {
      if (data.includes('Coodev server is running on')) {
        return true
      }
      return false
    }

    if (dev) {
      await this.runCommand(
        `pnpm coodev-react --host localhost --port ${port}`,
        resolveOnServerStarted,
      )
    } else {
      await this.runCommand('pnpm run build')
      await this.runCommand(
        `pnpm coodev-react start --host localhost --port ${port}`,
        resolveOnServerStarted,
      )
    }

    return `http://localhost:${port}`
  }

  public async stopApp() {
    if (this.runningChildProcess) {
      const promise = new Promise<void>(resolve => {
        const exit = () => {
          this.runningChildProcess = null
          resolve()
        }

        if (this.runningChildProcess) {
          this.runningChildProcess.on('close', exit)

          this.runningChildProcess.on('exit', exit)
        } else {
          resolve()
        }
      })
      this.runningChildProcess.kill()

      return promise
    }
  }

  public async close() {
    if (this.browser) {
      await this.browser.close()
    }
    await this.stopApp()
  }

  public async newPage() {
    if (!this.browser) {
      throw new Error('Browser is not started')
    }
    return this.browser.newPage()
  }

  private async runCommand(
    command: string,
    canResolve?: (data: string) => boolean,
  ) {
    return new Promise<void>((resolve, reject) => {
      const root = process.cwd()
      const child = spawn(command, { shell: true, cwd: root })
      child.stdout.on('data', data => {
        if (canResolve && canResolve(data.toString())) {
          resolve()
        }
      })

      child.stderr.on('data', data => {
        console.error(`stderr ${data}`)
      })

      child.on('error', error => {
        reject(error)
      })

      child.on('close', code => {
        if (code !== 0) {
          reject(new Error(`child process exited with code ${code}`))
        } else {
          resolve()
        }
      })

      this.runningChildProcess = child
    })
  }
}

export { CoodevBrowser }
export { CoodevPage, CoodevPageOptions } from './page'
export { CoodevElement, CoodevElementOptions } from './element'

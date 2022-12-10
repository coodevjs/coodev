import { spawn, ChildProcess } from 'child_process'
import { CoodevBrowser } from './browser'

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
  public async startApp({ dev = false }: { dev?: boolean }): Promise<string> {
    let url = ''
    const resolveOnServerStarted = (data: string) => {
      if (data.includes('Coodev server is running on')) {
        const match = data.match(/http:\/\/localhost:(\d+)/)
        if (match) {
          url = `http://localhost:${match[1]}`
        }
        return true
      }
      return false
    }

    if (dev) {
      await this.runCommand('pnpm run dev', resolveOnServerStarted)
    } else {
      await this.runCommand('pnpm run build')
      await this.runCommand('pnpm run start', resolveOnServerStarted)
    }

    return url
  }

  public async stopApp() {
    if (this.runningChildProcess) {
      const promise = new Promise<void>(resolve => {
        this.runningChildProcess!.on('close', () => {
          this.runningChildProcess = null
          resolve()
        })
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

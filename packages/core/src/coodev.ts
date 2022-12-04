import * as http from 'http'
import * as path from 'path'
import * as fs from 'fs'
import {
  ViteDevServer,
  createServer as createViteServer,
  mergeConfig,
  InlineConfig,
  build,
} from 'vite'
import * as mime from 'mime-types'
import BaseCoodev from './base'

class Coodev extends BaseCoodev {
  private readonly renderer: Coodev.Renderer
  private viteServer: ViteDevServer | null = null

  constructor(options: Coodev.CoodevOptions) {
    super(options)

    this.renderer = options.renderer

    this.applyPlugins(this.coodevConfig.plugins)
  }

  public async prepare() {
    this.middlewares.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'Coodev')
      next()
    })

    if (this.coodevConfig.dev) {
      await this.initializeViteServer()
    } else {
      this.middlewares.use(this.serveStatic.bind(this))
    }

    this.initializeMiddlewares()
  }

  public async start() {
    console.log('Preparing...')
    await this.prepare()
    console.log('Starting development server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('Coodev server is running on http://localhost:3000')
  }

  public async build() {
    const viteConfig = this.initializeViteConfig()
    const serverConfig = mergeConfig(viteConfig, {
      build: {
        ssr: this.renderer.serverEntryPath,
        outDir: this.coodevConfig.outputDir,
        minify: false,
        emptyOutDir: true,
      },
    })

    // Build server side
    await build(serverConfig)
    console.log('Build complete')

    // TODO 需要先 build server bundle
    // renderer 里面会使用 ssrLoadModule
    console.log('Document html generated')
    const documentHtml = await this.renderer.getDocumentHtml(this, {
      next: () => {
        // TODO handle error
        throw new Error('next() is not supported in build mode')
      },
    })
    console.log('Document html generated')

    const html = this.hooks.documentHtml.call(documentHtml)

    console.log('Building...', html)
    const outputDirName = path.basename(this.coodevConfig.outputDir)
    const generatedHtmlPath = path.join(
      this.coodevConfig.outputDir,
      'main.html',
    )
    fs.writeFileSync(generatedHtmlPath, html)
    const htmlRelativeName = outputDirName + '/main.html'

    const relativePath = path.relative(
      this.coodevConfig.rootDir,
      this.renderer.clientEntryPath,
    )

    const clientInput: Record<string, string> = {
      main: generatedHtmlPath,
    }

    if (this.coodevConfig.ssr) {
      clientInput.client = this.renderer.clientEntryPath
    }

    const clientConfig = mergeConfig(viteConfig, {
      build: {
        ssr: false,
        manifest: true,
        outDir: this.coodevConfig.outputDir,
        emptyOutDir: false,
        rollupOptions: {
          input: clientInput,
          plugins: [
            {
              generateBundle(options: any, bundle: any) {
                console.log('generateBundle', relativePath, bundle)
                bundle[htmlRelativeName].fileName = 'index.html'
              },
              writeBundle(options: any, bundle: any) {
                const manifest = bundle['manifest.json']
                manifest.source = manifest.source
                  .replaceAll(htmlRelativeName, 'index.html')
                  .replaceAll(relativePath, 'main')

                fs.writeFileSync(
                  path.join(options.dir, 'manifest.json'),
                  manifest.source,
                )
                fs.rmSync(generatedHtmlPath)
              },
            },
          ],
        },
      },
    })
    // Build client side
    await build(clientConfig)
    console.log('Client build complete')
  }

  public loadSSRModule(module: string) {
    if (!this.viteServer) {
      throw new Error('Vite server is not initialized')
    }
    return this.viteServer.ssrLoadModule(module) as any
  }

  private async applyPlugins(plugins: Coodev.Plugin[]) {
    for (const plugin of plugins) {
      await plugin.apply(this)
    }
  }

  private initializeViteConfig(): InlineConfig {
    const viteConfig = this.hooks.viteConfig.call({
      root: this.coodevConfig.root,

      clearScreen: true,
    })

    const merged = mergeConfig(viteConfig, {
      configFile: false,
      server: {
        middlewareMode: 'ssr',
      },
    })

    return merged
  }

  private async initializeViteServer() {
    const viteConfig = this.initializeViteConfig()

    this.viteServer = await createViteServer(viteConfig)

    this.middlewares.use(this.viteServer.middlewares)

    this.initializeMiddlewares()
  }

  private initializeMiddlewares() {
    const ssr = this.coodevConfig.ssr

    if (ssr === false) {
      this.middlewares.use(this.getDocumentHtml.bind(this))
      return
    }

    if (typeof ssr === 'object' && ssr.streamingHtml) {
      this.middlewares.use(this.renderToStream.bind(this))
      return
    }

    this.middlewares.use(this.renderToString.bind(this))
  }

  private serveStatic(
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
  ) {
    const filePath = path.join(this.coodevConfig.outputDir, req.url!)

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mime.lookup(filePath) || 'text/plain')
      res.end(fs.readFileSync(filePath))
    } else {
      next()
    }
  }

  private async renderToStream(
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
  ) {
    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const stream = await this.renderer.renderToStream(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext || res.writableEnded) {
      return
    }

    stream.pipe(res)
  }

  private async renderToString(
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
  ) {
    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const html = await this.renderer.renderToString(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext || res.writableEnded) {
      return
    }

    if (html == null) {
      console.warn(
        'Renderer returned null or undefined, skipping response, You can directly call next() in your renderer',
      )
      next()
    } else {
      res.end(this.hooks.htmlRendered.call(html))
    }
  }

  private async getDocumentHtml(
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
  ) {
    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const documentHtml = await this.renderer.getDocumentHtml(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext) {
      return
    }

    res.end(this.hooks.documentHtml.call(documentHtml))
  }
}

export function createCoodev(options: Coodev.CoodevOptions) {
  return new Coodev(options)
}

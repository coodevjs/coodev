const { coodev } = require('@coodev/react')
const http = require('http')

const dev = process.env.NODE_ENV !== 'production'
const app = coodev({ dev })

app.prepare().then(() => {
  http.createServer(app.middlewares).listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})

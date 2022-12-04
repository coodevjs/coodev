const { coodev } = require('../lib')

const app = coodev({
  dev: false,
})

app.build().then(() => {
  process.exit(0)
})

const { coodev } = require('../lib/coodev')

const app = coodev({
  dev: false,
})

app.build().then(() => {
  process.exit(0)
})

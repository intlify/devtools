import express, { json, urlencoded } from 'express'
import chalk from 'chalk'

const app = express()
const PORT = process.env.PORT || 4000

app.use(json())
app.use(urlencoded({ extended: true }))
app.use((req, res, next) => { // for CORS
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

app.post('/', (req, res) => {
  console.log('req.body', req.body)
  res.status(200).json({ msg: 'hello world!' })
})

app.listen(PORT, () => {
  console.log(`backend for dev clawler listening at ${chalk.cyan(`http://localhost:${PORT}`)}`)
})

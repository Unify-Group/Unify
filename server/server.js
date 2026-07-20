import './config/dotenv.js'
import express from 'express'
import cors from 'cors'
import categoryRoutes from './routes/categories.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cors())

app.use('/api/categories', categoryRoutes)

app.get('/', (req, res) => {
  res.status(200).send('<h1 style="text-align: center; margin-top: 3rem;">🤝 Unify API</h1>')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

import express from 'express'
import { signup, login, me, dashboard } from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authenticate, me)
router.get('/dashboard', authenticate, dashboard)

export default router

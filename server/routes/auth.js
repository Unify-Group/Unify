import express from 'express'
import AuthController from '../controllers/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)
router.get('/me', requireAuth, AuthController.me)

export default router

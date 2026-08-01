import express from 'express'
import { signup, login, me, dashboard, updateMe } from '../controllers/auth.js'
import { githubAuthUrl, githubCallback } from '../controllers/githubAuth.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authenticate, me)
router.put('/me', authenticate, updateMe)
router.get('/dashboard', authenticate, dashboard)
router.get('/github/auth-url', githubAuthUrl)
router.post('/github/callback', githubCallback)

export default router

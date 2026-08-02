import express from 'express'
import { signup, login, me, dashboard, updateMe, deleteMe } from '../controllers/auth.js'
import { githubAuthUrl, githubCallback } from '../controllers/githubAuth.js'
import { googleAuthUrl, googleCallback } from '../controllers/googleAuth.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authenticate, me)
router.put('/me', authenticate, updateMe)
router.delete('/me', authenticate, deleteMe)
router.get('/dashboard', authenticate, dashboard)
router.get('/github/auth-url', githubAuthUrl)
router.post('/github/callback', githubCallback)
router.get('/google/auth-url', googleAuthUrl)
router.post('/google/callback', googleCallback)

export default router

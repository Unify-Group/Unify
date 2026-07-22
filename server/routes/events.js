import express from 'express'
import EventController from '../controllers/events.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, EventController.createEvent)
router.get('/', EventController.getAllEvents)
router.get('/:id', EventController.getEventById)
router.post('/', EventController.createEvent)

export default router

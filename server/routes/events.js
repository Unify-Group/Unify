import express from 'express'
import EventController from '../controllers/events.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, EventController.createEvent)
router.get('/', EventController.getAllEvents)
router.get('/:id', EventController.getEventById)
router.put('/:id', authenticate, EventController.updateEvent)
router.delete('/:id', authenticate, EventController.deleteEvent)

export default router

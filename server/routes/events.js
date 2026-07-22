import express from 'express'
import EventController from '../controllers/events.js'

const router = express.Router()

router.get('/', EventController.getAllEvents)
router.get('/:id', EventController.getEventById)
router.post('/', EventController.createEvent)

export default router

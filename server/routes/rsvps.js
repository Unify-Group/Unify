import express from 'express'
import RsvpController from '../controllers/rsvps.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/:eventId/count', RsvpController.getAttendeeCount)
router.get('/:eventId/attendees', RsvpController.getAttendees)
router.get('/:eventId', authenticate, RsvpController.getMyRsvp)
router.post('/:eventId', authenticate, RsvpController.createRsvp)
router.delete('/:eventId', authenticate, RsvpController.deleteRsvp)

export default router

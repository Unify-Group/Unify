import express from 'express'
import CategoryController from '../controllers/categories.js'

const router = express.Router()

router.get('/', CategoryController.getAllCategories)

export default router

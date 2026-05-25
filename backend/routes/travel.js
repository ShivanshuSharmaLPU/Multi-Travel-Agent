const express = require('express')
const router = express.Router()
const travelController = require('../controllers/travelController')

router.post('/plan', travelController.generatePlan)
router.get('/stream', travelController.streamPlan)

module.exports = router

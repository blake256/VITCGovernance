const { Router } = require('express')
const router = Router()
const {
  submitVote,
} = require('../services/voting.service')

router.post('/submit-vote', submitVote)

module.exports = router

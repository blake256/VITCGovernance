const { Router } = require('express')
const router = Router()
const {
  createProposal,
} = require('../services/proposals.service')

router.post('/create-proposal', createProposal)

module.exports = router

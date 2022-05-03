const { Router } = require('express')
const router = Router()
const {
  getTokenInfoList,
  createProposal,
} = require('../services/proposals.service')

router.get('/get-token-list', getTokenInfoList)

router.post('/create-proposal', createProposal)

module.exports = router

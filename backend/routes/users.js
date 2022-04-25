const { Router } = require('express')
const router = Router()

const {
  requestLogin,
} = require('../services/users.service')

router.post('/request-login', requestLogin)

module.exports = router

require('dotenv').config()
const backendApp = require('./backend')
const proxyApp = require('./proxy')


/*********************|
|        Proxy        |
|____________________*/


const proxyServerRef = proxyApp.listen(process.env.PROXY_PORT, (err) => {
  if (err) {
    console.log('ERROR - VITCGovernance proxy server failed to start', err)
    throw err
  }

  console.log('VITCGovernance proxy server started')
})


/***********************|
|        Backend        |
|______________________*/


const backendServerRef = backendApp.listen(process.env.API_PORT, (err) => {
  if (err) {
    console.log('ERROR - VITCGovernance backend server failed to start', err)
    throw err
  }

  console.log('VITCGovernance backend server started')
})

// process.on('SIGTERM', () => {
//   // Close the backend app
//   backendServerRef.close(() => {
//     console.log('Backend server shutting down...')
//   })
//
//   // Close the proxy app
//   proxyServerRef.close(() => {
//     console.log('Proxy server shutting down...')
//   })
// })

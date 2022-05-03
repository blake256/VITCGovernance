import { compress, decompress } from 'compress-json'
import { signInByToken } from '@/firebase/firebase'

const { accountBlock } = require('@vite/vitejs')

const { createAccountBlock } = accountBlock

/**
 *
 */
export async function fetchRequest(fetchURL, fetchMethod = 'POST', fetchBody = {}) {
  const apiRes = await fetch(fetchURL, {
    method: fetchMethod,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.VUE_APP_BACKEND_AUTH_KEY,
    },
    body: JSON.stringify(fetchBody),
  })

  return decompress((await apiRes.json()))
}

/**
 *
 */
export async function getAPIBaseTest() {
  const apiRes = await fetch(`${process.env.VUE_APP_BACKEND_API_URL}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.VUE_APP_BACKEND_AUTH_KEY,
    },
  })

  return decompress((await apiRes.json()))
}

/**
 *
 */
export async function getTokenList() {
  const apiRes = await fetch(`${process.env.VUE_APP_BACKEND_API_URL}/get-token-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.VUE_APP_BACKEND_AUTH_KEY,
    },
  })

  return decompress((await apiRes.json()))
}

/**
 *
 */
export async function createProposal(newProposal = null) {
  const requestURL = `${process.env.VUE_APP_BACKEND_API_URL}/create-proposal`

  return fetchRequest(requestURL, 'POST', compress({
    newProposal: newProposal,
  }))
}

/**
 *
 */
export async function submitVote(newVote = null) {
  const requestURL = `${process.env.VUE_APP_BACKEND_API_URL}/submit-vote`

  return fetchRequest(requestURL, 'POST', compress({
    newVote: newVote,
  }))
}

/**
 *
 */
export async function requestLogin(walletPayload) {
  const requestURL = `${process.env.VUE_APP_BACKEND_API_URL}/request-login`

  const { user, token } = await fetchRequest(requestURL, 'POST', compress({
    payload: walletPayload,
  }))
  await signInByToken(token)

  return user
}

/**
 *
 */
export function sendVcTx(vbInstance, ...args) {
  return vbInstance
    .sendCustomRequest({ method: 'vite_signAndSendTx', params: args })
    .then(signedBlock => signedBlock)
}

/**
 *
 */
export async function callAndSignContract(vbInstance, contractInfo, methodName, params) {
  if (!vbInstance || !vbInstance.accounts[0]) {
    console.log('VITCGovernance: ERROR - callContract() vbInstance null')

    return null
  }

  const block = createAccountBlock('callContract', {
    address: vbInstance.accounts[0],
    abi: contractInfo.abi,
    toAddress: contractInfo.address,
    params: params,
    methodName,
    amount: `${0}`,
  })
  const callContractBlock = block.accountBlock

  return sendVcTx(vbInstance, { block: callContractBlock, abi: contractInfo.abi })
}

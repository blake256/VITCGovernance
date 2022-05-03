require('dotenv').config()
const { WS_RPC } = require('@vite/vitejs-ws')
const { ViteAPI, accountBlock, utils } = require('@vite/vitejs')
const { createAccountBlock } = accountBlock
const CryptoJS = require('crypto-js')

const TEST_WS_NET = 'wss://buidl.vite.net/gvite/ws'
const LIVE_WS_NET = 'wss://node.vite.net/gvite/ws'
// const VITE_WSS = process.env.NODE_ENV === 'production' ? LIVE_WS_NET : TEST_WS_NET
const VITE_WSS = TEST_WS_NET

/**
 *
 */
async function getPoWDifficulty(viteProvider, acctBlock) {
  if (!viteProvider) {
    return null
  }

  const powDifficulty = await viteProvider.request('ledger_getPoWDifficulty', {
    address: acctBlock.address,
    previousHash: acctBlock.previousHash,
    blockType: acctBlock.blockType,
    toAddress: acctBlock.toAddress,
    data: acctBlock.data,
  })

  return powDifficulty
}

/**
 *
 */
async function getPowNonce(viteProvider, difficulty, getNonceHash) {
  if (!viteProvider) {
    return null
  }

  const powNonce = await viteProvider.request('util_getPoWNonce', difficulty, getNonceHash).catch(err => {
    if (err) {
      // do nothing
    }
  })

  return powNonce
}

/**
 *
 */
async function signAndSendAcct(viteProvider, acctBlock) {
  if (!viteProvider) {
    return null
  }

  // Auto-fill height and previousHash
  await acctBlock.autoSetPreviousAccountBlock().catch(() => {})

  // Get difficulty
  let difficulty = null
  const powRes = await getPoWDifficulty(viteProvider, acctBlock).catch(() => {})
  if (powRes && powRes.difficulty) {
    difficulty = powRes.difficulty
  }

  // Check if account has enough quota to send transaction
  if (difficulty) {
    // Call gvite rpc api to calculate nonce from difficulty
    const getNonceHashBuffer = Buffer.from(acctBlock.originalAddress + acctBlock.previousHash, 'hex')
    const getNonceHash = utils.blake2bHex(getNonceHashBuffer, null, 32)
    const nonce = await getPowNonce(viteProvider, difficulty, getNonceHash)
    acctBlock.setDifficulty(difficulty)
    acctBlock.setNonce(nonce)
  }

  // Sign and send the AccountBlock
  const sendResult = await acctBlock.autoSend().catch(() => {})

  return sendResult
}

/**
 * Send token between given addresses
 */
async function selfSignCallContract(contract, methodName, inputParams) {
  const viteProvider = new ViteAPI(new WS_RPC(VITE_WSS), () => {
    // console.log('[LOG]: VITE API CLIENT CONNECTED')
  })

  // Create an AccountBlock instance
  const acctBlock = createAccountBlock('callContract', {
    address: process.env.SELF_SIGN_ADDR,
    abi: contract.abi,
    toAddress: contract.address,
    params: inputParams,
    methodName,
    amount: String(0),
  }).setProvider(viteProvider).setPrivateKey(
    CryptoJS.AES.decrypt(
      process.env.SELF_SIGN_KRIPT_DATA,
      process.env.FILE_KRIPT_KEY,
    ).toString(CryptoJS.enc.Utf8))

  try {
    const sendResult = await signAndSendAcct(viteProvider, acctBlock)

    return sendResult
  } catch(err) {
    if (err) {
      const sendResult = await signAndSendAcct(viteProvider, acctBlock)

      return sendResult
    }
  }
}

/**
 *
 */
async function getWalletBalanceInfo(walletAddr) {
  const viteProvider = new ViteAPI(new WS_RPC(LIVE_WS_NET), () => {
    // console.log('[LOG]: VITE API CLIENT CONNECTED')
  })

  if (walletAddr) {
    return viteProvider.getBalanceInfo(walletAddr)
  }

  return null
}


module.exports = {
  getWalletBalanceInfo,
  selfSignCallContract,
}

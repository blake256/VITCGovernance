const { WS_RPC } = require('@vite/vitejs-ws')
const { ViteAPI } = require('@vite/vitejs')
const proposalsContract = require('./contractInfo')

export const contractInfo = proposalsContract

// const TEST_WS_NET = 'wss://buidl.vite.net/gvite/ws'
const LIVE_WS_NET = 'wss://node.vite.net/gvite/ws'
// const VITE_WSS = process.env.NODE_ENV === 'production' ? LIVE_WS_NET : TEST_WS_NET
const VITE_WSS = LIVE_WS_NET

/**
 *
 */
export async function getTokenInfoList() {
  let viteProvider = new ViteAPI(new WS_RPC(VITE_WSS), () => {
    // console.log('[LOG]: VITE API CLIENT CONNECTED')
  })

  if (!viteProvider) {
    viteProvider = new ViteAPI(new WS_RPC(VITE_WSS), () => {
      // console.log('[LOG]: VITE API CLIENT CONNECTED')
    })
  }

  const tokenList = []
  const tokenInfo = await viteProvider.request('contract_getTokenInfoList', 0, 250)
  tokenInfo.tokenInfoList.forEach(value => {
    const tokenSymbol = value.tokenSymbol.toString()
    const tokenId = value.tokenId.toString()
    if (!Number.isNaN(value.tokenSymbol)) {
      tokenList.push({
        label: tokenSymbol,
        value: tokenId,
      })
    }
  })
  tokenList.sort((a, b) => a.label.localeCompare(b.label))

  return tokenList
}

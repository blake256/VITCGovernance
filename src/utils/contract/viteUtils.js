const { HTTP_RPC } = require('@vite/vitejs-http')
const { ViteAPI } = require('@vite/vitejs')

const HTTP_NET = 'https://node.vite.net/gvite/http'

async function _connectViteProvider() {
  return new ViteAPI(new HTTP_RPC(HTTP_NET), () => {
    // console.log('[LOG]: VITE API CLIENT CONNECTED')
  })
}

export default async function getTokenList() {
  const tokenList = []
  const viteProvider = await _connectViteProvider()
  if (viteProvider) {
    const tokenInfo = await viteProvider.request('contract_getTokenInfoList', 0, 500)
    if (tokenInfo) {
      for (let i = 0; i < tokenInfo.tokenInfoList.length; ++i) {
        const value = tokenInfo.tokenInfoList[i]
        const tokenSymbol = value.tokenSymbol.toString()
        const tokenId = value.tokenId.toString()
        if (!Number.isNaN(value.tokenSymbol)) {
          tokenList.push({
            label: tokenSymbol,
            value: tokenId,
          })
        }
      }
      tokenList.sort((a, b) => a.label.localeCompare(b.label))
    }
  }

  return tokenList
}

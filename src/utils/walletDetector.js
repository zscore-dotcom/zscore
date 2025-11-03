import Web3 from 'web3'

// 钱包配置信息
export const WALLETS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    detect: () => window.ethereum?.isMetaMask && !window.ethereum?.isCoinbaseWallet,
    getProvider: () => window.ethereum,
    downloadUrl: 'https://metamask.io/download/'
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔷',
    detect: () => window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension,
    getProvider: () => window.ethereum || window.coinbaseWalletExtension,
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🔒',
    detect: () => window.ethereum?.isTrust || window.trustwallet,
    getProvider: () => window.ethereum || window.trustwallet,
    downloadUrl: 'https://trustwallet.com/'
  },
  okx: {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '⚡',
    detect: () => window.okxwallet,
    getProvider: () => window.okxwallet,
    downloadUrl: 'https://www.okx.com/web3'
  },
  binance: {
    id: 'binance',
    name: 'Binance Wallet',
    icon: '🔶',
    detect: () => window.BinanceChain,
    getProvider: () => window.BinanceChain,
    downloadUrl: 'https://www.binance.com/en/web3wallet'
  },
  tokenpocket: {
    id: 'tokenpocket',
    name: 'TokenPocket',
    icon: '💼',
    detect: () => window.tokenpocket || window.ethereum?.isTokenPocket,
    getProvider: () => window.tokenpocket || window.ethereum,
    downloadUrl: 'https://tokenpocket.pro/'
  },
  safepal: {
    id: 'safepal',
    name: 'SafePal',
    icon: '🛡️',
    detect: () => window.safepalProvider || window.ethereum?.isSafePal,
    getProvider: () => window.safepalProvider || window.ethereum,
    downloadUrl: 'https://www.safepal.com/'
  },
  mathwallet: {
    id: 'mathwallet',
    name: 'MathWallet',
    icon: '📐',
    detect: () => window.ethereum?.isMathWallet || window.ethereum?.providers?.find(p => p.isMathWallet),
    getProvider: () => window.ethereum?.isMathWallet ? window.ethereum : window.ethereum?.providers?.find(p => p.isMathWallet),
    downloadUrl: 'https://mathwallet.org/'
  },
  rabby: {
    id: 'rabby',
    name: 'Rabby',
    icon: '🐰',
    detect: () => window.ethereum?.isRabby,
    getProvider: () => window.ethereum,
    downloadUrl: 'https://rabby.io/'
  },
  onekey: {
    id: 'onekey',
    name: 'OneKey',
    icon: '🔑',
    detect: () => window.$onekey?.ethereum || window.ethereum?.isOneKey,
    getProvider: () => window.$onekey?.ethereum || window.ethereum,
    downloadUrl: 'https://onekey.so/'
  },
  coin98: {
    id: 'coin98',
    name: 'Coin98',
    icon: '💎',
    detect: () => window.coin98 || window.ethereum?.isCoin98,
    getProvider: () => window.coin98?.provider || window.ethereum,
    downloadUrl: 'https://coin98.com/'
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    detect: () => window.phantom?.ethereum,
    getProvider: () => window.phantom?.ethereum,
    downloadUrl: 'https://phantom.app/'
  },
  // 通用 EIP-1193 钱包检测（支持任何符合标准的钱包）
  generic: {
    id: 'generic',
    name: '其他钱包',
    icon: '🌐',
    detect: () => {
      // 检测 window.ethereum 是否存在，但不属于任何已知钱包
      if (!window.ethereum) return false
      
      // 排除已知钱包
      const knownWallets = [
        window.ethereum.isMetaMask,
        window.ethereum.isCoinbaseWallet,
        window.ethereum.isTrust,
        window.ethereum.isTokenPocket,
        window.ethereum.isSafePal,
        window.ethereum.isMathWallet,
        window.ethereum.isRabby,
        window.ethereum.isOneKey,
        window.ethereum.isCoin98,
        window.okxwallet,
        window.BinanceChain
      ]
      
      // 如果有 window.ethereum 且不属于已知钱包，则认为是通用钱包
      return window.ethereum && !knownWallets.some(Boolean)
    },
    getProvider: () => window.ethereum,
    downloadUrl: null // 通用钱包没有特定的下载链接
  }
}

/**
 * 检测所有可用的钱包
 * @returns {Array} 可用的钱包列表
 */
export function detectAvailableWallets() {
  const availableWallets = []
  const detectedIds = new Set()
  
  // 先检测已知钱包（按优先级）
  const knownWalletIds = ['metamask', 'coinbase', 'trust', 'okx', 'binance', 
                          'tokenpocket', 'safepal', 'mathwallet', 'rabby', 
                          'onekey', 'coin98', 'phantom']
  
  for (const walletId of knownWalletIds) {
    const wallet = WALLETS[walletId]
    if (wallet && wallet.detect()) {
      availableWallets.push(wallet)
      detectedIds.add(walletId)
    }
  }
  
  // 最后检测通用钱包（只有在没有检测到其他钱包时才显示）
  if (availableWallets.length === 0 && WALLETS.generic.detect()) {
    availableWallets.push(WALLETS.generic)
  }
  
  return availableWallets
}

/**
 * 连接指定的钱包
 * @param {string} walletId - 钱包 ID
 * @returns {Promise<Object>} 返回 web3 实例、账户、provider 和 chainId
 */
export async function connectWallet(walletId) {
  const wallet = WALLETS[walletId]
  
  if (!wallet) {
    throw new Error(`不支持的钱包: ${walletId}`)
  }
  
  // 如果钱包未安装，尝试检测
  if (!wallet.detect()) {
    throw new Error(`${wallet.name} 未安装，请先安装钱包扩展`)
  }
  
  const provider = wallet.getProvider()
  
  if (!provider) {
    throw new Error(`无法获取 ${wallet.name} provider`)
  }
  
  const web3 = new Web3(provider)
  
  // 检查并切换到 BSC 主网
  let chainId = await web3.eth.getChainId()
  const targetChainId = 56n // BSC Mainnet
  
  if (chainId !== targetChainId) {
    try {
      // 对于 Binance Wallet，使用不同的方法
      if (walletId === 'binance') {
        await provider.switchNetwork?.(56)
      } else {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }] // 56 in hex
        })
      }
      
      // 刷新 chainId
      chainId = await web3.eth.getChainId()
    } catch (switchError) {
      // 如果切换失败，尝试添加链
      if (switchError.code === 4902 || switchError.code === -32603) {
        const chainParams = {
          chainId: '0x38',
          chainName: 'BSC Mainnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-dataseed.binance.org'],
          blockExplorerUrls: ['https://bscscan.com']
        }
        
        if (walletId === 'binance') {
          await provider.addNetwork?.(56, chainParams)
        } else {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [chainParams]
          })
        }
        
        // 刷新 chainId
        chainId = await web3.eth.getChainId()
      } else {
        throw switchError
      }
    }
  }
  
  // 请求账户
  let accounts
  if (walletId === 'binance') {
    accounts = await provider.request?.({ method: 'eth_accounts' }) || []
    if (accounts.length === 0) {
      accounts = await provider.request?.({ method: 'eth_requestAccounts' }) || []
    }
  } else {
    accounts = await web3.eth.requestAccounts()
  }
  
  if (accounts.length === 0) {
    throw new Error('用户拒绝了连接请求')
  }
  
  return {
    web3,
    account: accounts[0],
    provider,
    chainId
  }
}

/**
 * 检查钱包连接状态
 * @param {string} walletId - 钱包 ID
 * @returns {Promise<Object|null>} 如果已连接返回连接信息，否则返回 null
 */
export async function checkWalletConnection(walletId) {
  const wallet = WALLETS[walletId]
  
  if (!wallet || !wallet.detect()) {
    return null
  }
  
  try {
    const provider = wallet.getProvider()
    const web3 = new Web3(provider)
    
    // 对于 Binance Wallet，使用不同的方法
    let accounts
    if (walletId === 'binance') {
      accounts = await provider.request?.({ method: 'eth_accounts' }) || []
    } else {
      accounts = await web3.eth.getAccounts()
    }
    
    if (accounts.length === 0) {
      return null
    }
    
    const chainId = await web3.eth.getChainId()
    
    return {
      web3,
      account: accounts[0],
      provider,
      chainId
    }
  } catch (error) {
    console.error(`检查 ${wallet.name} 连接失败:`, error)
    return null
  }
}

/**
 * 自动检测并连接已授权的钱包
 * @returns {Promise<Object|null>} 如果找到已连接的钱包返回连接信息，否则返回 null
 */
export async function autoConnectWallet() {
  const availableWallets = detectAvailableWallets()
  
  for (const wallet of availableWallets) {
    const connection = await checkWalletConnection(wallet.id)
    if (connection) {
      return {
        ...connection,
        walletId: wallet.id,
        walletName: wallet.name
      }
    }
  }
  
  return null
}

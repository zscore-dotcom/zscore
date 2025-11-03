import { useState, useEffect } from 'react'
import Web3 from 'web3'
import { AiOutlineLineChart, AiOutlineTeam, AiOutlineSetting, AiOutlineWallet, AiOutlineGift } from 'react-icons/ai'
import WalletConnect from './components/WalletConnect'
import NodeManagement from './components/NodeManagement'
import LPManagement from './components/LPManagement'
import Distribute from './components/Distribute'
import QueryInfo from './components/QueryInfo'
import { contracts } from './utils/contracts'
import { autoConnectWallet } from './utils/walletDetector'
import styles from './App.module.css'

function App() {
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState(null)
  const [activeTab, setActiveTab] = useState('wallet')
  const [provider, setProvider] = useState(null)
  const [contractInstances, setContractInstances] = useState(null)

  useEffect(() => {
    // 检查是否已连接钱包（只在用户未主动断开的情况下）
    const wasDisconnected = localStorage.getItem('wallet_disconnected') === 'true'
    if (!wasDisconnected) {
      autoCheckWalletConnection()
    }
    
    // 监听账户变化 - 监听所有可能的 provider
    setupEventListeners()

    return () => {
      removeEventListeners()
    }
  }, [])

  useEffect(() => {
    // 当账户或链ID变化时，初始化合约实例
    if (account && provider && chainId === 56n) {
      initContracts()
    } else {
      setContractInstances(null)
    }
  }, [account, provider, chainId])

  const autoCheckWalletConnection = async () => {
    try {
      const connection = await autoConnectWallet()
      if (connection) {
        setProvider(connection.provider)
        setAccount(connection.account)
        setChainId(connection.chainId)
        setWeb3(connection.web3)
      }
    } catch (error) {
      console.error('自动连接钱包失败:', error)
    }
  }

  const setupEventListeners = () => {
    // 监听 window.ethereum (支持所有 EIP-1193 兼容的钱包)
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      // 支持多个 provider（某些钱包使用 providers 数组）
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        window.ethereum.providers.forEach(provider => {
          if (provider && typeof provider.on === 'function') {
            provider.on('accountsChanged', handleAccountsChanged)
            provider.on('chainChanged', handleChainChanged)
          }
        })
      }
    }
    
    // 监听 Binance Chain
    if (window.BinanceChain && typeof window.BinanceChain.on === 'function') {
      window.BinanceChain.on('accountsChanged', handleAccountsChanged)
      window.BinanceChain.on('chainChanged', handleChainChanged)
    }
    
    // 监听 OKX Wallet
    if (window.okxwallet && typeof window.okxwallet.on === 'function') {
      window.okxwallet.on('accountsChanged', handleAccountsChanged)
      window.okxwallet.on('chainChanged', handleChainChanged)
    }
    
    // 监听 TokenPocket
    if (window.tokenpocket && typeof window.tokenpocket.on === 'function') {
      window.tokenpocket.on('accountsChanged', handleAccountsChanged)
      window.tokenpocket.on('chainChanged', handleChainChanged)
    }
    
    // 监听 SafePal
    if (window.safepalProvider && typeof window.safepalProvider.on === 'function') {
      window.safepalProvider.on('accountsChanged', handleAccountsChanged)
      window.safepalProvider.on('chainChanged', handleChainChanged)
    }
    
    // 监听 Coin98
    if (window.coin98?.provider && typeof window.coin98.provider.on === 'function') {
      window.coin98.provider.on('accountsChanged', handleAccountsChanged)
      window.coin98.provider.on('chainChanged', handleChainChanged)
    }
    
    // 监听 Phantom
    if (window.phantom?.ethereum && typeof window.phantom.ethereum.on === 'function') {
      window.phantom.ethereum.on('accountsChanged', handleAccountsChanged)
      window.phantom.ethereum.on('chainChanged', handleChainChanged)
    }
    
    // 监听 OneKey
    if (window.$onekey?.ethereum && typeof window.$onekey.ethereum.on === 'function') {
      window.$onekey.ethereum.on('accountsChanged', handleAccountsChanged)
      window.$onekey.ethereum.on('chainChanged', handleChainChanged)
    }
  }

  const removeEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
      
      // 移除多个 provider 的监听器
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        window.ethereum.providers.forEach(provider => {
          if (provider && typeof provider.removeListener === 'function') {
            provider.removeListener('accountsChanged', handleAccountsChanged)
            provider.removeListener('chainChanged', handleChainChanged)
          }
        })
      }
    }
    
    if (window.BinanceChain && typeof window.BinanceChain.removeListener === 'function') {
      window.BinanceChain.removeListener('accountsChanged', handleAccountsChanged)
      window.BinanceChain.removeListener('chainChanged', handleChainChanged)
    }
    
    if (window.okxwallet && typeof window.okxwallet.removeListener === 'function') {
      window.okxwallet.removeListener('accountsChanged', handleAccountsChanged)
      window.okxwallet.removeListener('chainChanged', handleChainChanged)
    }
    
    if (window.tokenpocket && typeof window.tokenpocket.removeListener === 'function') {
      window.tokenpocket.removeListener('accountsChanged', handleAccountsChanged)
      window.tokenpocket.removeListener('chainChanged', handleChainChanged)
    }
    
    if (window.safepalProvider && typeof window.safepalProvider.removeListener === 'function') {
      window.safepalProvider.removeListener('accountsChanged', handleAccountsChanged)
      window.safepalProvider.removeListener('chainChanged', handleChainChanged)
    }
    
    if (window.coin98?.provider && typeof window.coin98.provider.removeListener === 'function') {
      window.coin98.provider.removeListener('accountsChanged', handleAccountsChanged)
      window.coin98.provider.removeListener('chainChanged', handleChainChanged)
    }
    
    if (window.phantom?.ethereum && typeof window.phantom.ethereum.removeListener === 'function') {
      window.phantom.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.phantom.ethereum.removeListener('chainChanged', handleChainChanged)
    }
    
    if (window.$onekey?.ethereum && typeof window.$onekey.ethereum.removeListener === 'function') {
      window.$onekey.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.$onekey.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setWeb3(null)
      setAccount('')
      setProvider(null)
      setChainId(null)
      setContractInstances(null)
      // 账户被移除时，也标记为断开
      localStorage.setItem('wallet_disconnected', 'true')
    } else {
      // 尝试自动检测并重新连接
      try {
        const connection = await autoConnectWallet()
        if (connection) {
          setProvider(connection.provider)
          setAccount(connection.account)
          setChainId(connection.chainId)
          setWeb3(connection.web3)
        } else {
          setAccount(accounts[0])
        }
        // 账户切换时，清除断开标记（因为用户还在使用钱包）
        localStorage.removeItem('wallet_disconnected')
      } catch (error) {
        console.error('处理账户变化失败:', error)
        setAccount(accounts[0])
        localStorage.removeItem('wallet_disconnected')
      }
    }
  }

  const handleChainChanged = async (chainId) => {
    // chainId 可能是字符串（十六进制）或数字
    const chainIdValue = typeof chainId === 'string' 
      ? BigInt(parseInt(chainId, 16))
      : BigInt(chainId)
    
    setChainId(chainIdValue)
    
    // 尝试自动检测并重新连接以获取正确的 provider
    try {
      const connection = await autoConnectWallet()
      if (connection) {
        setProvider(connection.provider)
        setWeb3(connection.web3)
        setChainId(connection.chainId)
      } else if (window.ethereum && account) {
        const web3Instance = new Web3(window.ethereum)
        setProvider(window.ethereum)
        setWeb3(web3Instance)
      }
    } catch (error) {
      console.error('处理链变化失败:', error)
    }
  }

  const initContracts = async () => {
    try {
      const instances = await contracts.init(provider)
      setContractInstances(instances)
    } catch (error) {
      console.error('初始化合约失败:', error)
    }
  }

  const handleConnect = async (web3Instance, accountAddr, providerInstance, chainIdValue) => {
    setWeb3(web3Instance)
    setAccount(accountAddr)
    setProvider(providerInstance)
    setChainId(chainIdValue)
    // 清除断开标记，允许自动连接
    localStorage.removeItem('wallet_disconnected')
  }

  const handleDisconnect = () => {
    setWeb3(null)
    setAccount('')
    setProvider(null)
    setChainId(null)
    setContractInstances(null)
    setActiveTab('wallet')
    // 标记为已断开，刷新后不再自动连接
    localStorage.setItem('wallet_disconnected', 'true')
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <AiOutlineLineChart size={28} />
            <h1>ZSCore Manager</h1>
          </div>
          <div className={styles.accountInfo}>
            {account ? (
              <>
                <div className={styles.address}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                {chainId !== 56n && (
                  <div className={styles.warning}>
                    ⚠️ 请切换到BSC主网
                  </div>
                )}
              </>
            ) : (
              <div className={styles.notConnected}>未连接钱包</div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {!web3 ? (
            <WalletConnect onConnect={handleConnect} />
          ) : (
            <>
              {chainId !== 56n ? (
                <div className={styles.chainWarning}>
                  <h2>⚠️ 网络错误</h2>
                  <p>请连接到 BSC Mainnet (Chain ID: 56)</p>
                  <p className={styles.smallText}>
                    ZSCore: 0x6aF6Ac03f0B85DbdC8bF875417188DB5c53B8791
                  </p>
                </div>
              ) : (
                <>
                  <nav className={styles.nav}>
                    <button
                      className={activeTab === 'wallet' ? styles.active : ''}
                      onClick={() => setActiveTab('wallet')}
                    >
                      <AiOutlineWallet size={20} />
                      <span>钱包信息</span>
                    </button>
                    <button
                      className={activeTab === 'nodes' ? styles.active : ''}
                      onClick={() => setActiveTab('nodes')}
                    >
                      <AiOutlineTeam size={20} />
                      <span>节点管理</span>
                    </button>
                    <button
                      className={activeTab === 'lp' ? styles.active : ''}
                      onClick={() => setActiveTab('lp')}
                    >
                      <AiOutlineGift size={20} />
                      <span>LP分红</span>
                    </button>
                    <button
                      className={activeTab === 'distribute' ? styles.active : ''}
                      onClick={() => setActiveTab('distribute')}
                    >
                      <AiOutlineSetting size={20} />
                      <span>分发管理</span>
                    </button>
                  </nav>

                  <div className={styles.content}>
                    {activeTab === 'wallet' && (
                      <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
                    )}
                    {activeTab === 'nodes' && (
                      <NodeManagement wallet={web3} contracts={contractInstances} />
                    )}
                    {activeTab === 'lp' && (
                      <LPManagement wallet={web3} contracts={contractInstances} />
                    )}
                    {activeTab === 'distribute' && (
                      <Distribute wallet={web3} contracts={contractInstances} />
                    )}
                  </div>

                  {activeTab !== 'wallet' && (
                    <div className={styles.info}>
                      <QueryInfo contracts={contractInstances} />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>ZSCore Manager © 2024 - BSC Mainnet</p>
      </footer>
    </div>
  )
}

export default App

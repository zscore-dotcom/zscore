import { useState, useEffect } from 'react'
import { AiOutlineLoading3Quarters, AiOutlineLogout, AiOutlineDownload } from 'react-icons/ai'
import { detectAvailableWallets, connectWallet, WALLETS } from '../utils/walletDetector'
import styles from './WalletConnect.module.css'

function WalletConnect({ onConnect, onDisconnect }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableWallets, setAvailableWallets] = useState([])
  const [connectingWalletId, setConnectingWalletId] = useState(null)

  useEffect(() => {
    // 检测可用的钱包
    const wallets = detectAvailableWallets()
    setAvailableWallets(wallets)
    
    // 如果检测到钱包但列表为空，可能是钱包刚安装，延迟检测
    if (wallets.length === 0) {
      const timer = setTimeout(() => {
        const retryWallets = detectAvailableWallets()
        setAvailableWallets(retryWallets)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleConnectWallet = async (walletId) => {
    setLoading(true)
    setConnectingWalletId(walletId)
    setError('')

    try {
      const result = await connectWallet(walletId)
      onConnect(result.web3, result.account, result.provider, result.chainId)
    } catch (err) {
      console.error('连接钱包失败:', err)
      setError(err.message || '连接失败，请重试')
    } finally {
      setLoading(false)
      setConnectingWalletId(null)
    }
  }

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect()
    }
  }

  const handleDownloadWallet = (wallet) => {
    window.open(wallet.downloadUrl, '_blank')
  }

  // 如果已连接，显示断开按钮
  if (onDisconnect) {
    return (
      <div className={styles.walletConnect}>
        <div className={styles.card}>
          <h2>🔐 钱包连接</h2>
          <div className={styles.connectedSection}>
            <div className={styles.success}>
              ✓ 钱包已连接
            </div>
            <button onClick={handleDisconnect} className={styles.disconnectButton}>
              <AiOutlineLogout size={16} />
              断开连接
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.walletConnect}>
      <div className={styles.card}>
        <h2>🔐 钱包连接</h2>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div className={styles.loading}>
            <AiOutlineLoading3Quarters className={styles.spinner} />
            <p>正在连接钱包...</p>
          </div>
        ) : (
          <div className={styles.connectSection}>
            <p className={styles.description}>
              选择您的钱包进行连接
            </p>
            
            {availableWallets.length > 0 ? (
              <div className={styles.walletList}>
                {availableWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnectWallet(wallet.id)}
                    className={styles.walletButton}
                    disabled={loading}
                  >
                    <span className={styles.walletIcon}>{wallet.icon}</span>
                    <span className={styles.walletName}>{wallet.name}</span>
                    {connectingWalletId === wallet.id && (
                      <AiOutlineLoading3Quarters className={styles.buttonSpinner} />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.noWallets}>
                <p>未检测到已安装的钱包</p>
                <p className={styles.hint}>请安装以下任一钱包扩展：</p>
              </div>
            )}
            
            {/* 显示所有支持的钱包，未安装的显示下载按钮 */}
            <div className={styles.allWallets}>
              <p className={styles.sectionTitle}>支持的钱包</p>
              <div className={styles.walletGrid}>
                {Object.values(WALLETS)
                  .filter(wallet => wallet.id !== 'generic') // 过滤掉通用钱包（只在检测到时显示）
                  .map((wallet) => {
                    const isInstalled = availableWallets.some(w => w.id === wallet.id)
                    return (
                      <div key={wallet.id} className={styles.walletItem}>
                        <span className={styles.walletIcon}>{wallet.icon}</span>
                        <span className={styles.walletName}>{wallet.name}</span>
                        {isInstalled ? (
                          <span className={styles.installedBadge}>已安装</span>
                        ) : wallet.downloadUrl ? (
                          <button
                            onClick={() => handleDownloadWallet(wallet)}
                            className={styles.downloadButton}
                            title={`下载 ${wallet.name}`}
                          >
                            <AiOutlineDownload size={14} />
                          </button>
                        ) : (
                          <span className={styles.notAvailable}>未安装</span>
                        )}
                      </div>
                    )
                  })}
              </div>
              {/* 如果检测到通用钱包，显示提示 */}
              {availableWallets.some(w => w.id === 'generic') && (
                <div className={styles.genericWalletNote}>
                  <p>已检测到其他兼容的钱包扩展</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.infoCard}>
        <h3>📋 使用说明</h3>
        <ul>
          <li>请确保您的钱包已安装并配置好 BSC 主网</li>
          <li>需要 Owner 或 Manager 权限才能执行管理操作</li>
          <li>所有操作均在链上执行，请谨慎操作</li>
          <li>所有操作都是真实的，会产生实际费用</li>
        </ul>
      </div>
    </div>
  )
}

export default WalletConnect

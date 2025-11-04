import { useState, useEffect } from 'react'
import { AiOutlineReload } from 'react-icons/ai'
import styles from './QueryInfo.module.css'

function QueryInfo({ contracts }) {
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState('')
  const [smallNodeLength, setSmallNodeLength] = useState('')
  const [bigNodeLength, setBigNodeLength] = useState('')
  const [lpLength, setLpLength] = useState('')
  const [shareAmount, setShareAmount] = useState('')
  const [burnAmount, setBurnAmount] = useState('')

  const fetchData = async () => {
    if (!contracts) return

    setLoading(true)
    try {
      // 查询价格
      const priceResult = await contracts.zsCore.methods.getPrice().call()
      setPrice((Number(priceResult) / 1e8).toFixed(6))

      // 查询节点数量
      const smallNodes = await contracts.zsCore.methods.getNodeLength(0).call()
      const bigNodes = await contracts.zsCore.methods.getNodeLength(1).call()
      setSmallNodeLength(smallNodes.toString())
      setBigNodeLength(bigNodes.toString())

      // 查询LP用户数量
      const lpCount = await contracts.zsCore.methods.getlpGroupLength().call()
      setLpLength(lpCount.toString())

      // 查询LP分红和销毁信息
      const lpShareInfo = await contracts.zsCore.methods.getLpShareAndBurnInfo().call()
      // Web3.js 可能返回对象或数组，兼容两种格式
      const share = lpShareInfo.shareAmount || lpShareInfo[0] || '0'
      const burn = lpShareInfo.burnAmount || lpShareInfo[1] || '0'
      // Token数量需要除以10^18转换为可读格式
      const shareFormatted = (Number(share) / 1e18).toFixed(6)
      const burnFormatted = (Number(burn) / 1e18).toFixed(6)
      setShareAmount(shareFormatted)
      setBurnAmount(burnFormatted)
    } catch (error) {
      console.error('查询失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contracts) {
      fetchData()
    }
  }, [contracts])

  return (
    <div className={styles.queryInfo}>
      <div className={styles.header}>
        <h3>📊 合约信息</h3>
        <button onClick={fetchData} disabled={loading} className={styles.refreshButton}>
          <AiOutlineReload className={loading ? styles.spinning : ''} size={18} />
          刷新
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.infoItem}>
          <div className={styles.label}>ZS/USDT 价格</div>
          <div className={styles.value}>
            {price ? `$${price}` : '-'}
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.label}>小节点数量</div>
          <div className={styles.value}>
            {smallNodeLength || '-'}
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.label}>大节点数量</div>
          <div className={styles.value}>
            {bigNodeLength || '-'}
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.label}>LP总人数</div>
          <div className={styles.value}>
            {lpLength || '-'}
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.label}>大LP收益数量</div>
          <div className={styles.value}>
            {shareAmount ? Number(shareAmount).toLocaleString('zh-CN') : '-'}
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.label}>大LP销毁数量</div>
          <div className={styles.value}>
            {burnAmount ? Number(burnAmount).toLocaleString('zh-CN') : '-'}
          </div>
        </div>
      </div>

      <div className={styles.contractAddresses}>
        <h4>合约地址</h4>
        <div className={styles.addressList}>
          <div className={styles.addressItem}>
            <span className={styles.addressLabel}>ZSCore:</span>
            <span className={styles.addressValue}>{contracts?.addresses?.ZSCore}</span>
          </div>
          <div className={styles.addressItem}>
            <span className={styles.addressLabel}>ZSSharePool:</span>
            <span className={styles.addressValue}>{contracts?.addresses?.ZSSharePool}</span>
          </div>
          <div className={styles.addressItem}>
            <span className={styles.addressLabel}>ZSRelayVault:</span>
            <span className={styles.addressValue}>{contracts?.addresses?.ZSRelayVault}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryInfo

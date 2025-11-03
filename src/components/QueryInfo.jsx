import { useState, useEffect } from 'react'
import { AiOutlineReload } from 'react-icons/ai'
import styles from './QueryInfo.module.css'

function QueryInfo({ contracts }) {
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState('')
  const [smallNodeLength, setSmallNodeLength] = useState('')
  const [bigNodeLength, setBigNodeLength] = useState('')
  const [lpLength, setLpLength] = useState('')

  const fetchData = async () => {
    if (!contracts) return

    setLoading(true)
    try {
      // 查询价格
      const priceResult = await contracts.zsCore.methods.getPrice().call()
      setPrice((Number(priceResult) / 1e16).toFixed(6))

      // 查询节点数量
      const smallNodes = await contracts.zsCore.methods.getNodeLength(0).call()
      const bigNodes = await contracts.zsCore.methods.getNodeLength(1).call()
      setSmallNodeLength(smallNodes.toString())
      setBigNodeLength(bigNodes.toString())

      // 查询LP数量
      const lpCount = await contracts.zsCore.methods.getlpGroupLength().call()
      setLpLength(lpCount.toString())
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

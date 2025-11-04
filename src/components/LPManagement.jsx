import { useState, useEffect } from 'react'
import { AiOutlineDollarCircle as CoinsIcon, AiOutlineExport as ExternalIcon } from 'react-icons/ai'
import CustomSelect from './CustomSelect'
import styles from './LPManagement.module.css'

function LPManagement({ wallet, contracts }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenType, setTokenType] = useState('address') // 'address' or 'zero'
  const [account, setAccount] = useState('')

  useEffect(() => {
    const getAccount = async () => {
      if (wallet) {
        const accounts = await wallet.eth.getAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      }
    }
    getAccount()
  }, [wallet])

  const handleLPShareZSInLp = async () => {
    console.log('=== [LP分红提取] 开始执行 ===')
    console.log('[LP分红提取] 1. 检查前置条件...')
    
    if (!contracts || !wallet || !account) {
      console.error('[LP分红提取] ❌ 前置条件检查失败: 合约、钱包或账户未就绪')
      console.log('[LP分红提取] - contracts:', !!contracts)
      console.log('[LP分红提取] - wallet:', !!wallet)
      console.log('[LP分红提取] - account:', account)
      setMessage('⚠️ 请先连接钱包')
      return
    }
    
    console.log('[LP分红提取] ✅ 前置条件检查通过')
    console.log('[LP分红提取] 2. 准备执行提取操作...')
    console.log('[LP分红提取] - account (from):', account)
    console.log('[LP分红提取] - 方法: lpShareZSInLp()')
    console.log('[LP分红提取] - 参数: 无参数')

    setLoading(true)
    setMessage('')

    try {
      console.log('[LP分红提取] 3. 构建交易方法...')
      const method = contracts.zsCore.methods.lpShareZSInLp()
      console.log('[LP分红提取] - 方法已构建:', method)
      
      console.log('[LP分红提取] 4. 发送交易到区块链...')
      console.log('[LP分红提取] - from:', account)
      
      const tx = await method.send({ from: account })
      
      console.log('[LP分红提取] 5. 交易已提交')
      console.log('[LP分红提取] - 交易哈希:', tx.transactionHash)
      console.log('[LP分红提取] - 区块号:', tx.blockNumber)
      console.log('[LP分红提取] - Gas使用量:', tx.gasUsed)
      console.log('[LP分红提取] - 完整交易对象:', tx)
      
      setMessage('⏳ 交易已提交，等待确认...')
      setMessage(`✅ LP分红提取成功！交易哈希: ${tx.transactionHash.slice(0, 10)}...`)
      
      console.log('[LP分红提取] ✅ 操作成功完成')
    } catch (error) {
      console.error('[LP分红提取] ❌ 执行失败')
      console.error('[LP分红提取] - 错误类型:', error.constructor.name)
      console.error('[LP分红提取] - 错误消息:', error.message)
      console.error('[LP分红提取] - 错误代码:', error.code)
      console.error('[LP分红提取] - 完整错误对象:', error)
      
      if (error.data) {
        console.error('[LP分红提取] - 错误数据:', error.data)
      }
      if (error.reason) {
        console.error('[LP分红提取] - 错误原因:', error.reason)
      }
      
      setMessage(`❌ 提取失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
      console.log('[LP分红提取] === 执行结束 ===')
    }
  }

  const handleSkim = async (e) => {
    e.preventDefault()

    console.log('=== [清理Token] 开始执行 ===')
    console.log('[清理Token] 1. 检查前置条件...')
    
    if (!contracts || !wallet || !account) {
      console.error('[清理Token] ❌ 前置条件检查失败: 合约、钱包或账户未就绪')
      console.log('[清理Token] - contracts:', !!contracts)
      console.log('[清理Token] - wallet:', !!wallet)
      console.log('[清理Token] - account:', account)
      setMessage('⚠️ 请先连接钱包')
      return
    }
    
    console.log('[清理Token] ✅ 前置条件检查通过')
    console.log('[清理Token] 2. 处理Token类型和地址...')
    console.log('[清理Token] - tokenType:', tokenType)
    console.log('[清理Token] - tokenAddress (原始):', tokenAddress)

    const addressToUse = tokenType === 'zero' 
      ? '0x0000000000000000000000000000000000000000'
      : tokenAddress

    console.log('[清理Token] - addressToUse (处理后):', addressToUse)
    console.log('[清理Token] - 是否为BNB (零地址):', addressToUse === '0x0000000000000000000000000000000000000000')

    if (tokenType === 'address' && (!addressToUse || !/^0x[a-fA-F0-9]{40}$/.test(addressToUse))) {
      console.error('[清理Token] ❌ 地址格式验证失败:', addressToUse)
      setMessage('❌ 请输入有效的token地址')
      return
    }
    
    console.log('[清理Token] ✅ 地址验证通过')
    console.log('[清理Token] 3. 准备执行清理操作...')
    console.log('[清理Token] - account (from):', account)
    console.log('[清理Token] - 方法: skim(address)')
    console.log('[清理Token] - token地址参数:', addressToUse)

    setLoading(true)
    setMessage('')

    try {
      console.log('[清理Token] 4. 构建交易方法...')
      const method = contracts.zsCore.methods.skim(addressToUse)
      console.log('[清理Token] - 方法已构建:', method)
      
      console.log('[清理Token] 5. 发送交易到区块链...')
      console.log('[清理Token] - 参数:', { token: addressToUse, from: account })
      
      const tx = await method.send({ from: account })
      
      console.log('[清理Token] 6. 交易已提交')
      console.log('[清理Token] - 交易哈希:', tx.transactionHash)
      console.log('[清理Token] - 区块号:', tx.blockNumber)
      console.log('[清理Token] - Gas使用量:', tx.gasUsed)
      console.log('[清理Token] - 完整交易对象:', tx)
      
      setMessage(`⏳ 清理${tokenType === 'zero' ? 'BNB' : 'Token'}中，等待确认...`)
      setMessage(`✅ 清理成功！交易哈希: ${tx.transactionHash.slice(0, 10)}...`)
      
      console.log('[清理Token] ✅ 操作成功完成')
      
      // 重置表单
      setTokenAddress('')
    } catch (error) {
      console.error('[清理Token] ❌ 执行失败')
      console.error('[清理Token] - 错误类型:', error.constructor.name)
      console.error('[清理Token] - 错误消息:', error.message)
      console.error('[清理Token] - 错误代码:', error.code)
      console.error('[清理Token] - 完整错误对象:', error)
      
      if (error.data) {
        console.error('[清理Token] - 错误数据:', error.data)
      }
      if (error.reason) {
        console.error('[清理Token] - 错误原因:', error.reason)
      }
      
      setMessage(`❌ 清理失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
      console.log('[清理Token] === 执行结束 ===')
    }
  }

  return (
    <div className={styles.lpManagement}>
      <h2>💰 LP分红管理</h2>
      <p className={styles.subtitle}>仅 Manager 可以执行LP相关操作</p>

      {message && (
        <div className={message.includes('❌') || message.includes('⚠️') ? styles.error : styles.success}>
          {message}
        </div>
      )}

      <div className={styles.actions}>
        <div className={styles.actionCard}>
          <div className={styles.actionHeader}>
            <CoinsIcon className={styles.icon} />
            <h3>提取LP分红</h3>
          </div>
          <p className={styles.description}>
            从底池pair里面拿出收益
          </p>
          <button 
            onClick={handleLPShareZSInLp} 
            disabled={loading}
            className={styles.actionButton}
          >
            {loading ? '处理中...' : '执行提取'}
          </button>
        </div>

        <div className={styles.actionCard}>
          <div className={styles.actionHeader}>
            <ExternalIcon className={styles.icon} />
            <h3>清理Token</h3>
          </div>
          <p className={styles.description}>
            将ZS地址多余的其它token清理到清理池里面
          </p>
          <form onSubmit={handleSkim} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Token类型</label>
              <CustomSelect
                value={tokenType}
                onChange={(value) => {
                  setTokenType(value)
                  setTokenAddress('')
                }}
                options={[
                  { value: 'zero', label: 'BNB' },
                  { value: 'address', label: 'ERC20 Token' }
                ]}
                placeholder="请选择Token类型"
              />
            </div>
            
            {tokenType === 'address' && (
              <div className={styles.formGroup}>
                <label>Token地址</label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
            )}

            <button type="submit" disabled={loading} className={styles.cleanButton}>
              {loading ? '处理中...' : '执行清理'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LPManagement

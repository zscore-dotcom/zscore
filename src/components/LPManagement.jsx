import { useState, useEffect, useCallback, useRef } from 'react'
import { AiOutlineDollarCircle as CoinsIcon, AiOutlineExport as ExternalIcon, AiOutlineClose } from 'react-icons/ai'
import CustomSelect from './CustomSelect'
import styles from './LPManagement.module.css'

function LPManagement({ wallet, contracts }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenType, setTokenType] = useState('address') // 'address' or 'zero'
  const [account, setAccount] = useState('')
  const [lastEarnTime, setLastEarnTime] = useState('')
  const [txHash, setTxHash] = useState('')
  const txHashTimerRef = useRef(null)

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

  // 获取最后收益时间戳并转换为北京时间的函数
  const fetchLastEarnTimestamp = useCallback(async () => {
    console.log('[最后收益时间] === 开始获取最后收益时间 ===')
    console.log('[最后收益时间] - contracts存在:', !!contracts)
    console.log('[最后收益时间] - zsCore存在:', !!contracts?.zsCore)
    
    if (!contracts?.zsCore) {
      console.log('[最后收益时间] ⚠️ 合约未就绪，清空时间显示')
      setLastEarnTime('')
      return
    }

    try {
      const timestamp = await contracts.zsCore.methods.lastestEarnTimestamp().call()
      console.log('[最后收益时间] 原始时间戳:', timestamp, '类型:', typeof timestamp)
      const timestampNum = Number(timestamp)
      console.log('[最后收益时间] 转换后的时间戳:', timestampNum)
      
      if (timestampNum === 0) {
        console.log('[最后收益时间] 时间戳为0，显示"暂无记录"')
        setLastEarnTime('暂无记录')
        console.log('[最后收益时间] === 获取结束（无记录）===')
        return
      }

      // 转换为北京时间 (UTC+8)
      // 时间戳是秒级，需要乘以1000转换为毫秒
      const date = new Date(timestampNum * 1000)
      console.log('[最后收益时间] 创建的Date对象:', date)
      
      // 使用 toLocaleString 转换为北京时间，精确到秒
      const beijingTime = date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      console.log('[最后收益时间] 转换后的北京时间:', beijingTime)
      console.log('[最后收益时间] ✅ 获取成功')
      console.log('[最后收益时间] === 获取结束（成功）===')

      setLastEarnTime(beijingTime)
    } catch (error) {
      console.error('[最后收益时间] ❌ 获取失败:', error)
      console.error('[最后收益时间] - 错误类型:', error.constructor.name)
      console.error('[最后收益时间] - 错误消息:', error.message)
      console.error('[最后收益时间] - 完整错误对象:', error)
      console.log('[最后收益时间] === 获取结束（失败）===')
      setLastEarnTime('获取失败')
    }
  }, [contracts])

  // 获取最后收益时间戳并转换为北京时间
  useEffect(() => {
    fetchLastEarnTimestamp()
    // 每隔30秒刷新一次
    const interval = setInterval(fetchLastEarnTimestamp, 30000)
    
    return () => clearInterval(interval)
  }, [fetchLastEarnTimestamp])

  // 自动清除交易哈希（15秒后）
  useEffect(() => {
    // 清除之前的定时器
    if (txHashTimerRef.current) {
      clearTimeout(txHashTimerRef.current)
      txHashTimerRef.current = null
    }

    // 如果有交易哈希，设置15秒后自动清除
    if (txHash) {
      txHashTimerRef.current = setTimeout(() => {
        setTxHash('')
        txHashTimerRef.current = null
      }, 15000) // 15秒
    }

    // 清理函数：组件卸载或txHash变化时清除定时器
    return () => {
      if (txHashTimerRef.current) {
        clearTimeout(txHashTimerRef.current)
        txHashTimerRef.current = null
      }
    }
  }, [txHash])

  // 手动清除交易哈希
  const handleCloseTxHash = () => {
    if (txHashTimerRef.current) {
      clearTimeout(txHashTimerRef.current)
      txHashTimerRef.current = null
    }
    setTxHash('')
  }

  const handleLPShareZSInLp = async () => {
    console.log('=== [LP分红提取] 开始执行 ===')
    console.log('[LP分红提取] 时间戳:', new Date().toISOString())
    
    // 1. 检查前置条件
    console.log('[LP分红提取] 1. 检查前置条件...')
    console.log('[LP分红提取] - contracts存在:', !!contracts)
    console.log('[LP分红提取] - wallet存在:', !!wallet)
    console.log('[LP分红提取] - account存在:', !!account)
    console.log('[LP分红提取] - account值:', account)
    
    if (!contracts || !wallet || !account) {
      console.error('[LP分红提取] ❌ 前置条件检查失败: 合约、钱包或账户未就绪')
      setMessage('⚠️ 请先连接钱包')
      return
    }
    
    console.log('[LP分红提取] ✅ 前置条件检查通过')
    
    // 2. 检查合约实例
    console.log('[LP分红提取] 2. 检查合约实例...')
    console.log('[LP分红提取] - contracts.zsCore存在:', !!contracts.zsCore)
    if (contracts.zsCore) {
      console.log('[LP分红提取] - 合约地址:', contracts.zsCore.options.address)
    }
    
    if (!contracts.zsCore) {
      console.error('[LP分红提取] ❌ ZSCore合约实例不存在')
      setMessage('❌ 合约未初始化')
      return
    }
    
    // 3. 检查网络和账户信息
    console.log('[LP分红提取] 3. 检查网络和账户信息...')
    try {
      const chainId = await wallet.eth.getChainId()
      console.log('[LP分红提取] - 当前链ID:', chainId.toString())
      
      const balance = await wallet.eth.getBalance(account)
      const balanceInBNB = wallet.utils.fromWei(balance, 'ether')
      console.log('[LP分红提取] - 账户余额:', balanceInBNB, 'BNB')
      console.log('[LP分红提取] - 账户余额(原始):', balance.toString())
      
      if (Number(balanceInBNB) < 0.001) {
        console.warn('[LP分红提取] ⚠️ 账户余额可能不足以支付Gas费用')
      }
    } catch (error) {
      console.error('[LP分红提取] ❌ 获取网络信息失败:', error)
    }
    
    // 4. 准备执行提取操作
    console.log('[LP分红提取] 4. 准备执行提取操作...')
    console.log('[LP分红提取] - 调用账户 (from):', account)
    console.log('[LP分红提取] - 方法名: lpShareZSInLp()')
    console.log('[LP分红提取] - 方法参数: 无参数')

    setLoading(true)
    setMessage('')
    // 清空之前的交易哈希和定时器
    if (txHashTimerRef.current) {
      clearTimeout(txHashTimerRef.current)
      txHashTimerRef.current = null
    }
    setTxHash('')

    try {
      // 5. 构建交易方法
      console.log('[LP分红提取] 5. 构建交易方法...')
      const method = contracts.zsCore.methods.lpShareZSInLp()
      console.log('[LP分红提取] - 方法对象:', method)
      console.log('[LP分红提取] - 方法编码:', method.encodeABI())
      
      // 6. 估算Gas
      console.log('[LP分红提取] 6. 估算Gas费用...')
      try {
        const gasEstimate = await method.estimateGas({ from: account })
        console.log('[LP分红提取] - 预估Gas:', gasEstimate.toString())
        
        const gasPrice = await wallet.eth.getGasPrice()
        const gasPriceInGwei = wallet.utils.fromWei(gasPrice, 'gwei')
        console.log('[LP分红提取] - Gas价格:', gasPriceInGwei, 'Gwei')
        console.log('[LP分红提取] - Gas价格(原始):', gasPrice.toString())
        
        const estimatedCost = BigInt(gasEstimate) * BigInt(gasPrice)
        const estimatedCostInBNB = wallet.utils.fromWei(estimatedCost.toString(), 'ether')
        console.log('[LP分红提取] - 预估费用:', estimatedCostInBNB, 'BNB')
      } catch (gasError) {
        console.warn('[LP分红提取] ⚠️ Gas估算失败 (可能是权限问题):', gasError.message)
      }
      
      // 7. 发送交易到区块链
      console.log('[LP分红提取] 7. 发送交易到区块链...')
      console.log('[LP分红提取] - from:', account)
      console.log('[LP分红提取] - 发送时间:', new Date().toISOString())
      
      const startTime = Date.now()
      const tx = await method.send({ from: account })
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 8. 交易提交成功
      console.log('[LP分红提取] 8. 交易已提交 ✅')
      console.log('[LP分红提取] - 交易哈希:', tx.transactionHash)
      console.log('[LP分红提取] - 完整交易哈希:', tx.transactionHash)
      console.log('[LP分红提取] - 区块号:', tx.blockNumber)
      console.log('[LP分红提取] - Gas使用量:', tx.gasUsed)
      console.log('[LP分红提取] - Gas限制:', tx.gas)
      console.log('[LP分红提取] - 交易索引:', tx.transactionIndex)
      console.log('[LP分红提取] - 交易状态:', tx.status)
      console.log('[LP分红提取] - 耗时:', duration, 'ms')
      console.log('[LP分红提取] - 完整交易对象:', JSON.stringify(tx, null, 2))
      
      // 9. 获取交易详情
      console.log('[LP分红提取] 9. 获取交易详情...')
      try {
        const txReceipt = await wallet.eth.getTransactionReceipt(tx.transactionHash)
        console.log('[LP分红提取] - 交易回执:', JSON.stringify(txReceipt, null, 2))
        console.log('[LP分红提取] - 交易状态 (回执):', txReceipt.status ? '成功' : '失败')
        console.log('[LP分红提取] - 实际Gas使用:', txReceipt.gasUsed.toString())
      } catch (receiptError) {
        console.warn('[LP分红提取] ⚠️ 获取交易回执失败 (可能还未被打包):', receiptError.message)
      }
      
      // 保存交易哈希（确保转换为字符串类型）
      const hashString = String(tx.transactionHash || '')
      setTxHash(hashString)
      setMessage('✅ LP分红提取成功！')
      
      // 10. 刷新最后收益时间
      console.log('[LP分红提取] 10. 刷新最后收益时间...')
      await fetchLastEarnTimestamp()
      
      console.log('[LP分红提取] ✅ 操作成功完成')
      console.log('[LP分红提取] === 执行结束（成功）===')
    } catch (error) {
      console.error('[LP分红提取] ❌ 执行失败')
      console.error('[LP分红提取] - 错误发生时间:', new Date().toISOString())
      console.error('[LP分红提取] - 错误类型:', error.constructor.name)
      
      // 转换错误消息为中文
      let errorMessageZh = error.message || '未知错误'
      let errorCodeZh = ''
      
      // 检查是否为交易超时错误
      const isTransactionTimeout = 
        error.constructor.name === 'TransactionBlockTimeoutError' ||
        error.code === 432 ||
        (error.message && (
          error.message.includes('not mined within') ||
          error.message.includes('Transaction started at') ||
          error.message.includes('可能仍在等待挖出')
        ))
      
      // 提取交易哈希（如果错误消息中包含）
      let txHash = null
      if (error.message) {
        const txHashMatch = error.message.match(/Transaction Hash:\s*([0-9a-fA-F]{66}|[0-9a-fA-F]{64})/i)
        if (txHashMatch) {
          txHash = String(txHashMatch[1]) // 确保转换为字符串
        }
      }
      
      // 如果错误对象中包含交易哈希，也提取出来
      if (!txHash && error.transactionHash) {
        txHash = String(error.transactionHash)
      }
      if (!txHash && error.receipt && error.receipt.transactionHash) {
        txHash = String(error.receipt.transactionHash)
      }
      
      // 如果提取到交易哈希，保存到 state 中
      if (txHash) {
        setTxHash(txHash)
      }
      
      // 根据错误类型、代码和消息转换为中文
      if (isTransactionTimeout) {
        // 交易超时错误的中文说明
        errorMessageZh = '交易超时：交易在62个区块内未被挖出，但交易可能仍在等待确认。请确保交易已正确发送，并且该账户没有其他待处理的交易。交易可能仍在等待挖出！'
        if (txHash && txHash !== 'not available') {
          errorMessageZh += ` 交易哈希: ${txHash.slice(0, 10)}...`
        }
        errorCodeZh = '交易确认超时（交易可能仍在处理中）'
      } else if (error.message) {
        if (error.message.includes('User denied transaction signature') || 
            error.message.includes('User rejected the request') ||
            error.message.includes('用户拒绝')) {
          errorMessageZh = '用户拒绝了交易签名'
        } else if (error.message.includes('insufficient funds') || 
                   error.message.includes('余额不足')) {
          errorMessageZh = '账户余额不足，无法支付Gas费用'
        } else if (error.message.includes('nonce') && error.message.includes('low')) {
          errorMessageZh = '交易nonce过低，请稍后重试'
        } else if (error.message.includes('replacement transaction underpriced')) {
          errorMessageZh = '替换交易Gas价格过低'
        } else if (error.message.includes('intrinsic gas too low')) {
          errorMessageZh = 'Gas设置过低'
        } else if (error.message.includes('execution reverted')) {
          errorMessageZh = '合约执行被回滚'
        } else if (error.message.includes('network') || error.message.includes('网络')) {
          errorMessageZh = '网络连接错误'
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
          errorMessageZh = '交易超时'
        }
      }
      
      console.error('[LP分红提取] - 错误消息 (英文):', error.message)
      console.error('[LP分红提取] - 错误消息 (中文):', errorMessageZh)
      console.error('[LP分红提取] - 错误代码:', error.code)
      
      if (error.code) {
        console.error('[LP分红提取] - 错误代码说明:')
        switch (error.code) {
          case 4001:
            errorCodeZh = '用户拒绝交易'
            console.error('[LP分红提取]   - 用户拒绝交易')
            break
          case 4100:
            errorCodeZh = '未授权账户'
            console.error('[LP分红提取]   - 未授权账户')
            break
          case 4200:
            errorCodeZh = '不支持的操作'
            console.error('[LP分红提取]   - 不支持的操作')
            break
          case 4900:
            errorCodeZh = '未连接钱包'
            console.error('[LP分红提取]   - 未连接钱包')
            break
          case 4901:
            errorCodeZh = '未解锁钱包'
            console.error('[LP分红提取]   - 未解锁钱包')
            break
          case 100:
            errorCodeZh = '交易签名被拒绝'
            console.error('[LP分红提取]   - 交易签名被拒绝')
            break
          case 432:
            errorCodeZh = '交易确认超时（交易可能仍在处理中）'
            console.error('[LP分红提取]   - 交易确认超时（交易可能仍在处理中）')
            break
          default:
            errorCodeZh = `其他错误代码: ${error.code}`
            console.error('[LP分红提取]   - 其他错误代码:', error.code)
        }
      }
      
      if (error.data) {
        console.error('[LP分红提取] - 错误数据:', error.data)
        if (typeof error.data === 'string') {
          console.error('[LP分红提取] - 错误数据 (字符串):', error.data)
        } else if (typeof error.data === 'object') {
          console.error('[LP分红提取] - 错误数据 (对象):', JSON.stringify(error.data, null, 2))
        }
      }
      if (error.reason) {
        console.error('[LP分红提取] - 错误原因:', error.reason)
      }
      
      // 确定最终显示的错误信息（优先使用中文的错误代码说明，其次使用中文错误消息）
      const finalErrorMessage = errorCodeZh || errorMessageZh
      console.error('[LP分红提取] - 最终错误信息:', finalErrorMessage)
      
      setMessage(`❌ 提取失败: ${finalErrorMessage}`)
      
      console.log('[LP分红提取] === 执行结束（失败）===')
    } finally {
      setLoading(false)
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
    // 清空之前的交易哈希和定时器
    if (txHashTimerRef.current) {
      clearTimeout(txHashTimerRef.current)
      txHashTimerRef.current = null
    }
    setTxHash('')

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
      
      // 保存交易哈希（确保转换为字符串类型）
      const hashString = String(tx.transactionHash || '')
      setTxHash(hashString)
      setMessage(`✅ 清理成功！`)
      
      console.log('[清理Token] ✅ 操作成功完成')
      
      // 重置表单
      setTokenAddress('')
    } catch (error) {
      console.error('[清理Token] ❌ 执行失败')
      console.error('[清理Token] - 错误类型:', error.constructor.name)
      console.error('[清理Token] - 错误消息:', error.message)
      console.error('[清理Token] - 错误代码:', error.code)
      console.error('[清理Token] - 完整错误对象:', error)
      
      // 提取交易哈希（如果错误中包含）
      let txHashFromError = null
      if (error.message) {
        const txHashMatch = error.message.match(/Transaction Hash:\s*([0-9a-fA-F]{66}|[0-9a-fA-F]{64})/i)
        if (txHashMatch) {
          txHashFromError = String(txHashMatch[1]) // 确保转换为字符串
        }
      }
      if (!txHashFromError && error.transactionHash) {
        txHashFromError = String(error.transactionHash)
      }
      if (!txHashFromError && error.receipt && error.receipt.transactionHash) {
        txHashFromError = String(error.receipt.transactionHash)
      }
      
      // 如果提取到交易哈希，保存到 state 中
      if (txHashFromError) {
        setTxHash(txHashFromError)
      }
      
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
      {lastEarnTime && (
        <p className={styles.timeInfo}>最后收益时间（北京时间）: {lastEarnTime}</p>
      )}

      {message && (
        <div className={message.includes('❌') || message.includes('⚠️') ? styles.error : styles.success}>
          {message}
        </div>
      )}

      {txHash && (
        <div className={styles.txHashContainer}>
          <div className={styles.txHashHeader}>
            <div className={styles.txHashLabel}>交易哈希:</div>
            <button 
              onClick={handleCloseTxHash}
              className={styles.closeButton}
              aria-label="关闭"
            >
              <AiOutlineClose size={18} />
            </button>
          </div>
          <a 
            href={`https://bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.txHashLink}
          >
            {txHash}
          </a>
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

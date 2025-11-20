import { useState, useEffect, useRef } from 'react'
import { AiOutlineSend, AiOutlineClose } from 'react-icons/ai'
import styles from './Distribute.module.css'

function Distribute({ wallet, contracts }) {
  const [size, setSize] = useState('')
  const [bigIndex, setBigIndex] = useState('')
  const [count, setCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [account, setAccount] = useState('')
  const [lpTotal, setLpTotal] = useState(null)
  const [maxBigIndex, setMaxBigIndex] = useState(null)
  const [txHash, setTxHash] = useState('')
  const successTimerRef = useRef(null)

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

  // 查询 LP 总人数并计算 maxBigIndex
  useEffect(() => {
    const fetchLpTotal = async () => {
      if (contracts && size) {
        try {
          const lpTotalLength = await contracts.zsCore.methods.getlpGroupLength().call()
          const total = parseInt(lpTotalLength.toString())
          setLpTotal(total)
          
          const sizeNum = parseInt(size)
          if (!isNaN(sizeNum) && sizeNum > 0) {
            const maxIndex = total > 0 ? Math.ceil(total / sizeNum) - 1 : 0
            setMaxBigIndex(maxIndex)
          } else {
            setMaxBigIndex(null)
          }
        } catch (error) {
          console.error('查询 LP 人数失败:', error)
          setLpTotal(null)
          setMaxBigIndex(null)
        }
      } else {
        setLpTotal(null)
        setMaxBigIndex(null)
      }
    }
    fetchLpTotal()
  }, [contracts, size])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
    }
  }, [])

  // 手动关闭成功消息
  const handleCloseSuccess = () => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
    setMessage('')
    setTxHash('')
  }

  const handleDistribute = async (e) => {
    e.preventDefault()
    
    console.log('=== [Token分发] 开始执行 ===')
    console.log('[Token分发] 1. 检查前置条件...')
    
    if (!contracts || !wallet || !account || !contracts.helper) {
      console.error('[Token分发] ❌ 前置条件检查失败: 合约、钱包或账户未就绪')
      console.log('[Token分发] - contracts:', !!contracts)
      console.log('[Token分发] - wallet:', !!wallet)
      console.log('[Token分发] - account:', account)
      setMessage('⚠️ 请先连接钱包')
      return
    }
    
    console.log('[Token分发] ✅ 前置条件检查通过')
    console.log('[Token分发] 2. 验证参数完整性...')
    console.log('[Token分发] - size (原始):', size, typeof size)
    console.log('[Token分发] - bigIndex (原始):', bigIndex, typeof bigIndex)
    console.log('[Token分发] - count (原始):', count, typeof count)

    if (!size || !bigIndex || !count) {
      console.error('[Token分发] ❌ 参数完整性检查失败')
      console.log('[Token分发] - size存在:', !!size)
      console.log('[Token分发] - bigIndex存在:', !!bigIndex)
      console.log('[Token分发] - count存在:', !!count)
      setMessage('❌ 请填写所有参数')
      return
    }
    
    console.log('[Token分发] ✅ 参数完整性检查通过')
    console.log('[Token分发] 3. 参数类型转换...')

    const sizeNum = parseInt(size)
    const bigIndexNum = parseInt(bigIndex)
    const countNum = parseInt(count)

    console.log('[Token分发] - size (转换后):', sizeNum, typeof sizeNum)
    console.log('[Token分发] - bigIndex (转换后):', bigIndexNum, typeof bigIndexNum)
    console.log('[Token分发] - count (转换后):', countNum, typeof countNum)

    console.log('[Token分发] 4. 参数范围验证...')

    if (isNaN(sizeNum) || sizeNum <= 0 || sizeNum > 255) {
      console.error('[Token分发] ❌ size范围验证失败:', sizeNum)
      console.log('[Token分发] - size有效范围: 1-255')
      setMessage('❌ size 必须是 1-255 之间的整数')
      return
    }
    console.log('[Token分发] ✅ size范围验证通过')

    if (isNaN(bigIndexNum) || bigIndexNum < 0 || bigIndexNum > 4294967295) {
      console.error('[Token分发] ❌ bigIndex范围验证失败:', bigIndexNum)
      console.log('[Token分发] - bigIndex有效范围: 0-4294967295')
      setMessage('❌ bigIndex 必须是 0-4294967295 之间的整数')
      return
    }
    console.log('[Token分发] ✅ bigIndex范围验证通过')

    if (isNaN(countNum) || countNum < 0 || countNum > 4294967295) {
      console.error('[Token分发] ❌ count范围验证失败:', countNum)
      console.log('[Token分发] - count有效范围: 0-4294967295')
      setMessage('❌ count 必须是 0-4294967295 之间的整数')
      return
    }
    console.log('[Token分发] ✅ count范围验证通过')

    // 验证参数之间的逻辑关系
    console.log('[Token分发] 5. 验证参数之间的逻辑关系...')
    try {
      // 查询 LP 总人数
      const lpTotalLength = await contracts.zsCore.methods.getlpGroupLength().call()
      const lpTotal = parseInt(lpTotalLength.toString())
      
      console.log('[Token分发] - LP总人数:', lpTotal)
      
      // 计算 bigIndex 的最大值
      // bigIndex = ceil(LP总人数 / size) - 1，从0开始
      const maxBigIndex = lpTotal > 0 ? Math.ceil(lpTotal / sizeNum) - 1 : 0
      
      console.log('[Token分发] - size:', sizeNum)
      console.log('[Token分发] - 计算的最大 bigIndex:', maxBigIndex)
      console.log('[Token分发] - 用户输入的 bigIndex:', bigIndexNum)
      
      // 验证 bigIndex 不能超过最大值
      if (bigIndexNum > maxBigIndex) {
        console.error('[Token分发] ❌ bigIndex 超出有效范围')
        console.error('[Token分发] - bigIndex', bigIndexNum, '超出范围 [0,', maxBigIndex, ']')
        setMessage(`❌ bigIndex ${bigIndexNum} 超出范围！LP总人数: ${lpTotal}，size: ${sizeNum}，bigIndex 有效范围: 0-${maxBigIndex}`)
        return
      }
      
      // 验证：如果 LP 总人数为 0，不能分发
      if (lpTotal === 0) {
        console.error('[Token分发] ❌ LP总人数为0')
        setMessage('❌ LP总人数为 0，无法执行分发')
        return
      }
      
      // 验证：bigIndex * size 不能超过 LP 总人数
      const startIndex = bigIndexNum * sizeNum
      if (startIndex >= lpTotal) {
        console.error('[Token分发] ❌ bigIndex * size 超出 LP 总人数')
        setMessage(`❌ bigIndex(${bigIndexNum}) × size(${sizeNum}) = ${startIndex} 超出 LP 总人数(${lpTotal})`)
        return
      }
      
      console.log('[Token分发] ✅ 参数逻辑关系验证通过')
      console.log('[Token分发] - 本次分发起始索引:', startIndex)
      console.log('[Token分发] - 本次分发结束索引:', Math.min(startIndex + sizeNum, lpTotal) - 1)
    } catch (error) {
      console.error('[Token分发] ❌ 查询 LP 人数失败:', error)
      setMessage('⚠️ 无法验证参数关系，将继续尝试分发（可能失败）')
      // 继续执行，让合约层面处理错误
    }

    console.log('[Token分发] 6. 所有参数验证完成')
    console.log('[Token分发] - 最终参数值:', { size: sizeNum, bigIndex: bigIndexNum, count: countNum })
    console.log('[Token分发] - account (from):', account)

    setLoading(true)
    setMessage('')
    // 清除之前的自动清除定时器
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
    setTxHash('')

    try {
      console.log('[Token分发] 7. 构建交易方法...')
      const method = contracts.helper.methods.distribute(sizeNum, bigIndexNum, countNum)
      console.log('[Token分发] - 方法已构建:', method)
      
      console.log('[Token分发] 8. 发送交易到区块链...')
      console.log('[Token分发] - 参数:', { 
        size: sizeNum, 
        bigIndex: bigIndexNum, 
        count: countNum, 
        from: account 
      })
      
      const tx = await method.send({ from: account })
      
      console.log('[Token分发] 9. 交易已提交')
      console.log('[Token分发] - 交易哈希:', tx.transactionHash)
      console.log('[Token分发] - 区块号:', tx.blockNumber)
      console.log('[Token分发] - Gas使用量:', tx.gasUsed)
      console.log('[Token分发] - 交易状态:', tx.status)
      console.log('[Token分发] - 完整交易对象:', tx)
      
      // 确保有交易哈希
      if (!tx.transactionHash) {
        setLoading(false)
        setMessage('❌ 分发失败：未获取到交易哈希')
        console.error('[Token分发] ❌ 未获取到交易哈希')
        return
      }
      
      // 检查交易状态（优先使用 tx.status，如果不存在则通过 getTransactionReceipt 获取）
      console.log('[Token分发] 10. 检查交易状态...')
      const hashString = String(tx.transactionHash || '')
      
      // 优先使用 tx.status（method.send() 返回的对象本身就是 receipt）
      if (tx.status !== undefined) {
        console.log('[Token分发] - 使用 tx.status:', tx.status)
        if (tx.status === false || tx.status === 0) {
          setLoading(false)
          setMessage('❌ 分发失败：交易状态为失败')
          console.error('[Token分发] ❌ 交易状态检查失败，状态值:', tx.status)
          return
        }
        // 交易成功
        setTxHash(hashString)
        setMessage('success')
      } else {
        // 如果 tx.status 不存在，通过 getTransactionReceipt 获取
        console.log('[Token分发] - tx.status 不存在，通过 getTransactionReceipt 获取...')
        try {
          const txReceipt = await wallet.eth.getTransactionReceipt(tx.transactionHash)
          
          if (!txReceipt) {
            // receipt 为 null，但有 transactionHash，仍然认为成功（可能还未被打包）
            console.warn('[Token分发] ⚠️ 交易回执为 null，但交易已提交 (可能还未被打包)')
            setTxHash(hashString)
            setMessage('success')
          } else {
            console.log('[Token分发] - 交易回执:', txReceipt)
            console.log('[Token分发] - 交易状态 (回执):', txReceipt.status ? '成功' : '失败')
            
            // 检查交易状态（receipt.status 是布尔值或数字 1/0）
            if (txReceipt.status === false || txReceipt.status === 0) {
              setLoading(false)
              setMessage('❌ 分发失败：交易状态为失败')
              console.error('[Token分发] ❌ 交易状态检查失败，状态值:', txReceipt.status)
              return
            }
            
            // 交易成功
            setTxHash(hashString)
            setMessage('success')
          }
        } catch (receiptError) {
          // 如果获取 receipt 失败，但有 transactionHash，仍然认为成功（可能还未被打包）
          console.warn('[Token分发] ⚠️ 获取交易回执失败，但交易已提交:', receiptError.message)
          setTxHash(hashString)
          setMessage('success')
        }
      }
      
      // 10秒后自动清除成功消息
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
      successTimerRef.current = setTimeout(() => {
        setMessage('')
        setTxHash('')
        successTimerRef.current = null
      }, 10000) // 10秒
      
      console.log('[Token分发] ✅ 操作成功完成')
      
      // 重置表单
      setSize('')
      setBigIndex('')
      setCount('')
    } catch (error) {
      console.error('[Token分发] ❌ 执行失败')
      console.error('[Token分发] - 错误类型:', error.constructor.name)
      console.error('[Token分发] - 错误消息:', error.message)
      console.error('[Token分发] - 错误代码:', error.code)
      console.error('[Token分发] - 完整错误对象:', error)
      
      if (error.data) {
        console.error('[Token分发] - 错误数据:', error.data)
      }
      if (error.reason) {
        console.error('[Token分发] - 错误原因:', error.reason)
      }
      
      // 清除交易信息和定时器
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
      setTxHash('')
      setMessage(`❌ 分发失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
      console.log('[Token分发] === 执行结束 ===')
    }
  }

  return (
    <div className={styles.distribute}>
      <h2>📤 Token分发</h2>
      <p className={styles.subtitle}>仅 Manager 可以执行分发操作</p>

      {message && (
        <div className={message.includes('❌') || message.includes('⚠️') ? styles.error : styles.success} style={{ position: 'relative' }}>
          {message === 'success' && txHash ? (
            <div>
              <button
                onClick={handleCloseSuccess}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                aria-label="关闭"
              >
                <AiOutlineClose size={18} />
              </button>
              <div style={{ marginBottom: '0.75rem', paddingRight: '2rem' }}>
                ✅ <strong>分发成功！</strong>
              </div>
              <div style={{ fontSize: '0.9rem', paddingRight: '2rem' }}>
                <strong>交易哈希：</strong>
                <a
                  href={`https://bscscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1890ff',
                    textDecoration: 'underline',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {txHash}
                </a>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                  (点击查看)
                </span>
              </div>
            </div>
          ) : (
            message
          )}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.actionHeader}>
          <AiOutlineSend className={styles.icon} />
          <h3>执行分发</h3>
        </div>
        
        <form onSubmit={handleDistribute} className={styles.form}>
          <div className={styles.formGroup}>
            <label>
              <span>Size (每次最大承载地址数)</span>
              <span className={styles.hint}>范围: 1-255</span>
            </label>
            <input
              type="number"
              value={size}
              onChange={(e) => {
                const value = e.target.value
                // 限制输入范围 1-255
                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 255)) {
                  setSize(value)
                }
              }}
              placeholder="100"
              required
              min="1"
              max="255"
              step="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <span>BigIndex (分发批次索引)</span>
              <span className={styles.hint}>范围: 0 到 ceil(LP总人数/size)-1</span>
            </label>
            <input
              type="number"
              value={bigIndex}
              onChange={(e) => {
                const value = e.target.value
                // 允许清空输入
                if (value === '') {
                  setBigIndex(value)
                  return
                }
                
                const numValue = parseInt(value)
                // 检查是否为有效数字
                if (isNaN(numValue)) {
                  return // 不是数字，不更新
                }
                
                // 限制输入必须 >= 0
                if (numValue < 0) {
                  return // 小于0，不更新
                }
                
                // 如果有 maxBigIndex，限制最大值
                if (maxBigIndex !== null && numValue > maxBigIndex) {
                  return // 超过最大值，不更新
                }
                
                setBigIndex(value)
              }}
              placeholder="0"
              required
              min="0"
              max={maxBigIndex !== null ? maxBigIndex : undefined}
              step="1"
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
              计算公式: ceil(LP总人数 ÷ size) - 1
              {maxBigIndex !== null && (
                <span style={{ color: '#1890ff', marginLeft: '8px' }}>
                  (当前最大值: {maxBigIndex})
                </span>
              )}
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>
              <span>Count (累加器)</span>
              <span className={styles.hint}>范围: 0-4294967295</span>
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => {
                const value = e.target.value
                // 限制输入必须 >= 0，且 <= uint32 最大值
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 4294967295)) {
                  setCount(value)
                }
              }}
              placeholder="0"
              required
              min="0"
              max="4294967295"
              step="1"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? '处理中...' : '执行分发'}
          </button>
        </form>

        <div className={styles.info}>
          <h4>参数说明：</h4>
          <ul>
            <li><strong>Size:</strong> 每次想要执行的最大承载地址数（如100人），范围: 1-255</li>
            <li><strong>BigIndex:</strong> 分发批次索引，从0开始。计算公式: ceil(LP总人数 ÷ size) - 1。例如：LP总人数=250，size=100，则bigIndex最大值为2（0,1,2）</li>
            <li><strong>Count:</strong> 全部分发完后的累加器，从0开始，每完成一轮完整分发后+1</li>
          </ul>
          <div className={styles.warning}>
            <strong>⚠️ 重要提示：</strong>
            <ul>
              <li>bigIndex × size 不能超过 LP 总人数</li>
              <li>bigIndex 的最大值 = ceil(LP总人数 / size) - 1</li>
              <li>如果 bigIndex 超出范围，交易会在链上失败</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Distribute

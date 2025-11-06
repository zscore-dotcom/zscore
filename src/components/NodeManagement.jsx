import { useState, useEffect, useRef } from 'react'
import { AiOutlinePlus, AiOutlineDelete, AiOutlineExclamationCircle as AlertCircle, AiOutlineClose } from 'react-icons/ai'
import CustomSelect from './CustomSelect'
import styles from './NodeManagement.module.css'

function NodeManagement({ wallet, contracts }) {
  const [addNodeType, setAddNodeType] = useState('0')  // 添加节点的类型
  const [delNodeType, setDelNodeType] = useState('0')  // 删除节点的类型
  const [nodeAddress, setNodeAddress] = useState('')
  const [nodeIndex, setNodeIndex] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [account, setAccount] = useState('')
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

  const handleAddNode = async (e) => {
    e.preventDefault()
    
    console.log('=== [添加节点] 开始执行 ===')
    console.log('[添加节点] 1. 检查前置条件...')
    
    if (!contracts || !wallet || !account) {
      console.error('[添加节点] ❌ 前置条件检查失败: 合约、钱包或账户未就绪')
      console.log('[添加节点] - contracts:', !!contracts)
      console.log('[添加节点] - wallet:', !!wallet)
      console.log('[添加节点] - account:', account)
      setMessage('⚠️ 请先连接钱包')
      return
    }
    
    console.log('[添加节点] ✅ 前置条件检查通过')
    console.log('[添加节点] 2. 验证输入参数...')
    console.log('[添加节点] - nodeType (原始):', addNodeType, typeof addNodeType)
    console.log('[添加节点] - nodeAddress (原始):', nodeAddress)

    if (!nodeAddress || !/^0x[a-fA-F0-9]{40}$/.test(nodeAddress)) {
      console.error('[添加节点] ❌ 地址格式验证失败:', nodeAddress)
      setMessage('❌ 请输入有效的地址')
      return
    }
    
    console.log('[添加节点] ✅ 地址格式验证通过')
    
    const nodeTypeNum = parseInt(addNodeType)
    console.log('[添加节点] 3. 参数转换和准备...')
    console.log('[添加节点] - nodeType (转换后):', nodeTypeNum, typeof nodeTypeNum)
    console.log('[添加节点] - nodeAddress:', nodeAddress)
    console.log('[添加节点] - account (from):', account)

    setLoading(true)
    setMessage('')
    // 清除之前的自动清除定时器
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
    // 清空之前的交易哈希
    setTxHash('')

    try {
      console.log('[添加节点] 4. 构建交易方法...')
      const method = contracts.zsCore.methods.addNode(nodeTypeNum, nodeAddress)
      console.log('[添加节点] - 方法已构建:', method)
      
      console.log('[添加节点] 5. 发送交易到区块链...')
      console.log('[添加节点] - 参数:', { nodeType: nodeTypeNum, nodeAddress, from: account })
      
      const tx = await method.send({ from: account })
      
      console.log('[添加节点] 6. 交易已提交')
      console.log('[添加节点] - 交易哈希:', tx.transactionHash)
      console.log('[添加节点] - 区块号:', tx.blockNumber)
      console.log('[添加节点] - Gas使用量:', tx.gasUsed)
      console.log('[添加节点] - 交易状态:', tx.status)
      console.log('[添加节点] - 完整交易对象:', tx)
      
      // 检查交易状态（status 可能是布尔值 true/false 或数字 1/0）
      const txStatus = tx.status === true || tx.status === 1
      if (!txStatus) {
        setLoading(false)
        setMessage('❌ 添加失败：交易状态为失败')
        console.error('[添加节点] ❌ 交易状态检查失败，状态值:', tx.status)
        return
      }
      
      // 获取交易哈希
      const hashString = String(tx.transactionHash || '')
      setTxHash(hashString)
      setMessage('success') // 使用特殊标记表示成功，将在渲染时显示详细信息
      
      // 10秒后自动清除成功消息
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
      successTimerRef.current = setTimeout(() => {
        setMessage('')
        setTxHash('')
        successTimerRef.current = null
      }, 10000) // 10秒
      
      console.log('[添加节点] ✅ 操作成功完成')
      
      // 重置表单
      setNodeAddress('')
    } catch (error) {
      console.error('[添加节点] ❌ 执行失败')
      console.error('[添加节点] - 错误类型:', error.constructor.name)
      console.error('[添加节点] - 错误消息:', error.message)
      console.error('[添加节点] - 错误代码:', error.code)
      console.error('[添加节点] - 完整错误对象:', error)
      
      if (error.data) {
        console.error('[添加节点] - 错误数据:', error.data)
      }
      if (error.reason) {
        console.error('[添加节点] - 错误原因:', error.reason)
      }
      
      // 清除交易信息和定时器
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
      setTxHash('')
      setMessage(`❌ 添加失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
      console.log('[添加节点] === 执行结束 ===')
    }
  }

  const handleDelNode = async (e) => {
    e.preventDefault()
    
    console.log('=== [删除节点] 开始执行 ===')
    console.log('[删除节点] 1. 检查前置条件...')
    
    if (!contracts || !wallet || !account) {
      console.error('[删除节点] ❌ 前置条件检查失败: 合约、钱包或账户未就绪')
      console.log('[删除节点] - contracts:', !!contracts)
      console.log('[删除节点] - wallet:', !!wallet)
      console.log('[删除节点] - account:', account)
      setMessage('⚠️ 请先连接钱包')
      return
    }
    
    console.log('[删除节点] ✅ 前置条件检查通过')
    console.log('[删除节点] 2. 验证输入参数...')
    console.log('[删除节点] - nodeType (原始):', delNodeType, typeof delNodeType)
    console.log('[删除节点] - nodeIndex (原始):', nodeIndex, typeof nodeIndex)

    if (!nodeIndex || isNaN(nodeIndex) || parseInt(nodeIndex) < 0) {
      console.error('[删除节点] ❌ 索引验证失败:', nodeIndex)
      setMessage('❌ 请输入有效的索引')
      return
    }
    
    const nodeTypeNum = parseInt(delNodeType)
    const nodeIndexNum = parseInt(nodeIndex)
    
    console.log('[删除节点] 3. 检查索引是否在有效范围内...')
    console.log('[删除节点] - nodeType (转换后):', nodeTypeNum, typeof nodeTypeNum)
    console.log('[删除节点] - nodeIndex (转换后):', nodeIndexNum, typeof nodeIndexNum)
    
    // 验证索引是否超出数组范围
    try {
      const nodeLength = await contracts.zsCore.methods.getNodeLength(nodeTypeNum).call()
      const maxIndex = parseInt(nodeLength.toString()) - 1
      
      console.log('[删除节点] - 当前节点数量:', nodeLength.toString())
      console.log('[删除节点] - 最大有效索引:', maxIndex)
      console.log('[删除节点] - 用户输入的索引:', nodeIndexNum)
      
      if (nodeIndexNum > maxIndex) {
        console.error('[删除节点] ❌ 索引超出范围')
        console.error('[删除节点] - 索引', nodeIndexNum, '超出有效范围 [0,', maxIndex, ']')
        setMessage(`❌ 索引 ${nodeIndexNum} 超出范围！当前${nodeTypeNum === 0 ? '小' : '大'}节点数量: ${nodeLength.toString()}，有效索引范围: 0-${maxIndex}`)
        return
      }
      
      if (parseInt(nodeLength.toString()) === 0) {
        console.error('[删除节点] ❌ 节点数组为空')
        setMessage(`❌ 当前${nodeTypeNum === 0 ? '小' : '大'}节点数量为 0，无法删除`)
        return
      }
      
      console.log('[删除节点] ✅ 索引范围验证通过')
    } catch (error) {
      console.error('[删除节点] ❌ 查询节点数量失败:', error)
      setMessage('⚠️ 无法验证索引范围，将继续尝试删除（可能失败）')
      // 继续执行，让合约层面处理错误
    }
    
    console.log('[删除节点] 4. 参数转换和准备...')
    console.log('[删除节点] - account (from):', account)

    setLoading(true)
    setMessage('')
    // 清除之前的自动清除定时器
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
    // 清空之前的交易哈希
    setTxHash('')

    try {
      console.log('[删除节点] 5. 构建交易方法...')
      const method = contracts.zsCore.methods.delNode(nodeTypeNum, nodeIndexNum)
      console.log('[删除节点] - 方法已构建:', method)
      
      console.log('[删除节点] 6. 发送交易到区块链...')
      console.log('[删除节点] - 参数:', { nodeType: nodeTypeNum, nodeIndex: nodeIndexNum, from: account })
      
      const tx = await method.send({ from: account })
      
      console.log('[删除节点] 6. 交易已提交')
      console.log('[删除节点] - 交易哈希:', tx.transactionHash)
      console.log('[删除节点] - 区块号:', tx.blockNumber)
      console.log('[删除节点] - Gas使用量:', tx.gasUsed)
      console.log('[删除节点] - 交易状态:', tx.status)
      console.log('[删除节点] - 完整交易对象:', tx)
      
      // 检查交易状态（status 可能是布尔值 true/false 或数字 1/0）
      const txStatus = tx.status === true || tx.status === 1
      if (!txStatus) {
        setLoading(false)
        setMessage('❌ 删除失败：交易状态为失败')
        console.error('[删除节点] ❌ 交易状态检查失败，状态值:', tx.status)
        return
      }
      
      // 获取交易哈希
      const hashString = String(tx.transactionHash || '')
      setTxHash(hashString)
      setMessage('success') // 使用特殊标记表示成功，将在渲染时显示详细信息
      
      // 10秒后自动清除成功消息
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
      successTimerRef.current = setTimeout(() => {
        setMessage('')
        setTxHash('')
        successTimerRef.current = null
      }, 10000) // 10秒
      
      console.log('[删除节点] ✅ 操作成功完成')
      
      // 重置表单
      setNodeIndex('')
    } catch (error) {
      console.error('[删除节点] ❌ 执行失败')
      console.error('[删除节点] - 错误类型:', error.constructor.name)
      console.error('[删除节点] - 错误消息:', error.message)
      console.error('[删除节点] - 错误代码:', error.code)
      console.error('[删除节点] - 完整错误对象:', error)
      
      if (error.data) {
        console.error('[删除节点] - 错误数据:', error.data)
      }
      if (error.reason) {
        console.error('[删除节点] - 错误原因:', error.reason)
      }
      
      // 清除交易信息和定时器
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
      setTxHash('')
      setMessage(`❌ 删除失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
      console.log('[删除节点] === 执行结束 ===')
    }
  }

  return (
    <div className={styles.nodeManagement}>
      <h2>🔗 节点管理</h2>
      <p className={styles.subtitle}>仅 Owner 可以添加/删除节点</p>

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
                ✅ <strong>操作成功！</strong>
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

      <div className={styles.actions}>
        <div className={styles.actionCard}>
          <div className={styles.actionHeader}>
            <AiOutlinePlus className={styles.icon} />
            <h3>添加节点</h3>
          </div>
          <form onSubmit={handleAddNode} className={styles.form}>
            <div className={styles.formGroup}>
              <label>节点类型</label>
              <CustomSelect
                value={addNodeType}
                onChange={(value) => setAddNodeType(value)}
                options={[
                  { value: '0', label: '小节点' },
                  { value: '1', label: '大节点' }
                ]}
                placeholder="请选择节点类型"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>节点地址</label>
              <input
                type="text"
                value={nodeAddress}
                onChange={(e) => setNodeAddress(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.addButton}>
              {loading ? '处理中...' : '添加节点'}
            </button>
          </form>
        </div>

        <div className={styles.actionCard}>
          <div className={styles.actionHeader}>
            <AiOutlineDelete className={styles.icon} />
            <h3>删除节点</h3>
          </div>
          <form onSubmit={handleDelNode} className={styles.form}>
            <div className={styles.formGroup}>
              <label>节点类型</label>
              <CustomSelect
                value={delNodeType}
                onChange={(value) => setDelNodeType(value)}
                options={[
                  { value: '0', label: '小节点' },
                  { value: '1', label: '大节点' }
                ]}
                placeholder="请选择节点类型"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>节点索引</label>
              <input
                type="number"
                value={nodeIndex}
                onChange={(e) => setNodeIndex(e.target.value)}
                placeholder="0"
                required
                min="0"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.deleteButton}>
              {loading ? '处理中...' : '删除节点'}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.warningBox}>
        <AlertCircle className={styles.warningIcon} />
        <div>
          <strong>注意事项：</strong>
          <ul>
            <li>添加节点前请确认地址正确</li>
            <li>删除节点会改变后续索引，请谨慎操作</li>
            <li>只有合约 Owner 可以执行此操作</li>
            <li>操作需要消耗 Gas 费用</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NodeManagement

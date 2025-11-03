import { useState, useEffect } from 'react'
import { AiOutlinePlus, AiOutlineDelete, AiOutlineExclamationCircle as AlertCircle } from 'react-icons/ai'
import styles from './NodeManagement.module.css'

function NodeManagement({ wallet, contracts }) {
  const [nodeType, setNodeType] = useState('0')
  const [nodeAddress, setNodeAddress] = useState('')
  const [nodeIndex, setNodeIndex] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
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
    console.log('[添加节点] - nodeType (原始):', nodeType, typeof nodeType)
    console.log('[添加节点] - nodeAddress (原始):', nodeAddress)

    if (!nodeAddress || !/^0x[a-fA-F0-9]{40}$/.test(nodeAddress)) {
      console.error('[添加节点] ❌ 地址格式验证失败:', nodeAddress)
      setMessage('❌ 请输入有效的地址')
      return
    }
    
    console.log('[添加节点] ✅ 地址格式验证通过')
    
    const nodeTypeNum = parseInt(nodeType)
    console.log('[添加节点] 3. 参数转换和准备...')
    console.log('[添加节点] - nodeType (转换后):', nodeTypeNum, typeof nodeTypeNum)
    console.log('[添加节点] - nodeAddress:', nodeAddress)
    console.log('[添加节点] - account (from):', account)

    setLoading(true)
    setMessage('')

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
      console.log('[添加节点] - 完整交易对象:', tx)
      
      setMessage('⏳ 交易已提交，等待确认...')
      setMessage(`✅ 添加节点成功！交易哈希: ${tx.transactionHash.slice(0, 10)}...`)
      
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
    console.log('[删除节点] - nodeType (原始):', nodeType, typeof nodeType)
    console.log('[删除节点] - nodeIndex (原始):', nodeIndex, typeof nodeIndex)

    if (!nodeIndex || isNaN(nodeIndex) || parseInt(nodeIndex) < 0) {
      console.error('[删除节点] ❌ 索引验证失败:', nodeIndex)
      setMessage('❌ 请输入有效的索引')
      return
    }
    
    const nodeTypeNum = parseInt(nodeType)
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
      console.log('[删除节点] - 完整交易对象:', tx)
      
      setMessage('⏳ 交易已提交，等待确认...')
      setMessage(`✅ 删除节点成功！交易哈希: ${tx.transactionHash.slice(0, 10)}...`)
      
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
        <div className={message.includes('❌') || message.includes('⚠️') ? styles.error : styles.success}>
          {message}
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
              <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
                <option value="0">小节点</option>
                <option value="1">大节点</option>
              </select>
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
              <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
                <option value="0">小节点</option>
                <option value="1">大节点</option>
              </select>
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

import { useState, useRef, useEffect } from 'react'
import { AiOutlineDown } from 'react-icons/ai'
import styles from './CustomSelect.module.css'

function CustomSelect({ value, onChange, options = [], placeholder = '请选择' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const selectRef = useRef(null)
  const dropdownRef = useRef(null)

  // 确保options是数组
  const safeOptions = Array.isArray(options) ? options : []

  // 根据value找到对应的选项
  useEffect(() => {
    try {
      const option = safeOptions.find(opt => opt && opt.value === value)
      setSelectedOption(option || null)
    } catch (error) {
      console.error('CustomSelect: 查找选项时出错', error)
      setSelectedOption(null)
    }
  }, [value, safeOptions])

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false)
        }
      } catch (error) {
        console.error('CustomSelect: 点击外部处理错误', error)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // 防止下拉框超出视口
  useEffect(() => {
    if (!isOpen || !dropdownRef.current || !selectRef.current) return

    const updatePosition = () => {
      try {
        if (!dropdownRef.current || !selectRef.current) return
        
        const selectRect = selectRef.current.getBoundingClientRect()
        if (!selectRect) return

        const viewportHeight = window.innerHeight
        const isMobile = window.innerWidth <= 768
        
        if (isMobile) {
          // 移动端使用 fixed 定位，居中显示
          dropdownRef.current.style.position = 'fixed'
          
          // 计算居中位置（基于select元素的位置）
          const selectCenterX = selectRect.left + selectRect.width / 2
          const dropdownWidth = Math.min(180, Math.max(140, window.innerWidth * 0.85))
          const leftPosition = selectCenterX - dropdownWidth / 2
          // 确保下拉框不会超出视口
          const clampedLeft = Math.max(8, Math.min(leftPosition, window.innerWidth - dropdownWidth - 8))
          
          dropdownRef.current.style.left = `${clampedLeft}px`
          dropdownRef.current.style.transform = 'none'
          dropdownRef.current.style.right = 'auto'
          dropdownRef.current.style.width = `${dropdownWidth}px`
          dropdownRef.current.style.maxWidth = '180px'
          dropdownRef.current.style.minWidth = '140px'
          
          // 计算垂直位置
          const spaceBelow = viewportHeight - selectRect.bottom
          const spaceAbove = selectRect.top
          const estimatedHeight = Math.min(200, safeOptions.length * 48 + 16)
          
          if (spaceBelow < estimatedHeight && spaceAbove > estimatedHeight) {
            // 向上展开
            dropdownRef.current.style.bottom = `${viewportHeight - selectRect.top + 4}px`
            dropdownRef.current.style.top = 'auto'
          } else {
            // 向下展开
            dropdownRef.current.style.top = `${selectRect.bottom + 4}px`
            dropdownRef.current.style.bottom = 'auto'
          }
        } else {
          // 桌面端使用 absolute 定位，居中显示
          dropdownRef.current.style.position = 'absolute'
          dropdownRef.current.style.left = '50%'
          dropdownRef.current.style.transform = 'translateX(-50%)'
          dropdownRef.current.style.right = 'auto'
          dropdownRef.current.style.width = '80%'
          dropdownRef.current.style.maxWidth = '200px'
          dropdownRef.current.style.minWidth = '120px'
          
          const spaceBelow = viewportHeight - selectRect.bottom
          const spaceAbove = selectRect.top
          const estimatedHeight = Math.min(192, safeOptions.length * 48)
          
          if (spaceBelow < estimatedHeight && spaceAbove > estimatedHeight) {
            dropdownRef.current.style.bottom = '100%'
            dropdownRef.current.style.top = 'auto'
            dropdownRef.current.style.marginBottom = '0.25rem'
            dropdownRef.current.style.marginTop = '0'
          } else {
            dropdownRef.current.style.top = '100%'
            dropdownRef.current.style.bottom = 'auto'
            dropdownRef.current.style.marginTop = '0.25rem'
            dropdownRef.current.style.marginBottom = '0'
          }
        }
      } catch (error) {
        console.error('CustomSelect: 更新位置时出错', error)
      }
    }
    
    // 使用requestAnimationFrame确保DOM已更新
    requestAnimationFrame(() => {
      updatePosition()
    })

    // 监听窗口大小变化和滚动（仅在移动端）
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      let ticking = false
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updatePosition()
            ticking = false
          })
          ticking = true
        }
      }
      
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', updatePosition, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, safeOptions.length])

  const handleToggle = (e) => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setIsOpen(!isOpen)
    } catch (error) {
      console.error('CustomSelect: 切换下拉框时出错', error)
    }
  }

  const handleSelect = (option) => {
    try {
      if (option && option.value !== undefined && onChange) {
        onChange(option.value)
      }
      setIsOpen(false)
    } catch (error) {
      console.error('CustomSelect: 选择选项时出错', error)
    }
  }

  return (
    <div className={styles.customSelectWrapper}>
      <div
        ref={selectRef}
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle(e)
          }
        }}
      >
        <span className={styles.selectValue}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <AiOutlineDown className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} />
      </div>
      
      {isOpen && safeOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className={styles.dropdown}
        >
          {safeOptions.map((option, index) => {
            if (!option || option.value === undefined) return null
            return (
              <div
                key={option.value || index}
                className={`${styles.option} ${
                  value === option.value ? styles.optionSelected : ''
                }`}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelect(option)
                  }
                }}
                role="option"
                aria-selected={value === option.value}
                tabIndex={0}
              >
                {option.label || option.value}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomSelect

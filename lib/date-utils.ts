// 日期工具函数 - 统一处理日期格式，避免时区问题

/**
 * 将日期转换为本地日期字符串 (YYYY-MM-DD)
 * 避免时区转换导致的日期偏移问题
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 从日期字符串创建本地日期对象
 * 避免时区转换问题
 */
export function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return formatDateToLocal(new Date())
}

/**
 * 为指定日期创建带时间的ISO字符串
 * 保持日期不变，只添加当前时间
 */
export function createDateTimeISO(dateString: string): string {
  const now = new Date()
  const [year, month, day] = dateString.split('-').map(Number)
  const dateTime = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds())
  return dateTime.toISOString()
}

/**
 * 从ISO字符串提取日期部分 (YYYY-MM-DD)
 */
export function extractDateFromISO(isoString: string): string {
  return isoString.split('T')[0]
}

/**
 * 检查两个日期字符串是否是同一天
 */
export function isSameDate(date1: string, date2: string): boolean {
  return date1 === date2
}

/**
 * 获取月份的所有日期，用于日历显示
 */
export function getMonthDates(year: number, month: number): {
  prevMonthDates: string[]
  currentMonthDates: string[]
  nextMonthDates: string[]
} {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // 上个月的日期
  const prevMonthDates: string[] = []
  const prevMonth = new Date(year, month, 0)
  const prevMonthDays = prevMonth.getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const prevMonthYear = month === 0 ? year - 1 : year
    const prevMonthIndex = month === 0 ? 11 : month - 1
    prevMonthDates.push(formatDateToLocal(new Date(prevMonthYear, prevMonthIndex, day)))
  }

  // 当前月的日期
  const currentMonthDates: string[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    currentMonthDates.push(formatDateToLocal(new Date(year, month, day)))
  }

  // 下个月的日期
  const nextMonthDates: string[] = []
  const totalCells = 42 // 6周 * 7天
  const remainingDays = totalCells - prevMonthDates.length - currentMonthDates.length
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonthYear = month === 11 ? year + 1 : year
    const nextMonthIndex = month === 11 ? 0 : month + 1
    nextMonthDates.push(formatDateToLocal(new Date(nextMonthYear, nextMonthIndex, day)))
  }

  return {
    prevMonthDates,
    currentMonthDates,
    nextMonthDates
  }
} 
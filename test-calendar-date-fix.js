// 测试日历日期重复Bug修复
// 在浏览器控制台运行此脚本来验证修复效果

console.log("=== 日历日期重复Bug修复测试 ===");

// 测试函数：检查日历是否有重复日期显示
function testCalendarDates() {
  // 获取当前显示的所有日期格子
  const dateButtons = document.querySelectorAll('[class*="grid-cols-7"] button');
  
  if (dateButtons.length === 0) {
    console.log("❌ 未找到日历组件，请确保在情绪记录页面运行此测试");
    return false;
  }

  console.log(`📅 找到 ${dateButtons.length} 个日期格子`);

  // 提取所有日期信息
  const dateInfo = Array.from(dateButtons).map((button, index) => {
    const dayText = button.querySelector('div')?.textContent?.trim();
    const isCurrentMonth = !button.classList.contains('text-gray-300');
    
    return {
      index,
      dayNumber: parseInt(dayText) || 0,
      isCurrentMonth,
      element: button
    };
  });

  // 检查当前月份的日期是否有重复
  const currentMonthDates = dateInfo.filter(d => d.isCurrentMonth);
  const currentMonthDays = currentMonthDates.map(d => d.dayNumber);
  
  console.log(`📊 当前月份日期: ${currentMonthDays.join(', ')}`);

  // 检查重复
  const duplicates = currentMonthDays.filter((day, index) => 
    currentMonthDays.indexOf(day) !== index
  );

  if (duplicates.length > 0) {
    console.log(`❌ 发现重复的日期号码: ${[...new Set(duplicates)].join(', ')}`);
    
    // 高亮显示重复的日期
    duplicates.forEach(day => {
      const duplicateElements = currentMonthDates.filter(d => d.dayNumber === day);
      duplicateElements.forEach(d => {
        d.element.style.border = '3px solid red';
        d.element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      });
    });
    
    return false;
  } else {
    console.log("✅ 没有发现重复的日期号码");
    
    // 检查日期连续性（1号到月末）
    const sortedDays = currentMonthDays.sort((a, b) => a - b);
    const expectedDays = Array.from({length: sortedDays.length}, (_, i) => i + 1);
    
    const isSequential = JSON.stringify(sortedDays) === JSON.stringify(expectedDays);
    
    if (isSequential) {
      console.log("✅ 日期序列正确 (1号到月末连续)");
      return true;
    } else {
      console.log(`❌ 日期序列不正确`);
      console.log(`期望: ${expectedDays.join(', ')}`);
      console.log(`实际: ${sortedDays.join(', ')}`);
      return false;
    }
  }
}

// 测试函数：检查日期点击功能
function testDateSelection() {
  console.log("\n=== 测试日期选择功能 ===");
  
  const dateButtons = document.querySelectorAll('[class*="grid-cols-7"] button');
  const currentMonthButtons = Array.from(dateButtons).filter(button => 
    !button.classList.contains('text-gray-300')
  );

  if (currentMonthButtons.length === 0) {
    console.log("❌ 未找到当前月份的日期按钮");
    return false;
  }

  // 随机选择一个日期进行测试
  const randomButton = currentMonthButtons[Math.floor(Math.random() * currentMonthButtons.length)];
  const dayNumber = randomButton.querySelector('div')?.textContent?.trim();
  
  console.log(`🎯 测试点击日期: ${dayNumber}号`);
  
  // 模拟点击
  randomButton.click();
  
  // 等待一下让状态更新
  setTimeout(() => {
    // 检查是否有侧边栏出现或日期被选中
    const sidebar = document.querySelector('[class*="fixed"][class*="right-0"]');
    const selectedButton = document.querySelector('[class*="bg-blue-100"]');
    
    if (sidebar || selectedButton) {
      console.log("✅ 日期选择功能正常工作");
    } else {
      console.log("⚠️  日期选择可能没有响应，请手动验证");
    }
  }, 500);
  
  return true;
}

// 运行测试
const dateTestResult = testCalendarDates();
if (dateTestResult) {
  console.log("\n🎉 日历日期重复Bug已修复！");
  testDateSelection();
} else {
  console.log("\n❌ 日历仍存在问题，需要进一步检查");
}

console.log("\n📋 测试完成。如果发现问题，请检查:");
console.log("1. 是否在情绪记录页面运行此测试");
console.log("2. 日历组件是否正确加载");
console.log("3. 是否有JavaScript错误");

// 清理函数
window.cleanupCalendarTest = function() {
  const dateButtons = document.querySelectorAll('[class*="grid-cols-7"] button');
  dateButtons.forEach(button => {
    button.style.border = '';
    button.style.backgroundColor = '';
  });
  console.log("✅ 测试样式已清理");
}

console.log("\n💡 运行 cleanupCalendarTest() 可以清理测试添加的样式");

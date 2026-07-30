// 性格因子数组
const factors = [1, 1, 1, 1, 1]

const characterSelect = document.getElementById('character_select')
const characterSearch = document.getElementById('character_search')
const selectOptions = characterSelect.querySelector('.select-options')
const allOptions = Array.from(characterSelect.querySelectorAll('.character_opt'))

// 刻印多选框
const engravings = document.querySelectorAll('input[name="engraving"]')

// 将下拉列表移动到 body 下，避免被容器 overflow 裁剪
const dropdown = document.createElement('div')
dropdown.className = 'select-options character-dropdown'
dropdown.style.display = 'none'
document.body.appendChild(dropdown)

// 同步选项内容到 body 下拉列表
function syncDropdown() {
    dropdown.innerHTML = ''
    allOptions.forEach(opt => {
        if (opt.style.display !== 'none') {
            dropdown.appendChild(opt.cloneNode(true))
        }
    })
}

// 定位下拉列表
function positionDropdown() {
    const rect = characterSelect.getBoundingClientRect()
    dropdown.style.position = 'fixed'
    dropdown.style.left = rect.left + 'px'
    dropdown.style.top = rect.bottom + 'px'
    dropdown.style.width = rect.width + 'px'
    dropdown.style.zIndex = '10000'
}

// 刻印6选3
engravings.forEach(engraving => {
    engraving.addEventListener('change', () => {
        const checkedCount = document.querySelectorAll('input[name="engraving"]:checked').length;
        if (checkedCount > 3) {
            engraving.checked = false
            alert('刻印只能选择3个')
        }
    })
})

// 点击输入框，展开下拉列表
characterSearch.addEventListener('focus', () => {
    syncDropdown()
    positionDropdown()
    dropdown.style.display = 'block'
    // 重置显示所有选项
    allOptions.forEach(opt => opt.style.display = 'block')
})

// 处理选项选择
function selectOption(option) {
    // 更新原选项选中状态
    allOptions.forEach(opt => opt.classList.remove('selected'))
    const originalOption = allOptions.find(opt => opt.dataset.value === option.dataset.value)
    if (originalOption) {
        originalOption.classList.add('selected')
    }

    // 更新输入框值
    characterSearch.value = option.textContent
    console.log(characterSearch.value)
    console.log(characterFactors(characterSearch.value))
    // 隐藏下拉列表
    dropdown.style.display = 'none'
}

// 点击原下拉列表中的选项
selectOptions.addEventListener('click', (e) => {
    const option = e.target.closest('.character_opt')
    if (!option) return
    selectOption(option)
})

// 点击 body 下拉列表中的选项
dropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.character_opt')
    if (!option) return
    selectOption(option)
})

// 点击其他地方关闭下拉列表
document.addEventListener('click', (e) => {
    if (!characterSelect.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none'
    }
})

// 搜索过滤
characterSearch.addEventListener('input', () => {
    const keyword = characterSearch.value.toLowerCase()
    allOptions.forEach(opt => {
        const text = opt.textContent.toLowerCase()
        opt.style.display = text.includes(keyword) ? 'block' : 'none'
    })
    // 输入时同步并展开下拉列表
    syncDropdown()
    positionDropdown()
    dropdown.style.display = 'block'
})

// 窗口滚动或缩放时隐藏下拉列表
window.addEventListener('scroll', () => {
    dropdown.style.display = 'none'
})
window.addEventListener('resize', () => {
    dropdown.style.display = 'none'
})

/**
 * 根据性格返回对应的属性因子
 * 属性顺序：物攻、防御、特攻、特防、速度
 * 提升的项目：1.1，降低的项目：0.9，其他：1
 * @param {string} character - 性格
 * @returns {number[]} 属性因子数组
 */
function characterFactors(character) {
    // 重置为1
    factors.fill(1)
    switch (character) {
        case '孤独':
            factors[0] = 1.1; factors[1] = 0.9; break
        case '勇敢':
            factors[0] = 1.1; factors[4] = 0.9; break
        case '调皮':
            factors[0] = 1.1; factors[3] = 0.9; break
        case '固执':
            factors[0] = 1.1; factors[2] = 0.9; break
        case '大胆':
            factors[1] = 1.1; factors[0] = 0.9; break
        case '无虑':
            factors[1] = 1.1; factors[3] = 0.9; break
        case '悠闲':
            factors[1] = 1.1; factors[4] = 0.9; break
        case '顽皮':
            factors[1] = 1.1; factors[2] = 0.9; break
        case '保守':
            factors[2] = 1.1; factors[0] = 0.9; break
        case '马虎':
            factors[2] = 1.1; factors[3] = 0.9; break
        case '稳重':
            factors[2] = 1.1; factors[1] = 0.9; break
        case '冷静':
            factors[2] = 1.1; factors[4] = 0.9; break
        case '沉着':
            factors[3] = 1.1; factors[0] = 0.9; break
        case '狂妄':
            factors[3] = 1.1; factors[4] = 0.9; break
        case '温顺':
            factors[3] = 1.1; factors[1] = 0.9; break
        case '慎重':
            factors[3] = 1.1; factors[2] = 0.9; break
        case '胆小':
            factors[4] = 1.1; factors[0] = 0.9; break
        case '急躁':
            factors[4] = 1.1; factors[1] = 0.9; break
        case '天真':
            factors[4] = 1.1; factors[3] = 0.9; break
        case '开朗':
            factors[4] = 1.1; factors[2] = 0.9; break
        // 平衡性格：认真、坦率、实干、害羞、浮躁 - 保持全1
    }
    return factors
}
// 套装加成映射
const suitBonuses = {
    '雪雷': [15, 15, 15, 15, 0, 30],
    '银翼骑士': [30, 0, 30, 0, 0, 30],
    '黑渊魔角': [15, 10, 15, 10, 0, 25],
    '黑武士': [10, 10, 10, 10, 0, 20]
}

// 刻印加成
const engravingBonus = [20, 20, 20, 20, 10, 30]

// 获取输入值数组
function getInputValues(selector, defaultValue = 0) {
    return Array.from(document.querySelectorAll(selector)).map(input => {
        const value = Number(input.value)
        return isNaN(value) ? defaultValue : value
    })
}

// 计算并显示属性值
function calculateAttributes() {
    const raceValues = getInputValues('.race_values')
    const learningValues = getInputValues('.learning_values')
    const talentValues = getInputValues('.talent_values')

    // 战队科技：物攻、防御、特攻、特防、体力（速度列无输入）
    const teamTechInputs = getInputValues('.team_tech')
    const teamTech = [teamTechInputs[0], teamTechInputs[1], teamTechInputs[2], teamTechInputs[3], 0, teamTechInputs[4]]

    // 性格因子
    const character = characterSearch.value
    const characterFactorList = characterFactors(character)

    // 刻印
    const engravingIds = ['attackEngraving', 'defenseEngraving', 'specialAttackEngraving', 'specialDefenseEngraving', 'speedEngraving', 'healthPointEngraving']
    const engravings = engravingIds.map(id => document.getElementById(id).checked)

    // 套装加成
    const suitValue = document.getElementById('suit').value
    const suitBonus = suitBonuses[suitValue] || [0, 0, 0, 0, 0, 0]

    // 强化等级
    const levelIds = ['attackLevel', 'defenseLevel', 'specialAttackLevel', 'specialDefenseLevel', 'speedLevel']
    const levels = levelIds.map(id => {
        const value = Number(document.getElementById(id).value)
        return isNaN(value) ? 0 : value
    })
    levels.push(0) // 体力无强化等级

    const results = []
    for (let i = 0; i < 6; i++) {
        let base
        // 计算公式默认精灵等级为100级
        if (i === 5) {
            // HP 项
            base = (raceValues[i] * 2 + 110 + talentValues[i] + learningValues[i] / 4)
        } else {
            // 非 HP 项
            base = (raceValues[i] * 2 + 5 + talentValues[i] + (learningValues[i] / 4)) * characterFactorList[i]
        }

        // 加上战队科技、刻印、套装
        base += teamTech[i]
        base += engravings[i] ? engravingBonus[i] : 0
        base += suitBonus[i]

        // 强化等级倍率
        const multiplier = (2 + levels[i]) / 2
        base *= multiplier

        results.push(Math.floor(base))
    }

    // 更新属性值行
    const attributeCells = document.querySelectorAll('#attribute-row .form-cell')
    for (let i = 0; i < 6; i++) {
        attributeCells[i].textContent = results[i]
    }
    console.log(characterFactorList)
}

// 绑定计算按钮事件
document.getElementById('calculateBtn').addEventListener('click', calculateAttributes)

// 帮助弹窗逻辑
const helpBtn = document.querySelector('.help-btn')
const helpModal = document.getElementById('helpModal')
const modalClose = document.querySelector('.modal-close')

helpBtn.addEventListener('click', () => {
    helpModal.classList.add('active')
})

modalClose.addEventListener('click', () => {
    helpModal.classList.remove('active')
})

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.remove('active')
    }
})
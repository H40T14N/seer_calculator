// 性格因子数组
const factors = [1, 1, 1, 1, 1]

// 当前选择的性格
let currentCharacter = '实干'

// 性格数据（按分类组织）
const characterData = {
    attack: [
        { name: '孤独', factors: [1.1, 0.9, 1, 1, 1] },
        { name: '勇敢', factors: [1.1, 1, 1, 1, 0.9] },
        { name: '调皮', factors: [1.1, 1, 1, 0.9, 1] },
        { name: '固执', factors: [1.1, 1, 0.9, 1, 1] }
    ],
    defense: [
        { name: '大胆', factors: [0.9, 1.1, 1, 1, 1] },
        { name: '无虑', factors: [1, 1.1, 1, 0.9, 1] },
        { name: '悠闲', factors: [1, 1.1, 1, 1, 0.9] },
        { name: '顽皮', factors: [1, 1.1, 0.9, 1, 1] }
    ],
    special: [
        { name: '保守', factors: [0.9, 1, 1.1, 1, 1] },
        { name: '马虎', factors: [1, 1, 1.1, 0.9, 1] },
        { name: '稳重', factors: [1, 0.9, 1.1, 1, 1] },
        { name: '冷静', factors: [1, 1, 1.1, 1, 0.9] }
    ],
    speed: [
        { name: '胆小', factors: [0.9, 1, 1, 1, 1.1] },
        { name: '急躁', factors: [1, 0.9, 1, 1, 1.1] },
        { name: '天真', factors: [1, 1, 1, 0.9, 1.1] },
        { name: '开朗', factors: [1, 1, 0.9, 1, 1.1] }
    ],
    balance: [
        { name: '认真', factors: [1, 1, 1, 1, 1] },
        { name: '坦率', factors: [1, 1, 1, 1, 1] },
        { name: '实干', factors: [1, 1, 1, 1, 1] },
        { name: '害羞', factors: [1, 1, 1, 1, 1] },
        { name: '浮躁', factors: [1, 1, 1, 1, 1] }
    ]
}

// 性格选择弹窗逻辑
const characterModal = document.getElementById('characterModal')
const selectCharacterBtn = document.getElementById('selectCharacterBtn')
const characterTableBody = document.getElementById('characterTableBody')
const characterTabs = document.querySelectorAll('.character-tab')

let currentCategory = 'attack'

// 打开性格选择弹窗
selectCharacterBtn.addEventListener('click', () => {
    characterModal.classList.add('active')
    renderCharacterTable(currentCategory)
})

// 点击弹窗外部关闭弹窗
characterModal.addEventListener('click', (e) => {
    if (e.target === characterModal) {
        characterModal.classList.remove('active')
    }
})

// 切换分类标签
characterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // 移除所有active状态
        characterTabs.forEach(t => t.classList.remove('active'))
        // 添加当前active状态
        tab.classList.add('active')
        // 更新当前分类
        currentCategory = tab.dataset.category
        // 重新渲染表格
        renderCharacterTable(currentCategory)
    })
})

// 渲染性格表格
function renderCharacterTable(category) {
    characterTableBody.innerHTML = ''
    
    const characters = characterData[category] || []
    
    characters.forEach(char => {
        const row = document.createElement('tr')
        
        // 性格名称
        const nameCell = document.createElement('td')
        nameCell.textContent = char.name
        row.appendChild(nameCell)
        
        // 属性因子（物攻、防御、特攻、特防、速度）
        const attrNames = ['物攻', '防御', '特攻', '特防', '速度']
        char.factors.forEach((factor, index) => {
            const cell = document.createElement('td')
            
            if (factor > 1) {
                cell.textContent = '+10%'
                cell.className = 'positive'
            } else if (factor < 1) {
                cell.textContent = '-10%'
                cell.className = 'negative'
            } else {
                cell.textContent = '-'
            }
            
            row.appendChild(cell)
        })
        
        // 选择按钮
        const actionCell = document.createElement('td')
        const selectBtn = document.createElement('button')
        selectBtn.type = 'button'
        selectBtn.className = 'character-select-btn'
        selectBtn.textContent = '选择'
        
        // 如果是当前选择的性格，显示为已选
        if (char.name === currentCharacter) {
            selectBtn.classList.add('selected')
            selectBtn.textContent = '已选'
        }
        
        selectBtn.addEventListener('click', () => {
            // 更新当前性格
            currentCharacter = char.name
            // 更新按钮文本
            selectCharacterBtn.textContent = char.name
            // 关闭弹窗
            characterModal.classList.remove('active')
            // 重新计算属性值
            calculateAttributes()
        })
        
        actionCell.appendChild(selectBtn)
        row.appendChild(actionCell)
        
        characterTableBody.appendChild(row)
    })
}
// 汉堡菜单按钮逻辑
const hamburgerBtn = document.getElementById('hamburgerBtn')
const sidebar = document.querySelector('.sidebar')

// 切换侧边栏
hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active')
    sidebar.classList.toggle('active')
})

// 点击侧边栏外部关闭侧边栏
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        hamburgerBtn.classList.remove('active')
        sidebar.classList.remove('active')
    }
})

// 计算器切换逻辑
const switchBtn = document.getElementById('switchBtn')
const attributeForm = document.getElementById('learning_values_form')
const damageForm = document.getElementById('damage_calculator_form')
const titleText = document.querySelector('.title-header h2')
const helpBtn = document.querySelector('.help-btn')

let isAttributeMode = true

switchBtn.addEventListener('click', () => {
    if (isAttributeMode) {
        // 切换到伤害计算器
        attributeForm.style.display = 'none'
        damageForm.style.display = 'flex'
        titleText.textContent = '伤害计算器'
    } else {
        // 切换到属性计算器
        damageForm.style.display = 'none'
        attributeForm.style.display = 'flex'
        titleText.textContent = '属性值计算器'
    }
    isAttributeMode = !isAttributeMode
})

// 刻印多选框
const engravings = document.querySelectorAll('input[name="engraving"]')

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

/**
 * 根据性格返回对应的属性因子
 * 属性顺序：物攻、防御、特攻、特防、速度
 * 提升的项目：1.1，降低的项目：0.9，其他：1
 * @param {string} character - 性格
 * @returns {number[]} 属性因子数组
 */
function characterFactors(character) {
    // 从性格数据中查找
    for (let category in characterData) {
        const found = characterData[category].find(c => c.name === character)
        if (found) {
            return found.factors
        }
    }
    // 默认返回平衡性格
    return [1, 1, 1, 1, 1]
}
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
    const characterFactorList = characterFactors(currentCharacter)

    // 刻印
    const engravingIds = ['attackEngraving', 'defenseEngraving', 'specialAttackEngraving', 'specialDefenseEngraving', 'speedEngraving', 'healthPointEngraving']
    const engravings = engravingIds.map(id => document.getElementById(id).checked)

    // 套装加成
    const suitValue = document.getElementById('suit').value
    const suitBonus = suitBonuses[suitValue] || [0, 0, 0, 0, 0, 0]

    // 强化等级（支持-6到6，正数为强化，负数为弱化）
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

        // 强化/弱化等级倍率
        // 正数n：倍率 = (2+n)/2（强化）
        // 负数n：倍率 = 2/(2+|n|)（弱化）
        let multiplier = 1
        if (levels[i] > 0) {
            // 强化：n级正面强化
            multiplier = (2 + levels[i]) / 2
        } else if (levels[i] < 0) {
            // 弱化：n级负面弱化
            multiplier = 2 / (2 + Math.abs(levels[i]))
        }
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

// 伤害计算函数
function calculateDamage() {
    // 获取输入值
    const attackValue = Number(document.querySelector('.attack_value').value) || 0
    const defenseValue = Number(document.querySelector('.defense_value').value) || 0
    const attackLevel = Number(document.querySelector('.attack_level').value) || 0
    const skillPower = Number(document.querySelector('.skill_power').value) || 0
    const restraintCoefficient = Number(document.querySelector('.restraint_coefficient').value) || 1
    const sameTypeBonus = document.getElementById('sameTypeBonus').checked

    // 本系加成修正：checked为1.5，unchecked为1
    const sameTypeMultiplier = sameTypeBonus ? 1.5 : 1

    // 计算基础伤害
    // 公式：（攻击方的等级*0.4+2）*技能威力×攻击方的攻击值/防御方对应的防御值/50
    let baseDamage = (attackLevel * 0.4 + 2) * skillPower * attackValue / defenseValue / 50

    // 应用增减伤效果（每次四舍五入）
    // 正数为增伤，负数为减伤
    damageEffects.forEach(effect => {
        if (effect > 0) {
            // 增伤：伤害 * (1 + 百分比/100)
            baseDamage = Math.round(baseDamage * (1 + effect / 100))
        } else if (effect < 0) {
            // 减伤：伤害 * (1 - |百分比|/100)
            baseDamage = Math.round(baseDamage * (1 - Math.abs(effect) / 100))
        }
    })

    // 计算最终伤害区间
    // 公式：基础伤害 * 本系加成修正 * 克制系数 * (217-255) / 255
    let minDamage = Math.round(baseDamage * sameTypeMultiplier * restraintCoefficient * 217 / 255)
    let maxDamage = Math.round(baseDamage * sameTypeMultiplier * restraintCoefficient * 255 / 255)

    // 限制伤害值在0-9999范围内
    minDamage = Math.max(0, Math.min(9999, minDamage))
    maxDamage = Math.max(0, Math.min(9999, maxDamage))

    // 显示结果
    const damageResult = document.getElementById('damageResult')
    if (defenseValue === 0 || attackValue === 0 || skillPower === 0) {
        damageResult.textContent = '请输入有效数值'
    } else {
        damageResult.textContent = `${minDamage} ~ ${maxDamage}`
    }

    console.log(`伤害计算：基础伤害=${baseDamage}, 最小=${minDamage}, 最大=${maxDamage}`)
}

// 绑定伤害计算按钮事件
document.getElementById('calculateDamageBtn').addEventListener('click', calculateDamage)

// 增减伤配置弹窗逻辑
const damageConfigModal = document.getElementById('damageConfigModal')
const configDamageBtn = document.getElementById('configDamageBtn')
const addEffectBtn = document.getElementById('addEffectBtn')
const damageEffectList = document.getElementById('damageEffectList')
const savedEffectsList = document.getElementById('savedEffectsList')
const confirmDamageConfig = document.getElementById('confirmDamageConfig')
const saveEffectsBtn = document.getElementById('saveEffectsBtn')
const clearAllBtn = document.getElementById('clearAllBtn')

// 存储增减伤效果数据
let damageEffects = []

// 打开配置弹窗
configDamageBtn.addEventListener('click', () => {
    damageConfigModal.classList.add('active')
    renderEditEffects()
    renderSavedEffects()
})

// 关闭弹窗（点击关闭按钮或弹窗外部）
damageConfigModal.addEventListener('click', (e) => {
    if (e.target === damageConfigModal || e.target.classList.contains('modal-close')) {
        damageConfigModal.classList.remove('active')
    }
})

// 添加增减伤项
addEffectBtn.addEventListener('click', () => {
    const effectItem = document.createElement('div')
    effectItem.className = 'damage-effect-item'
    effectItem.innerHTML = `
        <span class="effect-number"></span>
        <input type="number" class="effect-input" placeholder="百分比（正为增伤，负为减伤）" step="0.01">
        <button type="button" class="remove-effect-btn">删除</button>
    `
    damageEffectList.appendChild(effectItem)

    // 绑定删除按钮事件
    effectItem.querySelector('.remove-effect-btn').addEventListener('click', () => {
        effectItem.remove()
        updateEffectNumbers()
    })

    // 更新序号
    updateEffectNumbers()
})

// 保存增减伤效果（保存到右侧）
saveEffectsBtn.addEventListener('click', () => {
    // 收集所有增减伤效果
    damageEffects = []
    const items = damageEffectList.querySelectorAll('.damage-effect-item')
    items.forEach(item => {
        const input = item.querySelector('.effect-input')
        const value = Number(input.value)
        if (!isNaN(value) && value !== 0) {
            damageEffects.push(value)
        }
    })

    console.log('增减伤效果已保存:', damageEffects)
    renderSavedEffects()
})

// 清空所有增减伤
clearAllBtn.addEventListener('click', () => {
    damageEffects = []
    damageEffectList.innerHTML = ''
    renderSavedEffects()
    console.log('增减伤效果已清空')
})

// 确认配置
confirmDamageConfig.addEventListener('click', () => {
    damageConfigModal.classList.remove('active')
})

// 渲染编辑区的增减伤效果
function renderEditEffects() {
    damageEffectList.innerHTML = ''

    damageEffects.forEach((value, index) => {
        const effectItem = document.createElement('div')
        effectItem.className = 'damage-effect-item'
        effectItem.innerHTML = `
            <span class="effect-number">${index + 1}.</span>
            <input type="number" class="effect-input" value="${value}" placeholder="百分比（正为增伤，负为减伤）" step="0.01">
            <button type="button" class="remove-effect-btn">删除</button>
        `
        damageEffectList.appendChild(effectItem)

        // 绑定删除按钮事件
        effectItem.querySelector('.remove-effect-btn').addEventListener('click', () => {
            effectItem.remove()
            updateEffectNumbers()
        })
    })
}

// 渲染已保存的增减伤效果（右侧显示）
function renderSavedEffects() {
    savedEffectsList.innerHTML = ''

    if (damageEffects.length === 0) {
        savedEffectsList.innerHTML = '<div class="saved-effect-item">暂无保存的增减伤效果</div>'
        return
    }

    damageEffects.forEach((value, index) => {
        const savedItem = document.createElement('div')
        savedItem.className = 'saved-effect-item'
        const effectType = value > 0 ? '增伤' : '减伤'
        savedItem.textContent = `${index + 1}. ${effectType} ${Math.abs(value)}%`
        savedEffectsList.appendChild(savedItem)
    })
}

// 更新序号
function updateEffectNumbers() {
    const items = damageEffectList.querySelectorAll('.damage-effect-item')
    items.forEach((item, index) => {
        const numberSpan = item.querySelector('.effect-number')
        numberSpan.textContent = `${index + 1}.`
    })
}

// 帮助弹窗逻辑
const helpModal = document.getElementById('helpModal')
const modalClose = document.querySelector('.modal-close')
const attributeHelp = document.getElementById('attributeHelp')
const damageHelp = document.getElementById('damageHelp')

// 更新帮助内容显示
function updateHelpContent() {
    if (isAttributeMode) {
        attributeHelp.style.display = 'block'
        damageHelp.style.display = 'none'
    } else {
        attributeHelp.style.display = 'none'
        damageHelp.style.display = 'block'
    }
}

helpBtn.addEventListener('click', () => {
    updateHelpContent()
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
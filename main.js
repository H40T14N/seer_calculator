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

/* ============ 遗物图鉴 ============ */
// 遗物数据来源：
//   - s.61.com 动态加载的数据（relic-data.js，实时抓取 itemRelic 配置表并解密）
// 字段结构：
// {
//   id: 1,                 // 唯一编号
//   name: '遗物名称',       // 遗物名称
//   quality: 'special',    // 品质: special(特殊) | red | orange | purple | blue | green
//   effect: '遗物效果',     // 游戏内实际效果
//   desc: '官方描述',       // 台词/背景描述
//   extraDesc: '补充描述',  // 补充描述（可选，由 Data/relic-extra.js 提供）
//   img: ''                // 遗物图片（可选，无图则显示品质色块）
// }

// 获取当前可用的遗物数据（来自 s.61.com 动态加载）
function getRelicData() {
    return window.getDynamicRelicData ? window.getDynamicRelicData() : []
}

// 品质配置
const QUALITY_CONFIG = {
    special: { label: '特殊', color: '#d4af37' },
    red: { label: '红色', color: '#ff4d4f' },
    orange: { label: '橙色', color: '#ff9f43' },
    purple: { label: '紫色', color: '#b77bff' },
    blue: { label: '蓝色', color: '#4facfe' },
    green: { label: '绿色', color: '#2ed573' }
}

// 图鉴状态
const tujianView = document.getElementById('tujianView')
const calculatorView = document.getElementById('calculatorView')
const developView = document.getElementById('developView')
const developTitle = document.getElementById('developTitle')
const developHint = document.getElementById('developHint')
const relicGrid = document.getElementById('relicGrid')
const relicPagination = document.getElementById('relicPagination')
const relicSearch = document.getElementById('relicSearch')
const qualityFilter = document.getElementById('qualityFilter')
const tujianTitle = document.getElementById('tujianTitle')
const mainContainer = document.querySelector('.container')

const PAGE_SIZE = 16
let currentPage = 1
let currentQuality = 'all'
let currentKeyword = ''

// 导航切换视图（涵盖 sidebar 与顶部 nav 的所有可点击项）
const navAllItems = document.querySelectorAll('.sidebar-item, .sidebar-sub, .sidebar-subsub, .nav-link[data-view]')
navAllItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault()
        const view = item.dataset.view
        const project = item.dataset.project || ''
        setActiveNav(view, project)

        // 关闭移动端侧边栏
        if (window.innerWidth <= 768) {
            hamburgerBtn.classList.remove('active')
            sidebar.classList.remove('active')
        }

        if (view === 'calculator') {
            showCalculator()
        } else if (view === 'relics') {
            showTujian()
        } else if (view === 'events' || view === 'endings' || view === 'achievements') {
            showDevelop(view, project)
        }
    })
})

// 同步高亮导航项（sidebar 与 nav 中 data-view 相同的项一起高亮）
function setActiveNav(view, project) {
    navAllItems.forEach(i => {
        const match = i.dataset.view === view &&
            (!i.dataset.project || i.dataset.project === project)
        i.classList.toggle('active', match)
    })
}

// 顶部下拉分组：点击展开/收起（配合 hover 使用）
document.querySelectorAll('.nav-drop > .nav-link').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const drop = toggle.parentElement
        const isOpen = drop.classList.contains('open')
        // 关闭其他已展开的下拉
        document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'))
        if (!isOpen) {
            drop.classList.add('open')
        }
    })
})

// 点击页面其他位置关闭所有下拉
document.addEventListener('click', () => {
    document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'))
})

// 显示计算器视图
function showCalculator() {
    calculatorView.style.display = 'block'
    tujianView.style.display = 'none'
    developView.style.display = 'none'
    // 计算器视图下容器恢复 50% 宽度
    mainContainer.classList.remove('tujian-mode')
    // 计算器视图下隐藏图鉴菜单
    document.querySelector('.nav-menu').style.display = 'none'
}

// 显示遗物图鉴视图（遗物共享，无项目区分）
function showTujian() {
    tujianTitle.textContent = '遗物图鉴'
    calculatorView.style.display = 'none'
    developView.style.display = 'none'
    tujianView.style.display = 'block'
    // 太空探索计划视图下容器加宽为 90%
    mainContainer.classList.add('tujian-mode')
    // 太空探索计划视图下显示图鉴菜单
    document.querySelector('.nav-menu').style.display = 'flex'
    currentPage = 1
    renderRelics()
}

// 显示开发中占位视图
function showDevelop(view, project) {
    const viewNames = { events: '事件', endings: '结局', achievements: '成就' }
    const projectNames = { blackhole: '无光黑洞', tower: '铸魂塔' }
    developTitle.textContent = `${viewNames[view]} · ${projectNames[project] || project}`
    developHint.textContent = '该模块正在建设中'
    calculatorView.style.display = 'none'
    tujianView.style.display = 'none'
    developView.style.display = 'block'
    // 太空探索计划视图下容器加宽为 90%
    mainContainer.classList.add('tujian-mode')
    // 太空探索计划视图下显示图鉴菜单
    document.querySelector('.nav-menu').style.display = 'flex'
}

// 根据关键词和品质过滤遗物
function filterRelics() {
    return getRelicData().filter(relic => {
        const matchKeyword = !currentKeyword ||
            relic.name.toLowerCase().includes(currentKeyword.toLowerCase())
        const matchQuality = currentQuality === 'all' || relic.quality === currentQuality
        return matchKeyword && matchQuality
    })
}

// 渲染遗物卡片
function renderRelicCard(relic) {
    const card = document.createElement('div')
    card.className = `relic-card q-${relic.quality}`

    // 父盒子：图标 + 描述文字共用，高度固定为图标高度
    const top = document.createElement('div')
    top.className = 'relic-card-top'

    // 图标区（优先显示 s.61.com 实时抓取的图标，无图/加载失败时显示品质色块）
    const imgArea = document.createElement('div')
    imgArea.className = 'relic-card-img'

    // ID 标签（方便在 relic-extra.js 中查找对应遗物）
    const idBadge = document.createElement('span')
    idBadge.className = 'relic-id-badge'
    idBadge.textContent = relic.id
    imgArea.appendChild(idBadge)

    const iconUrl = window.getRelicIconUrl ? window.getRelicIconUrl(relic.id) : ''
    if (iconUrl) {
        const img = document.createElement('img')
        img.src = iconUrl
        img.alt = relic.name
        img.loading = 'lazy'
        img.onerror = () => {
            imgArea.style.background = QUALITY_CONFIG[relic.quality].color
            imgArea.style.opacity = '0.25'
        }
        imgArea.appendChild(img)
    } else {
        imgArea.style.background = QUALITY_CONFIG[relic.quality].color
        imgArea.style.opacity = '0.25'
    }
    top.appendChild(imgArea)

    // 描述文字区（固定在父盒子高度内：名字固定在上，描述文本独立滚动）
    const info = document.createElement('div')
    info.className = 'relic-card-info'

    // 名称（字体颜色表示品质，固定在顶部不滚动）
    const name = document.createElement('div')
    name.className = 'relic-name'
    name.textContent = relic.name
    info.appendChild(name)

    // 描述文本区（仅此区域滚动）
    const descArea = document.createElement('div')
    descArea.className = 'relic-card-desc'

    // 官方描述（无描述时省略）
    if (relic.desc) {
        const desc = document.createElement('div')
        desc.className = 'relic-desc'
        desc.textContent = relic.desc
        descArea.appendChild(desc)
    }
    info.appendChild(descArea)
    top.appendChild(info)

    // 效果盒子（位于父盒子下方）
    const effect = document.createElement('div')
    effect.className = 'relic-card-effect'
    effect.textContent = relic.effect

    card.appendChild(top)
    card.appendChild(effect)

    // 点击卡片：弹出遗物详情弹窗（展示效果/描述/补充信息）
    card.addEventListener('click', () => {
        openRelicDetail(relic)
    })

    return card
}

// 渲染当前页
function renderRelics() {
    const filtered = filterRelics()
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    if (currentPage > totalPages) currentPage = totalPages

    const start = (currentPage - 1) * PAGE_SIZE
    const pageData = filtered.slice(start, start + PAGE_SIZE)

    relicGrid.innerHTML = ''

    if (pageData.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'relic-empty'
        empty.textContent = '没有找到匹配的遗物'
        relicGrid.appendChild(empty)
    } else {
        pageData.forEach(relic => {
            relicGrid.appendChild(renderRelicCard(relic))
        })
    }

    renderPagination(totalPages)
}

// 遗物图标映射（relic-icons.js）就绪后刷新当前页，保证图鉴卡片显示实时图标
if (window.onRelicIconsReady) {
    window.onRelicIconsReady(() => {
        if (tujianView && tujianView.style.display !== 'none') {
            renderRelics()
        }
    })
}

// 动态遗物数据（relic-data.js）就绪后刷新当前页，用实时数据替换静态兜底
if (window.onRelicDataReady) {
    window.onRelicDataReady(() => {
        if (tujianView && tujianView.style.display !== 'none') {
            renderRelics()
        }
    })
}

/* ============ 遗物详情弹窗 ============ */
const relicDetailModal = document.getElementById('relicDetailModal')
const relicDetailTitle = document.getElementById('relicDetailTitle')
const relicDetailExtra = document.getElementById('relicDetailExtra')

// 打开遗物详情弹窗（展示效果/官方描述/补充信息，样式类似计算器帮助弹窗）
function openRelicDetail(relic) {
    const quality = QUALITY_CONFIG[relic.quality]
    relicDetailTitle.textContent = relic.name
    relicDetailTitle.style.color = quality ? quality.color : '#fff'

    // 补充信息来自 Data/relic-extra.js（可编辑）
    const extra = (typeof relicExtra !== 'undefined' && relicExtra) ? (relicExtra[relic.id] || '') : ''
    relicDetailExtra.textContent = extra || '暂无补充信息'

    relicDetailModal.classList.add('active')
}

// 点击遮罩或关闭按钮关闭遗物详情弹窗
relicDetailModal.addEventListener('click', (e) => {
    if (e.target === relicDetailModal || e.target.classList.contains('modal-close')) {
        relicDetailModal.classList.remove('active')
    }
})

// 渲染分页
function renderPagination(totalPages) {
    relicPagination.innerHTML = ''

    if (totalPages <= 1) return

    // 上一页
    const prevBtn = createPageBtn('上一页', currentPage - 1, currentPage === 1)
    relicPagination.appendChild(prevBtn)

    // 页码（含省略号逻辑）
    const pages = getPageRange(currentPage, totalPages)
    pages.forEach(p => {
        if (p === '...') {
            const ellipsis = document.createElement('span')
            ellipsis.className = 'page-ellipsis'
            ellipsis.textContent = '…'
            relicPagination.appendChild(ellipsis)
        } else {
            relicPagination.appendChild(createPageBtn(p, p, p === currentPage))
        }
    })

    // 下一页
    const nextBtn = createPageBtn('下一页', currentPage + 1, currentPage === totalPages)
    relicPagination.appendChild(nextBtn)
}

// 创建分页按钮
function createPageBtn(text, page, isDisabled) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'page-btn'
    btn.textContent = text
    btn.disabled = isDisabled
    if (!isDisabled) {
        btn.addEventListener('click', () => {
            currentPage = page
            renderRelics()
        })
    }
    return btn
}

// 计算页码范围（首尾页码 + 当前页前后，超出用省略号）
function getPageRange(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }
    const pages = new Set([1, total, current - 1, current, current + 1])
    const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
    const result = []
    let prev = 0
    sorted.forEach(p => {
        if (p - prev > 1) result.push('...')
        result.push(p)
        prev = p
    })
    return result
}

// 搜索输入
relicSearch.addEventListener('input', () => {
    currentKeyword = relicSearch.value.trim()
    currentPage = 1
    renderRelics()
})

// 品质筛选
qualityFilter.addEventListener('click', (e) => {
    const btn = e.target.closest('.quality-btn')
    if (!btn) return
    qualityFilter.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentQuality = btn.dataset.quality
    currentPage = 1
    renderRelics()
})

// 页面初始化：遗物图鉴作为默认展示页面
showTujian()
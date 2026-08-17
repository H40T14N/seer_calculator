/* ============ 时空裂隙/幻影楼层事件信息动态加载（启动脚本） ============ */
// 功能：每次加载项目页面时，从 s.61.com 实时抓取无光黑洞/铸魂塔事件配置表并渲染，数据文件不存入项目文件夹。
// 原理（逆向自游戏客户端 PandaVersionManager + EncryptUtils，与魂印一致）：
//   1) 抓取版本头 https://s.61.com/zzz_config.txt 得到当前游戏版本号 ts
//   2) 抓取版本清单 https://s.61.com/version/version{ts}.swf（实为 ZIP，内含 body JSON），
//      读取 resource/json/xls/cn 下 rogueLevelEvent.json 和 rogueEventChoice.json 的 mtime
//   3) 配置表文件名 = CRC32("roguelevelevent.{mtime}.json")，最终 URL = https://s.61.com/resource/json/xls/cn/{CRC32}.json
//   4) rogueLevelEvent.json 是明文JSON，直接读取id/名字/描述/选项id列表/精灵modelId；
//      rogueEventChoice.json 中每条记录 content 以 "ELOCKEDE_" 前缀加密（AES-256-CBC / PKCS7），
//      密钥 jqY39pQYk2Lj6FFhzsbn1llNSR55X2B8，IV ABCDEF0123456789，解密后得到选项文本/类型/参数等信息。
//   5) 数据按版本号区分，无光黑洞对应 version=202310，铸魂塔对应 version=202411
// 说明：解密结果按版本号缓存于浏览器 localStorage（并非项目文件），数据本身始终从 s.61.com 实时加载。

(function () {
    'use strict'

    const BASE = 'https://s.61.com'
    const CACHE_PREFIX = 'seer_event_data_'

    // ---------- 解密参数（逆向自游戏 Common.min.js 中的 EncryptUtils.DecryptAllLineInJson） ----------
    const AES_KEY = 'jqY39pQYk2Lj6FFhzsbn1llNSR55X2B8'
    const AES_IV = 'ABCDEF0123456789'

    // ---------- CRC32（标准 CRC-32/ISO-HDLC，与游戏一致） ----------
    const CRC_TABLE = (() => {
        const t = new Int32Array(256)
        for (let n = 0; n < 256; n++) {
            let c = n
            for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
            t[n] = c
        }
        return t
    })()
    function crc32(str) {
        let c = 0xFFFFFFFF
        for (let i = 0; i < str.length; i++) {
            c = CRC_TABLE[(c ^ str.charCodeAt(i)) & 0xFF] ^ (c >>> 8)
        }
        return (c ^ 0xFFFFFFFF) | 0
    }

    let eventList = []  // 所有事件已解密完整数组
    let ready = false
    const waiters = []

    // 对外：获取动态加载的事件数据数组（未就绪时为空数组）
    function getEventData() {
        return eventList
    }
    // 对外：动态数据就绪后回调（已就绪则立即执行）
    function onEventDataReady(fn) {
        if (ready) fn()
        else waiters.push(fn)
    }

    // 下载版本清单文件并在浏览器内解压出 body JSON
    async function loadVersionBody(ver) {
        const res = await fetch(BASE + '/version/version' + ver + '.swf')
        if (!res.ok) throw new Error('version body HTTP ' + res.status)
        const buf = await res.arrayBuffer()
        // 解析 ZIP 本地文件头（该文件为单条目 ZIP，条目名 body，deflate 压缩）
        const dv = new DataView(buf)
        const nameLen = dv.getUint16(26, true)   // 文件名长度
        const extraLen = dv.getUint16(28, true)  // 扩展字段长度
        const compSize = dv.getUint32(18, true)  // 压缩后大小
        const dataStart = 30 + nameLen + extraLen
        const deflated = new Uint8Array(buf, dataStart, compSize)
        // 用原生 deflate-raw 解压（无需 JSZip 依赖）
        const ds = new DecompressionStream('deflate-raw')
        const text = await new Response(new Blob([deflated]).stream().pipeThrough(ds)).text()
        return JSON.parse(text)
    }

    // 从清单读取 rogueLevelEvent.json 的 mtime
    function getRogueLevelEventMtime(body) {
        const cn = body && body.files && body.files.resource && body.files.resource.json &&
            body.files.resource.json.xls && body.files.resource.json.xls.cn
        if (!cn) return 0
        const v = cn['rogueLevelEvent.json']
        return Array.isArray(v) ? +v[0] : +v
    }

    // 从清单读取 rogueEventChoice.json 的 mtime
    function getRogueEventChoiceMtime(body) {
        const cn = body && body.files && body.files.resource && body.files.resource.json &&
            body.files.resource.json.xls && body.files.resource.json.xls.cn
        if (!cn) return 0
        const v = cn['rogueEventChoice.json']
        return Array.isArray(v) ? +v[0] : +v
    }

    // AES-256-CBC 解密（Web Crypto API，PKCS7 为其默认填充）
    async function aesDecryptCbc(b64) {
        const cipherBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
        const enc = new TextEncoder()
        const key = await crypto.subtle.importKey(
            'raw', enc.encode(AES_KEY), { name: 'AES-CBC' }, false, ['decrypt']
        )
        const plain = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: enc.encode(AES_IV) }, key, cipherBytes
        )
        return new TextDecoder().decode(plain)
    }

    // 解密配置表并映射为图鉴数据结构
    async function buildEventList(eventArr, choiceArr) {
        const result = []
        // 预先解密所有choices
        const choiceMap = {}
        for (const cRec of choiceArr) {
            const plain = await aesDecryptCbc(cRec.content.replace(/^ELOCKEDE_/, ''))
            choiceMap[cRec.id] = JSON.parse(plain)
        }
        // 映射每个事件
        for (const eRec of eventArr) {
            const choiceIds = (eRec.choiceId || '').split('*').filter(Boolean).map(x => parseInt(x, 10))
            const choices = choiceIds.map(id => choiceMap[id] || null).filter(Boolean)
            result.push({
                id: eRec.id,
                group: eRec.group || 1,
                version: eRec.version || 202310,
                dlcId: eRec.dlcId || 0,
                name: eRec.name || '',
                desc: eRec.desc || '',
                modelId: eRec.modelId || 0,  // 0 means no sprite
                bgId: eRec.bgId || 1,
                choices: choices  // array of { desc, text, afterText, type, param, ... }
            })
        }
        return result
    }

    // 启动：每次页面加载时执行
    async function init() {
        try {
            if (!window.crypto || !crypto.subtle) throw new Error('Web Crypto API 不可用')

            // 1) 实时获取当前游戏版本号
            const verRes = await fetch(BASE + '/zzz_config.txt?ts=' + Date.now())
            const verJson = await verRes.json()
            const ver = verJson && verJson['zzz_config.txt']
            if (!ver) throw new Error('no version')

            // 2) 优先使用按版本缓存的数据（同版本内免去重复下载清单+解密）
            const cacheKey = CACHE_PREFIX + ver
            let list = null
            try {
                const cached = localStorage.getItem(cacheKey)
                if (cached) list = JSON.parse(cached)
            } catch (e) { /* 忽略缓存读取失败 */ }

            if (!list || !Array.isArray(list) || !list.length) {
                // 3) 下载并解压版本清单，取得两个配置表的 mtime
                const body = await loadVersionBody(ver)
                const mtime1 = getRogueLevelEventMtime(body)
                const mtime2 = getRogueEventChoiceMtime(body)
                if (!mtime1 || !mtime2) throw new Error('no mtime for event table')

                // 4) 抓取 rogueLevelEvent（明文）
                const hash1 = crc32('roguelevelevent.' + mtime1 + '.json')
                const res1 = await fetch(BASE + '/resource/json/xls/cn/{' + hash1 + '}.json')
                if (!res1.ok) throw new Error('rogueLevelEvent HTTP ' + res1.status)
                const eventArr = JSON.parse(await res1.text())

                // 5) 抓取 rogueEventChoice（加密）并解密
                const hash2 = crc32('rogueeventchoice.' + mtime2 + '.json')
                const res2 = await fetch(BASE + '/resource/json/xls/cn/{' + hash2 + '}.json')
                if (!res2.ok) throw new Error('rogueEventChoice HTTP ' + res2.status)
                const choiceArr = JSON.parse(await res2.text())

                list = await buildEventList(eventArr, choiceArr)
                try { localStorage.setItem(cacheKey, JSON.stringify(list)) } catch (e) { /* 忽略缓存写入失败 */ }
            }
            eventList = list
            ready = true
        } catch (e) {
            console.warn('[event-data] 事件信息动态加载失败：', e)
        }
        waiters.splice(0).forEach(fn => fn())
    }

    window.getDynamicEventData = getEventData
    window.onEventDataReady = onEventDataReady
    init()
})()

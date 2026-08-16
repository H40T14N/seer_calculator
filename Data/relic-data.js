/* ============ 遗物信息动态加载（启动脚本） ============ */
// 功能：每次加载项目页面时，从 s.61.com 实时抓取遗物配置表并渲染，数据文件不存入项目文件夹。
// 原理（逆向自游戏客户端 XlsModule + EncryptUtils）：
//   1) 抓取版本头 https://s.61.com/zzz_config.txt 得到当前游戏版本号 ts
//   2) 抓取版本清单 https://s.61.com/version/version{ts}.swf（实为 ZIP，内含 body JSON），
//      读取 resource/json/xls/cn 下 itemRelic.json 的 mtime
//   3) 配置表文件名 = CRC32("itemrelic.{mtime}.json")（文件名小写），
//      最终 URL = https://s.61.com/resource/json/xls/cn/{CRC32}.json
//   4) 表内每条记录 content 以 "ELOCKEDE_" 前缀加密（AES-256-CBC / PKCS7），
//      密钥 Blk8z4aPZfoM08Q7ir5DjJ2Z7RqJfApq，IV ABCDEF0123456789
//   5) 解密后仅保留 type=relic 的遗物，映射为图鉴需要的 品质/名字/效果/描述
// 说明：解密结果按版本号缓存于浏览器 localStorage（并非项目文件），数据本身始终从 s.61.com 实时加载。

(function () {
    'use strict'

    const BASE = 'https://s.61.com'
    const CACHE_PREFIX = 'seer_relic_data_'

    // 解密参数（逆向自游戏 Common.min.js 中的 EncryptUtils.DecryptAllLineInJson）
    const AES_KEY = 'Blk8z4aPZfoM08Q7ir5DjJ2Z7RqJfApq'
    const AES_IV = 'ABCDEF0123456789'

    // 配置表内品质数值 -> 图鉴品质字符串
    const QUALITY_MAP = { 0: 'special', 1: 'green', 2: 'blue', 3: 'purple', 4: 'orange', 5: 'red' }

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

    let relicList = []
    let ready = false
    const waiters = []

    // 对外：获取动态加载的遗物数据数组（未就绪时为空数组）
    function getRelicData() {
        return relicList
    }
    // 对外：动态数据就绪后回调（已就绪则立即执行）
    function onRelicDataReady(fn) {
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

    // 从清单读取 itemRelic.json 的 mtime
    function getItemRelicMtime(body) {
        const cn = body && body.files && body.files.resource && body.files.resource.json &&
            body.files.resource.json.xls && body.files.resource.json.xls.cn
        if (!cn) return 0
        const v = cn['itemRelic.json']
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

    // 解密配置表并映射为图鉴数据结构（仅保留遗物）
    async function buildRelicList(arr) {
        const result = []
        for (const rec of arr) {
            const plain = await aesDecryptCbc(rec.content.replace(/^ELOCKEDE_/, ''))
            const data = JSON.parse(plain)
            if (data.type !== 'relic') continue // 排除药剂等非遗物条目
            result.push({
                id: rec.id,
                name: data.name,
                quality: QUALITY_MAP[data.quality] || 'green',
                effect: data.desc || '',       // 游戏内效果
                desc: data.unlockDesc || ''    // 官方描述
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

            // 2) 优先使用按版本缓存的解密结果（同版本内免去重复下载 462KB 清单）
            const cacheKey = CACHE_PREFIX + ver
            let list = null
            try {
                const cached = localStorage.getItem(cacheKey)
                if (cached) list = JSON.parse(cached)
            } catch (e) { /* 忽略缓存读取失败 */ }

            if (!list || !Array.isArray(list) || !list.length) {
                // 3) 下载并解压版本清单，取得 itemRelic.json 的 mtime
                const body = await loadVersionBody(ver)
                const mtime = getItemRelicMtime(body)
                if (!mtime) throw new Error('no itemRelic mtime')

                // 4) 按哈希规则抓取配置表并解密
                const hash = crc32('itemrelic.' + mtime + '.json')
                const res = await fetch(BASE + '/resource/json/xls/cn/{' + hash + '}.json')
                if (!res.ok) throw new Error('itemRelic HTTP ' + res.status)
                const arr = JSON.parse(await res.text())
                list = await buildRelicList(arr)
                try { localStorage.setItem(cacheKey, JSON.stringify(list)) } catch (e) { /* 忽略缓存写入失败 */ }
            }
            relicList = list
            ready = true
        } catch (e) {
            console.warn('[relic-data] 遗物信息动态加载失败：', e)
        }
        waiters.splice(0).forEach(fn => fn())
    }

    window.getDynamicRelicData = getRelicData
    window.onRelicDataReady = onRelicDataReady
    init()
})()

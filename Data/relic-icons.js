/* ============ 遗物图标动态加载（启动脚本） ============ */
// 功能：每次加载项目页面时，从 s.61.com 实时抓取遗物图标资源并渲染，图标文件不存入项目文件夹。
// 原理（逆向自游戏客户端 PandaVersionManager / RES.getVirtualUrl）：
//   1) 抓取版本头 https://s.61.com/zzz_config.txt 得到当前游戏版本号 ts
//   2) 抓取版本清单 https://s.61.com/version/version{ts}.swf（实为 ZIP，内含 body JSON）
//   3) 在浏览器内解压 body，读取 resource/hole/item_relic_icon 下每个 item_relic_{id}.png 的 mtime
//   4) 服务器图标文件名 = CRC32("item_relic_{id}.{mtime}.png")
//   5) 最终图标 URL = https://s.61.com/resource/hole/item_relic_icon/{CRC32}.png
// 说明：id -> 图标URL 映射按版本号缓存于浏览器 localStorage（并非项目文件），图标本身始终从 s.61.com 实时加载。

(function () {
    'use strict'

    const BASE = 'https://s.61.com'
    const CACHE_PREFIX = 'seer_relic_icons_'

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

    let urlMap = {}
    let ready = false
    const waiters = []

    // 对外：获取某遗物 id 的图标 URL（未就绪或不存在时返回 ''）
    function getRelicIconUrl(id) {
        return urlMap[id] || ''
    }
    // 对外：图标映射就绪后回调（已就绪则立即执行）
    function onRelicIconsReady(fn) {
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

    // 从 body 构建 id -> 图标URL 映射
    function buildUrlMap(body) {
        const map = {}
        const folder = body && body.files && body.files.resource &&
            body.files.resource.hole && body.files.resource.hole.item_relic_icon
        if (!folder) return map
        for (const key of Object.keys(folder)) {
            if (key.indexOf('item_relic_') !== 0 || key.indexOf('.png') !== key.length - 4) continue
            const id = parseInt(key.slice(11, -4), 10) // 'item_relic_' 长 11 字符
            if (!id) continue
            const v = folder[key]
            const mtime = Array.isArray(v) ? +v[0] : +v
            if (!mtime) continue
            const hash = crc32('item_relic_' + id + '.' + mtime + '.png')
            map[id] = BASE + '/resource/hole/item_relic_icon/{' + hash + '}.png'
        }
        return map
    }

    // 启动：每次页面加载时执行
    async function init() {
        try {
            // 1) 实时获取当前游戏版本号
            const verRes = await fetch(BASE + '/zzz_config.txt?ts=' + Date.now())
            const verJson = await verRes.json()
            const ver = verJson && verJson['zzz_config.txt']
            if (!ver) throw new Error('no version')

            // 2) 优先使用按版本缓存的映射（同版本内免去重复下载 462KB 清单）
            const cacheKey = CACHE_PREFIX + ver
            let map = null
            try {
                const cached = localStorage.getItem(cacheKey)
                if (cached) map = JSON.parse(cached)
            } catch (e) { /* 忽略缓存读取失败 */ }

            if (!map || typeof map !== 'object') {
                // 3) 下载并解压版本清单，构建映射
                const body = await loadVersionBody(ver)
                map = buildUrlMap(body)
                try { localStorage.setItem(cacheKey, JSON.stringify(map)) } catch (e) { /* 忽略缓存写入失败 */ }
            }
            urlMap = map
            ready = true
        } catch (e) {
            console.warn('[relic-icons] 遗物图标映射加载失败，将使用品质色块兜底：', e)
        }
        waiters.splice(0).forEach(fn => fn())
    }

    window.getRelicIconUrl = getRelicIconUrl
    window.onRelicIconsReady = onRelicIconsReady
    init()
})()

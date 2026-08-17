/* ============ 事件精灵立绘动态加载（启动脚本） ============ */
// 功能：每次加载项目页面时，从 s.61.com 实时抓取时空裂隙/幻影楼层事件的精灵立绘资源并渲染，图片不存入项目文件夹。
// 原理（逆向自游戏客户端 PandaVersionManager / RES.getVirtualUrl，与遗物/魂印/增益一致）：
//   1) 抓取版本头 https://s.61.com/zzz_config.txt 得到当前游戏版本号 ts
//   2) 抓取版本清单 https://s.61.com/version/version{ts}.swf（实为 ZIP，内含 body JSON），
//      读取 resource/fight/pet/body 下每个 pet_body{modelId}.png 的 mtime
//   3) 最终文件名 = CRC32("pet_body{modelId}.{mtime}.png")
//   4) 最终 URL = https://s.61.com/resource/fight/pet/body/{CRC32}.png
// 说明：id -> URL 映射按版本号缓存于浏览器 localStorage（并非项目文件），图片本身始终从 s.61.com 实时加载。

(function () {
    'use strict'

    const BASE = 'https://s.61.com'
    const CACHE_PREFIX = 'seer_event_icons_'

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

    // 对外：获取某事件精灵 modelId 的立绘 URL（未就绪或不存在时返回 ''）
    function getEventSpriteUrl(modelId) {
        return urlMap[modelId] || ''
    }
    // 对外：图标映射就绪后回调（已就绪则立即执行）
    function onEventSpritesReady(fn) {
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

    // 从 body 构建 modelId -> 立绘URL 映射
    function buildUrlMap(body) {
        const map = {}
        const folder = body && body.files && body.files.resource &&
            body.files.resource.fight && body.files.resource.fight.pet && body.files.resource.fight.pet.body
        if (!folder) return map
        for (const key of Object.keys(folder)) {
            // key format: pet_bodyNNN.png -> NNN = modelId
            const match = key.match(/^pet_body(\d+)\.png$/)
            if (!match) continue
            const id = parseInt(match[1], 10)
            if (!id) continue
            const v = folder[key]
            const mtime = Array.isArray(v) ? +v[0] : +v
            if (!mtime) continue
            const hash = crc32('pet_body' + id + '.' + mtime + '.png')
            map[id] = BASE + '/resource/fight/pet/body/{' + hash + '}.png'
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

            // 2) 优先使用按版本缓存的映射（同版本内免去重复下载清单）
            const cacheKey = CACHE_PREFIX + ver
            let map = null
            try {
                const cached = localStorage.getItem(cacheKey)
                if (cached) map = JSON.parse(cached)
            } catch (e) { /* 忽略缓存读取失败 */ }

            if (!map || typeof map !== 'object' || !Object.keys(map).length) {
                // 3) 下载并解压版本清单，取得 pet_body*.png 的 mtime
                const body = await loadVersionBody(ver)
                map = buildUrlMap(body)
                try { localStorage.setItem(cacheKey, JSON.stringify(map)) } catch (e) { /* 忽略缓存写入失败 */ }
            }
            urlMap = map
            ready = true
        } catch (e) {
            console.warn('[event-icons] 精灵立绘动态加载失败：', e)
        }
        waiters.splice(0).forEach(fn => fn())
    }

    window.getEventSpriteUrl = getEventSpriteUrl
    window.onEventSpritesReady = onEventSpritesReady
    init()
})()

/**
 * Image URL construction and proxying.
 *
 * The API returns relative image filenames (e.g. "abc123.jpg").
 * Full URL = https://qnhdpic.twt.edu.cn/download/origin/{filename}
 * We proxy through Vite: /qnhdpic/download/origin/{filename}
 */

const PIC_PROXY_BASE = '/qnhdpic/download/'

/**
 * Build a full-size image URL from a relative filename.
 */
export function imageOriginUrl(filename) {
    if (!filename) return ''
    // Already a full URL — proxy it
    if (filename.startsWith('http')) {
        return proxyFullUrl(filename)
    }
    return PIC_PROXY_BASE + 'origin/' + filename
}

/**
 * Build a thumbnail image URL from a relative filename.
 */
export function imageThumbUrl(filename) {
    if (!filename) return ''
    if (filename.startsWith('http')) {
        return proxyFullUrl(filename)
    }
    return PIC_PROXY_BASE + 'thumb/' + filename
}

/**
 * Proxy a full URL through Vite.
 */
function proxyFullUrl(url) {
    if (!url) return ''
    if (url.startsWith('/')) return url
    try {
        const u = new URL(url)
        if (u.hostname === 'qnhdpic.twt.edu.cn') {
            return '/qnhdpic' + u.pathname + u.search
        }
        if (u.hostname === 'qnhd.twt.edu.cn') {
            return '/qnhd-static' + u.pathname + u.search
        }
    } catch (e) {
        // not a URL
    }
    return url
}

/**
 * Process an array of image filenames to origin URLs.
 */
export function imageOriginUrls(filenames) {
    if (!Array.isArray(filenames)) return []
    return filenames.map(imageOriginUrl)
}

/**
 * Process an array of image filenames to thumb URLs.
 */
export function imageThumbUrls(filenames) {
    if (!Array.isArray(filenames)) return []
    return filenames.map(imageThumbUrl)
}

/**
 * Build an avatar image URL.
 * Flutter: https://qnhdpic.twt.edu.cn/download/origin/{avatar}
 */
export function avatarUrl(avatar) {
    if (!avatar) return ''
    if (avatar.startsWith('http')) return proxyFullUrl(avatar)
    return PIC_PROXY_BASE + 'origin/' + avatar
}

/**
 * Level colors matching Flutter's levelColors palette.
 * Used when no avatar image is available.
 */
const AVATAR_COLORS = [
    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC',
    '#26C6DA', '#EC407A', '#8D6E63', '#78909C',
    '#5C6BC0', '#D4E157'
]

export function getAvatarColor(uid) {
    if (!uid) return AVATAR_COLORS[0]
    return AVATAR_COLORS[uid % AVATAR_COLORS.length]
}


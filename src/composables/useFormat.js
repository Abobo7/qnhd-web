/**
 * Shared formatting utilities for dates and content rendering.
 */

const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
}

function escapeHtml(text) {
    return text.replace(/[&<>"'`]/g, (ch) => HTML_ESCAPE_MAP[ch] || ch)
}

/**
 * Render user text safely with line breaks.
 * Escapes HTML to prevent XSS, then converts \n to <br/>.
 */
export function renderContent(text) {
    if (!text) return ''
    return escapeHtml(text).replace(/\n/g, '<br/>')
}

/**
 * Relative time format (e.g. "刚刚", "3分钟前", "2小时前").
 */
export function formatRelativeTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return '刚刚'
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
    if (diff < 604800) return Math.floor(diff / 86400) + '天前'
    return d.toLocaleDateString('zh-CN')
}

/**
 * Full date-time format: YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const sec = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}:${sec}`
}

/**
 * Short date-time format: YYYY-MM-DD HH:mm
 */
export function formatDateTimeShort(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncateContent(text, maxLen = 150) {
    if (!text) return ''
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

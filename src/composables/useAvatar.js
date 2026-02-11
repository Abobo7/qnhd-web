/**
 * Shared avatar utilities for extracting and displaying user avatars.
 */
import { avatarUrl, getAvatarColor } from '../utils/image'

/**
 * Extract avatar string from a post or floor object.
 * Returns empty string for anonymous/school-official posts.
 *
 * @param {Object} item - post or floor object
 * @param {Object} options
 * @param {boolean} options.hideAvatar - force hide (e.g. school posts)
 */
export function getAvatarStr(item, { hideAvatar = false } = {}) {
    if (!item) return ''
    if (hideAvatar || item.type === 1) return ''
    const ui = item.user_info
    if (ui && ui.avatar && ui.avatar !== '') return ui.avatar
    if (item.avatar && item.avatar !== '') return item.avatar
    return ''
}

/**
 * Get the first character for a letter avatar fallback.
 * Prefers Chinese characters; falls back to first character of name.
 */
export function getLetterAvatar(nickname, fallback = '匿') {
    const name = nickname || fallback
    const cleaned = name.replace(/[\d\*\s]/g, '').replace(/[^\u4e00-\u9fa5]/g, '')
    return cleaned ? cleaned[0] : name[0]
}

/**
 * Build full avatar image URL from an item (post/floor).
 */
export function getAvatarImageUrl(item, options = {}) {
    const str = getAvatarStr(item, options)
    if (!str) return ''
    return avatarUrl(str)
}

export { avatarUrl, getAvatarColor }

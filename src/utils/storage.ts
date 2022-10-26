/* 本地存储封装 */
/**
 * 设置本地缓存
 */
export function setStorage(key:string, data = '', temporary = false) {
  if (temporary) {
    sessionStorage.setItem(key, data)
  } else {
    localStorage.setItem(key, data)
  }
}

/**
 * 获取缓存，先从sessionStorage中获取，若为空，再从localStorage中获取
 */
export function getStorage(key:string) {
  let data = sessionStorage.getItem(key)

  if (!data) {
    data = localStorage.getItem(key)
  }
  return data
}

/**
 * 同时清除sessionStorage和localStorage缓存
 */
export function clearStorage(key:string) {
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
}

/**
 * 清除所有缓存
 */
export function clearAllStorage() {
  sessionStorage.clear()
  localStorage.clear()
}

/**
 * 获取用户Token
 * @returns token
 */
export function getToken() {
  return getStorage('aha_token') || ''
}

/**
 * 设置用户token
 * @param {String} token
 */
export function setToken(token:string) {
  setStorage('aha_token', token)
}

/**
 * 清除用户token
 */
export function clearToken() {
  clearStorage('aha_token')
}

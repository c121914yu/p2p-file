import { message } from 'antd'
import { MessageType } from 'antd/lib/message'

/**
 * 解析路径参数
 */
export function sq(str = window.location.href) {
  const query:{ // 用一个对象存储目标值
    [key: string]: string
  } = {}
  const paramsArr:string[] = str.split('?') // 截取?号后的字符串即name=itclanCoder&study=css

  if (paramsArr.length > 1) {
    const params = paramsArr[ 1 ]

    params.split('&').forEach(item => {
      const param = item.split('=')

      query[ param[ 0 ] ] = param[ 1 ]
    })
  }
  return query
}
/**
 * 对象转路由query
 * @param {Boolean} hasMask 是否有问号
 */
export function qs(obj:{[key:string]:any}, hasMask = true) {
  let param = hasMask ? '?' : ''

  for (const key in obj) {
    if (obj[ key ] !== undefined && obj[ key ] !== null) {
      param += `${ key }=${ obj[ key ] }&`
    }
  }
  return param.slice(0, -1)
}

/**
* 防抖
*/
let dTimer:NodeJS.Timeout

export function debounce(cb:()=>void, delay = 500) {
  if (dTimer) {
    clearTimeout(dTimer)
  }
  dTimer = setTimeout(() => {
    cb()
  }, delay)
}
/**
* 节流
* @param {Function} cb 回调
* @param {Number} time 多久执行一次
*/
let tTimer:number

export function throttle(cb:()=>void, time = 500) {
  if (!tTimer || Date.now() - tTimer >= time) {
    tTimer = Date.now()
    cb()
  }
}

/* antd 消息提示 */
interface messageProps {
  duration?: number
  key?: string | number
}
message.config({
  top: 50,
  maxCount: 3,
})

export function $success(
  text: string,
  { duration = 2.5, key }: messageProps = {}
) {
  message.success({
    content: text,
    duration,
    key,
  })
}
export function $warning(
  text: string,
  { duration = 2.5, key }: messageProps = {}
) {
  message.warn({
    content: text,
    duration,
    key,
  })
}
export function $error(
  text: string,
  { duration = 2.5, key }: messageProps = {}
) {
  message.error({
    content: text,
    duration,
    key,
  })
}
export function $loading(
  text = '加载中...',
  { duration = 0, key }: messageProps = {}
): MessageType {
  return message.loading({
    content: text,
    duration,
    key,
  })
}
export function $hideMsg(key?:string) {
  message.destroy(key)
}

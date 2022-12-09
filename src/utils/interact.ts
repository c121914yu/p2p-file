import { message } from 'antd'
import { MessageType } from 'antd/lib/message'

/* antd 消息提示 */
interface messageProps {
  duration?: number
  key?: string | number
}
message.config({
  top: 50,
  maxCount: 3,
})

export function $info(
  text: string,
  { duration = 2.5, key = 'defaultToast' }: messageProps = {}
) {
  message.info({
    content: text,
    duration,
    key,
  })
}
export function $success(
  text: string,
  { duration = 2.5, key = 'defaultToast' }: messageProps = {}
) {
  message.success({
    content: text,
    duration,
    key,
  })
}
export function $warning(
  text: string,
  { duration = 2.5, key = 'defaultToast' }: messageProps = {}
) {
  message.warn({
    content: text,
    duration,
    key,
  })
}
export function $error(
  text: string,
  { duration = 2.5, key = 'defaultToast' }: messageProps = {}
) {
  message.error({
    content: text,
    duration,
    key,
  })
}
export function $loading(
  text = '加载中...',
  { duration = 0, key = 'defaultToast' }: messageProps = {}
): MessageType {
  return message.loading({
    content: text,
    duration,
    key,
  })
}
export function $hideMsg(key = 'defaultToast') {
  message.destroy(key)
}

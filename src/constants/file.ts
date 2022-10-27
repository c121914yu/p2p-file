export enum FILE_STATUS {
    leisure = 0,
    sending = 1,
    error = 2,
}
export const FILE_STATUS_TEXT:{[key: number]:{label: string, color: string}} = {
  0: {
    label: '空闲',
    color: 'gold'
  },
  1: {
    label: '传输中',
    color: 'blur'
  },
  2: {
    label: '出错了',
    color: 'red'
  },
}


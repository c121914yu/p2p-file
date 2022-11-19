export enum socketCallbackEnum {
  'new-join' = 'new-join',
  'leave-room' = 'leave-room'
}
export enum peerCallbackEnum {
  addFiles = 'add-files',
  otherOpened = 'other-opened',
  peerDisconnect = 'peer-disconnect',
  connections = 'connections',
  reqDownload = 'request-download',
  resDownload = 'response-download',
  downloadError = 'download-error',
  downloadFinish = 'download-finish'
}

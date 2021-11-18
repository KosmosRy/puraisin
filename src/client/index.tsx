import ReactDOM from 'react-dom'
import App from './App'
import { AppInfo, UserStatus } from '../common/types'

declare global {
  interface Window {
    __USERSTATUS__: UserStatus
    __APPINFO__: AppInfo
  }
}

const userStatus = window.__USERSTATUS__
const appInfo = window.__APPINFO__

ReactDOM.hydrate(<App userStatus={userStatus} appInfo={appInfo} />, document.getElementById('app'))

import ReactDOM from 'react-dom'
import { AppInfo, Binge } from '../common/types'
import App from './App'

export default (userStatus: Binge, appInfo: AppInfo) => {
  ReactDOM.hydrate(<App userStatus={userStatus} appInfo={appInfo} />, document.getElementById('app'))
}


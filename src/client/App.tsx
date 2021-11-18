import { VFC } from 'react'
import { FrontPage } from './components/FrontPage'
import { AppInfo, UserStatus } from '../common/types'
import styled from 'styled-components'
import { GlobalStyle } from './GlobalStyle'
import dayjs from 'dayjs'

export interface AppProps {
  appInfo: AppInfo
  userStatus: UserStatus
}

const App: VFC<AppProps> = ({ appInfo, userStatus }) => (
  <AppContainer>
    <GlobalStyle />
    <MainContainer>
      <FrontPage info={appInfo} initialUserStatus={userStatus} />
      <Copyright>&copy; Apin Heristäjät {dayjs().get('year')}</Copyright>
    </MainContainer>
  </AppContainer>
)

export default App

const AppContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 15px;
`

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const Copyright = styled.div`
  flex-shrink: 0;
  padding-bottom: 10px;
`

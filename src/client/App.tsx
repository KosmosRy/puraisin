import { VFC } from 'react'
import { FrontPage } from './components/FrontPage'
import { AppInfo, Binge } from '../common/types'
import styled from 'styled-components'
import { GlobalStyle } from './GlobalStyle'
import dayjs from 'dayjs'

export interface AppProps {
  appInfo: AppInfo
  userStatus: Binge
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

const AppContainer = styled.div({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: '0 15px'
})

const MainContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh'
})

const Copyright = styled.div({
  marginTop: 16,
  flexShrink: 0,
  paddingBottom: 10
})

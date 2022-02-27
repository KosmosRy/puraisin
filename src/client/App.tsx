import dayjs from 'dayjs'
import { VFC } from 'react'
import styled from 'styled-components'
import { AppInfo, Binge } from '../common/types'
import { GlobalStyle } from './GlobalStyle'
import { FrontPage } from './components/FrontPage'

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
  gap: 32
})

const Copyright = styled.div({
  flexShrink: 0,
  paddingBottom: 10
})

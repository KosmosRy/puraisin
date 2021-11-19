import App, { AppProps } from '../client/App'
import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

export const appHtml = ({ appInfo, userStatus }: AppProps) => {
  const sheet = new ServerStyleSheet()
  try {
    const html = ReactDOMServer.renderToString(
      sheet.collectStyles(<App appInfo={appInfo} userStatus={userStatus} />)
    )
    const styles = sheet.getStyleTags()
    return { html, styles }
  } finally {
    sheet.seal()
  }
}
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle({
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    textRendering: 'optimizeLegibility'
  },
  'html, body': {
    height: '100%'
  },
  body: {
    fontFamily: '"Roboto", Helvetica, Arial, sans-serif',
    fontWeight: 400,
    fontSize: 16,
    color: '#777',
    background: '#F9F9F9'
  },
  'input[type="text"], input[type="number"], textarea, select': {
    fontFamily: '"Roboto", Helvetica, Arial, sans-serif',
    padding: '6px 12px',
    border: '1px solid #ced4da',
    borderRadius: 4,
    fontSize: 16,
    color: '#495057',
    ':focus': {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgb(0 123 255 / 25%)',
      outline: 0,
      zIndex: 3
    }
  }
})

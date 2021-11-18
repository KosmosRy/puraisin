import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
}

html, body {
    height: 100%;
}

body {
    font-family: "Roboto", Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: #777;
    background: #F9F9F9;
}

input[type="text"], input[type="number"], textarea, select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  color: #495057;
  
  :focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
    outline: 0;
    z-index: 3;
  }
}
`

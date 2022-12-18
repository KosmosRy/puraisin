import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
  textRendering: 'optimizeLegibility',
});

globalStyle('html, body', {
  height: '100%',
});

globalStyle('body', {
  fontFamily: '"Roboto", Helvetica, Arial, sans-serif',
  fontWeight: 400,
  fontSize: 16,
  color: '#777',
  background: '#F9F9F9',
});

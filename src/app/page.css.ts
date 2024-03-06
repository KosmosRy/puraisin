import { style } from '@vanilla-extract/css';

export const appContainer = style({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: '0 15px',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
});

export const copyright = style({
  flexShrink: 0,
  paddingBottom: 10,
});

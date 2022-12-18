import { globalStyle, style } from '@vanilla-extract/css';

export const adornedInputContainer = style({
  display: 'flex',
  justifyContent: 'flex-start',
});

globalStyle(`${adornedInputContainer} input`, {
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

export const inputAdornment = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#495057',
  backgroundColor: '#e9ecef',
  padding: '4px 8px',
  border: '1px solid #ced4da',
  borderLeft: 'none',
  borderRadius: 4,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  fontSize: 14,
  lineHeight: 1.5,
});

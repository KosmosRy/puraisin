import { style } from '@vanilla-extract/css';

export const baseInput = style({
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
    zIndex: 3,
  },
});
export const fullWidth = style({
  width: '100%',
});

import { style, styleVariants } from '@vanilla-extract/css';

export const headingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 5,
  marginBottom: 16,
  gap: 10,
});
export const userRow = style({
  display: 'flex',
  justifyContent: 'space-between',
});
export const title = styleVariants({
  h3: {
    fontSize: 32,
    fontWeight: 300,
    marginBottom: 10,
  },
  h4: {
    margin: '5px 0 15px',
    fontSize: 16,
    fontWeight: 400,
  },
});
export const userInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  alignItems: 'flex-end',
  fontSize: 14,
  textAlign: 'right',
});
export const statusRow = style({
  display: 'flex',
});
export const statusList = style({
  listStyleType: 'none',
});
export const statusListItem = style({
  lineHeight: 1.5,
});
export const logout = style({
  padding: '4px 8px',
  borderRadius: 3.2,
  color: 'inherit',
  borderStyle: 'solid',
  borderWidth: 1,
  backgroundColor: '#ffc107',
  borderColor: '#ffc107',
  textDecoration: 'none',
  textAlign: 'center',
  fontSize: 14,
  verticalAlign: 'middle',
  lineHeight: 1.5,
  userSelect: 'none',
  fontWeight: 400,

  ':hover': {
    backgroundColor: '#e0a800',
    borderColor: '#d39e00',
  },
});

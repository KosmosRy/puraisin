import { style } from '@vanilla-extract/css';

export const frontPageContainer = style({
  display: 'flex',
  flexDirection: 'column',
});
export const loadingContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
});
export const biteDoneContainer = style({
  transition: 'opacity 3s 7s',
  opacity: 1,
});

import { style } from '@vanilla-extract/css';
import { baseInput } from './styles.css';

export const pfRow = style({
  margin: '16px 0',
  display: 'flex',
  gap: 16,
});

export const pfLabel = style({
  display: 'flex',
  alignItems: 'center',
  height: 33,
});

export const pfCheckbox = style({
  marginRight: 8,
});

export const pfInput = style([
  baseInput,
  {
    maxWidth: 65,
  },
]);

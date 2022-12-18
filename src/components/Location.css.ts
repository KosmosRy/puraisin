import { style } from '@vanilla-extract/css';
import { baseInput } from './styles.css';

export const row = style({
  display: 'flex',
  margin: '8px 0',
  gap: 8,
});

export const customLocationInput = style([baseInput]);

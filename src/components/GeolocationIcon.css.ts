import { createVar, style } from '@vanilla-extract/css';

export const iconColor = createVar();

export const icon = style({
  verticalAlign: -2,
  width: 16,
  color: iconColor,
});

import { style, styleVariants } from '@vanilla-extract/css';

export const alertVariant = styleVariants({
  success: {
    color: '#155724',
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  danger: {
    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
});

export const container = style({
  borderRadius: 4,
  padding: '12px 20px',
  marginBottom: 16,
  border: '1px solid transparent',
});

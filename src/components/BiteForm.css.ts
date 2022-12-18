import { style } from '@vanilla-extract/css';
import { baseInput, fullWidth } from './styles.css';

export const biteForm = style({
  marginTop: -16,
});

export const row = style({
  display: 'flex',
  margin: '16px 0',
});

export const fullWidthInput = style([baseInput, fullWidth]);

export const portionRow = style([
  row,
  {
    flexDirection: 'column',
  },
]);

export const portionSelectLabel = style({
  fontWeight: 300,
  marginBottom: 8,
  display: 'inline-block',
});

export const portionInfo = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
});

export const portionSelectColumn = style({
  flex: '2 1 66%',
});

export const portionSelectComponent = style([
  baseInput,
  {
    width: '100%',
    appearance: 'none',
    background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='currentColor'><polygon points='0,25 100,25 50,75'/></svg>") no-repeat`,
    backgroundSize: 12,
    backgroundPosition: 'calc(100% - 10px) center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'white',
    paddingRight: 32,
  },
]);

export const portionInputColumn = style({
  flex: '1 0 33%',
});

export const portionInput = style([
  baseInput,
  {
    maxWidth: 65,
  },
]);

export const submit = style({
  display: 'inline-block',
  color: '#fff',
  backgroundColor: '#28a745',
  border: '1px solid #28a745',
  textAlign: 'center',
  verticalAlign: 'middle',
  userSelect: 'none',
  padding: '6px 12px',
  fontSize: 16,
  lineHeight: 1.5,
  borderRadius: 4,
  ':hover': {
    backgroundColor: '#218838',
    borderColor: '#1e7e34',
  },
});

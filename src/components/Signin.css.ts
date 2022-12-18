import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',
  marginRight: 'auto',
  marginLeft: 'auto',
  textAlign: 'center',
  color: '#777',
  backgroundColor: '#f9f9f9',
  lineHeight: 1.5,
});

const heading = style({
  fontWeight: 500,
});

export const heading1 = style([
  heading,
  {
    fontSize: 40,
  },
]);

export const heading2 = style([
  heading,
  {
    fontSize: 32,
  },
]);

export const disclaimer = style({
  fontSize: 'small',
  marginBottom: 25,
});

export const link = style({
  cursor: 'pointer',
  alignItems: 'center',
  color: '#fff',
  backgroundColor: '#4A154B',
  border: 0,
  borderRadius: 48,
  display: 'inline-flex',
  fontFamily: 'Lato, sans-serif',
  fontSize: 16,
  fontWeight: 600,
  height: 48,
  justifyContent: 'center',
  textDecoration: 'none',
  width: 256,
});

export const svg = style({
  height: 20,
  width: 20,
  marginRight: 12,
});

/*
body {
            font-family: Roboto,Helvetica,Arial,sans-serif;
            font-weight: 100;
            font-size: 16px;
            width: 100%;
            height: 100%;
            margin-right: auto;
            margin-left: auto;
            text-align: center;
            color: #777;
            background: #f9f9f9;
            line-height: 1.5;
        }

        h1, h2 {
            font-weight: 500;
        }

        h1 {
            font-size: 40px;
        }

        h2 {
            font-size: 32px;
        }

        .disclaimer {
            font-size: small;
            margin-bottom: 25px;
        }
 */

import '../styles/global.css';
import { FC, PropsWithChildren } from 'react';
import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ReactDOM from 'react-dom';

export const metadata: Metadata = {
  title: 'Pikapuraisin',
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  ReactDOM.preconnect(
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap',
  );
  return (
    <html lang="fi">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;

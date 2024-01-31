import { type DocumentProps, Head, Html, Main, NextScript } from 'next/document';
import { type FC } from 'react';

const Document: FC<DocumentProps> = () => (
  <Html>
    <Head>
      <link rel="shortcut icon" type="image/png" href="/favicon.png" />
      <link rel="shortcut icon" sizes="196x196" href="/favicon.png" />
      <link rel="apple-touch-icon-precomposed" href="/favicon.png" />
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap"
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;

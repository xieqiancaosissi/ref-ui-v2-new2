import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  return (
    <Html className="dark" lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <title>REF Finance</title>
      </Head>
      <body className="dark:bg-dark-30 bg-lightWhite-20" id="root">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

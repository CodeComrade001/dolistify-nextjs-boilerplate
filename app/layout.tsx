import React from "react";
import bodyGlobalStyle from "./styles/bobyDefault.module.css"

export const metadata = {
  title: 'Dolistify',
  description: 'A Task Management Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Dolistify</title>
        <meta name="description" content="A Task Management Application" />
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={bodyGlobalStyle.body_global_style} >
        {children}  {/* This will render different page content based on route */}
      </body>
    </html>
  );
}

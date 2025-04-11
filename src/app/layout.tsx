import React from "react";
import bodyGlobalStyle from "./styles/bodyDefault.module.css";
import { NotifierProvider } from "./context/notificationContext";

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={bodyGlobalStyle.body_global_style}>
        <NotifierProvider>
            <main>{children}</main>
        </NotifierProvider>
      </body>
    </html>
  );
}
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import AuthStatusProvider from "./auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Task Management System",
  description: "Sistema de gerenciamento de tarefas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      ></meta>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthStatusProvider />
        {children}
      </body>
    </html>
  );
}

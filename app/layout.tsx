import './globals.css';
import { gql } from '@apollo/client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { getClient } from '../util/apolloClient';
import { LogoutButton } from './(auth)/logout/LogoutButton';
import { ApolloClientProvider } from './ApolloClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = await getClient().query({
    query: gql`
      query LoggedInAnimal {
        loggedInAnimal {
          id
          firstName
          type
          accessory
        }
      }
    `,
  });

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav
          style={{
            width: '100%',
            backgroundColor: 'lightblue',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <Link href="/">Home</Link>
            <Link href="/animals">Animals</Link>
            <Link href="/animals/dashboard">Animal Dashboard</Link>
          </div>

          <span>{data.loggedInAnimal?.firstName}</span>
          {data.loggedInAnimal?.firstName ? (
            <LogoutButton />
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
        <ApolloClientProvider>{children}</ApolloClientProvider>
      </body>
    </html>
  );
}

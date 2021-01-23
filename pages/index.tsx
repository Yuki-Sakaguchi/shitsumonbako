import Head from 'next/head'
import { useAuthentication } from '../hooks/auth';

export default function Home() {
  const { user } = useAuthentication();

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <p>
          {user?.uid || '未ログイン'}
        </p>
      </main>
    </div>
  )
}

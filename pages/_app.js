import AuthProvider from '../contexts/AuthContext'
import '../styles/globals.css'
import Head from 'next/head'
import Navbar from '../components/NavBar'
import "../flow/config.js";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className='bg-[#011E30] flex flex-col min-h-screen'>
        <main className='container mx-auto flex-1 p-5'>
          <Navbar />
          <Head>
            <title>#-DAPPNAME</title>
            <meta name="description" content="Used by Emerald Academy" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </main>
        <footer>
          <img className="w-full" src='/city.svg' alt='city' />
          <div className='bg-black flex pt-10 pb-5 justify-center text-white'>
            <div className='w-[80%] flex justify-between items-center'>
              <div className='font-jet text-xs'>2022. All rights reserved.</div>
              <a className='flex items-center text-[#38E8C6] hover:underline hover:underline-offset-2 space-x-1 font-poppins text-lg' href='https://academy.ecdao.org/'><h1>Emerald</h1>
                <img src='/EC_Education.png' width={40} alt='city' />
                <h1>Academy</h1></a>
              <div className='font-jet text-xs'>Created by <a href='https://discord.gg/emeraldcity' className='text-[#38E8C6] hover:underline hover:underline-offset-2 '>Emerald City DAO</a></div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}

export default MyApp

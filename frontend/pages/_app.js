import '../styles/globals.css'
import Navbar from '../components/Navbar'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp

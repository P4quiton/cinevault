
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import MovieCatalog from './components/MovieCatalog'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message)
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
  }

  if (loading) {
    return <main className="auth-page">Cargando CineVault...</main>
  }

  if (session) {
    return (
      <MovieCatalog
        user={session.user}
        onLogout={signOut}
      />
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">CINEVAULT</div>
        <p className="subtitle">Tu universo de películas</p>
        <h1>Explora el cine</h1>
        <p>Inicia sesión para descubrir nuestro catálogo.</p>
        <button onClick={signInWithGoogle}>
          Continuar con Google
        </button>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  )
}

export default App


import { useEffect, useState } from 'react'
import {
  Film, Search, LogOut, Star, X,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { getMovies } from '../services/movies'

const posterUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : null

export default function MovieCatalog({ user, onLogout }) {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')

      try {
        const result = await getMovies(page, search)
        if (!active) return
        setMovies(result.movies)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (err) {
        if (!active) return
        setMovies([])
        setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [page, search])

  useEffect(() => {
    if (!selected) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selected])

  const changeSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="catalog">
      <header className="navbar">
        <div className="logo"><Film size={26} /> CINEVAULT</div>
        <div className="nav-user">
          <span>{user?.user_metadata?.full_name || user?.email}</span>
          <button onClick={onLogout} className="logout">
            <LogOut size={17} /> Salir
          </button>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">TU UNIVERSO DE CINE</span>
        <h1>Descubre tu próxima película favorita.</h1>
        <p>Explora historias, encuentra películas y descubre nuevos mundos.</p>
        <div className="search-box">
          <Search size={22} />
          <input
            type="search"
            placeholder="Buscar películas por título..."
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="movies-section">
        <div className="section-heading">
          <h2>{search ? 'Resultados de búsqueda' : 'Películas populares'}</h2>
          {!loading && <span>{total} películas</span>}
        </div>

        {error && <p className="error">Error: {error}</p>}
        {loading && <p className="loading">Cargando películas...</p>}

        {!loading && !error && movies.length === 0 && (
          <p className="empty">No encontramos películas con ese título.</p>
        )}

        <div className="movie-grid">
          {!loading && movies.map((movie) => (
            <button
              className="movie-card"
              key={movie.id}
              onClick={() => setSelected(movie)}
            >
              <div className="poster-container">
                {movie.poster_path ? (
                  <img
                    src={posterUrl(movie.poster_path)}
                    alt={`Póster de ${movie.title}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-poster"><Film size={48} /></div>
                )}
                <span className="rating">
                  <Star size={14} fill="currentColor" />
                  {Number(movie.vote_average ?? 0).toFixed(1)}
                </span>
              </div>
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.release_date?.slice(0, 4) || 'Sin fecha'}</p>
              </div>
            </button>
          ))}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={18} /> Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <footer className="footer">
        Este producto utiliza la API de TMDB, pero no está avalado ni
        certificado por TMDB.
      </footer>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <section
            className="movie-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalles de ${selected.title}`}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelected(null)}
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
            {selected.backdrop_path && (
              <img
                className="modal-backdrop"
                src={posterUrl(selected.backdrop_path)}
                alt=""
              />
            )}
            <div className="modal-content">
              <h2>{selected.title}</h2>
              <p className="modal-meta">
                {selected.release_date?.slice(0, 4) || 'Sin fecha'}
                {' · '} ⭐ {Number(selected.vote_average ?? 0).toFixed(1)}/10
              </p>
              <h3>Sinopsis</h3>
              <p>{selected.overview || 'Sinopsis no disponible.'}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

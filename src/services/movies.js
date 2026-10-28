
import { supabase } from '../lib/supabase'

export async function getMovies(page = 1, search = '') {
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('movies')
    .select(`
      id,
      title,
      overview,
      release_date,
      poster_path,
      backdrop_path,
      vote_average,
      popularity
    `, { count: 'exact' })

  if (search.trim()) {
    const term = search.trim().replace(/[%_,]/g, '')
    if (term) query = query.ilike('title', `%${term}%`)
  }

  const { data, count, error } = await query
    .order('popularity', { ascending: false })
    .order('id', { ascending: true })
    .range(from, to)

  if (error) throw error

  return {
    movies: data ?? [],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

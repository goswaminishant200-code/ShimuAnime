import { supabase } from './supabase'

// ── AUTH ────────────────────────────────────────────────────
export async function registerUser(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { display_name: displayName } }
  })
  if (error) throw error
  return data
}
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}
export async function logoutUser() { await supabase.auth.signOut() }

// ── PROFILES ────────────────────────────────────────────────
export async function getProfile(uid) {
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
  return data
}
export async function updateProfile(uid, updates) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', uid)
  if (error) throw error
}
export async function getAllProfiles() {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return data || []
}

// ── ADMIN ────────────────────────────────────────────────────
export const grantPremium  = (uid) => updateProfile(uid, { role: 'premium' })
export const revokePremium = (uid) => updateProfile(uid, { role: 'free' })
export const makeAdmin     = (uid) => updateProfile(uid, { role: 'admin' })
export const banUser       = (uid) => updateProfile(uid, { banned: true })
export const unbanUser     = (uid) => updateProfile(uid, { banned: false })

// ── WATCHLIST ────────────────────────────────────────────────
export async function addToWatchlist(uid, animeId, d) {
  const { error } = await supabase.from('watchlist').upsert({
    user_id: uid, anime_id: String(animeId),
    title: d.title, image: d.image, score: d.score, episodes: String(d.episodes)
  })
  if (error) throw error
}
export async function removeFromWatchlist(uid, animeId) {
  await supabase.from('watchlist').delete().eq('user_id', uid).eq('anime_id', String(animeId))
}
export async function getWatchlist(uid) {
  const { data } = await supabase.from('watchlist').select('*').eq('user_id', uid).order('created_at', { ascending: false })
  return data || []
}
export async function checkWatchlist(uid, animeId) {
  const { data } = await supabase.from('watchlist').select('anime_id').eq('user_id', uid).eq('anime_id', String(animeId)).single()
  return !!data
}

// ── RATINGS ──────────────────────────────────────────────────
export async function submitRating(uid, animeId, rating) {
  await supabase.from('ratings').upsert({ user_id: uid, anime_id: String(animeId), rating })
}
export async function getMyRating(uid, animeId) {
  const { data } = await supabase.from('ratings').select('rating').eq('user_id', uid).eq('anime_id', String(animeId)).single()
  return data?.rating || 0
}

// ── COMMENTS ─────────────────────────────────────────────────
export async function addComment(uid, animeId, text, displayName) {
  const { error } = await supabase.from('comments').insert({ user_id: uid, anime_id: String(animeId), text, display_name: displayName })
  if (error) throw error
}
export async function getComments(animeId) {
  const { data } = await supabase.from('comments').select('*').eq('anime_id', String(animeId)).order('created_at', { ascending: false })
  return data || []
}
export async function deleteComment(id, uid) {
  await supabase.from('comments').delete().eq('id', id).eq('user_id', uid)
}

// ── DOWNLOADS ────────────────────────────────────────────────
export async function addDownload(uid, anime) {
  await supabase.from('downloads').upsert({ user_id: uid, anime_id: String(anime.mal_id), title: anime.title, image: anime.image })
}
export async function getDownloads(uid) {
  const { data } = await supabase.from('downloads').select('*').eq('user_id', uid).order('created_at', { ascending: false })
  return data || []
}

// ── ANNOUNCEMENTS ────────────────────────────────────────────
export async function postAnnouncement(title, message, adminName) {
  await supabase.from('announcements').insert({ title, message, admin_name: adminName, active: true })
}
export async function getAnnouncements() {
  const { data } = await supabase.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false })
  return data || []
}
export async function removeAnnouncement(id) {
  await supabase.from('announcements').update({ active: false }).eq('id', id)
}

// ── NEWS ─────────────────────────────────────────────────────
export async function postNews(n) {
  await supabase.from('news').insert({ title: n.title, content: n.content, image_url: n.image_url || '', category: n.category || 'General', author: n.author })
}
export async function getNews() {
  const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  return data || []
}
export async function deleteNews(id) {
  await supabase.from('news').delete().eq('id', id)
}

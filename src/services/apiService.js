'use server';
// --- SERVER ACTIONS ---

// Mendapatkan API Keys dari environment variables server
const TMDB_BEARER = process.env.TMDB_ACCESS_TOKEN_KEY || process.env.VITE_TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const RAWG_KEY = process.env.RAWG_API || process.env.VITE_RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY;
const GOOGLE_BOOK_KEY = process.env.GOOGLE_BOOK_API;

/**
 * 1. TMDB (Film & TV Show)
 * Header Authorization: Bearer <key>
 * Endpoint: https://api.themoviedb.org/3/search/multi
 * 
 * @param {string} query - Kata kunci pencarian judul film atau TV
 * @returns {Promise<Array<Object>>} Daftar hasil pencarian berformat standar aplikasi
 */
export async function searchMovieOrTV(query) {
  if (!query) return [];
  try {
    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_BEARER}`,
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    // Filter hanya film (movie) dan acara TV (tv)
    return results
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 5)
      .map((item) => {
        const isMovie = item.media_type === 'movie';
        const title = isMovie ? item.title : item.name;
        const coverUrl = item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : `https://placehold.co/500x750?text=${encodeURIComponent(title || 'No Cover')}`;

        return {
          id: String(item.id),
          external_id: String(item.id),
          title: title || 'Tanpa Judul',
          type: isMovie ? 'movie' : 'tv',
          coverUrl,
          authorOrStudio: isMovie ? 'TMDB Movie' : 'TMDB TV',
          totalLength: null, // Episode/durasi detail perlu request terpisah, default null
          progressType: isMovie ? 'percentage' : 'episodes',
          description: item.overview || 'Tidak ada deskripsi.',
        };
      });
  } catch (error) {
    console.error('[Server Action Error] searchMovieOrTV:', error.message);
    return [];
  }
}

/**
 * 2. Anilist (Anime)
 * Menggunakan Anilist GraphQL API (sebagai pengganti Jikan API yang tidak stabil)
 * Endpoint: https://graphql.anilist.co
 * 
 * @param {string} query - Judul anime yang dicari
 * @returns {Promise<Array<Object>>} Daftar anime hasil pencarian
 */
export async function searchAnime(query) {
  if (!query) return [];
  try {
    const url = 'https://graphql.anilist.co';
    const graphqlQuery = `
      query ($query: String) {
        Page(page: 1, perPage: 5) {
          media(search: $query, type: ANIME, sort: SEARCH_MATCH) {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            studios(isMain: true) {
              nodes {
                name
              }
            }
            episodes
            description
            averageScore
            seasonYear
          }
        }
      }
    `;

    const variables = { query };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables
      })
    });

    if (!response.ok) {
      throw new Error(`Anilist API error: ${response.status}`);
    }

    const json = await response.json();
    if (!json.data || !json.data.Page || !json.data.Page.media) return [];

    return json.data.Page.media.map((item) => {
      const title = item.title.english || item.title.romaji || "Judul Tidak Diketahui";
      const coverUrl = item.coverImage?.large || `https://placehold.co/400x600?text=${encodeURIComponent(title)}`;
      const studio = item.studios?.nodes?.[0]?.name || "Unknown Studio";

      return {
        id: item.id.toString(),
        external_id: item.id.toString(),
        title,
        type: 'anime',
        coverUrl,
        authorOrStudio: studio,
        totalLength: item.episodes || null,
        progressType: 'episodes',
        description: item.description?.replace(/<[^>]*>?/gm, '') || 'Tidak ada deskripsi.',
        score: item.averageScore ? (item.averageScore / 10).toFixed(1) : null,
        year: item.seasonYear || null
      };
    });
  } catch (error) {
    console.error('[Server Action Error] searchAnime:', error.message);
    return [];
  }
}

/**
 * 3. RAWG (Video Games)
 * Query Param key=<key>
 * Endpoint: https://api.rawg.io/api/games
 * 
 * @param {string} query - Judul video game yang dicari
 * @returns {Promise<Array<Object>>} Daftar game hasil pencarian
 */
export async function searchGame(query) {
  if (!query) return [];
  try {
    const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=5`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((item) => {
      const coverUrl = item.background_image || `https://placehold.co/600x400?text=${encodeURIComponent(item.name || 'No Image')}`;
      
      return {
        id: String(item.id),
        external_id: String(item.id),
        title: item.name || 'Tanpa Judul',
        type: 'game',
        coverUrl,
        authorOrStudio: 'RAWG Database',
        totalLength: null,
        progressType: 'percentage',
        description: 'Detail game dapat dilihat lebih lanjut.',
        score: item.rating ? item.rating.toFixed(1) : null,
        year: item.released ? item.released.substring(0,4) : null
      };
    });
  } catch (error) {
    console.error('[Server Action Error] searchGame:', error.message);
    return [];
  }
}

/**
 * 4. Google Books (Buku)
 * Query Param q=<query>&key=<key>
 * Endpoint: https://www.googleapis.com/books/v1/volumes
 * 
 * @param {string} query - Judul atau ISBN buku yang dicari
 * @returns {Promise<Array<Object>>} Daftar buku hasil pencarian
 */
export async function searchBooks(query) {
  if (!query) return [];
  try {
    const keyParam = GOOGLE_BOOK_KEY ? `&key=${GOOGLE_BOOK_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&maxResults=5${keyParam}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NowPlayingMediaTracker/1.0.0 (Contact: baramutawakkil1701@gmail.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const json = await response.json();
    if (!json.items || !Array.isArray(json.items)) return [];

    return json.items.map((item) => {
      const info = item.volumeInfo || {};
      const title = info.title || "Judul Tidak Diketahui";
      let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
      if (coverUrl) {
        coverUrl = coverUrl.replace("http://", "https://");
      } else {
        coverUrl = `https://placehold.co/400x600?text=${encodeURIComponent(title)}`;
      }

      return {
        id: item.id,
        external_id: item.id,
        title: info.title || 'Tanpa Judul',
        type: 'book',
        coverUrl,
        authorOrStudio: info.authors ? info.authors.join(', ') : 'Penulis Tidak Diketahui',
        totalLength: info.pageCount || null,
        progressType: 'pages',
        description: info.description || 'Tidak ada deskripsi.',
        year: info.publishedDate ? info.publishedDate.substring(0,4) : null
      };
    });
  } catch (error) {
    console.error('[Server Action Error] searchBooks:', error.message);
    return [];
  }
}

// Alias untuk kompatibilitas ke belakang
export async function searchBook(query) {
  return searchBooks(query);
}

/**
 * 5. MangaDex (Komik/Manga/Manhwa)
 * Endpoint: https://api.mangadex.org/manga
 * 
 * @param {string} query - Judul komik yang dicari
 * @returns {Promise<Array<Object>>} Daftar komik hasil pencarian
 */
export async function searchComics(query) {
  if (!query) return [];
  try {
    const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=5&includes[]=cover_art&includes[]=author`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MangaDex API error: ${response.status}`);
    }

    const json = await response.json();
    const data = json.data || [];

    return data.map((item) => {
      const attributes = item.attributes;
      const title = attributes.title?.en || Object.values(attributes.title)[0] || "Judul Tidak Diketahui";
      const coverRel = item.relationships.find(rel => rel.type === 'cover_art');
      const filename = coverRel?.attributes?.fileName;
      const coverUrl = filename ? `https://uploads.mangadex.org/covers/${item.id}/${filename}` : `https://placehold.co/400x600?text=${encodeURIComponent(title)}`;
      const desc = attributes.description?.en || 'Tidak ada deskripsi.';

      return {
        id: item.id,
        external_id: item.id,
        title,
        type: 'comic',
        coverUrl,
        authorOrStudio: 'MangaDex', // Author detail requires separate relationship fetching
        totalLength: null, // MangaDex rarely provides total chapters for ongoing
        progressType: 'chapters',
        description: desc,
        year: attributes.year || null
      };
    });
  } catch (error) {
    console.error('[Server Action Error] searchComics:', error.message);
    return [];
  }
}

/**
 * 6. Recommendations API
 * Mendapatkan rekomendasi berdasarkan tipe dan ID original
 */
export async function getRecommendations(type, id, title) {
  if (!title && !id) return [];

  try {
    let apiId = id;
    
    // Jika ID adalah UUID dari database (bukan ID asli dari API)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid && title) {
      if (type === 'movie' || type === 'tv') {
        const results = await searchMovieOrTV(title);
        // Pastikan kita mengambil ID yang sesuai dengan tipenya
        const matched = results.find(r => r.type === type) || results[0];
        if (matched) apiId = matched.id;
      } else if (type === 'game') {
        const results = await searchGame(title);
        if (results.length > 0) apiId = results[0].id;
      } else if (type === 'anime') {
        const results = await searchAnime(title);
        if (results.length > 0) apiId = results[0].id;
      } else if (type === 'comic') {
        // Harus query Anilist langsung karena searchComics pakai MangaDex
        const graphqlQuery = `
          query ($query: String) {
            Page(page: 1, perPage: 1) {
              media(search: $query, type: MANGA, sort: SEARCH_MATCH) {
                id
              }
            }
          }
        `;
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ query: graphqlQuery, variables: { query: title } })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.Page?.media?.[0]?.id) {
            apiId = json.data.Page.media[0].id;
          }
        }
      }
    }

    if (type === 'movie' || type === 'tv') {
      if (!apiId) return [];
      const url = `https://api.themoviedb.org/3/${type}/${apiId}/recommendations`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_BEARER}`,
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.results || []).slice(0, 6).map(item => ({
        id: String(item.id),
        title: item.title || item.name || 'Tanpa Judul',
        type: type,
        coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : `https://placehold.co/500x750?text=No+Cover`,
        authorOrStudio: type === 'movie' ? 'TMDB Movie' : 'TMDB TV',
        progressType: type === 'movie' ? 'percentage' : 'episodes',
        description: item.overview || 'Tidak ada deskripsi.',
        rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : null // scale to 5
      }));
    } 
    
    else if (type === 'game') {
      if (!apiId) return [];
      // RAWG Suggested games
      const url = `https://api.rawg.io/api/games/${apiId}/suggested?key=${RAWG_KEY}&page_size=6`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      return (data.results || []).map(item => ({
        id: String(item.id),
        title: item.name || 'Tanpa Judul',
        type: 'game',
        coverUrl: item.background_image || `https://placehold.co/600x400?text=No+Image`,
        authorOrStudio: 'RAWG Games',
        progressType: 'percentage',
        description: 'Rekomendasi dari RAWG API.',
        rating: item.rating || null
      }));
    }
    
    else if (type === 'anime' || type === 'comic') {
      if (!apiId) return [];
      // Anilist Recommendations
      const anilistType = type === 'anime' ? 'ANIME' : 'MANGA';
      const graphqlQuery = `
        query ($id: Int) {
          Media(id: $id, type: ${anilistType}) {
            recommendations(sort: RATING_DESC, perPage: 6) {
              nodes {
                mediaRecommendation {
                  id
                  title {
                    english
                    romaji
                  }
                  coverImage {
                    large
                  }
                  averageScore
                  studios(isMain: true) {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: graphqlQuery, variables: { id: parseInt(apiId) } })
      });
      if (!response.ok) return [];
      const json = await response.json();
      const nodes = json.data?.Media?.recommendations?.nodes || [];
      return nodes.filter(n => n.mediaRecommendation).map(n => {
        const item = n.mediaRecommendation;
        const recTitle = item.title.english || item.title.romaji || "Tanpa Judul";
        return {
          id: item.id.toString(),
          title: recTitle,
          type: type,
          coverUrl: item.coverImage?.large || `https://placehold.co/400x600?text=No+Cover`,
          authorOrStudio: item.studios?.nodes?.[0]?.name || "Anilist",
          progressType: type === 'anime' ? 'episodes' : 'chapters',
          description: 'Rekomendasi dari Anilist.',
          rating: item.averageScore ? (item.averageScore / 20).toFixed(1) : null // scale 100 to 5
        };
      });
    }
    
    else if (type === 'book') {
      // Google Books fallback: search by part of the title
      const shortTitle = title ? title.split(' ').slice(0, 2).join(' ') : 'Novel';
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(shortTitle)}&printType=books&maxResults=6${GOOGLE_BOOK_KEY ? `&key=${GOOGLE_BOOK_KEY}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const json = await response.json();
      return (json.items || []).filter(item => item.id !== apiId).slice(0,6).map(item => {
        const info = item.volumeInfo || {};
        let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
        if (coverUrl) coverUrl = coverUrl.replace("http://", "https://");
        else coverUrl = `https://placehold.co/400x600?text=No+Cover`;
        return {
          id: item.id,
          title: info.title || "Tanpa Judul",
          type: 'book',
          coverUrl,
          authorOrStudio: info.authors?.[0] || "Unknown Author",
          progressType: 'pages',
          description: info.description || 'Tidak ada deskripsi.',
          rating: info.averageRating || null
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

// Alias untuk kompatibilitas ke belakang
export async function searchComic(query) {
  return searchComics(query);
}

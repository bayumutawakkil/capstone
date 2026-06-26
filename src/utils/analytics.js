/**
 * @file analytics.js
 * @description Kumpulan utilitas algoritma murni untuk agregasi data statistik dan metrik profil user.
 * Dipisahkan dari UI/Komponen agar komputasi tidak memicu re-render dan mudah diuji.
 */

/**
 * Menghitung rekapitulasi performa media untuk modal "NowPlaying Wrapped"
 * @param {Array<Object>} items - Array seluruh entri media milik user dari Supabase 'media_items'
 * @returns {Object} Data agregat (completedTotal, breakdown, topGenres, totalVolume, averageRating)
 */
export function calculateWrappedData(items) {
  if (!items || !Array.isArray(items)) return null;

  const completedItems = items.filter(item => item.status === 'completed');
  
  // Breakdown Kuantitas berdasarkan tipe
  const breakdown = completedItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  // Niche Top Genres: Mengambil genre dari item yang rating >= 4 ATAU completed
  // Fallback ke 'Action' jika kosong (bawaan lama)
  const qualityItems = items.filter(item => item.status === 'completed' || item.rating >= 4);
  const genreCounts = qualityItems.reduce((acc, item) => {
    const g = item.genre || 'Action';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(x => x[0]);
    
  if (topGenres.length === 0) {
    topGenres.push('Belum ada data', 'Belum ada data', 'Belum ada data');
  }

  // Hitung Kuantitas Total
  const totalVolume = { episodes: 0, pages: 0, chapters: 0 };
  items.forEach(item => {
    const units = parseInt(item.units_completed || 0);
    if (item.type === 'anime' || item.type === 'tv') totalVolume.episodes += units;
    else if (item.type === 'book') totalVolume.pages += units;
    else if (item.type === 'comic') totalVolume.chapters += units;
  });

  // Rata-rata rating ulasan
  const avgRating = completedItems.length > 0 
    ? completedItems.reduce((acc, item) => acc + (item.rating || 0), 0) / completedItems.length 
    : 0;

  return {
    completedTotal: completedItems.length,
    completedBreakdown: breakdown,
    topGenres: topGenres.length >= 3 ? topGenres : [...topGenres, 'Drama', 'Sci-Fi'],
    totalVolume,
    averageRating: avgRating
  };
}

/**
 * Menghitung distribusi media berdasarkan kuantitas, disajikan untuk Chart (Recharts)
 * @param {Array<Object>} items - Array seluruh entri media
 * @returns {Array<Object>} Data terformat untuk Pie Chart [{ name: 'Anime', value: 10 }]
 */
export function calculateMediaDistribution(items) {
  if (!items || !Array.isArray(items)) return [];

  const distributionCounts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(distributionCounts).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));
}

import { test, expect } from '@playwright/test';

test.describe('Fitur Utama: Dashboard & Manajemen Media', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Set cookie untuk bypass auth di proxy.js
    await page.context().addCookies([
      { name: 'playwright-test', value: '1', domain: 'localhost', path: '/' }
    ]);

    // 2. Mock API Supabase untuk data user (client-side check)
    await page.route('**/auth/v1/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user',
          email: 'test@example.com',
          user_metadata: { full_name: 'Penguji Utama' }
        }),
      });
    });

    // 3. Mock API Supabase untuk daftar media_items saat dimuat pertama kali
    await page.route('**/rest/v1/media_items*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'item-1',
              title: 'Mocked Game 1',
              type: 'game',
              status: 'playing',
              progress: '5 jam',
              rating: 5,
              cover_url: 'https://via.placeholder.com/150'
            },
            {
              id: 'item-2',
              title: 'Mocked Movie 1',
              type: 'movie',
              status: 'completed',
              progress: 'Selesai',
              rating: 4,
              cover_url: ''
            }
          ]),
        });
      } else if (route.request().method() === 'POST') {
        // Mock berhasil insert
        await route.fulfill({ status: 201, body: JSON.stringify({}) });
      } else {
        await route.continue();
      }
    });

    // 4. Pastikan localStorage memiliki token dummy agar client Supabase tak ngeluh
    await page.addInitScript(() => {
      window.localStorage.setItem('sb-prqzszcegfulthkebtmd-auth-token', JSON.stringify({
        access_token: 'fake', user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
  });

  test('Melihat daftar media tracking dan menggunakan filter', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Pastikan user bisa masuk dan melihat halo
    await expect(page.locator('text=Halo, Penguji Utama!')).toBeVisible();

    // Pastikan item mock muncul
    await expect(page.locator('text=Mocked Game 1')).toBeVisible();
    await expect(page.locator('text=Mocked Movie 1')).toBeVisible();

    // Uji Filter Tipe (Klik Film)
    await page.click('button:has-text("Film")');
    // Mocked Game 1 seharusnya hilang dari UI
    await expect(page.locator('text=Mocked Game 1')).not.toBeVisible();
    await expect(page.locator('text=Mocked Movie 1')).toBeVisible();
    
    // Kembalikan filter ke Semua
    await page.click('button:has-text("Semua Tipe")');
    await expect(page.locator('text=Mocked Game 1')).toBeVisible();
  });

  const mediaTypesToTest = [
    { type: 'game', query: 'Witcher' },
    { type: 'anime', query: 'Naruto' },
    { type: 'movie', query: 'Avengers' },
    { type: 'tv', query: 'Breaking Bad' },
    { type: 'book', query: 'Harry Potter' },
    { type: 'comic', query: 'Solo Leveling' }
  ];

  for (const media of mediaTypesToTest) {
    test(`Pencarian API Eksternal dan Tambah Media: ${media.type}`, async ({ page }) => {
      await page.goto('/dashboard');
      
      // 1. Klik Tambah Media
      await page.click('button:has-text("Tambah Media")');
      await expect(page.locator('text=Cari Judul Media')).toBeVisible();
      
      // 2. Pilih Tipe Media
      // Select pertama pada layar adalah Tipe Media
      await page.locator('select').first().selectOption(media.type);
      
      // 3. Ketik judul dan cari
      await page.fill('input[placeholder*="Cari judul"]', media.query);
      await page.click('button:has-text("Cari")');

      // 4. Pastikan hasil pencarian muncul (tunggu gambar dari API asli)
      await expect(page.locator('div.absolute.z-30 img').first()).toBeVisible({ timeout: 15000 });
      
      // 5. Pilih hasil pertama
      await page.locator('div.absolute.z-30 div.cursor-pointer').first().click();
      
      // 6. Isi form progress
      await expect(page.locator('text=Status Pelacakan')).toBeVisible();
      await page.fill('input[placeholder*="Misal:"]', '1');
      
      // 7. Simpan ke tracking list (ini akan men-trigger POST yg sudah di-mock)
      await page.click('button:has-text("Simpan ke Daftar Tracking")');
      
      // 8. Form pencarian harus tertutup setelah submit
      await expect(page.locator('button:has-text("Simpan ke Daftar Tracking")')).not.toBeVisible();
    });
  }
});

import { test, expect } from '@playwright/test';

test.describe('Fitur Baru: Discovery, Anti-Duplikat, Toast & Modal', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: 'playwright-test', value: '1', domain: 'localhost', path: '/' }
    ]);

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

    await page.route('**/rest/v1/media_items*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '20a2e7c3-a3d8-4a62-8515-52e89d2cbb54',
              title: 'Mocked Game 1',
              type: 'game',
              status: 'playing',
              progress: '5 jam',
              rating: 5,
              cover_url: 'https://via.placeholder.com/150'
            }
          ]),
        });
      } else if (route.request().method() === 'POST' || route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
      } else {
        await route.continue();
      }
    });

    // Mock API for TMDB search to return 'Mocked Game 1' to test duplication
    await page.route('**/api.rawg.io/api/games*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 9999,
              name: 'Mocked Game 1',
              background_image: 'https://via.placeholder.com/150'
            }
          ]
        })
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('sb-prqzszcegfulthkebtmd-auth-token', JSON.stringify({
        access_token: 'fake', user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
  });

  test('Uji Fitur Anti-Duplikat (Pencarian Utama)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Buka modal pencarian
    await page.click('button:has-text("Tambah Media Baru")');
    await expect(page.locator('text=Cari dan tambahkan entri ke daftar pelacakanmu')).toBeVisible();
    
    // Cari judul yang sudah ada di mock database (Mocked Game 1)
    await page.click('button:has-text("Game")');
    await page.fill('input[placeholder*="Cari judul"]', 'Mocked Game 1');
    await page.click('button[type="submit"]');

    // Pastikan label "Sudah di Inventory" muncul
    await expect(page.locator('text=Sudah di Inventory')).toBeVisible({ timeout: 10000 });
  });

  test('Uji Toast Notification (Pencarian Kosong)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Buka modal pencarian
    await page.click('button:has-text("Tambah Media Baru")');
    
    // Cari judul ngawur
    await page.click('button:has-text("Game")');
    await page.fill('input[placeholder*="Cari judul"]', 'JDSFKSJDFKSJDFKSJDFK');
    
    // Mock the RAWG API for an empty result
    await page.route('**/api.rawg.io/api/games*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) });
    });

    await page.click('button[type="submit"]');

    // Pastikan Toast muncul
    await expect(page.locator('text=Tidak ada hasil yang ditemukan')).toBeVisible({ timeout: 10000 });
  });

  test('Uji Custom Confirm Modal (Penghapusan Item)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Pastikan item render
    await expect(page.locator('text=Mocked Game 1')).toBeVisible();
    
    // Klik tombol hapus
    await page.click('button[title="Hapus"]', { force: true });
    
    // Modal Konfirmasi harus muncul
    await expect(page.locator('text=Konfirmasi Tindakan')).toBeVisible();
    await expect(page.locator('text=Apakah Anda yakin ingin menghapus item ini dari rak pelacakan?')).toBeVisible();
    
    // Batalkan dulu
    await page.click('button:has-text("Batal")');
    await expect(page.locator('text=Konfirmasi Tindakan')).not.toBeVisible();
    
    // Ulangi dan konfirmasi
    await page.click('button[title="Hapus"]');
    await page.click('button:has-text("Ya, Lanjutkan")');
    
    // Pastikan Toast sukses muncul
    await expect(page.locator('text=Item berhasil dihapus')).toBeVisible();
  });

  test('Uji Tab Discovery & Lencana Dropdown', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Klik tab Discovery
    await page.click('button:has-text("Discovery")');
    
    // Pastikan custom dropdown ter-render dan menampilkan "Mocked Game 1"
    await expect(page.locator('button', { hasText: 'Mocked Game 1' }).first()).toBeVisible();
    
    // Pastikan ada lencana status [Active] di dalam tombol
    await expect(page.locator('span:has-text("[Active]")').first()).toBeVisible();
    
    // Klik dropdown untuk membuka list
    await page.locator('button', { hasText: 'Mocked Game 1' }).first().click();
    
    // Pastikan opsi dropdown menampilkan judul dan lencana
    await expect(page.locator('div.absolute.z-50 button', { hasText: 'Mocked Game 1' }).first()).toBeVisible();
  });

});

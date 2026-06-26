import { test, expect } from '@playwright/test';

test.describe('Autentikasi: Register & Login', () => {
  
  test('Validasi form registrasi gagal jika data tidak lengkap', async ({ page }) => {
    await page.goto('/register');
    
    // Ketik di email dan blur untuk trigger validasi
    await page.fill('input[id="email"]', 'email_salah');
    await page.locator('input[id="email"]').blur();
    
    // Seharusnya muncul pesan error validasi email di UI
    await expect(page.locator('text=Format email tidak valid')).toBeVisible();
  });

  test('Validasi form registrasi: Password tidak cocok', async ({ page }) => {
    await page.goto('/register');
    
    // Isi data
    await page.fill('input[id="name"]', 'User Uji');
    await page.fill('input[id="email"]', 'user@example.com');
    await page.fill('input[id="password"]', 'PasswordKuat123!');
    await page.fill('input[id="confirmPassword"]', 'PasswordSalah123!');
    
    // Setuju syarat
    await page.check('input[id="terms"]');
    
    // Seharusnya ada tulisan "Tidak cocok" di UI sebelum submit
    await expect(page.locator('text=Tidak cocok')).toBeVisible();
    
    await page.click('button[type="submit"]');
    // Tombol submit bisa digetarkan/tidak lanjut, URL tetap di /register
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('Mocking Login gagal menampilkan pesan error', async ({ page }) => {
    // Intercept API Supabase (Asumsikan domain Supabase ada 'supabase.co')
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_credentials', error_description: 'Email atau password salah' }),
      });
    });

    await page.goto('/login');
    await page.fill('input[id="email"]', 'salah@example.com');
    await page.fill('input[id="password"]', 'password_salah');
    await page.click('button[type="submit"]');

    // Pesan error dari Supabase harus ditampilkan
    await expect(page.locator('text=Email atau password salah')).toBeVisible();
  });
});

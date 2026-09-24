@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Kauny Catering - Push GitHub + Deploy Vercel

REM ================================================================
REM  PENGATURAN (ubah jika perlu)
REM ================================================================
set "REPO_URL=https://github.com/jafit1/kaunycatering"
set "BRANCH=main"
REM ================================================================

cd /d "%~dp0"
echo.
echo ================================================
echo   KAUNY CATERING - PUSH ^& DEPLOY OTOMATIS
echo ================================================
echo   Folder : %cd%
echo   Repo   : %REPO_URL%
echo   Branch : %BRANCH%
echo ================================================
echo.

REM ---------- 1. Cek alat yang dibutuhkan ----------
where git >nul 2>nul
if errorlevel 1 (
  echo [GAGAL] Git belum terpasang. Unduh di https://git-scm.com/download/win
  goto :gagal
)
where node >nul 2>nul
if errorlevel 1 (
  echo [GAGAL] Node.js belum terpasang. Unduh di https://nodejs.org
  goto :gagal
)

REM ---------- 2. Siapkan repo git (hanya saat pertama kali) ----------
if not exist ".git" (
  echo [1/5] Folder belum terhubung ke GitHub, menyiapkan git...
  git init -q
  git remote add origin "%REPO_URL%"
  git fetch -q origin
  if errorlevel 1 (
    echo [GAGAL] Tidak bisa mengambil data dari GitHub. Cek internet / akses repo.
    goto :gagal
  )
  REM Hubungkan ke riwayat GitHub TANPA mengubah file di folder ini
  git reset -q origin/%BRANCH%
  git checkout -q -B %BRANCH%
  git branch -q --set-upstream-to=origin/%BRANCH% %BRANCH%
) else (
  echo [1/5] Repo git sudah siap.
)

REM Identitas commit (dipakai hanya jika belum diatur)
git config user.name >nul 2>nul || (
  set /p "GITNAME=Nama untuk commit git: "
  git config user.name "!GITNAME!"
)
git config user.email >nul 2>nul || (
  set /p "GITMAIL=Email untuk commit git: "
  git config user.email "!GITMAIL!"
)

REM ---------- 3. Commit perubahan ----------
echo.
echo [2/5] Memeriksa perubahan...
git add -A
git diff --cached --quiet
if errorlevel 1 (
  git status --short
  echo.
  set "MSG="
  set /p "MSG=Pesan commit (Enter = otomatis): "
  if "!MSG!"=="" (
    for /f "tokens=1-3 delims=/-. " %%a in ("%date%") do set "TGL=%%a-%%b-%%c"
    set "MSG=update: !TGL! %time:~0,5%"
  )
  git commit -q -m "!MSG!"
  if errorlevel 1 (
    echo [GAGAL] Commit gagal.
    goto :gagal
  )
  echo       Commit dibuat: !MSG!
) else (
  echo       Tidak ada perubahan baru untuk di-commit.
)

REM ---------- 4. Ambil update terbaru lalu push ----------
echo.
echo [3/5] Mengambil update terbaru dari GitHub...
git pull -q --rebase origin %BRANCH%
if errorlevel 1 (
  echo [GAGAL] Ada bentrok dengan versi di GitHub. Selesaikan dulu secara manual,
  echo         lalu jalankan file ini lagi. ^(git status untuk melihat file bentrok^)
  goto :gagal
)

echo.
echo [4/5] Push ke GitHub (%BRANCH%)...
git push -u origin HEAD:%BRANCH%
if errorlevel 1 (
  echo [GAGAL] Push gagal. Pastikan Anda sudah login GitHub dan punya akses ke repo.
  goto :gagal
)
echo       Push berhasil.

REM ---------- 5. Deploy ke Vercel ----------
echo.
echo [5/5] Deploy ke Vercel (production)...
if not exist ".vercel\project.json" (
  echo       Folder belum terhubung ke project Vercel.
  echo       Ikuti pertanyaan berikut dan PILIH PROJECT YANG SUDAH ADA
  echo       agar tidak membuat project baru.
  call npx --yes vercel@latest link
  if errorlevel 1 (
    echo [GAGAL] Gagal menghubungkan ke Vercel. Coba: npx vercel login
    goto :gagal
  )
)
call npx --yes vercel@latest deploy --prod --yes
if errorlevel 1 (
  echo [GAGAL] Deploy Vercel gagal. Lihat pesan error di atas.
  goto :gagal
)

echo.
echo ================================================
echo   SELESAI - kode sudah di GitHub ^& Vercel
echo ================================================
echo.
pause
exit /b 0

:gagal
echo.
echo Proses dihentikan.
pause
exit /b 1

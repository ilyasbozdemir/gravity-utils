#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Gravity Desktop Engine - Güvenli Sistem Temizleme Aracı
.DESCRIPTION
    Bu betik Ağ DNS önbelleğini temizler ve sadece geçici (Temp) klasörlerdeki zararsız kalıntıları siler.
    Kesinlikle Windows sistem dosyalarına veya kişisel verilere dokunmaz.
#>

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " GRAVITY ENGINE - GÜVENLİ SİSTEM TEMİZLİĞİ" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # 1. DNS Flush
    Write-Host "[1/3] DNS Önbelleği Temizleniyor..." -ForegroundColor Yellow
    Clear-DnsClientCache
    ipconfig /flushdns | Out-Null
    Write-Host "      ✓ DNS Başarıyla Temizlendi." -ForegroundColor Green

    # 2. Local AppData Temp Temizliği (Sadece klasör içindekiler)
    Write-Host "[2/3] Kullanıcı Temp Kalıntıları Temizleniyor..." -ForegroundColor Yellow
    $userTempPath = [System.IO.Path]::GetTempPath()
    if (Test-Path $userTempPath) {
        Remove-Item "$userTempPath\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "      ✓ Kullanıcı Temp Dosyaları Temizlendi." -ForegroundColor Green
    }

    # 3. Windows Temp Temizliği (Sadece klasör içindekiler)
    Write-Host "[3/3] Sistem Temp Kalıntıları Temizleniyor..." -ForegroundColor Yellow
    $sysTempPath = "$extenv:WINDIR\Temp"
    if (Test-Path $sysTempPath) {
        Remove-Item "$sysTempPath\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "      ✓ Sistem Temp Dosyaları Temizlendi." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host " İŞLEM BAŞARIYLA TAMAMLANDI! 🎉" -ForegroundColor Green
    Write-Host " Gravity Desktop Engine artık daha temiz." -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan

} catch {
    Write-Host "Hata oluştu: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Çıkmak için bir tuşa basın..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

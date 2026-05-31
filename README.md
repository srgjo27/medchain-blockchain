# MedChain Blockchain

Sistem berbasis blockchain untuk menjamin integritas dan keaslian dokumen rekam medis menggunakan *cryptographic hash* (SHA-256) pada jaringan Ethereum.

Proyek ini dibangun menggunakan **Hardhat 3** dengan Solidity untuk smart contract, serta TypeScript untuk pengujian integrasi dan naskah penyebaran (*deployment scripts*).

## Fitur Utama

- **Anchoring Registry**: Menyimpan sidik jari digital (hash SHA-256) dari berkas rekam medis ke dalam blockchain.
- **Verifikasi Integritas**: Memverifikasi apakah dokumen rekam medis telah dimanipulasi atau masih asli.
- **Pencabutan Akses (Revocation)**: Pemilik kontrak (misalnya institusi medis) dapat mencabut validitas hash rekam medis tertentu jika diperlukan.
- **Keamanan Akses**: Menggunakan pustaka OpenZeppelin `Ownable` untuk memastikan hanya pihak berwenang yang dapat memodifikasi status rekam medis di blockchain.

## Struktur Proyek

```text
contracts/        # Kontrak pintar Solidity (MedicalRecord.sol)
test/             # Unit test dan integrasi TypeScript (MedicalRecord.ts)
scripts/          # Naskah deploy/interaksi (deploy.ts)
hardhat.config.ts # Konfigurasi Hardhat
```

## Prasyarat

Pastikan Anda memiliki:
- Node.js (versi 18+)
- npm / yarn

## Penggunaan

### 1. Instalasi Dependensi

```shell
npm install
```

### 2. Menjalankan Pengujian

Menjalankan seluruh rangkaian tes unit:

```shell
npx hardhat test
```

### 3. Penyebaran Kontrak (Deployment)

Jalankan skrip deploy ke jaringan target (misal lokal):

```shell
npx hardhat run scripts/deploy.ts
```

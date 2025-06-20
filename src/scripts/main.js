// Xử lý các chức năng chung cho index.html (header, menu, banner, ...)

// Load header và xử lý user sau khi header đã load
document.addEventListener('DOMContentLoaded', function() {
    // Đổ header
    fetch('components/header.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('header').innerHTML = html;
        });

    // Đổ footer
    fetch('components/footer.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('footer').innerHTML = html;
        });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    const toggle = document.getElementById('mobileMenuToggle');
    const navUl = document.querySelector('.header-nav ul');
    if (toggle && navUl) {
        toggle.addEventListener('click', function() {
            navUl.classList.toggle('active');
        });
    }

    loadCategories(); // Gọi hàm render danh mục cho index.html
    initMobileMenu();
});

// Hàm render danh mục cho index.html (không sidebar, không "Tất cả sản phẩm")
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const categoryList = document.getElementById('category-list');
        if (!categoryList) return;
        categoryList.innerHTML = categories.map(category => `
            <a 
                href="product.html?category=${category.id}"
                class="product-category-item"
            >
                ${category.name}
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
}






document.addEventListener('DOMContentLoaded', function() {
    const revealEls = document.querySelectorAll('.section-header, .about-container, .product-card, .service-feature-box');
    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        revealEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.top < windowHeight - 60) {
                el.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
});

//xử lý đăng ký tài khoản
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.register-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = {
        username: form.username.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value,
        confirm_password: form.confirm_password.value
      };
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.message);
      if(result.success) {
        form.reset();
        alert(result.message);
        window.location.href = 'login.html'; // Chuyển sang trang đăng nhập
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = {
        username: loginForm.username.value,
        password: loginForm.password.value
      };
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.message);
      if(result.success) {
        // Lưu tên user và role vào localStorage
        localStorage.setItem('username', result.user.username);
        localStorage.setItem('role', result.user.role);

        // Chuyển hướng dựa vào role
        if(result.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }
    });
  }
});

function updateHeaderUser() {
    const username = localStorage.getItem('username');
    const userBtn = document.getElementById('user-header');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userBtn && logoutBtn) {
        if (username) {
            // Đã đăng nhập: Hiển thị username và ẩn icon
            userBtn.innerHTML = `<span>${username}</span>`; // Chỉ hiện username
            userBtn.classList.add('logged-in');
            userBtn.href = "#";
            userBtn.style.pointerEvents = "none";
            logoutBtn.style.display = 'flex';
        } else {
            // Chưa đăng nhập: Hiển thị icon người
            userBtn.innerHTML = `<i class="fas fa-user"></i>`;
            userBtn.classList.remove('logged-in');
            userBtn.href = "login.html";
            userBtn.style.pointerEvents = "auto";
            logoutBtn.style.display = 'none';
        }
    }

    // Xử lý sự kiện đăng xuất
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = 'login.html';
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = 'login.html';
        };
    }
});


document.addEventListener('DOMContentLoaded', async function() {
    const bannerSlider = document.getElementById('banner-slider');
    if (!bannerSlider) return;

    // Lấy banner từ API
    const res = await fetch('/api/banners');
    const banners = await res.json();

    // Render banner
    bannerSlider.innerHTML = banners.map((banner, idx) => `
        <div class="banner-slide${idx === 0 ? ' active' : ''}">
            <img src="${banner.image}" alt="${banner.title || ''}" loading="lazy">
        </div>
    `).join('') + `
        <button class="banner-nav-btn banner-prev" aria-label="Previous">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="banner-nav-btn banner-next" aria-label="Next">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    const slides = bannerSlider.querySelectorAll('.banner-slide');
    const prevBtn = bannerSlider.querySelector('.banner-prev');
    const nextBtn = bannerSlider.querySelector('.banner-next');
    let currentSlide = 0;
    let isTransitioning = false;

    function showSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Update current slide index
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
        
        // Reset transition lock after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 800); // Match this with CSS transition duration
    }

    // Event listeners for navigation buttons
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

    // Auto advance slides every 5 seconds
    let autoSlide = setInterval(() => showSlide(currentSlide + 1), 5000);

    // Pause auto-advance on hover
    bannerSlider.addEventListener('mouseenter', () => clearInterval(autoSlide));
    bannerSlider.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => showSlide(currentSlide + 1), 5000);
    });
});

// Hiển thị danh mục sản phẩm động
document.addEventListener('DOMContentLoaded', function() {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                document.getElementById('category-list').innerHTML = data.data.map(cat => `
                    <li>${cat.name}</li>
                `).join('');
            });
    });


async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const categoryList = document.getElementById('category-list');
        if (!categoryList) return;
        categoryList.innerHTML = categories.map(category => `
            <a 
                href="product.html?category=${category.id}"
                class="product-category-item"
            >
                ${category.name}
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadCategories);

// Hàm xử lý click danh mục
function handleCategoryClick(event, categoryId) {
    event.preventDefault(); // Tạm dừng chuyển trang mặc định
    window.location.href = `./product.html?category=${categoryId}`; // Chuyển trang theo JS
}

// Gọi hàm load danh mục khi trang load xong
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    loadCategories();
});





document.addEventListener('DOMContentLoaded', function() {
    // Render banners dynamically
    const renderBanners = async () => {
        try {
            const response = await fetch('/api/banners');
            const banners = await response.json();
            
            const sliderContainer = document.getElementById('banner-slider');
            sliderContainer.innerHTML = banners.map(banner => `
                <div class="banner-slide">
                    <img src="${banner.image}" alt="${banner.title || 'Banner'}">
                </div>
            `).join('');
            
            initializeSlider();
        } catch (error) {
            console.error('Error loading banners:', error);
        }
    };

    // Initialize slider functionality
    const initializeSlider = () => {
        const slider = document.getElementById('banner-slider');
        const slides = slider.querySelectorAll('.banner-slide');
        const prevBtn = document.getElementById('banner-prev');
        const nextBtn = document.getElementById('banner-next');
        
        let currentSlide = 0;
        const totalSlides = slides.length;

        const updateSlider = () => {
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        };

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        });

        // Auto slide every 5 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        }, 5000);
    };

    // Start the banner system
    renderBanners();
});



// Xử lý header: menu mobile, tìm kiếm, active menu
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    
    // Toggle menu
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('show');
            mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Close menu button
    if (closeMenuBtn && navMenu) {
        closeMenuBtn.addEventListener('click', function() {
            navMenu.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    }
    
    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && navMenu) {
            if (!event.target.closest('.header-nav-section') && 
                !event.target.closest('.nav-menu') &&
                navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });
    
    // Close menu when clicking on menu item
    if (navMenu) {
        navMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
    
    // Search input focus
    const searchToggle = document.querySelector('.search-toggle');
    const searchInput = document.querySelector('.search-input');
    
    if (searchToggle && searchInput) {
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                searchInput.style.width = '180px';
                searchInput.style.opacity = '1';
                searchInput.style.pointerEvents = 'auto';
                searchInput.focus();
            }
        });
    }
    
    // Close search input when clicking outside
    document.addEventListener('click', function(e) {
        if (searchInput && window.innerWidth <= 768) {
            if (!e.target.closest('.header-search') && 
                !searchInput.matches(':focus') && 
                searchInput.style.opacity === '1') {
                searchInput.style.width = '0';
                searchInput.style.opacity = '0';
                searchInput.style.pointerEvents = 'none';
            }
        }
    });
    
    // Prevent closing when clicking inside search box
    if (searchInput) {
        searchInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Highlight active menu item
    const currentPage = window.location.pathname.split('/').pop();
    const menuLinks = document.querySelectorAll('.nav-menu li a');
    
    menuLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
});

// Hàm lấy danh mục từ API
async function fetchCategories() {
    const res = await fetch('/api/categories');
    return await res.json();
}

// Hàm render danh mục ra index.html
function renderHomeCategories(categories) {
    const grid = document.getElementById('home-categories');
    if (!grid) return;
    grid.innerHTML = categories.map(cat => `
        <a href="product.html?category=${cat.id}" class="category-card">
            <h3>${cat.name}</h3>
        </a>
    `).join('');
}

// Khi trang index load, gọi API và render
document.addEventListener('DOMContentLoaded', async function() {
    const categories = await fetchCategories();
    renderHomeCategories(categories);
});

// Lấy danh sách sản phẩm từ API
async function fetchProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data.data || [];
}

// Render sản phẩm nổi bật
function renderFeaturedProducts(products) {
    const grid = document.getElementById('featured-products');
    if (!grid) return;
    
    const featured = products.filter(p => p.featured == 1).slice(0, 4);
    if (featured.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666;">Chưa có sản phẩm nổi bật</p>';
        return;
    }
    
    grid.innerHTML = featured.map(p => `
        <div class="featured-card">
            <span class="featured-badge">
                <i class="fas fa-star"></i> Nổi bật
            </span>
            <img src="${p.image}" alt="${p.name}">
            <div class="featured-content">
                <h3 class="featured-title">${p.name}</h3>
                <div class="featured-price">${Number(p.price).toLocaleString()}đ</div>
            </div>
             <a href="product-detail.html?id=${p.id}" class="featured-button">Xem chi tiết</a>
        </div>
    `).join('');
}

// Render sản phẩm mới
function renderNewProducts(products) {
    const grid = document.getElementById('new-arrivals');
    if (!grid) return;

    const newProducts = products.filter(p => p.new == 1).slice(0, 4);
    if (newProducts.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666;">Chưa có sản phẩm mới</p>';
        return;
    }

    grid.innerHTML = newProducts.map(p => `
        <div class="featured-card">
            <span class="featured-badge" style="background:linear-gradient(90deg,#FFD600,#FFEA00);color:#222;">
                <i class="fas fa-bolt"></i> New
            </span>
            <img src="${p.image}" alt="${p.name}">
            <div class="featured-content">
                <h3 class="featured-title">${p.name}</h3>
                <div class="featured-price">${Number(p.price).toLocaleString()}đ</div>
            </div>
            <a href="product-detail.html?id=${p.id}" class="featured-button">Xem chi tiết</a>
        </div>
    `).join('');
}

// Gọi khi trang load
document.addEventListener('DOMContentLoaded', async function() {
    const products = await fetchProducts();
    renderFeaturedProducts(products);
    renderNewProducts(products); // Thêm dòng này
});

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.banner-slider');
    const slides = document.querySelectorAll('.banner-slide');
    
    if (!slider || slides.length === 0) return;

    // Thêm nút điều hướng
    const wrapper = document.querySelector('.banner-slider-wrapper');
    wrapper.insertAdjacentHTML('beforeend', `
        <button class="banner-nav banner-prev">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="banner-nav banner-next">
            <i class="fas fa-chevron-right"></i>
        </button>
    `);

    let currentSlide = 0;
    const slideCount = slides.length;

    // Cập nhật vị trí slider
    function updateSliderPosition() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Xử lý nút next
    document.querySelector('.banner-next').addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSliderPosition();
    });

    // Xử lý nút prev
    document.querySelector('.banner-prev').addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSliderPosition();
    });

    // Auto slide
    let autoSlide = setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSliderPosition();
    }, 5000);

    // Dừng auto slide khi hover
    wrapper.addEventListener('mouseenter', () => clearInterval(autoSlide));
    wrapper.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSliderPosition();
        }, 5000);
    });
});

// Banner handling
async function initBanner() {
    const bannerSlider = document.getElementById('banner-slider');
    if (!bannerSlider) return;

    try {
        // Fetch banners from API
        const response = await fetch('/api/banners');
        const banners = await response.json();

        if (!banners || banners.length === 0) {
            console.log('No banners found');
            return;
        }

        // Render banners
        bannerSlider.innerHTML = banners.map((banner, index) => `
            <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${banner.image}" alt="${banner.title || 'Banner'}" loading="${index === 0 ? 'eager' : 'lazy'}">
            </div>
        `).join('') + `
            <button class="banner-nav banner-prev" aria-label="Previous">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="banner-nav banner-next" aria-label="Next">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Initialize slider functionality
        const slides = bannerSlider.querySelectorAll('.banner-slide');
        const prevBtn = bannerSlider.querySelector('.banner-prev');
        const nextBtn = bannerSlider.querySelector('.banner-next');
        let currentIndex = 0;
        let isTransitioning = false;

        function showSlide(index) {
            if (isTransitioning) return;
            isTransitioning = true;

            // Handle index bounds
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            // Update slides
            slides[currentIndex].classList.remove('active');
            slides[index].classList.add('active');
            currentIndex = index;

            // Reset transition lock
            setTimeout(() => {
                isTransitioning = false;
            }, 500); // Match with CSS transition duration
        }

        // Event listeners
        prevBtn?.addEventListener('click', () => showSlide(currentIndex - 1));
        nextBtn?.addEventListener('click', () => showSlide(currentIndex + 1));

        // Auto slide
        let autoSlide = setInterval(() => showSlide(currentIndex + 1), 5000);

        // Pause on hover
        bannerSlider.addEventListener('mouseenter', () => clearInterval(autoSlide));
        bannerSlider.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => showSlide(currentIndex + 1), 5000);
        });

    } catch (error) {
        console.error('Error initializing banner:', error);
    }
}

// Initialize banner when DOM is loaded
document.addEventListener('DOMContentLoaded', initBanner);







// Constants
const PRODUCTS_PER_PAGE = 12;
const API_BASE_URL = ''; // Để trống nếu gọi trực tiếp /api/...

let allProducts = [];
let allCategories = [];
let filteredProducts = [];
let currentPage = 1;
let currentCategoryId = ''; // Dùng chuỗi cho nhất quán

let minPrice = 0;
let maxPrice = 10000000;
let selectedMinPrice = 0;
let selectedMaxPrice = 10000000;

// DOM Elements
const elements = {
    productsGrid: document.getElementById('products-grid'),
    pagination: document.getElementById('products-pagination'),
    categoryList: document.getElementById('product-category-list'),
    categoryFilter: document.getElementById('category-filter'),
    searchInput: document.getElementById('search-input'),
    sortFilter: document.getElementById('sort-filter'),
    currentCategoryDisplay: document.getElementById('current-category')
};

// Fetch categories and products
async function fetchCategories() {
    const res = await fetch('/api/categories');
    return await res.json();
}
async function fetchProducts() {
    const res = await fetch('/api/products');
    return await res.json();
}

// Render sidebar categories
function renderCategories(categories, activeId = '') {
    if (!elements.categoryList) return;
    elements.categoryList.innerHTML = `
        <li>
            <a href="#" data-id="" class="${!activeId ? 'active' : ''}">Tất cả sản phẩm</a>
        </li>
        ${categories.map(cat => `
            <li>
                <a href="#" data-id="${cat.id}" class="${cat.id == activeId ? 'active' : ''}">${cat.name}</a>
            </li>
        `).join('')}
    `;
    // Sự kiện click
    elements.categoryList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentCategoryId = this.dataset.id || '';
            elements.categoryFilter.value = currentCategoryId;
            renderCategories(allCategories, currentCategoryId);
            updateBreadcrumb(currentCategoryId);
            filterAndRender();
        });
    });
}

// Render category options for filter dropdown
function renderCategoryOptions(categories) {
    if (!elements.categoryFilter) return;
    elements.categoryFilter.innerHTML = `
        <option value="">Tất cả danh mục</option>
        ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
    `;
}

// Lọc và render sản phẩm
function filterAndRender() {
    const search = elements.searchInput.value.trim().toLowerCase();
    const sort = elements.sortFilter.value;
    let category = currentCategoryId || elements.categoryFilter.value || '';

    // Lọc theo danh mục, tên, GIÁ
    filteredProducts = allProducts.filter(p =>
        (!category || String(p.category_id) === String(category)) &&
        (!search || p.name.toLowerCase().includes(search)) &&
        (typeof p.price === 'number' && p.price >= selectedMinPrice && p.price <= selectedMaxPrice)
    );

    // Sắp xếp
    if (sort === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') filteredProducts.sort((a, b) => b.name.localeCompare(a.name));

    currentPage = 1;
    renderProducts();
    renderPagination();
}

// Render sản phẩm
function renderProducts() {
    if (!filteredProducts.length) {
        elements.productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Hãy thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc</p>
            </div>
        `;
        elements.pagination.innerHTML = '';
        return;
    }
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(start, end);

    elements.productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image || 'images/default-product.jpg'}" alt="${escapeHtml(product.name)}">
            <div class="product-info">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                <button class="quick-view-btn" data-id="${product.id}">Xem nhanh</button>
                <button class="add-to-cart-btn" data-id="${product.id}">Thêm vào giỏ</button>
            </div>
        </div>
    `).join('');

    // Gán sự kiện cho nút "Xem nhanh"
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.onclick = function() {
            const id = this.dataset.id;
            const prod = allProducts.find(p => String(p.id) === String(id));
            if (prod) showQuickView(prod);
        };
    });

    // Gán sự kiện cho nút "Thêm vào giỏ"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.onclick = function() {
            const id = this.dataset.id;
            addToCart(id);
        };
    });
}

// Render phân trang
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }
    let html = '';
    // Previous
    html += `<a href="#" class="page-link prev" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></a>`;
    // Số trang
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
        html += `<a href="#" class="page-link" data-page="1">1</a>`;
        if (startPage > 2) html += `<span class="page-dots">...</span>`;
    }
    for (let i = startPage; i <= endPage; i++) {
        html += `<a href="#" class="page-link${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</a>`;
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
        html += `<a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>`;
    }
    // Next
    html += `<a href="#" class="page-link next" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></a>`;
    elements.pagination.innerHTML = html;

    // Sự kiện click
    elements.pagination.querySelectorAll('.page-link').forEach(link => {
        if (link.classList.contains('prev')) {
            link.addEventListener('click', e => {
                e.preventDefault();
                if (currentPage > 1) goToPage(currentPage - 1);
            });
        } else if (link.classList.contains('next')) {
            link.addEventListener('click', e => {
                e.preventDefault();
                if (currentPage < totalPages) goToPage(currentPage + 1);
            });
        } else if (link.dataset.page) {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (page !== currentPage) goToPage(page);
            });
        }
    });
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: elements.productsGrid.offsetTop - 20, behavior: 'smooth' });
}

// Breadcrumb
function updateBreadcrumb(categoryId) {
    if (!elements.currentCategoryDisplay) return;
    if (!categoryId) {
        elements.currentCategoryDisplay.textContent = '';
        return;
    }
    const category = allCategories.find(cat => cat.id == categoryId);
    if (category) {
        elements.currentCategoryDisplay.innerHTML = ` > <span>${category.name}</span>`;
    }
}

// Helper
function formatPrice(price) {
    return Number(price).toLocaleString('vi-VN') + 'đ';
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Sự kiện filter dropdown
if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener('change', function() {
        currentCategoryId = this.value;
        renderCategories(allCategories, currentCategoryId);
        updateBreadcrumb(currentCategoryId);
        filterAndRender();
    });
}
if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce(filterAndRender, 300));
}
if (document.getElementById('search-btn')) {
    document.getElementById('search-btn').addEventListener('click', filterAndRender);
}
if (elements.sortFilter) {
    elements.sortFilter.addEventListener('change', filterAndRender);
}
const priceFilter = document.getElementById('price-filter');
if (priceFilter) {
    priceFilter.addEventListener('change', filterAndRender);
}

// Toggle panel lọc nâng cao
const advancedFilterToggle = document.querySelector('.advanced-filter-toggle');
const advancedFilterPanel = document.querySelector('.advanced-filter-panel');
if (advancedFilterToggle && advancedFilterPanel) {
    advancedFilterToggle.addEventListener('click', () => {
        advancedFilterPanel.style.display = advancedFilterPanel.style.display === 'block' ? 'none' : 'block';
    });
}

// Xử lý range giá
const priceRange = document.getElementById('price-range');
const minPriceSpan = document.getElementById('min-price');
const maxPriceSpan = document.getElementById('max-price');
if (priceRange && minPriceSpan && maxPriceSpan) {
    priceRange.addEventListener('input', function() {
        selectedMaxPrice = Number(this.value);
        maxPriceSpan.textContent = selectedMaxPrice.toLocaleString('vi-VN') + 'đ';
    });
}

// Áp dụng lọc nâng cao
const applyFilterBtn = document.getElementById('apply-filter');
if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', function() {
        selectedMaxPrice = Number(priceRange.value);
        filterAndRender();
        advancedFilterPanel.style.display = 'none';
    });
}

// Debounce
function debounce(func, wait) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', async function() {
    allCategories = await fetchCategories();
    allProducts = await fetchProducts();

    // Lấy category từ URL nếu có
    const params = new URLSearchParams(window.location.search);
    currentCategoryId = params.get('category') || '';

    renderCategoryOptions(allCategories);
    renderCategories(allCategories, currentCategoryId);
    if (elements.categoryFilter) elements.categoryFilter.value = currentCategoryId;
    updateBreadcrumb(currentCategoryId);

    // Khởi tạo giá trị lọc giá
    selectedMinPrice = 0;
    selectedMaxPrice = 10000000;
    if (priceRange && maxPriceSpan) {
        priceRange.value = selectedMaxPrice;
        maxPriceSpan.textContent = selectedMaxPrice.toLocaleString('vi-VN') + 'đ';
    }

    filterAndRender();
    updateCartCount();
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM categories');
    res.json(rows);
});

// GET /api/products
app.get('/api/products', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM products');
    res.json(rows);
});

function showQuickView(product) {
    const modal = document.getElementById('quick-view-modal');
    const content = modal.querySelector('.quick-view-content');
    content.innerHTML = `
        <div style="display:flex;gap:24px;align-items:center;">
            <img src="${product.image || 'images/default-product.jpg'}" alt="${escapeHtml(product.name)}" style="width:160px;height:160px;object-fit:contain;border-radius:8px;background:#f4f6fa;">
            <div>
                <h2 style="margin-bottom:10px;">${escapeHtml(product.name)}</h2>
                <p style="color:#DC3545;font-size:20px;font-weight:bold;margin-bottom:10px;">${formatPrice(product.price)}</p>
                <div style="margin-bottom:12px;">${product.description ? escapeHtml(product.description) : ''}</div>
                <button class="add-to-cart-btn" data-id="${product.id}">Thêm vào giỏ</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';

    // Đóng modal
    modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Nút thêm vào giỏ trong modal
    content.querySelector('.add-to-cart-btn').onclick = function() {
        addToCart(product.id);
    };
}

// Add to cart function
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const prod = allProducts.find(p => String(p.id) === String(productId));
    if (!prod) return;
    const idx = cart.findIndex(item => String(item.id) === String(productId));
    if (idx > -1) {
        cart[idx].quantity += 1;
    } else {
        cart.push({ id: prod.id, name: prod.name, price: prod.price, image: prod.image, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Đã thêm vào giỏ hàng!');
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Tổng số lượng sản phẩm (tính cả số lượng từng mặt hàng)
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    // Nếu muốn chỉ đếm số mặt hàng khác nhau: const total = cart.length;
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
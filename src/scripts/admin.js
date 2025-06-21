// Banner management (client-side demo)
let banners = [
    {
        image: "img/banner/baner1.jpg",
        title: "Banner 1",
        event: "Khuyến mãi mùa hè"
    },
    {
        image: "img/banner/banner2.jpg",
        title: "Banner 2",
        event: "Sự kiện ra mắt"
    }
];

// Lấy danh sách banner từ server
async function fetchBanners() {
    const res = await fetch('/api/banners');
    return await res.json();
}

// Thêm banner mới
async function addBanner(banner) {
    const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner)
    });
    return await res.json();
}

// Xóa banner
async function deleteBanner(id) {
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    renderBanners();
}

// Hiển thị danh sách banner
async function renderBanners() {
    const banners = await fetchBanners();
    const tbody = document.getElementById('banner-table-body');
    tbody.innerHTML = '';
    banners.forEach((banner, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${banner.image}" alt="Banner" style="max-width:120px; border-radius:6px;"></td>
            <td>${banner.title || ''}</td>
            <td>${banner.event || ''}</td>
            <td>
                <button class="btn-delete" onclick="deleteBanner(${banner.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Hiển thị modal thêm banner
function showAddBannerModal() {
    document.getElementById('banner-modal').style.display = 'block';
    document.getElementById('banner-form').reset();
}

// Đóng modal
function closeBannerModal() {
    document.getElementById('banner-modal').style.display = 'none';
}

// Xử lý thêm banner mới
document.addEventListener('DOMContentLoaded', function() {
    renderBanners();

    document.getElementById('banner-form').onsubmit = async function(e) {
        e.preventDefault();
        const imageInput = document.getElementById('banner-image');
        const title = document.getElementById('banner-title').value;
        const eventText = document.getElementById('banner-event').value;
        // Lấy đường dẫn ảnh (demo: chỉ lấy tên file, thực tế cần upload lên server)
        let imagePath = "img/banner/" + (imageInput.files[0]?.name || "baner1.jpg");
        await addBanner({ image: imagePath, title, event: eventText });
        closeBannerModal();
        renderBanners();
    };

    // Đóng modal khi click ngoài vùng modal
    window.onclick = function(event) {
        const modal = document.getElementById('banner-modal');
        if (event.target === modal) {
            closeBannerModal();
        }
    };
});

// Xử lý đăng xuất
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Xóa thông tin user khỏi localStorage (hoặc sessionStorage nếu bạn dùng)
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            // Chuyển hướng về trang chủ
            window.location.href = 'index.html';
        });
    }
});

// Hàm lấy số lượng user và cập nhật dashboard
async function updateUserCount() {
    try {
        const res = await fetch('/api/users/count');
        const data = await res.json();
        document.getElementById('stat-users').textContent = data.count;
    } catch (e) {
        document.getElementById('stat-users').textContent = '0';
    }
}

// Lấy số lượng banner từ danh sách
async function updateBannerCount() {
    try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        document.getElementById('stat-banners').textContent = data.length;
    } catch (e) {
        document.getElementById('stat-banners').textContent = '0';
    }
}

// Lấy số lượng danh mục từ danh sách
async function updateCategoryCount() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        document.getElementById('stat-categories').textContent = data.length;
    } catch (e) {
        document.getElementById('stat-categories').textContent = '0';
    }
}

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', function() {
    renderBanners();
    updateUserCount();
    updateBannerCount();
    updateCategoryCount();
});

// Xử lý chuyển tab sidebar
document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('.sidebar nav li');
    const tabContents = document.querySelectorAll('.tab-content');
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Bỏ active tất cả
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            // Active tab được chọn
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
            // Nếu là tab thương hiệu thì renderBrands
            if (tabId === 'brands') renderBrands();
            // Nếu là tab sản phẩm thì renderProducts
            if (tabId === 'products') renderProducts();
            // Nếu là tab danh mục thì renderCategories
            if (tabId === 'categories') renderCategories();
            // Nếu là tab users thì renderUsers
            if (tabId === 'users') renderUsers();
            // Nếu là tab banners thì renderBanners
            if (tabId === 'banners') renderBanners();
        });
    });
});

// Hiển thị toast thông báo
function showToast(message, isError = false) {
    alert(message);
}

// Hiển thị modal thêm user
function showAddUserModal() {
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('user-modal-title').textContent = 'Thêm User';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-username').disabled = false;
}

// Hiển thị modal sửa user
function showEditUserModal(id, username, email, phone, role) {
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('user-modal-title').textContent = 'Chỉnh sửa User';
    document.getElementById('user-id').value = id;
    document.getElementById('user-username').value = username;
    document.getElementById('user-username').disabled = true;
    document.getElementById('user-email').value = email;
    document.getElementById('user-phone').value = phone;
    document.getElementById('user-role').value = role;
    document.getElementById('user-password').value = '';
}

// Đóng modal user
function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Lấy danh sách user từ server
async function fetchUsers() {
    const res = await fetch('/api/users');
    return await res.json();
}

// Thêm user mới
async function addUser(user) {
    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return await res.json();
}

// Sửa user
async function updateUser(id, user) {
    const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return await res.json();
}

// Xóa user
async function deleteUser(id) {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToast('Xóa user thành công!');
        renderUsers();
    } else {
        showToast(data.error || 'Xóa user thất bại!', true);
    }
}

// Hiển thị danh sách user
async function renderUsers() {
    const users = await fetchUsers();
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    users.forEach((u, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${u.username}</td>
                <td>${u.email || ''}</td>
                <td>${u.phone || ''}</td>
                <td>${u.role}</td>
                <td>
                    <button class="btn-edit" onclick="showEditUserModal(${u.id}, '${u.username}', '${u.email || ''}', '${u.phone || ''}', '${u.role}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteUser(${u.id})" ${u.role === 'admin' ? 'disabled title="Không thể xóa admin"' : ''}>Xóa</button>
                </td>
            </tr>
        `;
    });
}

// Xử lý submit form user (thêm/sửa)
document.addEventListener('DOMContentLoaded', function() {
    renderUsers();

    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('user-id').value;
            const username = document.getElementById('user-username').value.trim();
            const password = document.getElementById('user-password').value;
            const email = document.getElementById('user-email').value.trim();
            const phone = document.getElementById('user-phone').value.trim();
            const role = document.getElementById('user-role').value;

            if (!username) {
                showToast('Vui lòng nhập tên đăng nhập!', true);
                return;
            }

            if (id) {
                // Sửa user
                const result = await updateUser(id, { email, phone, role, password });
                if (result.success) {
                    showToast('Cập nhật user thành công!');
                    closeUserModal();
                    renderUsers();
                } else {
                    showToast(result.error || 'Cập nhật user thất bại!', true);
                }
            } else {
                // Thêm user mới
                if (!password) {
                    showToast('Vui lòng nhập mật khẩu!', true);
                    return;
                }
                const result = await addUser({ username, password, email, phone, role });
                if (result.success) {
                    showToast('Thêm user thành công!');
                    closeUserModal();
                    renderUsers();
                } else {
                    showToast(result.error || 'Thêm user thất bại!', true);
                }
            }
        };
    }
});

// Lấy danh sách danh mục
async function fetchCategories() {
    const res = await fetch('/api/categories');
    return await res.json();
}

// Thêm danh mục
async function addCategory(category) {
    const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
    return await res.json();
}

// Sửa danh mục
async function updateCategory(id, category) {
    const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
    return await res.json();
}

// Xóa danh mục
async function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToast('Xóa danh mục thành công!');
        renderCategories();
    } else {
        showToast(data.error || 'Xóa danh mục thất bại!', true);
    }
}

// Hiển thị danh sách danh mục
async function renderCategories() {
    const categories = await fetchCategories();
    const tbody = document.getElementById('category-table-body');
    tbody.innerHTML = '';
    categories.forEach((cat, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${cat.name}</td>
                <td>${cat.description || ''}</td>
                <td>
                    <button class="btn-edit" onclick="showEditCategoryModal(${cat.id}, '${cat.name.replace(/'/g,"\\'")}', '${(cat.description||'').replace(/'/g,"\\'")}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteCategory(${cat.id})">Xóa</button>
                </td>
            </tr>
        `;
    });
}

// Hiển thị modal thêm danh mục
function showAddCategoryModal() {
    document.getElementById('category-modal').style.display = 'block';
    document.getElementById('category-modal-title').textContent = 'Thêm Danh mục';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
}

// Hiển thị modal sửa danh mục
function showEditCategoryModal(id, name, description) {
    document.getElementById('category-modal').style.display = 'block';
    document.getElementById('category-modal-title').textContent = 'Chỉnh sửa Danh mục';
    document.getElementById('category-id').value = id;
    document.getElementById('category-name').value = name;
    document.getElementById('category-description').value = description;
}

// Đóng modal danh mục
function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
}

// Xử lý submit form danh mục
document.addEventListener('DOMContentLoaded', function() {
    renderCategories();
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const name = document.getElementById('category-name').value.trim();
            const description = document.getElementById('category-description').value.trim();
            if (!name) {
                showToast('Vui lòng nhập tên danh mục!', true);
                return;
            }
            if (id) {
                const result = await updateCategory(id, { name, description });
                if (result.success) {
                    showToast('Cập nhật danh mục thành công!');
                    closeCategoryModal();
                    renderCategories();
                } else {
                    showToast(result.error || 'Cập nhật thất bại!', true);
                }
            } else {
                const result = await addCategory({ name, description });
                if (result.success) {
                    showToast('Thêm danh mục thành công!');
                    closeCategoryModal();
                    renderCategories();
                } else {
                    showToast(result.error || 'Thêm thất bại!', true);
                }
            }
        };
    }
});

// Quản lý sản phẩm
// Lấy danh sách sản phẩm từ server
async function fetchProducts() {
    const res = await fetch('/api/products');
    return await res.json();
}

// Thêm sản phẩm mới
async function addProduct(product) {
    const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return await res.json();
}

// Sửa sản phẩm
async function updateProduct(id, product) {
    const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return await res.json();
}

// Xóa sản phẩm
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToast('Xóa sản phẩm thành công!');
        renderProducts();
    } else {
        showToast(data.error || 'Xóa sản phẩm thất bại!', true);
    }
}

// Hiển thị danh sách sản phẩm
async function renderProducts() {
    const products = await fetchProducts();
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = '';
    products.forEach((p, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${p.name}</td>
                <td>${Number(p.price).toLocaleString()}đ</td>
                <td>${p.category_name || ''}</td>
                <td><img src="${p.image}" alt="${p.name}" style="max-width:60px; border-radius:4px;"></td>
                <td>
                    <span class="star-featured" data-id="${p.id}" style="cursor:pointer;">
                        <i class="fas fa-star${p.featured == 1 ? '' : '-o'}" style="color:${p.featured == 1 ? '#FFD600' : '#ccc'};font-size:1.4em;"></i>
                    </span>
                </td>
                <td>
                    <span class="star-new" data-id="${p.id}" style="cursor:pointer;">
                        <i class="fas fa-bolt${p.new == 1 ? '' : '-o'}" style="color:${p.new == 1 ? '#FFD600' : '#ccc'};font-size:1.4em;"></i>
                    </span>
                </td>
                <td>
                  <button class="btn-edit" onclick="showEditProductModal(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.price}, ${p.category_id}, '${p.image.replace(/'/g,"\\'")}', ${p.featured == 1 ? 1 : 0}, ${p.new == 1 ? 1 : 0})">Sửa</button>
                  <button class="btn-delete" onclick="deleteProduct(${p.id})">Xóa</button>
                </td>
            </tr>
        `;
    });

    // Gán sự kiện click cho icon ngôi sao
    document.querySelectorAll('.star-featured').forEach(star => {
        star.onclick = async function() {
            const id = this.dataset.id;
            await toggleFeaturedProduct(id);
            renderProducts();
        };
    });

    document.querySelectorAll('.star-new').forEach(star => {
        star.onclick = async function() {
            const id = this.dataset.id;
            await toggleNewProduct(id);
            renderProducts();
        };
    });
}

// Hiển thị modal thêm sản phẩm
async function showAddProductModal() {
    document.getElementById('product-modal').style.display = 'block';
    document.getElementById('product-modal-title').textContent = 'Thêm Sản phẩm';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-image-preview').src = '';
    await renderCategoryOptions();
    fillBrandSelect();
}

// Hiển thị modal sửa sản phẩm
async function showEditProductModal(id, name, price, category_id, image, featured) {
    document.getElementById('product-modal').style.display = 'block';
    document.getElementById('product-modal-title').textContent = 'Chỉnh sửa Sản phẩm';
    document.getElementById('product-id').value = id;
    document.getElementById('product-name').value = name;
    document.getElementById('product-price').value = price;
    await renderCategoryOptions(category_id);
    document.getElementById('product-image-preview').src = image || '';
    document.getElementById('product-featured').checked = featured == 1;
    fillBrandSelect();
}

// Đóng modal sản phẩm
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Xử lý thêm/sửa sản phẩm
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.onsubmit = async function(e) {
            e.preventDefault();

            const id = document.getElementById('product-id').value;
            const name = document.getElementById('product-name').value.trim();
            const price = document.getElementById('product-price').value;
            const category_id = document.getElementById('product-category').value;
            let image = document.getElementById('product-image-preview').src;
            const featured = document.getElementById('product-featured').checked ? 1 : 0;
            const brand_id = document.getElementById('product-brand').value || null;

            if (!name || !price || !category_id) {
                showToast('Vui lòng nhập đầy đủ thông tin!', true);
                return;
            }
            if (!image || image === window.location.href) image = '';

            let result;
            if (id) {
                result = await updateProduct(id, { name, price, category_id, image, featured, brand_id });
            } else {
                result = await addProduct({ name, price, category_id, image, featured, brand_id });
            }

            if (result && result.success) {
                showToast('Lưu sản phẩm thành công!');
                closeProductModal();
                renderProducts();
            } else {
                showToast((result && result.error) || 'Có lỗi xảy ra!', true);
            }
        };
    }
});

async function renderCategoryOptions(selectedId) {
    const categories = await fetchCategories();
    const select = document.getElementById('product-category');
    select.innerHTML = categories.map(cat => `
        <option value="${cat.id}" ${selectedId == cat.id ? 'selected' : ''}>${cat.name}</option>
    `).join('');
}

// Hiển thị ảnh preview khi chọn file
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('product-image');
    const preview = document.getElementById('product-image-preview');
    if (imageInput && preview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    }
});

// Toggle sản phẩm nổi bật
async function toggleFeaturedProduct(productId) {
    const products = await fetchProducts();
    const product = products.find(p => p.id == productId);
    const newFeatured = product.featured == 1 ? 0 : 1;
    if (newFeatured == 1) {
        const featuredCount = products.filter(p => p.featured == 1).length;
        // Nếu bật nổi bật, kiểm tra số lượng tối đa 4
        if (featuredCount >= 4) {
            showToast('Chỉ được chọn tối đa 4 sản phẩm nổi bật!', true);
            return;
        }
    }
    const result = await updateProduct(productId, { ...product, featured: newFeatured });
    if (newFeatured == 1) {
        showToast('Đã thêm sản phẩm vào danh sách nổi bật!');
    } else {
        showToast('Đã bỏ sản phẩm khỏi danh sách nổi bật!');
    }
}

// Toggle sản phẩm mới
async function toggleNewProduct(productId) {
    const products = await fetchProducts();
    const product = products.find(p => p.id == productId);
    const newStatus = product.new == 1 ? 0 : 1;
    const result = await updateProduct(productId, { ...product, new: newStatus });
    if (result && result.success) {
        if (product.new == 1 && newStatus == 0) {
            showToast('Đã bỏ sản phẩm khỏi danh sách mới!');
        }
    } else {
        showToast((result && result.error) || 'Có lỗi xảy ra!', true);
    }
}

// Quản lý thương hiệu
let brands = [];

// Lấy danh sách thương hiệu
async function fetchBrands() {
    const res = await fetch('http://localhost:3000/api/brands');
    return await res.json();
}

// Hiển thị danh sách thương hiệu
async function renderBrands() {
    const brands = await fetchBrands();
    const tbody = document.getElementById('brand-table-body');
    tbody.innerHTML = '';
    brands.forEach((b, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i+1}</td>
                <td>${b.name}</td>
                <td>
                    <button onclick="editBrand(${b.id}, '${b.name}')">Sửa</button>
                    <button onclick="deleteBrand(${b.id})">Xóa</button>
                </td>
            </tr>
        `;
    });
}

// Thêm thương hiệu
async function addBrand() {
    const name = prompt('Nhập tên thương hiệu:');
    if (name) {
        await fetch('http://localhost:3000/api/brands', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name })
        });
        renderBrands();
    }
}

// Sửa thương hiệu
async function editBrand(id, oldName) {
    const name = prompt('Sửa tên thương hiệu:', oldName);
    if (name) {
        await fetch(`http://localhost:3000/api/brands/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name })
        });
        renderBrands();
    }
}

// Xóa thương hiệu
async function deleteBrand(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        await fetch(`http://localhost:3000/api/brands/${id}`, { method: 'DELETE' });
        renderBrands();
    }
}

// Khi vào tab Thương hiệu
document.querySelector('[data-tab="brands"]').onclick = renderBrands;
// Cart Data Structure
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const elements = {
    cartItemsContainer: document.getElementById('cart-items-container'),
    subtotal: document.getElementById('subtotal'),
    discount: document.getElementById('discount'),
    shipping: document.getElementById('shipping'),
    total: document.getElementById('total'),
    couponCode: document.getElementById('coupon-code'),
    applyCouponBtn: document.getElementById('apply-coupon'),
    btnCheckout: document.querySelector('.btn-checkout'),
    btnClearCart: document.querySelector('.btn-clear-cart'),
    btnContinueShopping: document.querySelector('.btn-continue-shopping')
};

// Initialize the cart page
function initCartPage() {
    renderCartItems();
    calculateCartTotals();
    setupEventListeners();
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        elements.cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm</p>
                <button class="btn-start-shopping" onclick="window.location.href='product.html'">
                    <i class="fas fa-store"></i> Bắt đầu mua sắm
                </button>
            </div>
        `;
        return;
    }

    elements.cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-product">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.category}</p>
                </div>
            </div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-quantity">
                <div class="quantity-control">
                    <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" onchange="updateQuantityInput('${item.id}', this.value)">
                    <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
            <div class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </div>
        </div>
    `).join('');

    // Sau khi render các cart-item
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.onclick = function() {
            const id = this.dataset.id;
            removeItem(id);
        };
    });
}

// Calculate cart totals
function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 0; // Would be calculated from coupons
    const shipping = subtotal > 500000 ? 0 : 30000; // Free shipping for orders over 500,000₫
    const total = subtotal - discount + shipping;

    elements.subtotal.textContent = formatPrice(subtotal);
    elements.discount.textContent = formatPrice(discount);
    elements.shipping.textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
    elements.total.textContent = formatPrice(total);
}

// Update item quantity
function updateQuantity(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += change;

    // Ensure quantity is at least 1
    if (cart[itemIndex].quantity < 1) {
        cart[itemIndex].quantity = 1;
    }

    saveCart();
    renderCartItems();
    calculateCartTotals();
}

// Update quantity from input
function updateQuantityInput(itemId, value) {
    const quantity = parseInt(value) || 1;
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity = quantity < 1 ? 1 : quantity;

    saveCart();
    renderCartItems();
    calculateCartTotals();
}

// Remove item from cart
function removeItem(productId) {
    cart = cart.filter(item => String(item.id) !== String(productId));
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount && updateCartCount();
}

// Apply coupon code
function applyCoupon() {
    const couponCode = elements.couponCode.value.trim();
    if (!couponCode) return;

    // Here you would typically validate the coupon with your backend
    alert(`Mã giảm giá "${couponCode}" đã được áp dụng (mô phỏng)`);
    elements.couponCode.value = '';
}

// Clear cart
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
        cart = [];
        saveCart();
        renderCartItems();
        calculateCartTotals();
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
        return;
    }
    
    // Here you would redirect to checkout page
    alert('Chuyển hướng đến trang thanh toán (mô phỏng)');
    // window.location.href = 'checkout.html';
}

// Continue shopping
function continueShopping() {
    window.location.href = 'product.html';
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Format price with VND currency
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Setup event listeners
function setupEventListeners() {
    elements.applyCouponBtn.addEventListener('click', applyCoupon);
    elements.btnCheckout.addEventListener('click', proceedToCheckout);
    elements.btnClearCart.addEventListener('click', clearCart);
    elements.btnContinueShopping.addEventListener('click', continueShopping);
    
    // Allow pressing Enter to apply coupon
    elements.couponCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyCoupon();
    });
}

// Render cart for another instance
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    if (!cartList || !cartTotal) return;

    if (cart.length === 0) {
        cartList.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
        cartTotal.innerHTML = '';
        return;
    }

    let total = 0;
    cartList.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image || 'images/default-product.jpg'}" alt="${item.name}" style="width:60px;height:60px;object-fit:contain;">
                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <p>Giá: ${Number(item.price).toLocaleString()}đ</p>
                    <p>Số lượng: ${item.quantity}</p>
                </div>
            </div>
        `;
    }).join('');
    cartTotal.innerHTML = `<h3>Tổng cộng: ${total.toLocaleString()}đ</h3>`;
}

// Khi load trang giỏ hàng
document.addEventListener('DOMContentLoaded', function() {
    initCartPage();
    updateCartCount();
});

window.updateQuantity = updateQuantity;
window.updateQuantityInput = updateQuantityInput;
window.removeItem = removeItem;

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}
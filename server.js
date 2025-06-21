const express = require('express');
const path = require('path');
const db = require('./database/db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình multer để lưu trữ ảnh sản phẩm
const upload = multer({ dest: path.join(__dirname, 'src/img/products') });

// Helper cho truy vấn SELECT (trả về nhiều dòng)
function queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
// Helper cho truy vấn SELECT (trả về 1 dòng)
function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
        });
    });
}
// Helper cho truy vấn INSERT/UPDATE/DELETE
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

// Lấy danh sách banner
app.get('/api/banners', async (req, res) => {
    try {
        const rows = await queryAll('SELECT * FROM banners');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm banner
app.post('/api/banners', async (req, res) => {
    const { image, title, event } = req.body;
    try {
        const result = await runQuery('INSERT INTO banners (image, title, event) VALUES (?, ?, ?)', [image, title, event]);
        res.json({ id: result.insertId, image, title, event });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa banner
app.delete('/api/banners/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM banners WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng ký user
app.post('/api/register', async (req, res) => {
    const { username, password, email, phone } = req.body;
    try {
        const user = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
        if (user) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        const hash = await bcrypt.hash(password, 10);
        const result = await runQuery('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)', [username, hash, email, phone]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng nhập user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
        res.json({ success: true, role: user.role });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API đếm số lượng user
app.get('/api/users/count', async (req, res) => {
    try {
        const row = await queryOne('SELECT COUNT(*) as count FROM users');
        res.json({ count: row.count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách user
app.get('/api/users', async (req, res) => {
    try {
        const rows = await queryAll('SELECT id, username, email, phone, role, created_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm user mới
app.post('/api/users', async (req, res) => {
    const { username, password, email, phone, role } = req.body;
    try {
        const user = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
        if (user) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        const hash = await bcrypt.hash(password, 10);
        const result = await runQuery('INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)', [username, hash, email, phone, role || 'user']);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (user && user.role === 'admin') {
            return res.status(400).json({ error: 'Không thể xóa tài khoản admin!' });
        }
        await runQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa thông tin user
app.put('/api/users/:id', async (req, res) => {
    const { email, phone, role, password } = req.body;
    try {
        let sql, params;
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            sql = 'UPDATE users SET email = ?, phone = ?, role = ?, password = ? WHERE id = ?';
            params = [email, phone, role, hash, req.params.id];
        } else {
            sql = 'UPDATE users SET email = ?, phone = ?, role = ? WHERE id = ?';
            params = [email, phone, role, req.params.id];
        }
        await runQuery(sql, params);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách danh mục
app.get('/api/categories', async (req, res) => {
    try {
        const rows = await queryAll('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm danh mục
app.post('/api/categories', async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await runQuery('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa danh mục
app.put('/api/categories/:id', async (req, res) => {
    const { name, description } = req.body;
    try {
        await runQuery('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa danh mục
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const row = await queryOne('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
        if (row && row.count > 0) {
            return res.status(400).json({ error: 'Không thể xóa danh mục đã có sản phẩm!' });
        }
        await runQuery('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const rows = await queryAll(`SELECT products.*, categories.name as category_name, brands.name as brand_name FROM products LEFT JOIN categories ON products.category_id = categories.id LEFT JOIN brands ON products.brand_id = brands.id`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm sản phẩm
app.post('/api/products', async (req, res) => {
    const { name, price, category_id, brand_id, image, featured, new: isNew } = req.body;
    try {
        const result = await runQuery('INSERT INTO products (name, price, category_id, brand_id, image, featured, new_products) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, price, category_id, brand_id, image, featured || 0, isNew || 0]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
    const { name, price, category_id, image, featured, new: isNew } = req.body;
    try {
        const product = await queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        await runQuery('UPDATE products SET name=?, price=?, category_id=?, image=?, featured=?, new_products=? WHERE id=?', [name || product.name, price || product.price, category_id || product.category_id, image || product.image, typeof featured !== 'undefined' ? featured : product.featured, typeof isNew !== 'undefined' ? isNew : product.new_products, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tải ảnh sản phẩm lên
app.post('/api/upload-product-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ image: 'img/products/' + req.file.filename });
});

// Cập nhật trạng thái nổi bật của sản phẩm
app.put('/api/products/:id/featured', async (req, res) => {
    const { featured } = req.body;
    try {
        if (featured === 1) {
            const row = await queryOne('SELECT COUNT(*) as count FROM products WHERE featured = 1');
            if (row.count >= 4) {
                return res.status(400).json({ error: 'Chỉ được chọn tối đa 4 sản phẩm nổi bật!' });
            }
        }
        await runQuery('UPDATE products SET featured = ? WHERE id = ?', [featured, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách thương hiệu
app.get('/api/brands', async (req, res) => {
    try {
        const rows = await queryAll('SELECT * FROM brands');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm thương hiệu
app.post('/api/brands', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await runQuery('INSERT INTO brands (name) VALUES (?)', [name]);
        res.json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa thương hiệu
app.put('/api/brands/:id', async (req, res) => {
    const { name } = req.body;
    try {
        await runQuery('UPDATE brands SET name=? WHERE id=?', [name, req.params.id]);
        res.json({ id: req.params.id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa thương hiệu
app.delete('/api/brands/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM brands WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'src')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Thêm error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
const express = require('express');
const path = require('path');
const db = require('./database/db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const database = new sqlite3.Database(
  path.join(__dirname, 'database', 'banhang.db'),
  (err) => {
    if (err) {
      console.error('Kết nối SQLite thất bại:', err.message);
    } else {
      console.log('Kết nối SQLite thành công!');
    }
  }
);

// Cấu hình multer để lưu trữ ảnh sản phẩm
const upload = multer({ dest: path.join(__dirname, 'src/img/products') });

// Lấy danh sách banner
app.get('/api/banners', (req, res) => {
    db.all('SELECT * FROM banners', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Thêm banner (chỉ nhận đường dẫn ảnh, chưa upload file)
app.post('/api/banners', (req, res) => {
    const { image, title, event } = req.body;
    db.run(
        'INSERT INTO banners (image, title, event) VALUES (?, ?, ?)',
        [image, title, event],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, image, title, event });
        }
    );
});

// Xóa banner
app.delete('/api/banners/:id', (req, res) => {
    db.run('DELETE FROM banners WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Đăng ký user
app.post('/api/register', async (req, res) => {
    const { username, password, email, phone } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (row) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        const hash = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
            [username, hash, email, phone],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID });
            }
        );
    });
});

// Đăng nhập user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Lỗi server' });
        if (!user) return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
        // Trả về role trực tiếp
        res.json({ success: true, role: user.role });
    });
});

// API đếm số lượng user
app.get('/api/users/count', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ count: row.count });
    });
});

// Lấy danh sách user
app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, email, phone, role, created_at FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Thêm user mới
app.post('/api/users', async (req, res) => {
    const { username, password, email, phone, role } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (row) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        const hash = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)',
            [username, hash, email, phone, role || 'user'],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID });
            }
        );
    });
});

// Xóa user
app.delete('/api/users/:id', (req, res) => {
    // Không cho phép xóa user admin mặc định (id=1 hoặc username='admin')
    db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (user && user.role === 'admin') {
            return res.status(400).json({ error: 'Không thể xóa tài khoản admin!' });
        }
        db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Sửa thông tin user (không cho sửa username, chỉ sửa email, phone, role, password nếu nhập mới)
app.put('/api/users/:id', async (req, res) => {
    const { email, phone, role, password } = req.body;
    let sql = 'UPDATE users SET email = ?, phone = ?, role = ?';
    let params = [email, phone, role, req.params.id];

    if (password) {
        const hash = await bcrypt.hash(password, 10);
        sql = 'UPDATE users SET email = ?, phone = ?, role = ?, password = ? WHERE id = ?';
        params = [email, phone, role, hash, req.params.id];
    } else {
        sql += ' WHERE id = ?';
    }

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Lấy danh sách danh mục
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Thêm danh mục
app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    db.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Sửa danh mục
app.put('/api/categories/:id', (req, res) => {
    const { name, description } = req.body;
    db.run(
        'UPDATE categories SET name = ?, description = ? WHERE id = ?',
        [name, description, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// Xóa danh mục (chỉ cho xóa nếu không có sản phẩm thuộc danh mục)
app.delete('/api/categories/:id', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id], (err, row) => {
        if (row && row.count > 0) {
            return res.status(400).json({ error: 'Không thể xóa danh mục đã có sản phẩm!' });
        }
        db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Lấy danh sách sản phẩm (có tên danh mục)
app.get('/api/products', (req, res) => {
    db.all(`SELECT products.*, categories.name as category_name, brands.name as brand_name
            FROM products
            LEFT JOIN categories ON products.category_id = categories.id
            LEFT JOIN brands ON products.brand_id = brands.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Thêm sản phẩm
app.post('/api/products', (req, res) => {
    const { name, price, category_id, brand_id, image, featured, new: isNew } = req.body;
    db.run(
        'INSERT INTO products (name, price, category_id, brand_id, image, featured, new_products) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, price, category_id, brand_id, image, featured || 0, isNew || 0],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category_id, image, featured, new: isNew } = req.body;
        const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

        await db.run(
            'UPDATE products SET name=?, price=?, category_id=?, image=?, featured=?, new=? WHERE id=?',
            [
                name || product.name,
                price || product.price,
                category_id || product.category_id,
                image || product.image,
                typeof featured !== 'undefined' ? featured : product.featured,
                typeof isNew !== 'undefined' ? isNew : product.new,
                id
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Tải ảnh sản phẩm lên
app.post('/api/upload-product-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ image: 'img/products/' + req.file.filename });
});

// API cập nhật trạng thái nổi bật của sản phẩm
app.put('/api/products/:id/featured', async (req, res) => {
    try {
        const { featured } = req.body;
        const id = req.params.id;
        
        // Kiểm tra số lượng sản phẩm nổi bật hiện tại
        if (featured === 1) {
            const featuredCount = await db.get(
                'SELECT COUNT(*) as count FROM products WHERE featured = 1'
            );
            if (featuredCount.count >= 4) {
                return res.status(400).json({
                    error: 'Chỉ được chọn tối đa 4 sản phẩm nổi bật!'
                });
            }
        }

        await db.run(
            'UPDATE products SET featured = ? WHERE id = ?',
            [featured, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách thương hiệu
app.get('/api/brands', (req, res) => {
    db.all('SELECT * FROM brands', (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

// Thêm thương hiệu
app.post('/api/brands', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO brands (name) VALUES (?)', [name], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ id: this.lastID, name });
    });
});

// Sửa thương hiệu
app.put('/api/brands/:id', (req, res) => {
    const { name } = req.body;
    db.run('UPDATE brands SET name=? WHERE id=?', [name, req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ id: req.params.id, name });
    });
});

// Xóa thương hiệu
app.delete('/api/brands/:id', (req, res) => {
    db.run('DELETE FROM brands WHERE id=?', [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ success: true });
    });
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
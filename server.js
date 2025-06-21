const express = require('express');
const path = require('path');
const { pool } = require('./database/db'); // Sử dụng MySQL pool thay vì SQLite
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình multer để lưu trữ ảnh sản phẩm
const upload = multer({ dest: path.join(__dirname, 'src/img/products') });

// Middleware xử lý lỗi database
const handleDbError = (res, err) => {
  console.error('Database error:', err);
  res.status(500).json({ error: err.message });
};

// Lấy danh sách banner
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners');
    res.json(rows);
  } catch (err) {
    handleDbError(res, err);
  }
});

// Thêm banner
app.post('/api/banners', async (req, res) => {
  const { image, title, event } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO banners (image, title, event) VALUES (?, ?, ?)',
      [image, title, event]
    );
    res.json({ id: result.insertId, image, title, event });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Xóa banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Đăng ký user
app.post('/api/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  try {
    // Kiểm tra username tồn tại
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
      [username, hash, email, phone]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Đăng nhập user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
    
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
    
    res.json({ success: true, role: user.role });
  } catch (err) {
    handleDbError(res, err);
  }
});

// API đếm số lượng user
app.get('/api/users/count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    res.json({ count: rows[0].count });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Lấy danh sách user
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, phone, role, created_at FROM users'
    );
    res.json(rows);
  } catch (err) {
    handleDbError(res, err);
  }
});

// Thêm user mới
app.post('/api/users', async (req, res) => {
  const { username, password, email, phone, role } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)',
      [username, hash, email, phone, role || 'user']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Xóa user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }
    
    if (users[0].role === 'admin') {
      return res.status(400).json({ error: 'Không thể xóa tài khoản admin!' });
    }
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Sửa thông tin user
app.put('/api/users/:id', async (req, res) => {
  const { email, phone, role, password } = req.body;
  try {
    let query = 'UPDATE users SET email = ?, phone = ?, role = ? WHERE id = ?';
    let params = [email, phone, role, req.params.id];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET email = ?, phone = ?, role = ?, password = ? WHERE id = ?';
      params = [email, phone, role, hash, req.params.id];
    }

    const [result] = await pool.query(query, params);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Lấy danh sách danh mục
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    handleDbError(res, err);
  }
});

// Thêm danh mục
app.post('/api/categories', async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Sửa danh mục
app.put('/api/categories/:id', async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Xóa danh mục
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [req.params.id]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({ error: 'Không thể xóa danh mục đã có sản phẩm!' });
    }
    
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT products.*, categories.name as category_name, brands.name as brand_name
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      LEFT JOIN brands ON products.brand_id = brands.id
    `);
    res.json(rows);
  } catch (err) {
    handleDbError(res, err);
  }
});

// Thêm sản phẩm
app.post('/api/products', async (req, res) => {
  const { name, price, category_id, brand_id, image, featured, new: isNew } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, category_id, brand_id, image, featured, new_products) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, price, category_id, brand_id, image, featured || 0, isNew || 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id, image, featured, new: isNew } = req.body;
    
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    const product = products[0];
    const [result] = await pool.query(
      'UPDATE products SET name=?, price=?, category_id=?, image=?, featured=?, new_products=? WHERE id=?',
      [
        name || product.name,
        price || product.price,
        category_id || product.category_id,
        image || product.image,
        typeof featured !== 'undefined' ? featured : product.featured,
        typeof isNew !== 'undefined' ? isNew : product.new_products,
        id
      ]
    );
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Tải ảnh sản phẩm lên
app.post('/api/upload-product-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ image: 'img/products/' + req.file.filename });
});

// API cập nhật trạng thái nổi bật
app.put('/api/products/:id/featured', async (req, res) => {
  try {
    const { featured } = req.body;
    const id = req.params.id;
    
    if (featured === 1) {
      const [featuredCount] = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE featured = 1'
      );
      if (featuredCount[0].count >= 4) {
        return res.status(400).json({
          error: 'Chỉ được chọn tối đa 4 sản phẩm nổi bật!'
        });
      }
    }

    const [result] = await pool.query(
      'UPDATE products SET featured = ? WHERE id = ?',
      [featured, id]
    );
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Lấy danh sách thương hiệu
app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brands');
    res.json(rows);
  } catch (err) {
    handleDbError(res, err);
  }
});

// Thêm thương hiệu
app.post('/api/brands', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO brands (name) VALUES (?)',
      [name]
    );
    res.json({ id: result.insertId, name });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Sửa thương hiệu
app.put('/api/brands/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE brands SET name=? WHERE id=?',
      [name, req.params.id]
    );
    res.json({ id: req.params.id, name });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Xóa thương hiệu
app.delete('/api/brands/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM brands WHERE id=?',
      [req.params.id]
    );
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'src')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

// Thêm đoạn code này vào file server.js để kiểm tra
app.get('/api/check-db', async (req, res) => {
  try {
    // 1. Kiểm tra kết nối
    const [rows] = await pool.query('SELECT NOW() AS current_time');
    
    // 2. Kiểm tra dữ liệu users
    const [users] = await pool.query('SELECT * FROM users LIMIT 1');
    
    res.json({
      status: 'Database đang hoạt động',
      currentTime: rows[0].current_time,
      sampleUser: users[0] || 'Không có dữ liệu'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
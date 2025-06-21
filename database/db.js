require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Debug thông số kết nối
console.log('🔧 Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
  // ĐÃ BỎ PHẦN SSL
};

const pool = mysql.createPool(config);

const testConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1+1 AS result');
    console.log('✅ Kết nối thành công! Kết quả:', rows[0].result);
    return true;
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
    console.log('👉 Cần kiểm tra:');
    console.log('1. Password trong .env có đúng?');
    console.log('2. IP của bạn đã được whitelist?');
    console.log('3. Thông số host/port:', config.host, config.port);
    return false;
  } finally {
    if (conn) conn.release();
  }
};
// tạo bảng từ init.sql
const initializeDatabase = async () => {
  const initScript = fs.readFileSync(
    path.join(__dirname, 'init.sql'), 
    'utf-8'
  );
  
  const conn = await pool.getConnection();
  try {
    // Chạy từng câu lệnh SQL
    for (const statement of initScript.split(';')) {
      if (statement.trim()) {
        await conn.query(statement);
      }
    }
    console.log('✅ Đã tạo bảng thành công');
  } catch (err) {
    console.error('❌ Lỗi khi tạo bảng:', err.message);
    throw err;
  } finally {
    conn.release();
  }
};


module.exports = { pool, testConnection, initializeDatabase };
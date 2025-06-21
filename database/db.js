const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'banhang.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Kết nối SQLite thất bại:', err.message);
    } else {
        console.log('Kết nối SQLite thành công!');
        // Tự động chạy file init.sql khi khởi động
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        db.exec(initSql, (err) => {
            if (err) console.error('Lỗi khi tạo bảng:', err.message);
            else console.log('Đã kiểm tra/tạo các bảng thành công!');
        });
    }
});

module.exports = db;
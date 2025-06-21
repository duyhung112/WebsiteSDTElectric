const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

// Thông tin kết nối, bạn có thể chỉnh sửa cho phù hợp
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123123123', // Thay bằng mật khẩu MySQL của bạn nếu có
    database: 'banhang',
    multipleStatements: true // Cho phép chạy nhiều câu lệnh SQL cùng lúc
});

connection.connect((err) => {
    if (err) {
        console.error('Kết nối MySQL thất bại:', err.message);
    } else {
        console.log('Kết nối MySQL thành công!');
        // Nếu muốn tự động chạy file init.sql để tạo bảng, bạn có thể dùng đoạn sau:
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        connection.query(initSql, (err) => {
            if (err) console.error('Lỗi khi tạo bảng:', err.message);
            else console.log('Đã kiểm tra/tạo các bảng thành công!');
        });
    }
});

module.exports = connection;
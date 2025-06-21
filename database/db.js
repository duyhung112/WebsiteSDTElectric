const path = require('path');
const fs = require('fs');
// Thay đổi từ sqlite3 sang mysql2/promise để sử dụng async/await
const mysql = require('mysql2/promise');

// Cấu hình kết nối MySQL.
// Sử dụng biến môi trường do Railway cung cấp.
// Cung cấp giá trị mặc định cho môi trường local để dễ phát triển.
const connectionConfig = {
  host: process.env.MYSQLHOST || 'mysql.railway.internal',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'DHVTGEXHOfqDWVYhqSzMVqJQaPkVAJqT', // Thay đổi mật khẩu local của bạn nếu có
  database: process.env.MYSQLDATABASE || 'railway', // Thay đổi tên DB local của bạn
  port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 3306,
  multipleStatements: true // Cho phép chạy nhiều câu lệnh SQL từ file
};

async function initializeDbConnection() {
    try {
        // Bước 1: Kết nối tạm thời để đảm bảo database tồn tại (hữu ích cho local dev)
        const tempConnection = await mysql.createConnection({
            host: connectionConfig.host,
            user: connectionConfig.user,
            password: connectionConfig.password,
            port: connectionConfig.port
        });
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${connectionConfig.database}\`;`);
        await tempConnection.end();

        // Bước 2: Tạo một connection pool để quản lý kết nối hiệu quả
        const pool = mysql.createPool(connectionConfig);
        const promisePool = pool.promise(); // Lấy phiên bản hỗ trợ promise/await
        console.log('Connection pool tới MySQL đã được tạo thành công!');

        // Bước 3: Đọc và thực thi file init.sql để tạo bảng
        console.log('Đang kiểm tra và tạo bảng từ init.sql...');
        const initSqlPath = path.join(__dirname, '..', 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await promisePool.query(initSql); // Dùng pool để chạy script khởi tạo
        console.log('Đã kiểm tra/tạo các bảng thành công!');

        return promisePool;
    } catch (err) {
        console.error('Khởi tạo database thất bại:', err.message);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
    }
}
module.exports = initializeDbConnection(); // Export một Promise sẽ resolve ra đối tượng pool
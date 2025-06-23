import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',       // host, '127.0.0.1'
    user: 'root',            // name of MySQL user
    password: '', // password - default no password
    database: 'testdb', // DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function getConnection() {
    return pool.getConnection();
}

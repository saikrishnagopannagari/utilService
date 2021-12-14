require('dotenv').config();
const mysql = require('mysql');

// utils

module.exports = (Mobile) => new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        socketPath: '/cloudsql/charming-shield-300804:us-central1:indus',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect((error) => {
        if (error) reject({ 'statusMsg': error.message });
    });

    connection.query(`SELECT * FROM vendorStg WHERE Id=${Mobile}`, (error, results) => {
        if (error) {
            reject({ 'statusMsg': error.message });
        }
        else {
            resolve({ 'statusMsg': "Pulled successfully", results });
        }
    });

    connection.end();
})
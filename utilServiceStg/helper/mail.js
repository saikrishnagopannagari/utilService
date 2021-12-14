require('dotenv').config();
const mysql = require('mysql');


module.exports = (otp) => new Promise((resolve, reject) => {
    const Id = new Date().getTime();
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

    connection.query(`INSERT INTO otpStg(Id,otp) VALUES ('${Id}','${otp}')`, (error, results) => {
        if (error) {
            reject({ 'statusMsg': error.message });
        }
        resolve({ 'statusMsg': "Otp sent successfully", 'SessionId': Id });
    });

    connection.end();
})
require('dotenv').config();
const mysql = require('mysql');


module.exports = (body) => new Promise((resolve, reject) => {
    const {Id,otp} =body;
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

    connection.query(`SELECT * FROM otpStg WHERE Id='${Id}' AND otp='${otp}'`, (error, results) => {
        console.log(results)
        if (error) {
            reject({ 'statusMsg': error.message });
        }
        if (results.length > 0) {
            if((new Date().getTime() - Id)/1000 > 60){
                reject({'statusMsg':"OTP EXPIRED"})
            }
            resolve({ 'statusMsg': "OTP VERIFIED SUCCESFULLY" });
        }else {
            reject({'statusMsg': "OTP MISS MATCH" });
        }
        
    });

    connection.end();
})
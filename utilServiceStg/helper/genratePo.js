require('dotenv').config();
const mysql = require('mysql');
var pdf = require("pdf-creator-node");
const path = require('path');
var fs = require("fs");
// validations
const { idValidation } = require('../utils/validation');

module.exports = (OrderId) => new Promise((resolve, reject) => {
    console.log("OrderId", 1627451212732)
    if (idValidation(OrderId)) reject({ 'statusMsg': "OrderId is invalid" });
    else {
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            socketPath: '/cloudsql/charming-shield-300804:us-central1:indus',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        connection.connect((error) => {
            if (error) {
                reject({ 'statusMsg': error.message });
            }
        });
        console.log("database connection established")
        connection.query(`SELECT * FROM ServiceOrdersStg WHERE Id=${OrderId}`, (error, results) => {
            if (error) {
                reject({ 'statusMsg': error.message });
                console.log("ServiceOrderStg SELECT query Error: ", error)
            }
            else {
                if (results.length > 0) {
                    const order = results[0]
                    const orderId = order.Id
                    const orderData = JSON.parse(order.Data).data
                    const shippingAddress = order.Address
                    const acceptedDate = JSON.parse(order.Dates).AcceptedDate
                    console.log("Ready to read html template")
                    var html = fs.readFileSync(path.resolve("./helper/po.html"), "utf8");

                    var options = {
                        format: "A0",
                        orientation: "portrait",
                        border: "0mm",
                        header: {
                            height: "45mm",
                            contents: '<div style=></div>'
                        },
                        // footer: {
                        //     height: "28mm",
                        //     contents: {
                        //         first: '',
                        // 2: 'Second page', // Any page number is working. 1-based index
                        // default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                        // last: 'Last Page'
                        // }
                        // }
                    };


                    var document = {
                        html: html,
                        data: {
                            orderId: orderId,
                            shippingAddress: shippingAddress,
                            acceptedDate: acceptedDate,
                            orderData: orderData
                        },
                        // path: "./output.pdf",
                        type: "stream",
                    };
                    
                    // By default a file is created but you could switch between Buffer and Streams by using "buffer" or "stream" respectively.
                    console.log("Document is ready to use")

                    pdf.create(document, options).then((res) => {
                        console.log("PDF created and ready to send")
                        resolve({ 'statusMsg': "Order Details", res: res });
                    }).catch((error) => {
                        reject({ 'statusMsg': error });
                    });

                } else {
                    reject({ 'statusMsg': "Incorrect" });
                }
            }
        });
    }
})
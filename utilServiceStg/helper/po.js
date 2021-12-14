const app = require("express")();
var pdf = require("pdf-creator-node");
var fs = require("fs");

app.get("/", (req, response) => {

    var html = fs.readFileSync("index.html", "utf8");

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

    var users = [
        {
            Sno: "1",
            Descriptionofmaterial: "FAN",
            Unit: "0",
            Quantity: "2",
            Rate: "20",
            Amount: "40"
        },
        {
            Sno: "2",
            Descriptionofmaterial: "FAN",
            Unit: "0",
            Quantity: "2",
            Rate: "20",
            Amount: "40"
        },
        {
            Sno: "2",
            Descriptionofmaterial: "FAN",
            Unit: "0",
            Quantity: "2",
            Rate: "20",
            Amount: "40"
        }
    ];

    var document = {
        html: html,
        data: {
            users: users,
        },
        // path: "./output.pdf",
        type: "stream",
    };
    // By default a file is created but you could switch between Buffer and Streams by using "buffer" or "stream" respectively.


    pdf.create(document, options).then((res) => {
        response.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-disposition': 'attachment; filename=file.pdf'
        });
        res.pipe(response)
    }).catch((error) => { console.error(error); });

})

app.listen("3000", () => console.log("Server running at 3000"))

const express = require('express');
const nodemailer = require("nodemailer");
const cors = require('cors');

const app = express();
const sendsmstoclient = require('./helper/sendsmstoclient');
const sendsmstovendor = require('./helper/sendsmstovendor');
// const po = require('.helper/po');
const genratePo = require('./helper/genratePo');
const mail = require('./helper/mail');
const verify = require('./helper/verify');


app.use(express.json());
app.use(cors())


// app.post('/po', (req, res) => {

// });
app.get('/genratePo/:OrderId', async (req, res) => {
    let response = {};
    try {
        response = { status: 200, ...await genratePo(req.params.OrderId) };
        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-disposition': 'attachment; filename=file.pdf'
        });
        response.res.pipe(res)
    }
    catch (e) {
        response = { status: 400, ...e };
        res.json(response)
    };
});

app.post('/falseceiling', (req, res) => {
    const channels = {
        "Gyproc Ultra": {
            "Perimeter": "185",
            "CeilingSection": "288",
            "Intermediate": "288",
            "LAngle": "96",
        },

        "Gypsera": {
            "Perimeter": "185",
            "CeilingSection": "288",
            "Intermediate": "288",
            "LAngle": "96",
        },

        "Gypframe Expert": {
            "Perimeter": "95",
            "CeilingSection": "137",
            "Intermediate": "137",
            "LAngle": "65",
        }
    }

    const SaintGobainGyprocUnitPrice = 350;

    let fcvalues = req.body;
    let data = [];
    let total = 0;

    fcvalues.forEach(element => {
        let Perimeter = 2 * (element.l + element.b)
        Perimeter = (Perimeter * 1.05) / 12;
        const permeterUnitPrice = channels[element.channel]["Perimeter"];
        let PerimeterPrice = Perimeter * permeterUnitPrice;

        let CeilingSection = (element.l * element.b) / 2
        CeilingSection = (CeilingSection * 1.05) / 12;
        const CeilingSectionUnitPrice = channels[element.channel]["CeilingSection"];
        let CeilingSectionPrice = CeilingSection * CeilingSectionUnitPrice;

        let Intermediate = (element.l * element.b) / 3
        Intermediate = (Intermediate * 1.05) / 12;
        const IntermediateUnitPrice = channels[element.channel]["Intermediate"];
        let IntermediatePrice = Intermediate * IntermediateUnitPrice;

        let LAngle = (element.l * element.b) / 6
        LAngle = (LAngle * 1.05) / 12;
        const LAngleUnitPrice = channels[element.channel]["LAngle"];
        let LAnglePrice = LAngle * LAngleUnitPrice;

        let SaintGobainGyproc = (element.l * element.b) / 24
        SaintGobainGyproc = (SaintGobainGyproc * 1.05);
        let SaintGobainGyprocPrice = SaintGobainGyproc * SaintGobainGyprocUnitPrice;

        const FalseCeilingMaterialPrice = PerimeterPrice + CeilingSectionPrice + IntermediatePrice + LAnglePrice + SaintGobainGyprocPrice;

        const SFTs = element.l * element.b;

        const FalseCeilingLabourPrice = element.FCsftPrice * SFTs;

        let NoOfLights = element["No.OfLights"]
        let LightsPrice = element.LightPrice * NoOfLights
        let wireLength = 1.1 * 1.05 * ((2 * (Math.sqrt((0.6 ^ 2) + ((element.b / 3.2808) / 2 - 0.6) ^ 2) + ((element.l / 3.2808) - 1.2)) + ((element.l / 3.2808) - 1.2) + 0.6) + element["No.OfLoops"] * (2.8 - 1))
        let ElecticalMaterialPrice = wireLength * element['WirePricePerMeter']
        let ElectricalLabourPrice = NoOfLights * element['ElectricalPointPrice']
        let PaintPrice = SFTs * element['PaintSftPrice']
        total = total + FalseCeilingMaterialPrice + FalseCeilingLabourPrice + ElecticalMaterialPrice + ElectricalLabourPrice + PaintPrice + LightsPrice;

        data.push({
            ...element,
            "PerimeterPrice": PerimeterPrice,
            "CeilingSectionPrice": CeilingSectionPrice,
            "IntermediatePrice": IntermediatePrice,
            "LAnglePrice": LAnglePrice,
            "SaintGobainGyprocPrice": SaintGobainGyprocPrice,
            FalseCeilingMaterialPrice,
            FalseCeilingLabourPrice,
            ElecticalMaterialPrice,
            ElectricalLabourPrice,
            PaintPrice,
            LightsPrice,
            LightBrand: element.LightBrand
        })
    });

    res.json({ data, total: Math.round(total) })
});

app.post('/mail', async (req, res) => {

    const data = req.body;
    const to = data.to;
    // const subject = data.subject;
    // const text = data.text;

    var otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "accounts@uniworksdesigns.com",
            pass: "Uni@1234",
        },
    });

    try {
        let info = await transporter.sendMail({
            from: 'accounts@uniworksdesigns.com', // sender address
            to, // list of receivers
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"  // plain text body

        });
        const response = { status: 200, ...await mail(otp) };
        res.send(response);
    } catch (e) {
        const response = { status: 400, 'statusMsg': e.message };
        res.send(response)
    }
});

app.post('/verify', async (req, res) => {
    let response = {};
    try {
        response = { status: 200, ...await verify(req.body) };
    }
    catch (e) {
        response = { status: 400, ...e };
    };
    res.json(response)
});


app.get('/categories', async (req, res) => {

    const materialCategories = ['Fan', 'Paint', 'Light', 'Plywood', 'Laminate', 'Wood', 'Hardware', 'Misc', 'Seating', 'Bed', 'Polish', 'Wall/ Ceilling', 'Wire', 'Conduit', 'Light fixture', 'Switches', 'WC', 'WB', 'CP fitting', 'Sink', 'Spout', 'Plaster', 'Stucture', 'Screeding', 'Shuttering', 'Excavation', 'RCC', 'Concrete', 'MS', 'Tiles', 'Terracotta', 'Granite', 'Marble', 'Limestone', 'Slate', 'Quartz', 'Iron', 'SS', 'Alumunium', 'Enamel', 'Emultion', 'Glass shutter', 'Mirror', 'Kitchen', 'Wardrobe', 'Crockery', 'Panneling', 'Kitchen Appliances', 'Door lock', 'Door bell', 'Camera', 'Data', 'Tv', 'Floor protection', 'Office chair','sanitary fittings','Cement', 'Steel', 'Aggregate' ,'Redbrick' ,'CementBlock', 'Flyashblock', 'Electrical', 'Plumbing' , 'WPC' ,'uPVC', 'Scaffolding', 'Doors' ,'Windows' ,'Waterproofing','Sand','FloorProtection','Grouting','Primer','Putty','BrickWall','Plastering',]
    const vendorCategories = ['Carpenter', 'Painter', 'Marble Laying', 'Granite Laying', 'Tile Laying', 'Wood Laying', 'Electrical', 'False Ceiling', 'Glass', 'Stone', 'Loose furniture', 'Plumber', 'Civil', 'Demolition', 'Fabricator', 'Paint and polish', 'Furniture', 'Furnishing', 'Glass Vendor', 'Modular', 'AC-Low side', 'Deep cleaning', 'Equipments', 'Office furniture', 'Lacquered glass', 'Carpet', 'Blinds', 'Misc','CNC','BarBending', 'RMC' ,'Upvc' , 'Lift', 'generator' ,'Waterproofing' ,'Plants','Branding','Landscape','GlassSystem','frostedFilm','Mural','civil']
    res.send({ status: 200, materialCategories: materialCategories.map((item, index) => ({ id: index + 1, name: item })), vendorCategories })
});
app.post('/sendsms', async (req, res) => {

    const AccountType = req.body.AccountType
    const Mobile = req.body.Mobile
    const Message = req.body.Message

    let response = {};

    if (AccountType == "vendor") {
        try {
            response = { status: 200, ...await sendsmstovendor(Mobile) };
        } catch (e) {
            response = { status: 400, ...e };
        }
    } else (AccountType == "client"); {
        try {
            response = { status: 200, ...await sendsmstoclient(Mobile) };
        } catch (e) {
            response = { status: 400, ...e };
        }
    }
    console.log(response)
    const TwoFactor = new (require('2factor'))("0d8d4014-8b52-11e9-ade6-0200cd936042")
    TwoFactor.sendTemplate(["AccountType", "Mobile", "Message"], "Vendor", "8106811527","Thank You for signing up on Staart, an invite-only platform, taking factories online. Click https://play.google.com/store/apps/details?id=com.indusvendorapp&hl=en_IN&gl=US to download the StaartVendor App and go Digital! - Team Staart").then((response) => {
        console.log(response)
    }, (error) => {
        console.log(error)
    });

    res.send("working")
});







exports.utilServiceStg = app;

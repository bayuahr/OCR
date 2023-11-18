const express = require('express');
const fileUpload = require('express-fileupload');
const Tesseract = require('tesseract.js');
const app = express();
const port = 3000;

function jsonToCsv(jsonData) {
    let csv = '';
    // Get the headers
    let headers = Object.keys(jsonData[0]);
    csv += headers.join(',') + '\n';
    // Add the data
    jsonData.forEach(function (row) {
        let data = headers.map(header => JSON.stringify(row[header])).join(','); // Add JSON.stringify statement
        csv += data + '\n';
    });
    return csv;
}

app.use(
    fileUpload({
        limits: {
            fileSize: 10000000,
        },
        abortOnLimit: true,
    })
);

// Add this line to serve our index.html page
// app.use(express.static('public'));

app.use(express.static('upload'));
app.use(express.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render("pages/index")
});
app.get("/file1", (req, res) => {
    res.render("pages/file1", {
        data: null,
        filename: null
    })
})
app.post('/file1', (req, res) => {

    const hasil = [];
    var count = 0
    var obj = {}
    // Get the file that was set to our field named "image"
    const {
        image
    } = req.files;
    const filename = image.name.split(".")[0]
    // If no image submitted, exit
    if (!image) return res.sendStatus(400);;

    var namedir=__dirname + '/upload/' + image.name
    image.mv(__dirname + '/upload/' + image.name);
    // All good
    Tesseract.recognize(
        // this first argument is for the location of an image it can be a //url like below or you can set a local path in your computer
        namedir,
        // this second argument is for the laguage 
        'eng', {
            logger: m => console.log(m)
        }
    ).then(({
        data: {
            text
        }
    }) => {
        text.split("\n").forEach(element => {
            if (element !== "") {
                var data1 = element.replace(/[^:.,\w\s]/g, '').trimStart()
                var splittingData = (data1.split(" : "))
                if (splittingData[0] == "ffanggal") {
                    splittingData[0] = "Tanggal"
                }
                obj[splittingData[0]] = splittingData[1]
                var count = Object.keys(obj).length
                if (count == 5) {
                    hasil.push(obj)
                    obj = {}
                }
            }

        });
        console.log(hasil)
        res.render("pages/file1", {
            data: hasil,
            filename: filename
        });
    })


});
app.get("/file2", (req, res) => {
    res.render("pages/file2", {
        data: null,
        filename: null
    })
})
app.post('/file2', (req, res) => {

    const hasil = [];
    var count = 0
    var obj = {}
    // Get the file that was set to our field named "image"
    const {
        image
    } = req.files;
    const filename = image.name.split(".")[0]
    // If no image submitted, exit
    if (!image) return res.sendStatus(400);;

    var namedir=__dirname + '/upload/' + image.name
    image.mv(__dirname + '/upload/' + image.name);
    // All good
    Tesseract.recognize(
        // this first argument is for the location of an image it can be a //url like below or you can set a local path in your computer
        namedir,
        // this second argument is for the laguage 
        'eng', {
            logger: m => console.log(m)
        }
    ).then(({
        data: {
            text
        }
    }) => {
        text.split("\n").forEach(element => {
            if (element !== "") {
                var data1 = element.replace(/[^:.,\w\s]/g, '').trimStart()
                console.log(data1)
                const regex = /^(\d{1,2})\s+(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)$/i;
                const match = data1.match(regex);
                if (match) {
                    obj["Tanggal"] = data1
                } else {
                    if (data1.includes("PEMBELIAN")) {
                        obj["Transaksi"] = "PEMBELIAN"
                        obj["Keterangan1"] = data1
                    } else if (data1.includes("PENJUALAN")) {
                        obj["Transaksi"] = "PENJUALAN"
                        obj["Keterangan1"] = data1
                    } else {
                        obj["Keterangan2"] = data1
                    }
                }
                console.log(obj)
                var count = Object.keys(obj).length
                if (count == 4) {
                    obj["Keterangan"] = obj["Keterangan1"] + obj["Keterangan2"]
                    delete obj["Keterangan1"]
                    delete obj["Keterangan2"]
                    hasil.push(obj)
                    obj = {}
                }
            }

        });
        console.log(hasil)
        res.render("pages/file2", {
            data: hasil,
            filename: filename
        });
    })


});
app.get("/file3", (req, res) => {
    res.render("pages/file3", {
        data: null,
        filename: null
    })
})
app.post('/file3', (req, res) => {

    const hasil = [];
    var count = 0
    var obj = {}
    // Get the file that was set to our field named "image"
    const {
        image
    } = req.files;
    const filename = image.name.split(".")[0]
    // If no image submitted, exit
    if (!image) return res.sendStatus(400);;

    // Move the uploaded image to our upload folder
    var namedir=__dirname + '/upload/' + image.name
    image.mv(__dirname + '/upload/' + image.name);
    // All good
    Tesseract.recognize(
        // this first argument is for the location of an image it can be a //url like below or you can set a local path in your computer
        namedir,
        // this second argument is for the laguage 
        'eng', {
            logger: m => console.log(m)
        }
    ).then(({
        data: {
            text
        }
    }) => {
        text.split("\n").forEach(element => {
            if (element !== "") {
                var data1 = element.replace(/[^:.,\w\s]/g, '').trimStart()
                console.log(data1)
                const regex = /^RP\.\s?/i;
                if (data1.match(regex)) {
                    obj["Harga"] = data1
                } else {
                    if (data1.includes("MASUK")) {
                        const regex = /BARANG (.+)\DITERIMA/i;
                        const match = data1.match(regex);
                        obj["Barang"] = "MASUK"
                        if (match) {
                            const namaBarang = match[1];
                            obj["NamaBarang"] = namaBarang
                        } else {
                            obj["NamaBarang"] = ""
                        }
                        const regex2 = /DITERIMA(.+)/i
                        const match2 = data1.match(regex2);
                        obj["Keterangan"] = match2[0]
                    } else {
                        const regex = /BARANG (.+)\DIBERIKAN/i;
                        const match = data1.match(regex);
                        obj["Barang"] = "KELUAR"
                        if (match) {
                            const namaBarang = match[1];
                            obj["NamaBarang"] = namaBarang
                        } else {
                            obj["NamaBarang"] = ""
                        }
                        const regex2 = /DIBERIKAN(.+)/i
                        const match2 = data1.match(regex2);
                        obj["Keterangan"] = match2[0]

                    }

                }

                var count = Object.keys(obj).length
                if (count == 4) {
                    hasil.push(obj)
                    obj = {}
                }
            }

        });
        console.log(hasil)
        res.render("pages/file3", {
            data: hasil,
            filename: filename
        });
    })


});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
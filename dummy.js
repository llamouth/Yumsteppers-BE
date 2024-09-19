const QRCode = require('qrcode')
const newUrl = JSON.stringify("http://www.google.com")
const reward = {
    id: 1,
    test: "test"
}
        
const qr = QRCode.toString(JSON.stringify(reward), (err, url) => {
    if(err) throw err
    return url
})

console.log(qr)
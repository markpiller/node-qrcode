var QRCode = require('../lib')

QRCode.toFile('circle.png', 'example text', { shape: 'circle' }, function (err) {
  if (err) throw err
  console.log('saved circle.png')
})

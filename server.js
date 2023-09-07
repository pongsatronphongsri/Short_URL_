const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const qrcode = require('qrcode');
const app = express()

mongoose.connect('mongodb+srv://tawansapanyu54:Tar36301@cluster0.osj7r17.mongodb.net/?retryWrites=true&w=majority')
    .then(()=> console.log('connection successfullly'))
    .catch((err)=>console.error(err))
    
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/',async (req,res) => {
    const shortUrls = await ShortUrl.find()

    
      
    res.render('index',{shortUrls:shortUrls})
})
app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl })
    
    res.redirect('/')
})

app.get('/createqr/:id', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.id })

    if (shortUrl == null) return res.sendStatus(404)

    // สร้าง QR code จาก shortUrl.full
    qrcode.toDataURL(shortUrl.full, (err, qrCodeData) => {
        if (err) {
            console.error(err)
            return res.sendStatus(500)
        }

        // ให้ shortUrl เก็บข้อมูล QR code
        shortUrl.qrCode = qrCodeData
        shortUrl.save()

        // แสดงหน้า generate.ejs พร้อม QR code
        res.render('createqr', { shortUrl: shortUrl })
    })
})

//delete
app.get('/delete/:id', async (req, res) => {
    try {
      // Find the short URL by ID
      const shortUrlId = req.params.id;
      await ShortUrl.deleteOne({ _id: shortUrlId });
  
      // Redirect back to the homepage or any other desired page
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)
  
    shortUrl.clicks++
    shortUrl.save()
  
    res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory store for URLs
let urlDatabase = {};
let urlCounter = 1;

app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;
  console.log('req.body is: ', req.body);
  console.log(`url is: ${url}`);

  const urlPattern = /^(http|https):\/\/([^\/]+)/;
  const match = url.match(urlPattern);

  if (!match) {
    return res.json({ error: 'invalid url' });
  }

   // Check if the URL already exists in the database
   for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl] === url) {
      return res.json({ original_url: url, short_url: shortUrl });
    }
  }

  const hostname = match[2];


  dns.lookup(hostname, (err,address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    // Store URL and generate short URL
    const shortUrl = urlCounter++;
    urlDatabase[shortUrl] = url;
    console.log(`Address: ${address}`);
    res.json({ original_url: url, short_url: Number(shortUrl)});
  });
 
  console.log('urlDatabase:', urlDatabase);
})

// Endpoint to redirect to original URL
app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`); 
  
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');
const { url } = require('inspector');




const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("urlshortner");
const urls = db.collection("urls")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/public', express.static(`${process.cwd()}/public`));



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl',(req,res)=>{
  //console.log(req.body)
  const url=req.body.url

  const dnslookup = dns.lookup(urlparser.parse(url).hostname, 
async (err,address)=>{
    if(!address){
      res.json({
        error:"invalid url"
      })
    }
    else{
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        shorturl: urlCount
      }
      const result = await urls.insertOne(urlDoc)
    console.log(result)
    res.json({ original_url:url, shorturl:urlCount})
    }

    
})

})

app.get('/api/shorturl/:short_url',async (req,res)=>{
      const short_url=req.params.short_url
      const urlDoc=await urls.findOne({shorturl:+short_url})
      res.redirect(urlDoc.url)  
})

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello hacker' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

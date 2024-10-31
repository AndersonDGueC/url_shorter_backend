require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//const { MongoClient } = require('mongodb');
let mongoose = require('mongoose');
const {Schema} = mongoose;
let bodyParser = require('body-parser');
const dns = require('dns');
//const urlparser = require('url');
//const { url } = require('inspector');

console.log(process.env.MONGO_URI)

//avoid mongooose.connect(process.env.MONGO_URI,{{ useNewUrlParser: true, useUnifiedTopology: true }})
//this detail { useNewUrlParser: true, useUnifiedTopology: true } in post verions node 4.00 deprectated
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log('Conect to Mongo');
})
.catch((err)=>{
  console.error('Error connecting to Mongo', err);
});

const URLSchema = new Schema({
  original_url:{type:String, required:true, unique:true},
  short_url:{type:String, required:true, unique:true}
});

let URLModel = mongoose.model('url', URLSchema);




/*
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("urlshortner");
const urls = db.collection("urls")
*/
// Basic Configuration
const port = process.env.PORT || 3000;

app.use("/", bodyParser.urlencoded({extended:false}));

app.use(cors());
//app.use(express.json());
//app.use(express.urlencoded({extended:true}));


app.use('/public', express.static(`${process.cwd()}/public`));



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint

app.post("/api/shorturl", (req, res)=>{
  let url=req.body.url;
  //valid the URL
  try{
    urlObj=new URL(url);
    console.log(urlObj)
    dns.lookup(urlObj.hostname,(err,address)=>{
      console.log(address);
      //If the DNS domain does not exist no address returned
      if(!address){
        res.json({
          error:'invalid url'
        })
      }
      //We have a valid URL
      else{
        let original_url=urlObj.href;
        let short_url=1;
        //Get the latest short_url
        URLModel.find({}).sort(
          {short_url:"desc"}).limit(1).then(
            (latestURL)=>{
              if(latestURL.length>0){
              //increment the latest short url by adding 1
              short_url=parseInt(latestURL[0].short_url)+1
              }
              //let short_url = 1
          resObj={
          original_url:original_url,
          short_url:short_url
        }
        //Create an entry in the database
        let newURL = new URLModel(resObj);
        newURL.save()
        res.json(resObj)  
            }
          )
      }
    })
  }
  //if the URL has an invalid format
  catch{
    res.json({
      error:'invalid url'
    })
  }
}
)

app.get("/api/shorturl/:short_url",(req,res)=>{
  let short_url=req.params.url;
  //Find the original url from database
  URLModel.findOne({short_url:short_url}).then((foundURL)=>{
    console.log(foundURL);
    if(foundURL){
      let original_url=foundURL.original_url;
      res.direct(original_url);
    }
    else{
      res.json({message:"The short url does not exist!"})
    }
  })
})


/*
app.post('/api/shorturl',(req,res)=>{
  console.log(req.body)
  const url=req.body.url
  let hostname=urlparser.parse(url).hostname
  console.log(hostname)
  if(hostname===null){
   console.log("let's go hacker0")
    res.json({
      error:'invalid url'
    })
  }
  else{
  const dnslookup = dns.lookup(hostname, 
async (err,address)=>{
    //console.log(urlparser.parse(url).hostname)
    console.log(address)
    if(!address){
      console.log('invalid url1')
      res.json({
        error:'invalid url'
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
  }
})

app.get('/api/shorturl/:short_url',async (req,res)=>{
      console.log("how are you, hacker")
      const short_url=req.params.short_url
      console.log(short_url)
      const urlDoc=await urls.findOne({shorturl:+short_url})
      if(urlDoc!==null){
      res.redirect(urlDoc.url)
      }
      else{
        console.log('invalid url2')
        res.json({error:'invalid url'})
      }  
})

*/
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello hacker' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

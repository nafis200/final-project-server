const express = require('express')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5009
const cors = require('cors')
app.use(cors({
   origin: [
     'http://localhost:5173',
   ],
   credentials: true
}))
app.use(express.json())
app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f8w8siu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  const verifyToken = async(req,res,next)=>{
       const token = req.cookies?.token 
      //  console.log('value of verify token',token);
       if(!token){
         return res.status(401).send({message: 'not autorized'})
       }
       jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          console.log(err);
          return res.status(401).send({message: 'unauthorized'})
        }
        req.user = decoded
        next()
       })
       
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  async function run() {
    try { 
    
    const menuCollection =client.db("BistroDB").collection("menu")
    const reviewCollection = client.db("BistroDB").collection("reviews")
    const cartCollection = client.db("BistroDB").collection("carts")
    const userCollection = client.db("BistroDB").collection("users")

    // app.post('/jwt',async(req,res)=>{
    //    const user = req.body 
    //    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET ,{expiresIn: '1000h'})
    //    res
    //    .cookie('token',token,cookieOptions)
    //    .send({success: true}) 
    // })

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    app.post('/logout',async(req,res)=>{
        const user = req.body;
        res.clearCookie('token',{...cookieOptions, maxAge:0}).send({success:true})

    })

    app.get('/users',async(req,res)=>{
        const result = await userCollection.find().toArray()
        res.send(result)
    })

    app.post('/users',async(req,res)=>{
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({message:'user already exists'})
      }
      const cartItem = req.body; 
      const result = await userCollection.insertOne(cartItem)
      res.send(result)
 })

 app.delete('/users/:id',async(req,res)=>{
      const id = req.params.id; 
      const query = {
        _id: new ObjectId(id) 
      }
      const result = await userCollection.deleteOne(query)
      res.send(result)
 })

 app.patch('/users/admin/:id',async(req,res)=>{
  
     const id = req.params.id; 
     const filter = {_id : new ObjectId(id)}
     const updateDoc = {
        $set:{
           role: 'admin'
        }
     }
     const result = await userCollection.updateOne(filter,updateDoc)

 })
  
    app.get('/menu',async(req,res)=>{
      const cursor = menuCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/reviews',async(req,res)=>{
      const cursor = reviewCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/carts',async(req,res)=>{
       const email = req.query.email
       const query = {email: email}
       const result = await cartCollection.find(query).toArray()
       res.send(result)
    })

    app.post('/carts',async(req,res)=>{
         const cartItem = req.body; 
         const result = await cartCollection.insertOne(cartItem)
         res.send(result)
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    
  
      
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
    }
  }
  run().catch(console.dir);
  
  
  
  
  
  
  app.get('/', (req, res) => {
      res.send('Hello World! it s me how are you i am localhost bitro-boss')
    })
  
  
  
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  
    
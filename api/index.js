const express=require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const admin = require("firebase-admin");
let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("✅ Firebase initialized successfully");
} catch (err) {
  console.error("❌ Firebase initialization failed:", err.message);
}




require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app=express()
const port=process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

//coonnection of uri
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.stkfkwf.mongodb.net/?appName=Cluster1`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
app.post('/jwt', (req, res) => {
  const user = req.body;
  if (!user || !user.email) return res.status(400).send({ message: 'Email required' });
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.send({ token });
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ message: 'Unauthorized access' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Forbidden access' });
    req.decoded = decoded;
    next();
  });
}

app.get('/',(req,res)=>{
        res.send('Book Haven API is running')})


async function run() {
  try {
    await client.connect();
    const db = client.db('bookHavenDB');
    const booksCollection = db.collection('books');
    const usersCollection = db.collection('users');

    // Send a ping to confirm a successful connection
    
    
      
    //add new book
   app.post('/add-book',async(req,res)=>{
    const newbook = { ...req.body, createdAt: new Date() };
    const result = await booksCollection.insertOne(newbook);
    res.send(result);

   })

 
app.get('/latest-books', async (req,res) => {
  const books = await booksCollection
    .find()
    .sort({ _id:1}).limit(6).toArray();
    res.send(books);
});


   app.get('/all-books', async (req,res)=>{
  const books = await booksCollection.find().toArray();
  res.send(books);
});
app.get('/book-details/:id', async (req,res)=>{
  const id = req.params.id;
  const book = await booksCollection.findOne({ _id: new ObjectId(id) });
  res.send(book);
});

app.get('/book/:id', async (req, res) => {

  const id = req.params.id;

  try {
    const book = await booksCollection.findOne({ _id: new ObjectId(id) });
    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }
    res.send(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});



app.put('/update-book/:id', async (req, res) => {
  const id = req.params.id.trim();
  const updateData = req.body;

  try {
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ID received:", id);
      return res.status(400).json({ message: "Invalid book ID" });
    }

    delete updateData._id; // prevent overwriting _id

    const result = await booksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      console.log("Book not found with ID:", id);
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



app.delete('/delete-book/:id', async (req,res)=>{
  const id = req.params.id;
  const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.get("/my-books", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userBooks = await booksCollection.find({ userEmail: email }).toArray();
    res.send(userBooks);
  } catch (error) {
    console.error("Error fetching user books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  }
  finally{
   

  }
}
run().catch(console.dir);

module.exports = app;


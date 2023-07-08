const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.7em2cfy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("jerinsParlour").collection("users");
    //create user in database 
    app.post("/user", async (req, res) => {
      const body = req.body;
      const query = { email: body?.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        if (existingUser?.email === body?.email) {
          return res.status(401).send({ message: "email exist" });
        }
      }
      const result = await userCollection.insertOne(body);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("jerins parlour server running on local");
});

app.listen(port, () => {
  console.log(`server are running port : ${port}`);
});

// UserCollection.findOne({ email: body.email }, (err, user) => {
//   if (err) {
//     console.log(err);
//     return res.status(401).send("internal server error");
//   }
//   if (user) {
//     console.log(user);
//     return res.status(200).send("user info stored succesfully");
//   }
// });

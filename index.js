const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const serviceCollection = client.db("jerinsParlour").collection("services");
    const reviewsCollection = client.db("jerinsParlour").collection("reviews");
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

    //get user role from database
    app.get("/users", async (req, res) => {
      const query = { email: req.query.email };
      const user = await userCollection.findOne(query);
      if (user) {
        const { role } = user;
        res.send({ role });
      } else {
        res.send({ role: null });
      }
    });

    //google login user stored
    app.post("/user", async (req, res) => {
      const body = req.body;
      const query = { email: body.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist" });
      }
      const result = await userCollection.insertOne(body);
      res.send(result);
    });

    //makeAdmin route for admin role
    app.patch("/makeAdmin/:email", async (req, res) => {
      const email = { email: req.params.email };
      const updateUser = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(email, updateUser);
      if (result.modifiedCount === 1) {
        return res.status(200).send({ message: "user role updated" });
      } else {
        return res.status(404).send({ message: "user not found" });
      }
    });

    //added service stored on database
    app.post("/addedService", async (req, res) => {
      const body = req.body;
      const result = await serviceCollection.insertOne(body);
      res.send(result);
    });
    //get all services for manage a service in admin panel
    app.get("/allServices", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });
    //delete a service by admin
    app.delete("/serviceDelete/:id", async (req, res) => {
      const result = await serviceCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });
    //review stored on database
    app.post("/reviews", async (req, res) => {
      const body = req.body;
      const result = await reviewsCollection.insertOne(body);
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

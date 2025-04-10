const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const movies = require('./movieData.json')
const allMovie = require('./allMovie.json')

const app = express() 
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// user : movie-portal
// pass : BtEyzN7OVSNLxjUL


// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.i1uhr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i1uhr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get('/feature-movie', (req, res) => {
      res.send(movies);
    })
    app.get('/feature-movie/:id', (req, res) => {
      const id = parseInt(req.params.id);
      const movie = movies.find(mov => mov.id === id);
      res.send(movie);
    })

    // all movie
    app.get('/all-movie', (req, res) => {
      res.send(allMovie)
    })
    app.get('/all-movie/:id', (req, res) => {
      const id = parseInt(req.params.id);
      const all = allMovie.find(allMov => allMov._id === id);
      res.send(all)
    })
    // send mongodb

    const movieCollection = client.db("movieDB").collection("movie");
    const favouritMovieCollection = client.db("MyfavouritmovieDB").collection("favouritMovie");

    app.get('/movies', async (req, res) => {
      const cursor = movieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await movieCollection.findOne(query);
      res.send(result);
    })

    app.post('/movies', async (req, res) => {
      const newMovie = req.body;
      console.log(newMovie);
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    })

    app.put('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedMovie = req.body;
      const movie = {
        $set: {
          movieName: updatedMovie.movieName
        }
      }
      const result = await movieCollection.updateOne(filter, movie, options);
      res.send(result);
    })
    app.patch('/status/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: { isCompleted: true }
      };

      const result = await movieCollection.updateOne(filter, update);
      res.send(result);
    });

    app.delete('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    })

    app.post('/my-favourite', async (req, res) => {
      const favourite = req.body;
      console.log(favourite);
      const result = await favouritMovieCollection.insertOne(favourite);
      res.send(result);
    })
    app.get('/my-favourite', async (req, res) => {
      const cursor = favouritMovieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/my-favourite/:id', async (req, res) => {
      const id = req.params.id.trim();
      console.log('Deleting movie with id:', id); 
      const query = { _id: new ObjectId(id) };  
      const result = await favouritMovieCollection.deleteOne(query);
      console.log('Delete result:', result);  
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Movie Portal Live')
})

app.listen(port, () => {
  console.log(`Movie Portal on port ${port}`)
})
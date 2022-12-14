const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Post = require('./models/post')
const app = express();

mongoose.set('strictQuery', false)
mongoose.connect("mongodb+srv://rafaelsrabelo:xCxWLHc7EN34FFUB@cluster0.yduo841.mongodb.net/node-angular?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to database!');
  })
  .catch((err)=> { console.log(err)})

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST,PATCH, PUT, DELETE, OPTIONS');
  next();
});

const MIME_TYPE = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mimetype');
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIME_TYPE[file.mimetype];
    cb(null, name + Date.now() + '' + ext);
  }
});

app.post("", multer({storage: storage}).single("image"), (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    description: req.body.description
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post successfully',
      postId: createdPost._id
    });
  })
})

app.get("/api/posts", (req, res, next) => {
  Post.find()
    .then((documents) => {
      res.status(200).json({
        message: 'api running...',
        posts: documents
      })
    })
})

app.put('/api/posts/:id', (req, res, next) => {
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
  })
  Post.updateOne({ _id: req.params.id }, post)
    .then(result => {
      res.status(200).json({ message: 'Updated successfully'})
  })
})

app.delete('/api/posts/:id', (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: 'post deleted' });
  })
})

module.exports = app;

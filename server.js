var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

// Routes
// var routes = require('./routes/routes');
// app.use(routes);

app.get("/", function (req, res) {
  db.Article.find({}).then(function (articles) {
    res.render("index", { articles })
    console.log(articles)
  }).catch(function (err) {
    res.json(err)
  });
});

// A GET route for scraping the NYT website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .text();
      result.link = $(this)
        .parents("a")
        .attr("href");
      result.summary = $(this)
        .parent()
        .siblings("p")
        .text();
      console.log(result)
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          res.redirect("/")
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
  });
});

// Route for getting all saved articles from db
app.get("/saved", function (req, res) {
  db.Article.find({ saved: true })
    .then(function (articles) {
      res.render("saved", { articles });
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving an article 
app.put("/saved/:id", function (req, res) {
  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { saved: true })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route to clear all articles
app.get("/clear", function (req, res) {
  db.Article.deleteMany({})
    .then(function (dbArticle) {
      console.log("Articles Deleted")
      res.redirect(req.get('referer'));
    })
});

app.delete("/clear/:id", function (req, res) {
  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { saved: false })
    .then(function (dbArticle) {
      res.json(dbArticle)
    })
    .catch(function (err) {
      res.json(err)
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function (req, res) {
  db.Article.find({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      console.log(dbArticle)
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/article/:id", function (req, res) {
  console.log("Req Body:" + req.body)
  db.Note.create(req.body)
    .then(function (dbNote) {
      console.log("DB Note:" + dbNote)
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: {note: dbNote._id}}
      );
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

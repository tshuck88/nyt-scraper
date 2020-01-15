app.get("/", function (req, res) {
    db.Article.find({}).limit(20).then(function (articles) {
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
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
    });
});

// Route for getting all Articles from the db
app.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (articles) {
            res.render("saved", { articles });
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function (req, res) {
    db.Article.find({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/article/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate(
                { _id: req.params.id },
                { note: dbNote._id }
            );
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            console.log(err);
        });
});
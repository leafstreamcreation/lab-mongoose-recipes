const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// Import of the model Recipe from './models/Recipe.model.js'
const Recipe = require("./models/Recipe.model");
// Import of the data from './data.json'
const data = require("./data");

const MONGODB_URI = "mongodb://localhost:27017/recipe-app";

// Connection to the database "recipe-app"
mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((self) => {
    console.log(`Connected to the database: "${self.connection.name}"`);
    return self.connection.dropDatabase();
  })
  .then(() => {
    Recipe.insertMany(data)
      .then((recipes) => {
        recipes.forEach((recipe) =>
          console.log("Added default recipe: ", recipe.title)
        );
      })
      .catch((error) =>
        console.log("Error inserting default recipes: ", error)
      );
  })
  .catch((error) => {
    console.error("Error connecting to the database", error);
  });

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, result, next) => {
  Recipe.find({})
    .then((recipes) => {
      result.render("recipes-index", recipes);
    })
    .catch((error) => {
      result.send("Error: could not retrieve recipes");
      console.log("Error retrieving recipes: ", error);
    });
});

app.get("/recipes/:id", (request, result, next) => {
  Recipe.findById(request.params.id)
    .then((recipe) => {
      result.render("recipe-detail", recipe);
    })
    .catch((error) => {
      result.send(`Unable to locate recipe: ${request.params.id}`);
      console.log("Error retrieving recipe: ", error);
    });
});

app.get("/new-recipe", (request, result, next) => {
  result.render("new-recipe");
});

app.post("/create-recipe", (request, result, next) => {
  Recipe.create({
    title: request.body.title,
    level: request.body.level,
    ingredients: request.body.ingredients,
    cuisine: request.body.cuisine,
    dishType: request.body.dishType,
    image: request.body.image,
    duration: request.body.duration,
    creator: request.body.creator,
    created: request.body.date,
  })
    .then((recipe) => {
      console.log(`Created new recipe: ${recipe.title}`);
      result.redirect("/");
    })
    .catch((error) => console.log("Error creating recipe: ", error));
});

app.post("/delete-recipe/:id", (request, result, next) => {
  Recipe.findByIdAndDelete(request.params.id)
    .then((recipe) => {
      console.log(`Deleted Recipe: ${recipe.title}`);
      result.redirect("/");
    })
    .catch((error) => {
      console.log(`Error in deleting recipe ${request.params.id}: `, error);
      result.redirect("/");
    });
});

app.post("/update-recipe/:id", (request, result, next) => {
  Recipe.findByIdAndUpdate(request.params.id, {
    title: request.body.title,
    level: request.body.level,
    ingredients: request.body.ingredients,
    cuisine: request.body.cuisine,
    dishType: request.body.dishType,
    image: request.body.image,
    duration: request.body.duration,
    creator: request.body.creator,
    created: request.body.date,
  })
    .then((recipe) => {
      console.log(`Updated Recipe: ${recipe.title}`);
      result.redirect("/");
    })
    .catch((error) => {
      console.log(`Error in updating recipe ${request.params.id}: `, error);
      result.redirect("/");
    });
});

app.listen(3000, () => console.log("Recipes running on port 3000!"));

import React, { useState, useEffect } from "react";
import CreateRecipe from "./components/CreateRecipe/";
import RecipeCollection from "./components/RecipeCollection/";
import "./App.css";

const App = () => {
  const [recipeItems, setRecipeItems] = useState([]);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await fetch("http://localhost:5000/api/recipes");
        if (!response.ok) throw new Error("Network error");
        const recipes = await response.json();
        setRecipeItems(recipes);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    }
    loadRecipes();
  }, []);

  return (
    <div className="app">
      <h1 className="app-title">Delicious Recipes 🍴</h1>
      <CreateRecipe updateRecipes={setRecipeItems} />
      <RecipeCollection recipes={recipeItems} setRecipes={setRecipeItems} />
    </div>
  );
};

export default App;

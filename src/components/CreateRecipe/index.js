import React, { useState } from "react";
import "./index.css";

const CreateRecipe = ({ updateRecipes }) => {
  const [form, setForm] = useState({
    name: "",
    components: "",
    procedure: "",
    tag: "",
  });
  const [msg, setMsg] = useState("");

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitRecipe = async (e) => {
    e.preventDefault();
    setMsg("");
    const { name, components, procedure, tag } = form;
    if (!name || !components || !procedure || !tag) {
      setMsg("Please fill out all fields.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name,
          ingredients: components.split(",").map((ing) => ing.trim()),
          instructions: procedure,
          category: tag,
        }),
      });
      if (!res.ok) throw new Error("Posting failed");
      const newRecipe = await res.json();
      updateRecipes((prev) => [...prev, newRecipe]);
      setForm({ name: "", components: "", procedure: "", tag: "" });
    } catch (err) {
      setMsg("Error submitting recipe.");
      console.error(err);
    }
  };

  return (
    <div className="create-recipe">
      <h2>Add a Recipe</h2>
      <form onSubmit={submitRecipe} className="recipe-form">
        <input
          type="text"
          name="name"
          placeholder="Recipe Name"
          value={form.name}
          onChange={handleInput}
          className="form-control"
        />
        <input
          type="text"
          name="components"
          placeholder="Ingredients (comma separated)"
          value={form.components}
          onChange={handleInput}
          className="form-control"
        />
        <textarea
          name="procedure"
          placeholder="Cooking Procedure"
          value={form.procedure}
          onChange={handleInput}
          className="form-control"
        ></textarea>
        <input
          type="text"
          name="tag"
          placeholder="Category"
          value={form.tag}
          onChange={handleInput}
          className="form-control"
        />
        {msg && <p className="error-msg">{msg}</p>}
        <button type="submit" className="submit-btn">
          Submit Recipe
        </button>
      </form>
    </div>
  );
};

export default CreateRecipe;

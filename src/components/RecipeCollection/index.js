import React, { useState } from "react";
import "./index.css";

const RecipeCollection = ({ recipes, setRecipes }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    components: "",
    procedure: "",
    tag: "",
  });
  const [errMsg, setErrMsg] = useState("");

  // Handle drag start: store the source index in the dataTransfer
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("sourceIndex", index);
  };

  // Allow drop by preventing default behavior
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop: reorder the recipes array
  const handleDrop = (e, destinationIndex) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("sourceIndex");
    if (sourceIndexStr === "") return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (sourceIndex === destinationIndex) return;

    const newRecipes = Array.from(recipes);
    const [movedItem] = newRecipes.splice(sourceIndex, 1);
    newRecipes.splice(destinationIndex, 0, movedItem);
    setRecipes(newRecipes);
  };

  // Editing functions remain similar
  const initiateEdit = (recipe) => {
    setEditingId(recipe._id);
    setEditValues({
      name: recipe.title,
      components: recipe.ingredients.join(", "),
      procedure: recipe.instructions,
      tag: recipe.category,
    });
  };

  const handleEditChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    try {
      const res = await fetch(
        `https://recipe-management-backend-4wwp.onrender.com/api/recipes/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editValues.name,
            ingredients: editValues.components.split(",").map((item) =>
              item.trim()
            ),
            instructions: editValues.procedure,
            category: editValues.tag,
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const updatedRecipe = await res.json();
      setRecipes(
        recipes.map((rec) =>
          rec._id === editingId ? updatedRecipe : rec
        )
      );
      setEditingId(null);
    } catch (error) {
      setErrMsg("Error updating recipe.");
      console.error(error);
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(
        `https://recipe-management-backend-4wwp.onrender.com/api/recipes/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setRecipes(recipes.filter((rec) => rec._id !== id));
    } catch (error) {
      setErrMsg("Error deleting recipe.");
      console.error(error);
    }
  };

  return (
    <div className="recipe-collection">
      <h2 className="collection-title">Recipe Archive</h2>
      {errMsg && <p className="error">{errMsg}</p>}
      {recipes.length === 0 ? (
        <div className="empty">No recipes available.</div>
      ) : (
        <div className="recipe-list">
          {recipes.map((recipe, index) => (
            <div
              key={recipe._id}
              className="recipe-card"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{ cursor: "pointer" }}
            >
              {editingId === recipe._id ? (
                <form onSubmit={saveEdit} className="edit-form">
                  <input
                    type="text"
                    name="name"
                    placeholder="Recipe Name"
                    value={editValues.name}
                    onChange={handleEditChange}
                    className="edit-field"
                    required
                  />
                  <input
                    type="text"
                    name="components"
                    placeholder="Ingredients (comma-separated)"
                    value={editValues.components}
                    onChange={handleEditChange}
                    className="edit-field"
                    required
                  />
                  <textarea
                    name="procedure"
                    placeholder="Procedure"
                    value={editValues.procedure}
                    onChange={handleEditChange}
                    className="edit-field"
                    required
                  ></textarea>
                  <input
                    type="text"
                    name="tag"
                    placeholder="Category"
                    value={editValues.tag}
                    onChange={handleEditChange}
                    className="edit-field"
                    required
                  />
                  <div className="edit-actions">
                    <button type="submit" className="save-btn">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>
                    <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                  </p>
                  <p>
                    <strong>Instructions:</strong> {recipe.instructions}
                  </p>
                  <p>
                    <strong>Category:</strong> {recipe.category}
                  </p>
                  <div className="action-buttons">
                    <button
                      onClick={() => initiateEdit(recipe)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeCollection;

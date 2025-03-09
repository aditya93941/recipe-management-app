import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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

  const handleDrop = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(recipes);
    const [item] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, item);
    setRecipes(reordered);
  };

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
      const res = await fetch(`http://localhost:5000/api/recipes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editValues.name,
          ingredients: editValues.components.split(",").map((item) => item.trim()),
          instructions: editValues.procedure,
          category: editValues.tag,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedRecipe = await res.json();
      setRecipes(
        recipes.map((rec) => (rec._id === editingId ? updatedRecipe : rec))
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
      const res = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: "DELETE",
      });
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
        <p className="empty">No recipes available.</p>
      ) : (
        <DragDropContext onDragEnd={handleDrop}>
          <Droppable droppableId="recipeList">
            {(provided) => (
              <div
                className="recipe-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {recipes.map((recipe, index) => (
                  <Draggable
                    key={recipe._id}
                    draggableId={recipe._id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="recipe-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
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
                              <strong>Ingredients:</strong>{" "}
                              {recipe.ingredients.join(", ")}
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default RecipeCollection;

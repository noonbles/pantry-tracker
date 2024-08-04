"use client";

import { React, useState, useEffect } from "react";
import { List, ListItem, Stack, IconButton, TextField } from "@mui/material";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import EditIcon from "@mui/icons-material/Edit";
import { firestore } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function fetchPantry() {
      const pantryCollection = collection(firestore, "pantry");
      const pantrySnapshot = await getDocs(pantryCollection);
      const pantryItems = pantrySnapshot.docs.map((doc) => doc.id);
      setPantry(pantryItems);
    }
    fetchPantry();
  }, []);

  const filteredPantry = pantry.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function addItem() {
    let processed_txt = newItem.trim().toLowerCase();
    if (processed_txt && !pantry.includes(processed_txt)) {
      try {
        const itemDoc = doc(firestore, "pantry", processed_txt);
        await setDoc(itemDoc, { name: processed_txt });
        setPantry([...pantry, processed_txt]);
      } catch (error) {
        console.error("Error adding item:", error);
      }
      setNewItem("");
    }
  }
  
  async function deleteItem() {
    const processed_txt = newItem.trim().toLowerCase();
    if (processed_txt && pantry.includes(processed_txt)) {
      try {
        const itemDoc = doc(firestore, "pantry", processed_txt);
        await deleteDoc(itemDoc);
        setPantry(pantry.filter((item) => item !== processed_txt));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
      setNewItem("");
    }
  }
  

  const handleEditClick = (index, value) => {
    setEditIndex(index);
    setInputValue(value);
  };

  const handleInputChange = (event) => {
    const processed_txt = event.target.value.trim().toLowerCase();
    setInputValue(processed_txt);

    setPantry((prevPantry) => {
      const updatedPantry = [...prevPantry];
      updatedPantry[editIndex] = processed_txt;
      return updatedPantry;
    });
  };

  const handleInputBlur = () => {
    setEditIndex(null);
  };

  return (
    <div className="flex flex-wrap w-screen h-screen">
      <div className="flex absolute w-full bg-black text-4xl font-serif p-2 justify-center">
        <span className="text-white">
          <BreakfastDiningIcon /> Pantry Tracker{" "}
        </span>
      </div>

      <div className="flex w-1/3 h-full" />
      <div className="flex flex-col w-1/3 h-full justify-center gap-4">
        <input
          className="w-full bg-gray-300 rounded-md p-2 placeholder:text-black"
          placeholder="Add/Delete Item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <List>
          <Stack direction="row" spacing={2}>
            <ListItem className="updater-list-item" onClick={addItem}>
              Add
            </ListItem>
            <ListItem className="updater-list-item" onClick={deleteItem}>
              Delete
            </ListItem>
          </Stack>
        </List>

        <input
          className="w-full bg-gray-300 rounded-md p-2 placeholder:text-black"
          placeholder="Search Pantry"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />

        <List>
          <div>Pantry List</div>
          {filteredPantry.map((element, index) => (
            <ListItem
              key={index}
              className="list-item"
              onClick={() => handleEditClick(index, element)}
            >
              <div className="flex justify-between items-center">
                {editIndex === index ? (
                  <TextField
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    autoFocus
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <span> {element} </span>
                )}
                <IconButton onClick={() => handleEditClick(index, element)}>
                  <EditIcon />
                </IconButton>
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
}

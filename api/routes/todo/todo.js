"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/routes/todo/todo.ts
var todo_exports = {};
__export(todo_exports, {
  default: () => todo_default
});
module.exports = __toCommonJS(todo_exports);
var import_express = require("express");

// models/todo.ts
var Todo = class {
  constructor(id, text, completed = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
  }
};

// app/routes/todo/todo.ts
var router = (0, import_express.Router)();
var generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
var todoItems = [
  {
    id: generateUUID(),
    text: "Deploy Express v5 to Vercel",
    completed: false
  }
];
router.post(
  "/",
  (req, res) => {
    const { text } = req.body;
    if (!text) {
      res.status(400).jsend.error("Text is required");
      return;
    }
    const newTodo = new Todo(generateUUID(), text);
    todoItems.push(newTodo);
    res.status(201).jsend.success({ message: "Created the todo.", createdTodo: newTodo });
  }
);
router.get("/", (_req, res, _next) => {
  res.jsend.success({ items: todoItems });
});
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const todo = todoItems.find((item) => item.id === id);
  if (!todo) {
    res.status(404).jsend.error("Todo not found");
    return;
  }
  res.jsend.success(todo);
});
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  const todo = todoItems.find((item) => item.id === id);
  if (!todo) {
    res.status(404).jsend.error("Todo not found");
    return;
  }
  if (text) {
    todo.text = text;
  }
  if (completed !== void 0) {
    todo.completed = completed;
  }
  res.jsend.success(todo);
});
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = todoItems.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).jsend.error("Todo not found");
    return;
  }
  todoItems.splice(index, 1);
  res.jsend.success({ message: "Todo deleted." });
});
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  const todo = todoItems.find((item) => item.id === id);
  if (!todo) {
    res.status(404).jsend.error("Todo not found");
    return;
  }
  if (text) {
    todo.text = text;
  }
  if (completed !== void 0) {
    todo.completed = completed;
  }
  res.jsend.success(todo);
});
var todo_default = router;

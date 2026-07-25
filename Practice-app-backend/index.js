require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const Note = require("./models/note");

const app = express();

app.use(express.static("dist"));

app.use(express.json());
morgan.token("body", (req, res) => res.body);
app.use(morgan("dev"));

app.get("/", (request, response) => {
  response.send("<h1>Hello world</h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id).then((note) => {
    if (!note) {
      return response
        .status(404)
        .json({ error: `note with id ${request.params.id} does not exist` });
    }
    response.json(note);
  });
});

app.delete("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  notes = notes.filter((n) => n.id !== id);
  response.status(204).end();
});

app.post("/api/notes", (request, response) => {
  const body = request.body;
  if (!body.content) {
    response.status(400).json({ error: "note must contain content field" });
    return;
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });
  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

app.put("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  const body = request.body;
  if (!body.content || body.important === undefined) {
    response
      .status(400)
      .json({ error: `Updated note must contain content and important field` });
    return;
  }
  note = {
    id: note.id,
    content: body.content,
    important: body.important,
  };
  notes = notes.map((n) => (n.id === id ? note : n));
  response.json(note);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

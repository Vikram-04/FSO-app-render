const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.use(express.json());
morgan.token("body", (req, res) => res.body);
app.use(morgan("dev"));

app.use(cors());

app.get("/", (request, response) => {
  response.send("<h1>Hello world</h1>");
});

app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  const note = notes.find((n) => n.id === id);
  if (note) {
    response.json(note);
  } else {
    response.statusMessage = `A note with id ${id} does not exist`;
    response.status(404).end();
  }
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
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;

  const note = {
    content: body.content,
    important: body.important || false,
    id: (maxId + 1).toString(),
  };

  notes = notes.concat(note);
  console.log(note);
  response.json(note);
});

app.put("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  let note = notes.find((n) => n.id === id);
  if (!note) {
    response.status(400).json({ error: `Note with id ${id} does not exist` });
    return;
  }
  const body = request.body;
  if (!body.content || !body.important) {
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

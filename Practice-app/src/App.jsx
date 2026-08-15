import { useState, useEffect } from "react";
import Footer from "./components/Footer";
import Note from "./components/Note";
import Notification from "./components/Notification";
import noteService from "./services/notes";
import loginService from "./services/login";

const LoginForm = ({
  username,
  password,
  handleLogin,
  setUsername,
  setPassword,
  setLoginVisible,
}) => {
  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username:
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            ></input>
          </label>
        </div>
        <div>
          <label>
            password:
            <input
              type="text"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            ></input>
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

const Toggleable = (props) => {
  const [visible, setVisible] = useState(false);
  const hideWhenVisible = { display: visible ? "none" : "" };
  const showWhenVisible = { display: visible ? "" : "none" };
  return (
    <div>
      <button
        style={hideWhenVisible}
        onClick={() => {
          setVisible(true);
        }}
      >
        {props.buttonLabel}
      </button>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={() => setVisible(false)}>cancel</button>
      </div>
    </div>
  );
};

const NoteForm = ({ name, addNote, newNote, setNewNote }) => {
  return (
    <div>
      <p>{name} logged in</p>
      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={(event) => {
            setNewNote(event.target.value);
          }}
        />
        <button type="submit">save</button>
      </form>
    </div>
  );
};

const App = () => {
  const loginForm = () => {
    return (
      <Toggleable buttonLabel="login">
        <LoginForm
          username={username}
          password={password}
          handleLogin={handleLogin}
          setUsername={setUsername}
          setPassword={setPassword}
        ></LoginForm>
      </Toggleable>
    );
  };

  const noteForm = () => {
    return (
      <Toggleable buttonLabel="add note">
        <NoteForm
          name={user.name}
          addNote={addNote}
          newNote={newNote}
          setNewNote={setNewNote}
        ></NoteForm>
      </Toggleable>
    );
  };

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotes(initialNotes);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    };

    noteService.create(noteObject).then((returnedNote) => {
      setNotes(notes.concat(returnedNote));
      setNewNote("");
    });
  };

  const toggleImportanceOf = (id) => {
    const note = notes.find((n) => n.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id !== id ? note : returnedNote)));
      })
      .catch((error) => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`,
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter((n) => n.id !== id));
      });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem("loggedNoteAppUser", JSON.stringify(user));
      setUser(user);
      noteService.setToken(user.token);
      setUsername("");
      setPassword("");
    } catch (error) {
      setErrorMessage("invalid credentials");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      {!user && loginForm()}
      {user && noteForm()}
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>

      <Footer />
    </div>
  );
};

export default App;

const express = require('express');
const fs = require('fs');
const path = require('path');
const randomId = require('./helpers/randomId');

const PORT = process.env.PORT || 3001;

const app = express();

//JSON and urlencoded form data being parsed by middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

//reading file and parsing note data
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      return res.json(JSON.parse(data));
    }
  });
});

//deleting notes. then reads the file, parses the data and gets the note with right ID and then rewrites the file.
app.delete('/api/notes/:id', (req, res) => {
  const deleteNoteId = req.params.id;

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      let parsedNotes = JSON.parse(data);
      const indexOfId = parsedNotes.findIndex((obj) => obj.id === deleteNoteId);
      if (indexOfId > -1) {
        parsedNotes.splice(indexOfId, 1);
      }
      fs.writeFile(
        './db/db.json',
        JSON.stringify(parsedNotes, null, 4),
        (err) =>
          err ? res.status(400).json({ error: err.message }) : console.log('Database has been updated')
      );
    }
  });

  res.sendFile(path.join(__dirname, './db/db.json'));
});

//new note being created
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: randomId(),
    };

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        const parsedNOtes = JSON.parse(data);

        parsedNOtes.push(newNote);

        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNOtes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated notes!')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting note');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.listen(PORT, () =>
  console.log(`Listening at this location http://localhost:${PORT}`)
);
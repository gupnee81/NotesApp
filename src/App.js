import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

class App extends Component {
  state = {
    id: "",
    note: "",
    notes: []
  }

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items});
  }

  handleChangeNote = (event) => {
    this.setState({note: event.target.value});
  }

  hasExistingNote = () => {
    const { notes, id } = this.state;
    if(id) {
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  }

  handleAddNote = async event => {
    const { note, notes } = this.state;
    const input = { note: note };
    event.preventDefault();
    // check if we have existing note, if so update it
    if(this.hasExistingNote()) {
      console.log("updated");
      this.handleUpdateNote();
    }
    else {
      const result = await API.graphql(graphqlOperation(createNote, { input: input }));
      const newNote = result.data.createNote;
      this.setState({ notes: [...notes, newNote], note: "" });
    }
  }

  handleUpdateNote = async () => {
    const { note, id, notes } = this.state;
    const input = {
      note,
      id
    }
    const result = await API.graphql(graphqlOperation(updateNote, { input: input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1),
    ]
    this.setState({ notes: updatedNotes, note: "", id: "" });
  }

  handleDeleteNote = async noteID => {
    const { notes } = this.state;
    const input = {id : noteID };
    const result = await API.graphql(graphqlOperation(deleteNote, { input: input }));
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletedNoteId);
    this.setState({ notes: updatedNotes });
    // another way but it makes another API call and slow down updates on UI.
    // const result = await API.graphql(graphqlOperation(listNotes));
    // this.setState({ notes: result.data.listNotes.items});
  }

  handleSetNote = (item) => {
    console.log(item);
    this.setState({ note: item.note, id: item.id});
  }

  render() {
    const { notes, note } = this.state;
    return (
     <div>
       <h1>Amplify Notemaker</h1>
       <form onSubmit={this.handleAddNote}>
         <input type="text" onChange={this.handleChangeNote} value={note} />
         <button type="submit">Add Note</button>
       </form>
       <ul>
         {notes && notes.map((item, index) => (
           <div key={index}>
            <li onClick={ () => this.handleSetNote(item)}>{item.note}
              <button type="button" onClick={ () => this.handleDeleteNote(item.id)}>Delete</button>
            </li>
           </div>
         ))}
       </ul>
     </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true});

import React from 'react';
import IndexPug from './index.pug';
import './App.css';

function App() {
  return (
    <div  dangerouslySetInnerHTML={{ __html: IndexPug}}></div>
  );
}

export default App;

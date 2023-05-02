import React from 'react';
import IndexPug from '../index.pug';
import ReactDOM from 'react-dom';

function LandingPage(){
    return(
        <div  dangerouslySetInnerHTML={{ __html: IndexPug}} />
    );
}

ReactDOM.render(<LandingPage />, document.getElementById('root'));
import React from 'react';

export default function Home(props) {
    return (
        <div className="row">
            <div className="col">
                <img src="https://avatars1.githubusercontent.com/u/5032317?v=4"
                    className="img-fluid img-thumbnail rounded-circle" alt="Palash Kanti Kundu"></img>
            </div>
            <div className="col">
                <h1 className="display-1" align="left">Hello,</h1>
                <h2 className="display-4">A bit about me:</h2>
            </div>
            <div className="col">
               <span>&nbsp;</span>
            </div>
        </div>
    );
}
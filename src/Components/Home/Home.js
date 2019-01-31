import React from 'react';

export default function Home(props) {
    return (
        <div className="d-flex justify-content-center">
            <div>
                <img src="https://avatars1.githubusercontent.com/u/5032317?v=4"
                    className="img-fluid img-thumbnail rounded-circle" alt="Palash Kanti Kundu"></img>
            </div>
            <div style={{ "border-left": "100px solid #fef9f9" }}></div>
            <div>
                <h1>Hello,</h1>
                <h2>A bit about me:</h2>
            </div>
        </div>
    );
}
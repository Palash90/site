import React from 'react';

export default function Footer(props) {
    return (
        <footer className="footer">
            <div className="d-flex justify-content-center">
                <div className="p-2">
                    <img src="./static/si-glyph-smartphone.svg" />
                </div>
                <div className="p-2">
                    <span className="text-danger">+919851800599</span>
                </div>
                <div className="p-2">
                    <img src="./static/si-glyph-mail.svg" />
                </div>
                <div className="p-2">
                    <a href="mailto:me@palash90.in" className="text-danger">me@palash90.in</a>
                </div>
                <div className="p-2">
                    <img src="./static/si-glyph-button-plus.svg" />
                </div>
                <div className="p-2">
                    <a className="text-danger" href="http://www.linkedin.com/in/palash90">Add me on LinkedIn</a>
                </div>
                <div className="p-2">
                    <img src="./static/copyright.svg" />
                </div>
                <div className="p-2">
                    <span className="text-danger">2019 Palash Kanti Kundu</span>
                </div>
            </div>
        </footer>
    );
}
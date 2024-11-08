import React from 'react';
import './Yt.css'

function Yt(props) {

    return <div className="video-responsive">
        <iframe
            width="100%"
            height="60%"
            src={`https://www.youtube.com/embed/${props.ytUrl}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
        />
    </div>
}

export default Yt;
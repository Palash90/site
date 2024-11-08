import Markdown from "react-markdown"
import React from 'react';
import { Image } from "react-bootstrap";

export default function Blog(props) {
    const components = {
        img: (props) => {
            return <Image fluid src={props.src} />
        }
    }
    return <Markdown components={components}>{props.data}</Markdown>
}

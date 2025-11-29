import Markdown from "react-markdown"
import { Col, Container, Image, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import SocialRow from "./SocialRow";

export default function Blog(props) {
    const [mdData, setMdData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    var className;

    switch(props.contentType){
        case "swe": 
            className = window.findProp("pages.contents.techBlogClass")
            break;
        case "music":
            className = window.findProp("pages.contents.musicBlogClass")
            break;
        default:
            className = window.findProp("pages.contents.genericBlogClass")
            break;
    }

    const components = {
        img: (props) => {
            return <Image fluid src={props.src} />
        }
    }

    useEffect(() => {
        fetch(props.mdUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                setMdData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [props.mdUrl])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <Container className={className} fluid>
        <Row>
            {props.publishDate?<Col><b>{window.findProp("labels.publishedOn")}</b>{props.publishDate}</Col>:<></>}
            {props.lastUpdated?<Col><b>{window.findProp("labels.lastUpdated")}</b>{props.lastUpdated}</Col>:<></>}
        </Row>
        <br />
        <Row>
            <Col>
                <Markdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    components={components}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                >
                    {mdData}
                </Markdown>
            </Col>
        </Row>
    </Container>
}

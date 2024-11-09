import Markdown from "react-markdown"
import { Col, Container, Image, Row } from "react-bootstrap";
import { useState } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

export default function Blog(props) {
    const [mdData, setMdData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const components = {
        img: (props) => {
            return <Image fluid src={props.src} />
        }
    }

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

    //fetchMarkDown(props.mdUrl, setMdData, setLoading, setError);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <Container fluid>
        <Row>
            <Col>
                <Markdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={components}
                    rehypePlugins={[rehypeRaw]}
                >
                    {mdData}
                </Markdown>
            </Col>
        </Row>
    </Container>
}

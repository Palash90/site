import Card from 'react-bootstrap/Card';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FaGithub, FaInfoCircle, FaJava, FaReact, FaRust } from 'react-icons/fa';
import { useState } from 'react';
import Blog from './Blog';

function ProjectModal() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Card.Link variant="primary" onClick={handleShow}>
                <FaInfoCircle size={60} />
            </Card.Link>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Blog />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function ProjectCard(props) {
    const { name, desc, url, type } = props;
    const getTechStackIcon = () => {
        switch (type) {
            case "react":
                return <FaReact size={40} />
            case "java":
                return <FaJava size={40} />
            case "rust":
                return <FaRust size={40} />
            default:
                return <></>
        }
    }

    return (
        <Card style={{ width: '15rem' }}>
            <Card.Body>
                <Card.Title>{name}</Card.Title>
                <Card.Text>{desc}</Card.Text>
                <Card.Text>{window.findProp("pages.projects.techStack")}{getTechStackIcon()}</Card.Text>
                <Container>
                    <Row>
                        <Col>
                            <Card.Link href={url} target={type === "react" ? '' : '_blank'}>
                                {type === "react" ? <IoGameControllerOutline size={60} /> : <FaGithub size={60} />}
                            </Card.Link>
                        </Col>
                        <Col>
                            {type !== "react" ? <ProjectModal /> : <></>}
                        </Col>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    );
}
export default function Projects() {
    return <>
        <h1 style={{ color: 'tomato' }}>{window.findProp("labels.projects")}</h1>
        <p>{window.findProp("pages.projects.intro")}</p>
        <Container>
            <Row>
                {window.findProp("projects").map(p => <Col><ProjectCard name={p.name} desc={p.desc} url={p.url} type={p.type} /></Col>)}
            </Row>
        </Container>
    </>
}
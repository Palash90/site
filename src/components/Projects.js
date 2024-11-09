import Card from 'react-bootstrap/Card';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FaGithub, FaInfoCircle, FaJava, FaMarkdown, FaReact, FaRust } from 'react-icons/fa';
import { useState } from 'react';
import Blog from './Blog';
import PageIntro from './PageIntro';

function ProjectModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Card.Link variant="primary" onClick={handleShow}>
                <FaInfoCircle size={60} />
            </Card.Link>
            <Modal show={show}
                onHide={handleClose}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title>{props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    maxHeight: 'calc(100vh - 210px)',
                    overflowY: 'auto'
                }}>
                    <Blog mdUrl={props.mdUrl} />
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
    const { name, desc, url, mdUrl, type } = props;
    const getTechStackIcon = () => {
        switch (type) {
            case "react":
                return <FaReact size={40} />
            case "java":
                return <FaJava size={40} />
            case "rust":
                return <FaRust size={40} />
            case "markdown":
                return <FaMarkdown size={40} />
            default:
                return <></>
        }
    }

    return (
        <Card style={{ width: '100%', height: '100%' }}>
            <Card.Body>
                <Card.Title>{name}</Card.Title>
                <Card.Text>{desc}</Card.Text>
                <Card.Text>{window.findProp("pages.projects.techStack")}{getTechStackIcon()}</Card.Text>
                <Container fluid>
                    <Row>
                        <Col>
                            <Card.Link href={url} target={type === "react" ? '' : '_blank'}>
                                {type === "react" ? <IoGameControllerOutline size={60} /> : <FaGithub size={60} />}
                            </Card.Link>
                        </Col>
                        <Col>
                            {type !== "react" && mdUrl ? <ProjectModal title={name} mdUrl={mdUrl} /> : <></>}
                        </Col>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    );
}
export default function Projects() {
    return <>
        <Container fluid>
            <PageIntro h1={window.findProp("labels.projects")} p={window.findProp("pages.projects.intro")} />
            <Row>
                {window.findProp("projects").map(p => <Col key={p.id}><ProjectCard name={p.name} desc={p.desc} url={p.url} mdUrl={p.mdUrl} type={p.type} /></Col>)}
            </Row>
        </Container>
    </>
}
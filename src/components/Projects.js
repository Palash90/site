import Card from 'react-bootstrap/Card';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FaExternalLinkAlt, FaGithub, FaInfoCircle, FaJava, FaMarkdown, FaPython, FaReact, FaRust } from 'react-icons/fa';
import { useState } from 'react';
import Blog from './Blog';
import PageIntro from './PageIntro';
import { TbBrandJavascript } from 'react-icons/tb';

function ProjectModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Card.Link variant="primary" onClick={handleShow}>
                <FaInfoCircle />
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
    const { name, desc, playUrl, githubUrl, mdUrl, type } = props;
    const getTechStackIcon = () => {
        switch (type) {
            case "react":
                return <FaReact title='React.js' />
            case "java":
                return <FaJava title="Java" />
            case "rust":
                return <FaRust title="Rust" />
            case "markdown":
                return <FaMarkdown title="MarkDown" />
            case "python":
                return <FaPython title="Python" />
            case "javascript":
                return <TbBrandJavascript />
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
            </Card.Body>
            <Card.Footer>
                <Container fluid>
                    <Row>
                        {
                            playUrl ? <Col>
                                <Card.Link href={playUrl} target={type === "react" ? '' : '_blank'}>
                                    {type === "react" ? <IoGameControllerOutline /> : <FaExternalLinkAlt />}
                                </Card.Link>
                            </Col> : <></>
                        }
                        {
                            githubUrl ? <Col>
                                <Card.Link href={githubUrl} target={type === "react" ? '' : '_blank'}>
                                    <FaGithub />
                                </Card.Link>
                            </Col> : <></>
                        }
                        {
                            mdUrl ? <Col>
                                <ProjectModal title={name} mdUrl={mdUrl} />
                            </Col> : <></>
                        }
                    </Row>
                </Container>
            </Card.Footer>
        </Card>
    );
}
export default function Projects() {
    return <>
        <Container fluid>
            <PageIntro h1={window.findProp("labels.projects")} p={window.findProp("pages.projects.intro")} />
            <Row>
                {window.findProp("projects").map(p => <Col key={p.id}>
                    <ProjectCard
                        name={p.name}
                        desc={p.desc}
                        playUrl={p.playUrl}
                        githubUrl={p.githubUrl}
                        mdUrl={p.mdUrl}
                        type={p.type} />
                </Col>)}
            </Row>
        </Container>
    </>
}
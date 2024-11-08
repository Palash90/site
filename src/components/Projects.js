import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import findProp from "./data";
import { Container, Row } from 'react-bootstrap';
import { Github, PlayCircle } from 'react-bootstrap-icons';

function ProjectCard(props) {
    const { name, desc, url, type } = props;
    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>{name}</Card.Title>
                <Card.Text>{desc}</Card.Text>
                <Card.Link href={url} target='_blank'>{type === "Component" ? <PlayCircle size={60} /> : <Github size={60} />}</Card.Link>
            </Card.Body>
        </Card>
    );
}
export default function Projects() {
    return <>
        <h1>{findProp("labels.projects")}</h1>
        <Container>
            <Row>
                {findProp("projects").map(p => <ProjectCard name={p.name} desc={p.desc} url={p.url} type={p.type} />)}
            </Row>
        </Container>
    </>
}
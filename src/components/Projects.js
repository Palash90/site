import Card from 'react-bootstrap/Card';
import { Col, Container, Row } from 'react-bootstrap';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FaGithub, FaJava, FaReact, FaRust } from 'react-icons/fa';

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
                <Card.Link href={url} target='_blank'>
                    {type === "react" ? <IoGameControllerOutline size={60} /> : <FaGithub size={60} />}
                </Card.Link>
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
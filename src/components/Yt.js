import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

function Yt(props) {

    return <Container fluid>
        <Row className="justify-content-md-center">
            <Col style={{border:'1px solid', width:'100vw', height:'70vh'}}>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${props.ytId}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                />
            </Col>
        </Row>
    </Container>
}

export default Yt;
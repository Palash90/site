import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Yt from './Yt';
import Blog from './Blog';

export default function Both(props) {
    return <Container>
        <Row>
            <Col><Yt ytId={props.ytId} /></Col>
        </Row>
        <Row >
            <Col><br /></Col>
        </Row>
        <Row style={{ borderTop: '1px solid' }}>
            <Col><br /></Col>
        </Row>

        <Row >
            <Col><Blog mdUrl={props.mdUrl} /></Col>
        </Row>
    </Container>

}
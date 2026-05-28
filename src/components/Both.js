import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Yt from './Yt';
import Blog from './Blog';
import TabViewer from './tab-viewer/TabViewer';

export default function Both(props) {
    return <Container fluid>
        <Row>
            <Col><Yt ytId={props.ytId} /></Col>
        </Row>
        <Row >
            <Col><br /></Col>
        </Row>
        {props.tab ?
            <>
                <Row style={{ borderTop: '1px solid' }} >
                    <Col><br /></Col>
                </Row>
                <Row>
                    <Col><TabViewer tab={props.tab} /></Col>
                </Row>
            </> : <></>}
        <Row style={{ borderTop: '1px solid' }}>
            <Col><br /></Col>
        </Row>

        <Row >
            <Col><Blog {...props} /></Col>
        </Row>
    </Container>

}
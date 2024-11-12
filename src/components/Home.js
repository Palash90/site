import { Col, Container, Image, Row } from "react-bootstrap";
import PageIntro from "./PageIntro";
import Socials from "./Socials";
import ContentList from "./ContentList";

export default function Home() {
    return <>
        <Container className={window.findProp("pages.home.class")} fluid>
            <PageIntro
                h1={window.findProp('pages.home.greeting') + window.findProp('shortName')}
                p={window.findProp('pages.home.tag')}
                h1Color={window.findProp("pages.home.h1Color")}
                pColor={window.findProp("pages.home.pColor")}
            />
            <Row>
                <Col sm={12} md={6} className="order-md-2">
                    <Image
                        fluid
                        src={window.findProp('pages.home.profilePicUrl')}
                        style={{ background: 'transparent', maxHeight: '250px' }}
                    />
                </Col>
                <Col sm={12} md={6} className="order-md-1  mt-3 mt-md-0">
                    <div style={{ whiteSpace: "pre-line" }}>
                        {window.findProp('pages.home.desc')}
                    </div>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col sm={12} md={6}>
                    <h6>
                        <b>{window.findProp("pages.home.techBlogHeader")}</b>
                        <a href="#/contents/tech">
                            {window.findProp("pages.home.techBlogShowAll")}
                        </a>
                    </h6>
                    <p>{window.findProp("pages.home.techBlogTag")}</p>
                    <ContentList type="contents.swe" limit={5} />
                </Col>
                <Col sm={12} md={6}>
                    <h6>
                        <b>{window.findProp("pages.home.musicBlogHeader")}</b>
                        <a href="#/contents/tech">
                            {window.findProp("pages.home.musicBlogShowAll")}
                        </a>
                    </h6>
                    <p>{window.findProp("pages.home.musicBlogTag")}</p>
                    <ContentList type="contents.music" limit={5} />
                </Col>
            </Row>
            <Row className="mt-1">
                <Col>
                    <Socials />
                </Col>
            </Row>
        </Container>
    </>
}
import { Col, Container, Image, Row } from "react-bootstrap";
import PageIntro from "./PageIntro";
import SocialRow from "./SocialRow";
import ContentList from "./ContentList";

export default function Home() {
    return <>
        <Container className={"home-page " + window.findProp("pages.home.class")} fluid>
            <PageIntro
                h1={window.findProp('pages.home.greeting') + window.findProp('shortName')}
                p={window.findProp('pages.home.tag')}
                h1Color={window.findProp("pages.home.h1Color")}
                pColor={window.findProp("pages.home.pColor")}
            />
            <Row className="align-items-start">
                <Col md={7} className="order-1">
                    <div className="bio-text" style={{ whiteSpace: "pre-line" }}>
                        {window.findProp('pages.home.desc')}
                    </div>
                    <div className="hero-socials mt-3 mb-4">
                        <SocialRow />
                    </div>
                    <div className="home-section">
                        <h6 className="section-heading">
                            {window.findProp("pages.home.techBlogHeader")}
                            <a href="/contents/tech" className="show-all">
                                {window.findProp("pages.home.techBlogShowAll")}
                            </a>
                        </h6>
                        <p className="text-muted small section-sub">{window.findProp("pages.home.techBlogTag")}</p>
                        <ContentList type="contents.swe" limit={5} />
                    </div>
                </Col>
                <Col md={5} className="order-2">
                    <div className="profile-img-wrap">
                        <Image
                            fluid
                            className="profile-img"
                            src={window.findProp('pages.home.profilePicUrl')}
                        />
                    </div>
                    <div className="home-section mt-4">
                        <h6 className="section-heading">
                            {window.findProp("pages.home.musicBlogHeader")}
                            <a href="/contents/music" className="show-all">
                                {window.findProp("pages.home.musicBlogShowAll")}
                            </a>
                        </h6>
                        <p className="text-muted small section-sub">{window.findProp("pages.home.musicBlogTag")}</p>
                        <ContentList type="contents.music" limit={5} />
                    </div>
                </Col>
            </Row>
        </Container>
    </>
}

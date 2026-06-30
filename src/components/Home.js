import { Col, Container, Image, Row } from "react-bootstrap";
import PageIntro from "./PageIntro";
import SeriesList from "./SeriesList";

export default function Home() {
    return <>
        <Container className={"home-page " + window.findProp("pages.home.class")} fluid>
            <PageIntro
                h1={window.findProp('pages.home.greeting') + window.findProp('shortName')}
                p={window.findProp('pages.home.tag')}
                h1Color={window.findProp("pages.home.h1Color")}
                pColor={window.findProp("pages.home.pColor")}
            />
            <Row className="align-items-start mb-4">
                <Col md={7}>
                    <div className="bio-text" style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                        {window.findProp('pages.home.desc')}
                    </div>
                </Col>
                <Col md={5}>
                    <div className="profile-img-wrap">
                        <Image
                            fluid
                            className="profile-img"
                            src={window.findProp('pages.home.profilePicUrl')}
                        />
                    </div>
                </Col>
            </Row>
            <Row className="align-items-start">
                <Col md={7}>
                    <div className="home-section">
                        <h6 className="section-heading">
                            {window.findProp("pages.home.techBlogHeader")}
                            <a href="/contents/tech" className="show-all">
                                {window.findProp("pages.home.techBlogShowAll")}
                            </a>
                        </h6>
                        <p className="section-sub">{window.findProp("pages.home.techBlogTag")}</p>
                        <SeriesList type="contents.swe" limit={5} truncateAt={55} flat />
                    </div>
                </Col>
                <Col md={5}>
                    <div className="home-section">
                        <h6 className="section-heading">
                            {window.findProp("pages.home.musicBlogHeader")}
                            <a href="/contents/music" className="show-all">
                                {window.findProp("pages.home.musicBlogShowAll")}
                            </a>
                        </h6>
                        <p className="section-sub">{window.findProp("pages.home.musicBlogTag")}</p>
                        <SeriesList type="contents.music" limit={5} truncateAt={55} flat />
                    </div>
                </Col>
            </Row>
        </Container>
    </>
}

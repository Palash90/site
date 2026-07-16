import { Col, Container, Image, Row } from "react-bootstrap";
import PageIntro from "./PageIntro";
import SeriesList from "./SeriesList";
import Starfield from "./Starfield";

const organizations = [
  { name: "Infosys", logo: "https://www.vectorlogo.zone/logos/infosys/infosys-ar21.svg", url: "https://www.infosys.com" },
  { name: "HPE", logo: "https://www.vectorlogo.zone/logos/hewlett_packard_enterprise/hewlett_packard_enterprise-icon.svg", url: "https://www.hpe.com" },
  { name: "GE Renewable Energy", logo: "https://www.vectorlogo.zone/logos/ge/ge-icon.svg", url: "https://www.ge.com/renewableenergy" },
  { name: "Oracle", logo: "https://www.vectorlogo.zone/logos/oracle/oracle-icon.svg", url: "https://www.oracle.com" },
  { name: "HCL Technologies", logo: "https://www.vectorlogo.zone/logos/hcl/hcl-icon.svg", url: "https://www.hcltech.com" },
  { name: "Cognizant", logo: "https://www.vectorlogo.zone/logos/cognizanttechnology/cognizanttechnology-icon.svg", url: "https://www.cognizant.com" },
];

const timeline = [
  { role: "Senior Technologist", company: "Infosys", start: "Nov 2024", end: "Present" },
  { role: "Cloud Developer III", company: "HPE", start: "Dec 2022", end: "Nov 2024" },
  { role: "Sr. Software Engineer", company: "GE Renewable Energy", start: "Dec 2018", end: "Nov 2022" },
  { role: "Sr. Applications Engineer", company: "Oracle", start: "Jan 2016", end: "Dec 2018" },
  { role: "Sr. Software Engineer", company: "HCL Technologies", start: "Nov 2014", end: "Nov 2015" },
  { role: "Programmer Analyst", company: "Cognizant", start: "Nov 2011", end: "Oct 2014" },
];

const techStack = ["React.js", "Python", "Rust", "JavaScript", "C#", "Node.js", "System Design", "Distributed Systems", "Cloud Architecture", "Machine Learning"];

const openSourceProjects = [
  { name: "Iron Learn", desc: "A pure Rust ML library", url: "https://github.com/Palash90/iron_learn", type: "Rust" },
  { name: "HDL Emulator", desc: "Web-based HDL emulator for teaching", url: "https://github.com/Palash90/emulator", type: "JavaScript" },
  { name: "Distributed File System", desc: "DFS inspired by Google File System", url: "https://github.com/Palash90/dist-fs", type: "Java" },
];

export default function Home() {
    return <>
        <Starfield />
        <Container className={"home-page " + window.findProp("pages.home.class")} fluid>
            <PageIntro
                h1={(window.findProp('pages.home.greeting') || '') + (window.findProp('shortName') || '')}
                p={window.findProp('pages.home.tag')}
                h1Color={window.findProp("pages.home.h1Color")}
                pColor={window.findProp("pages.home.pColor")}
            />
            <Row className="align-items-center mb-5">
                <Col md={7}>
                    <div className="bio-text" style={{ whiteSpace: "pre-line", lineHeight: 1.85 }}>
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
            <Row className="mb-4">
                <Col>
                    <div className="professional-summary">
                        <Row className="text-center">
                            <Col md={3}>
                                <div className="stat-item stat-hover-wrapper">
                                    <div className="stat-number">14+</div>
                                    <div className="stat-label">Years Experience</div>
                                    <div className="timeline-tooltip">
                                        {timeline.map((item, i) => (
                                            <div className="timeline-item" key={i}>
                                                <div className="timeline-info">
                                                    <div className="timeline-role">{item.role}</div>
                                                    <div className="timeline-company">{item.company}</div>
                                                    <div className="timeline-dates">{item.start} — {item.end}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="stat-item stat-hover-wrapper">
                                    <div className="stat-number">5+</div>
                                    <div className="stat-label">Organizations</div>
                                    <div className="org-tooltip">
                                        {organizations.map((org, i) => (
                                            <a href={org.url} target="_blank" rel="noopener noreferrer" className="org-item" key={i}>
                                                <img src={org.logo} alt={org.name} className="org-logo" />
                                                <span>{org.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="stat-item stat-hover-wrapper">
                                    <div className="stat-number">11+</div>
                                    <div className="stat-label">Technologies</div>
                                    <div className="tech-tooltip">
                                        <div className="tech-tooltip-tags">
                                            {techStack.map((tech, i) => (
                                                <span className="tech-tooltip-tag" key={i}>{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="stat-item stat-hover-wrapper">
                                    <div className="stat-number">3</div>
                                    <div className="stat-label">Open Source</div>
                                    <div className="projects-tooltip">
                                        {openSourceProjects.map((proj, i) => (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="project-item" key={i}>
                                                <div className="project-name">{proj.name}</div>
                                                <div className="project-desc">{proj.desc}</div>
                                                <div className="project-type">{proj.type}</div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}>
                    <div className="home-section tech-stack-section">
                        <h6 className="section-heading">Technologies</h6>
                        <div className="tech-tags">
                            <span className="tech-tag primary">React.js</span>
                            <span className="tech-tag primary">Python</span>
                            <span className="tech-tag primary">Rust</span>
                            <span className="tech-tag">System Design</span>
                            <span className="tech-tag">Distributed Systems</span>
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="home-section expertise-section">
                        <h6 className="section-heading">Expertise</h6>
                        <ul className="expertise-list">
                            <li>Full Stack Dev</li>
                            <li>Cloud Architecture & Dev</li>
                            <li>Machine Learning</li>
                            <li>System Design and Architecture</li>
                        </ul>
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

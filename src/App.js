import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, useNavigate, useLocation } from "react-router-dom";
import RouteResolver from './components/RouteResolver';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { FaRegCopyright, FaUserCircle, FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { RiMailSendFill } from 'react-icons/ri';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import ReactGA from 'react-ga4';
import useTracker from './hooks/useTracker';
import { ConfigProvider, useConfig } from './config/findProp';

const isLiveDomain = window.location.hostname.endsWith('palashkantikundu.in');

if (isLiveDomain) {
  ReactGA.initialize('G-R0XE0Q4Z0Q');
}

function RouteTracker() {
  const location = useLocation();
  React.useEffect(() => {
    if (!isLiveDomain) return;
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);
  useTracker();
  return null;
}

function Header({ siteName, navLinks }) {
  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, logout } = useAuth();

  const profileLink = profile?.username
    ? `/profile/@${profile.username}`
    : user ? `/profile/${user.uid}` : "";

  const displayName = profile?.displayName || user?.displayName || user?.email || "";

  return (
    <>
      <Navbar expanded={expanded} onToggle={(val) => setExpanded(val)} expand="lg" bg="dark" className="border-bottom border-light border-opacity-10 py-1" sticky='top'>
      <Container fluid>
        <Navbar.Brand href="/" onClick={() => setExpanded(false)}>{siteName}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-lg-end flex-grow-1 pe-6">
            {(navLinks || []).map((l) => (
              <Nav.Link key={l.link} href={l.link} onClick={() => setExpanded(false)}>
                {l.label}
              </Nav.Link>
            ))}
            {user && (
              <Nav.Link onClick={() => { setExpanded(false); navigate("/contents/scores"); }}>
                All Scores
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-lg-center">
            {loading ? null : !user ? (
              <Nav.Link onClick={() => { setExpanded(false); navigate("/login?redirect=" + encodeURIComponent(location.pathname)); }}>Login</Nav.Link>
            ) : (
              <NavDropdown
                align="end"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaUserCircle size={18} />
                    <span className="small text-light">{displayName}</span>
                  </span>
                }
                id="user-dropdown"
                menuVariant="dark"
              >
                <NavDropdown.Item onClick={() => { setExpanded(false); navigate(profileLink); }}>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => { setExpanded(false); navigate("/contents/scores"); }}>
                  My Scores
                </NavDropdown.Item>
                {profile?.role === "moderator" && (
                  <NavDropdown.Item onClick={() => { setExpanded(false); navigate("/moderate"); }}>
                    Moderate
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => {
                  setExpanded(false);
                  logout();
                  const p = window.location.pathname;
                  if (p.startsWith("/contents/") || p === "/setup-username") navigate("/");
                }}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  );
}

function Footer({ siteName }) {
  return <Navbar className="site-footer border-top border-light border-opacity-10 flex-column" sticky='bottom'>
    <Container fluid className='justify-content-center footer-socials'>
      <a href="https://github.com/palash90" target="_blank" rel="noreferrer"><FaGithub /></a>
      <a href="https://linkedin.com/in/palash90" target="_blank" rel="noreferrer"><FaLinkedin /></a>
      <a href="https://www.youtube.com/@GuitaleleTutorials" target="_blank" rel="noreferrer"><FaYoutube /></a>
      <a href="mailto:connect@palashkantikundu.in" target="_blank" rel="noreferrer"><RiMailSendFill /></a>
    </Container>
    <Container fluid className='justify-content-center'>
      <Navbar.Text style={{ fontSize: '11px', lineHeight: '1' }}><FaRegCopyright size={10} /> {(siteName || "Site") + " " + new Date().getFullYear()}</Navbar.Text>
    </Container>
  </Navbar>;
}


function AppShell() {
  const { config } = useConfig();
  const siteName = config?.name || "Site";
  const navLinks = config?.navLinks || [];
  const pageStyle = config?.pages?.home?.mainStyle || "";

  return (
    <div className={pageStyle}>
      <Header siteName={siteName} navLinks={navLinks} />
      <RouteResolver />
      <Footer siteName={siteName} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteTracker />
        <ConfigProvider>
          <AppShell />
        </ConfigProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;


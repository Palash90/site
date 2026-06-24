import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import RouteResolver from './components/RouteResolver';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { FaRegCopyright, FaUserCircle } from 'react-icons/fa';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import ReactGA from 'react-ga4';
ReactGA.initialize('G-R0XE0Q4Z0Q');
ReactGA.send({hitType:"pageview",page:window.location.pathname+window.location.search});

function Header() {
  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();
  const { user, profile, loading, logout } = useAuth();

  const profileLink = profile?.username
    ? `/profile/@${profile.username}`
    : user ? `/profile/${user.uid}` : "";

  const displayName = profile?.displayName || user?.displayName || user?.email || "";

  return (
    <>
      <style>{`.navbar.sticky-top { z-index: 1030 !important; } .dropdown-menu { z-index: 10060 !important; }`}</style>
      <Navbar expanded={expanded} onToggle={(val) => setExpanded(val)} expand="lg" bg="dark" style={{ borderBottom: "1px solid" }} sticky='top'>
      <Container fluid>
        <Navbar.Brand href="/" onClick={() => setExpanded(false)}>{window.findProp("name")}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end flex-grow-1 pe-6">
            {window.findProp("navLinks").map((l) => {
              if (user && l.label && l.label.toLowerCase().includes("tech")) {
                return (
                  <Nav.Link key="scores" onClick={() => { setExpanded(false); navigate("/contents/scores"); }}>
                    All Scores
                  </Nav.Link>
                );
              }
              return (
                <Nav.Link key={l.link} href={l.link} onClick={() => setExpanded(false)}>
                  {l.label}
                </Nav.Link>
              );
            })}
          </Nav>
          <Nav className="align-items-center">
            {loading ? null : !user ? (
              <Nav.Link onClick={() => { setExpanded(false); navigate("/login"); }}>Login</Nav.Link>
            ) : (
              <NavDropdown
                align="end"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaUserCircle size={24} />
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
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => { setExpanded(false); logout(); navigate("/"); }}>
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

function Footer() {
  return <Navbar bg="dark" style={{ borderTop: "1px solid" }} sticky='bottom'>
    <Container fluid className='justify-content-center'>
      <Navbar.Text><FaRegCopyright size={15} /> {window.findProp("name") + " " + new Date().getFullYear()}  </Navbar.Text>
    </Container>
  </Navbar>;
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className={window.findProp("pages.home.mainStyle")}>
          <Header/>
          <RouteResolver />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


import 'bootstrap/dist/css/bootstrap.min.css';
import RouteResolver from './components/RouteResolver';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { FaRegCopyright, FaUserCircle } from 'react-icons/fa';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import ReactGA from 'react-ga4';
ReactGA.initialize('G-R0XE0Q4Z0Q');
ReactGA.send({hitType:"pageview",page:window.location.pathname+window.location.search});

function Header() {
  const [expanded, setExpanded] = React.useState(false);
  const { user, profile, logout } = useAuth();

  const profileLink = profile?.username
    ? `/profile/@${profile.username}`
    : user ? `/profile/${user.uid}` : "";

  return (
    <Navbar expanded={expanded} onToggle={(val) => setExpanded(val)} expand="lg" bg="dark" style={{ borderBottom: "1px solid" }} sticky='top'>
      <Container fluid>
        <Navbar.Brand href="/" onClick={() => setExpanded(false)}>{window.findProp("name")}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end flex-grow-1 pe-6">
            {
              window.findProp("navLinks").map((l) => (
                <Nav.Link key={l.link} href={l.link} onClick={() => setExpanded(false)}>{l.label}</Nav.Link>
              ))
            }
            {!user && (
              <Nav.Link href="/login" onClick={() => setExpanded(false)}>Login</Nav.Link>
            )}
          </Nav>
          {user && (
            <Nav className="align-items-center gap-2 ms-3">
              <a href={profileLink} className="text-decoration-none d-flex align-items-center text-light" title="View profile">
                <FaUserCircle size={24} />
              </a>
              <a href={profileLink} className="text-light small text-decoration-none">{profile?.displayName || user.displayName || user.email}</a>
              <Button variant="outline-light" size="sm" onClick={logout}>Logout</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
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
      <div className={window.findProp("pages.home.mainStyle")}>
        <Header/>
        <RouteResolver />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;


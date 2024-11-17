import 'bootstrap/dist/css/bootstrap.min.css';
import RouteResolver from './components/RouteResolver';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FaRegCopyright } from 'react-icons/fa';

import React, { useState, useEffect } from 'react';

import ReactGA from 'react-ga4';
ReactGA.initialize('G-R0XE0Q4Z0Q');
ReactGA.pageview(window.location.pathname + window.location.search);

function Header() {
  return (<Navbar expand="lg" bg="dark" style={{ borderBottom: "1px solid" }} sticky='top'>
    <Container fluid>
      <Navbar.Brand href="/">{window.findProp("name")}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="justify-content-end flex-grow-1 pe-6">
          {
            window.findProp("navLinks").map((l) => <Nav.Link key={l.link} href={l.link}>{l.label}</Nav.Link>)
          }
        </Nav>
        <br />
      </Navbar.Collapse>
    </Container>
  </Navbar>);
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
    <div className={window.findProp("pages.home.mainStyle")}>
      <Header/>
      <RouteResolver />
      <Footer />
    </div>
  );
}

export default App;


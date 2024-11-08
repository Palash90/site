import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import RouteResolver from './components/RouteResolver';
import { CCircle } from 'react-bootstrap-icons';
import findProp from './components/data';
import { Container, Nav, Navbar } from 'react-bootstrap';

function Header() {
  return (<Navbar bg="dark" style={{ borderBottom: "1px solid" }} sticky='top'>
      <Container fluid>
          <Navbar.Brand href="/">{findProp("name")}</Navbar.Brand>
          <Nav className="justify-content-end flex-grow-1 pe-6">
              {
                  findProp("navLinks").map((l) => <Nav.Link href={l.link}>{l.label}</Nav.Link>)
              }
          </Nav>
          <br />
      </Container>
  </Navbar>);
}

function Footer() {
  return <Navbar bg="dark" style={{ borderTop: "1px solid" }} sticky='bottom'>
    <Container fluid className='justify-content-center'>
      <Navbar.Text><CCircle size={15} /> {findProp("name") + " " + new Date().getFullYear()}  </Navbar.Text>
    </Container>
  </Navbar>;
}


function App() {
  return (
    <div className='lora-app'>
      <Header />
      <br />
      <RouteResolver />
      <br />
      <Footer />
    </div>
  );
}

export default App;


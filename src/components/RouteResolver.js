import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./Home"
import Projects from "./Projects"
import About from "./About"
import Contents from "./Contents"
import Content from "./Content"
import CustomComponent from "./CustomComponent"
import { Container, Alert } from "react-bootstrap"
import TabViewerDemo from "./tab-viewer/TabViewerDemo"
import TabShorthandParser from "./tab-viewer/TabShorthandParser"
import Login from "./Login"
import SetupUsername from "./SetupUsername"
import Profile from "./Profile"
import ProfileEdit from "./ProfileEdit"
import { useAuth } from "../contexts/AuthContext"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function VerifiedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!user.emailVerified) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 500 }}>
        <Alert variant="warning">
          <Alert.Heading>Email not verified</Alert.Heading>
          <p className="mb-0 small">Please verify your email before accessing the score editor. Check your inbox for a verification link.</p>
        </Alert>
      </Container>
    );
  }
  return children;
}

export default function RouteResolver() {
  return (
    <Container fluid className={window.findProp("pages.home.secondaryStyle") + " m-1"} >
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/contents' element={<Contents />} />
        <Route path='/contents/:type' element={<Contents />} />
        <Route path='/content/:username/:instrument/:titleSlug' element={<Content />} />
        <Route path='/content/:contentId' element={<Content />} />
        <Route path='/projects' element={<Projects />} />
        <Route path='/tab-demo' element={<TabViewerDemo />} />
        <Route path='/tab-parser' element={<VerifiedRoute><TabShorthandParser /></VerifiedRoute>} />
        <Route path='/component/:componentId' element={<CustomComponent />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<Login />} />
        <Route path='/setup-username' element={<ProtectedRoute><SetupUsername /></ProtectedRoute>} />
        <Route path='/profile/:identifier' element={<Profile />} />
        <Route path='/profile/edit' element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      </Routes>
    </Container>
  )
}

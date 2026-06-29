import React, { Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Container, Alert, Spinner } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"

const Home = React.lazy(() => import("./Home"))
const Projects = React.lazy(() => import("./Projects"))
const About = React.lazy(() => import("./About"))
const Contents = React.lazy(() => import("./Contents"))
const Content = React.lazy(() => import("./Content"))
const CustomComponent = React.lazy(() => import("./CustomComponent"))
const TabViewerDemo = React.lazy(() => import("./tab-viewer/TabViewerDemo"))
const TabShorthandParser = React.lazy(() => import("./tab-viewer/TabShorthandParser"))
const Login = React.lazy(() => import("./Login"))
const Analytics = React.lazy(() => import("./Analytics"))
const SetupUsername = React.lazy(() => import("./SetupUsername"))
const Profile = React.lazy(() => import("./Profile"))
const ProfileEdit = React.lazy(() => import("./ProfileEdit"))
const Moderate = React.lazy(() => import("./Moderate"))

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

function ModeratorRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (profile?.role !== "moderator") return <Navigate to="/" />;
  return children;
}

function Fallback() {
  return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="light" />
    </Container>
  );
}

export default function RouteResolver() {
  return (
    <Container fluid className={window.findProp("pages.home.secondaryStyle") + " m-1"} >
      <Suspense fallback={<Fallback />}>
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
          <Route path='/analytics' element={<Analytics />} />
          <Route path='/about' element={<About />} />
          <Route path='/login' element={<Login />} />
          <Route path='/setup-username' element={<ProtectedRoute><SetupUsername /></ProtectedRoute>} />
          <Route path='/profile/:identifier' element={<Profile />} />
          <Route path='/profile/edit' element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path='/moderate' element={<ModeratorRoute><Moderate /></ModeratorRoute>} />
        </Routes>
      </Suspense>
    </Container>
  )
}

import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./Home"
import Projects from "./Projects"
import About from "./About"
import Contents from "./Contents"
import Content from "./Content"
import CustomComponent from "./CustomComponent"
import { Container } from "react-bootstrap"
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

export default function RouteResolver() {
    return (
        <Container fluid className={window.findProp("pages.home.secondaryStyle") + " m-1"} >
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/contents' element={<Contents />} />
                <Route path='/contents/:type' element={<Contents />} />
                <Route path='/content/:contentId' element={<Content />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/tab-demo' element={<TabViewerDemo />} />
                <Route path='/tab-parser' element={<ProtectedRoute><TabShorthandParser /></ProtectedRoute>} />
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

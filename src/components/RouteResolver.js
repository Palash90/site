import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./Home"
import Projects from "./Projects"
import About from "./About"
import Project from "./Project"
import Blog from "./Blog"
import Blogs from "./Blogs"

export default function RouteResolver() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/blogs' element={<Blogs />} />
                <Route path='/blog/:blogId' element={<Blog />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/project/:projectId' element={<Project />} />
                <Route path='/about' element={<About />} />
            </Routes>
        </Router>
    )
}
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./Home"
import Projects from "./Projects"
import About from "./About"
import Project from "./Project"
import Contents from "./Contents"
import Content from "./Content"

export default function RouteResolver() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/contents' element={<Contents />} />
                <Route path='/content/:contentId' element={<Content />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/project/:projectId' element={<Project />} />
                <Route path='/about' element={<About />} />
            </Routes>
        </Router>
    )
}
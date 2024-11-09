import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./Home"
import Projects from "./Projects"
import About from "./About"
import Contents from "./Contents"
import Content from "./Content"
import CustomComponent from "./CustomComponent"

export default function RouteResolver() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/contents' element={<Contents />} />
                <Route path='/content/:contentId' element={<Content />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/component/:componentId' element={<CustomComponent />} />
                <Route path='/about' element={<About />} />
            </Routes>
        </Router>
    )
}
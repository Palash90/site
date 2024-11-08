const data = {
    name: "Palash Kanti Kundu",
    labels: {
        blogs: "Blogs",
        projects: "Projects",
        swe: "Software Engineering",
        music: "Music",
        blogNotExists: "Blog does not exist"
    },
    navLinks: [
        { label: "Home", link: "/" },
        { label: "Blogs", link: "/blogs" },
        { label: "Projects", link: "/projects" },
        { label: "About", link: "/about" }
    ],
    blogs: {
        swe: [
            { id: "tic-tac-toe", publishDate: "Jan 2014", title: "Tic Tac Toe", url: "https://raw.githubusercontent.com/Palash90/tic-tac-slide/refs/heads/main/README.md" }
        ],
        music: [
            { id: 1, publishDate: "Jan 2014", title: "Youtube", url: "/blog/1" }
        ]
    },
    projects: [
        { id: 1, name: "Iron Learn", desc: "A pure Rust Machine Learning Library", type: "Rust", url: "https://github.com/Palash90/iron_learn" },
        { id: 1, name: "HDL Emulator", desc: "An online Web Based HDL Emulator for Teaching Purpose", type: "Component", url: "/component/hdlEmulator" }
    ],
    about: {
        jobs: [
            { name: "Cognizant Technology Solutions", start: "December 2022", end: "Present", location: "Bengaluru, India", role: "Cloud Deverloper III" },
            { name: "GE Renewable Energy", start: "December 2018", end: "November 2022", location: "Hyderabad, India", role: "Senior Software Engineer" },
            { name: "Oracle India Pvt. Ltd.", start: "January 2016", end: "December 2018", location: "Hyderabad, India", role: "Senior Applications Engineer" },
            { name: "HCL Technologies", start: "November 2014", end: "November 2015", location: "Kolkata, India", role: "Senior Software Engineer" },
            { name: "Cognizant Technology Solutions", start: "November 2011", end: "October 2014", location: "Kolkata, India", role: "Programmer Analyst" },
        ],
        education: [
            { institution: "College of Engineering and Management, Kolaghat", start: "July 2007", end: "Jun 2011", degree: "Bachelor of Technology" }
        ]
    }
}

export default function findProp(prop, defval) {
    var obj = data
    prop = prop.split('.');
    for (var i = 0; i < prop.length; i++) {
        if (typeof obj[prop[i]] == 'undefined')
            return null;
        obj = obj[prop[i]];
    }
    return obj;
}
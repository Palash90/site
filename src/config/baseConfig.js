// Common site configuration — bundled with app so page renders even without GitHub Pages
// Only blog/article contents are fetched from GitHub Pages at runtime.

const baseConfig = {
  "name": "Palash Kanti Kundu",
  "shortName": "Palash",
  "labels": {
    "contents": "Blogs",
    "projects": "Projects",
    "swe": "Software Engineering",
    "music": "Music",
    "contentNotExists": "Content does not exist",
    "publishedOn": "Published on: ",
    "lastUpdated": "Last updated on: "
  },
  "pages": {
    "contents": {
      "header": "Blogs",
      "techHeader": "Tech Blogs",
      "musicHeader": "Music Blogs",
      "intro": "Software Engineering is what I do for a living, music is what I do to live. Here you can find both.",
      "techIntro": "Code, Insights, and the Art of Problem-Solving.",
      "musicIntro": "Exploring the World of Music, One Post at a Time.",
      "itemsPerPage": 50,
      "techBlogClass": "tech-blog-content markdown-color",
      "musicBlogClass": "blog-content markdown-color",
      "genericBlogClass": "blog-content markdown-color",
      "sweHeadColor": "",
      "musicHeadColor": "",
      "h1Color": "",
      "pColor": "",
      "linkClass": ""
    },
    "home": {
      "tag": "Crafting code, creating harmony.",
      "greeting": "Hi, I'm ",
      "moto": "My moto: ",
      "motos": [
        "Code",
        "Create",
        "Inspire"
      ],
      "desc": "I’m a software engineer with 14 years of experience, specializing in tech stacks like Java, Python, C#, React.js and Rust. Apart from my day-to-day office work, I’ve built a machine learning library, implemented parts of a distributed system, few react.js based games, and am passionate about system design. I also contribute to community through my blogs to share insights and learnings. \n \n  Outside of software engineering, I pursue music, specifically creating guitalele tutorials, which helps me stay creative and balanced.\n\n",
      "profilePicUrl": "https://palash90.github.io/site-assets/assets/profile.jpg",
      "mainStyle": "main-app-lora custom-theme",
      "secondaryStyle": "content-body-opensans",
      "class": "",
      "techBlogHeader": "Recent Tech Blogs | ",
      "techBlogTag": "Things I learned or implemented recently",
      "techBlogShowAll": "Show All",
      "musicBlogHeader": "Recent Music Blogs | ",
      "musicBlogShowAll": "Show All",
      "musicBlogTag": "Things I explored recently",
      "h1Color": "",
      "pColor": ""
    },
    "projects": {
      "intro": "If any idea catches my attention, I try to implement the same.",
      "techStack": "Technology: ",
      "h1Color": "",
      "pColor": "",
      "titleColor": "",
      "bodyColor": ""
    },
    "about": {
      "mdUrl": "https://palash90.github.io/site-assets/assets/ME.md",
      "resume": "https://palash90.github.io/site-assetsPalash_Kanti_Kundu_14YOE_BackEnd_AI.pdf",
      "resumeName": "Palash_Kanti_Kundu_14YOE_BackEnd_AI.pdf",
      "blogClass": "blog-content markdown-color"
    }
  },
  "techStack": {
    "iconColor": {
      "rust": "#B7410E",
      "java": "blue",
      "javascript": "red",
      "react": "teal"
    },
    "title": {
      "rust": "Rust",
      "java": "Java",
      "javascript": "JavaScript",
      "react": "React.js"
    }
  },
  "navLinks": [
    {
      "label": "Home",
      "link": "/"
    },
    {
      "label": "Tech Blogs",
      "link": "/contents/tech"
    },
    {
      "label": "Music Blogs",
      "link": "/contents/music"
    },
    {
      "label": "Projects",
      "link": "/projects"
    },
    {
      "label": "About",
      "link": "/about"
    }
  ],
  "projects": [
    {
      "id": "iron-learn",
      "name": "Iron Learn",
      "desc": "A pure Rust Machine Learning Library",
      "type": "rust",
      "githubUrl": "https://github.com/Palash90/iron_learn",
      "mdUrl": "https://raw.githubusercontent.com/Palash90/iron_learn/refs/heads/main/README.md"
    },
    {
      "id": "hdl-emulator",
      "name": "HDL Emulator",
      "desc": "An online Web Based HDL Emulator for Teaching Purpose",
      "type": "javascript",
      "playUrl": "https://emulator.palashkantikundu.in/",
      "githubUrl": "https://github.com/Palash90/emulator",
      "mdUrl": "https://raw.githubusercontent.com/Palash90/emulator/refs/heads/main/README.md"
    },
    {
      "id": "dist-fs",
      "name": "Distributed File System",
      "desc": "A simple distributed file system implementation",
      "type": "java",
      "githubUrl": "https://github.com/Palash90/dist-fs",
      "mdUrl": "https://raw.githubusercontent.com/Palash90/dist-fs/refs/heads/main/README.md"
    },
    {
      "id": "tic-tac-slide",
      "name": "Tic Tac Slide",
      "desc": "An innovation over simple tic tac toe for added fun",
      "type": "react",
      "playUrl": "/component/tic-tac-slide",
      "githubUrl": ""
    },
    {
      "id": "study",
      "name": "Quiz App",
      "desc": "A simple quiz game for kids.",
      "type": "react",
      "playUrl": "/component/study",
      "githubUrl": ""
    }
  ],
  "about": {
    "jobs": [
      {
        "name": "Hewlett Packard Enterprise",
        "start": "December 2022",
        "end": "Present",
        "location": "Bengaluru, India",
        "role": "Cloud Deverloper III"
      },
      {
        "name": "GE Renewable Energy",
        "start": "December 2018",
        "end": "November 2022",
        "location": "Hyderabad, India",
        "role": "Senior Software Engineer"
      },
      {
        "name": "Oracle India Pvt. Ltd.",
        "start": "January 2016",
        "end": "December 2018",
        "location": "Hyderabad, India",
        "role": "Senior Applications Engineer"
      },
      {
        "name": "HCL Technologies",
        "start": "November 2014",
        "end": "November 2015",
        "location": "Kolkata, India",
        "role": "Senior Software Engineer"
      },
      {
        "name": "Cognizant Technology Solutions",
        "start": "November 2011",
        "end": "October 2014",
        "location": "Kolkata, India",
        "role": "Programmer Analyst"
      }
    ],
    "education": [
      {
        "institution": "College of Engineering and Management, Kolaghat",
        "start": "July 2007",
        "end": "Jun 2011",
        "degree": "Bachelor of Technology"
      }
    ]
  },
  "test": "Hello Main committed by github action flow",
  "try": "try once again"
};

export default baseConfig;

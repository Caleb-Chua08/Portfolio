export const profile = {
  name: "Caleb Chua Yang Yang",
  headline: "Software & System Engineer",
  pronouns: "He/Him",
  location: "Subang Jaya, Selangor, Malaysia",
  linkedin: "https://linkedin.com/in/caleb-c-a9a678202",
  about: [
    "I'm a Software Engineer with an engineering background and a passion for building reliable software that connects machines, data, and people.",
    "My experience spans C++, C#, Python, PHP, JavaScript, and SQL, with a strong focus on manufacturing software, machine integration, data tracking, and automation. I develop and maintain software that supports real-world production environments—from machine control and data collection to manufacturing management systems and database solutions.",
  ],
};

export type Experience = {
  role: string;
  company: string;
  period: string;
  location: string;
  type: string;
  bullets: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    role: "Software and System Engineer",
    company: "Sensata Technologies",
    period: "Aug 2025 — Present",
    location: "Subang Jaya, Selangor, Malaysia",
    type: "Full-time · On-site",
    bullets: [
      "Develop and maintain C++ and C# manufacturing applications supporting machine operations, production processes, and data tracking.",
      "Enhance an internal manufacturing management system using PHP, JavaScript, HTML, CSS, and SQL Server.",
      "Develop C# data-tracking clients for new machine integration with SQL Server.",
      "Troubleshoot Windows-based software, database, communication, and hardware integration issues; collaborate with cross-functional engineering teams on development and production support.",
    ],
    tags: ["C++", "C#", "SQL Server", "PHP", "JavaScript", "Windows"],
  },
  {
    role: "System and Project Engineer",
    company: "Precision Control Sdn. Bhd.",
    period: "May 2023 — Aug 2025",
    location: "Shah Alam, Selangor, Malaysia",
    type: "Full-time · On-site",
    bullets: [
      "Developed SCADA functionality such as event logging and trend monitoring using VB script.",
      "Tested and troubleshot hardware and software issues during Factory Acceptance Tests for MCC/PLC panels.",
      "Designed and drew PLC panels for fabrication and site termination using EPLAN and AutoCAD.",
      "Supported customers with site program modifications and troubleshooting during production.",
    ],
    tags: ["PLC", "SCADA", "EPLAN", "AutoCAD", "VB Script", "FAT"],
  },
];

export const education = {
  school: "UCSI University",
  degree: "Bachelor of Mechatronics Engineering (Hons)",
  field: "Engineering",
  period: "May 2019 — May 2023",
  cgpa: "3.91",
};

export type Project = {
  name: string;
  tagline: string;
  bullets: string[];
  tags: string[];
  githubUrl: string;
};

export const projects: Project[] = [
  {
    name: "SmartCopy",
    tagline: "Folder Comparison & Safe-Copy Desktop App",
    bullets: [
      "Developed a local-first PySide6 desktop application that compares two folder trees byte-for-byte and applies a user-approved copy plan, ensuring no file is modified without explicit confirmation.",
      "Built a side-by-side diff viewer with line-level change transfer, in-pane text editing, and conflict resolution actions (keep source / destination / newer, merge), backed by a standalone filesystem engine that performs atomic temp-file replacement to prevent data corruption.",
      "Established a 22-test unittest suite with headless GUI smoke tests and a GitHub Actions pipeline that validates every commit on Ubuntu and Windows across Python 3.11 and 3.12.",
    ],
    tags: ["Python", "PySide6 (Qt)", "Unittest", "Desktop GUI Development"],
    githubUrl: "https://github.com/Caleb-Chua08/SmartCopy",
  },
  {
    name: "Selenium Automated Testing",
    tagline: "E-Commerce Website Testing",
    bullets: [
      "Developed a Selenium-based automated testing framework for an e-commerce platform, ensuring efficient functionality validation with high test coverage.",
      "Implemented browser automation using Selenium WebDriver and Python's unittest framework to test product search, cart operations, price calculations, and filtering features.",
      "Streamlined the testing process by automating critical user interactions and ensuring consistent test execution across different browsers.",
    ],
    tags: ["Selenium", "Python", "Unittest", "Web Automation"],
    githubUrl: "https://github.com/Caleb-Chua08/Selenium-Test-with-Unittest",
  },
];

export type Certification = {
  name: string;
  issuer: string;
  date: string | null;
  image?: string;
  verifyUrl?: string;
};

export const certifications: Certification[] = [
  {
    name: "Hands-on Introduction to Linux Commands and Shell Scripting",
    issuer: "IBM",
    date: "Apr 2025",
    image: "/certificates/ibm-linux-shell-scripting.png",
    verifyUrl: "https://www.coursera.org/account/accomplishments/verify/T4HG1R8JSHNO",
  },
  {
    name: "Learn Intermediate Python 3: Exceptions and Unit Testing",
    issuer: "Codecademy",
    date: "Mar 2025",
    image: "/certificates/codecademy-python-exceptions-unit-testing.png",
  },
  {
    name: "Pass the Technical Interview with Java",
    issuer: "Codecademy",
    date: "Feb 2025",
    image: "/certificates/codecademy-java-technical-interview.png",
  },
  {
    name: "Learn Object Oriented Programming (OOP) with C++",
    issuer: "Codecademy",
    date: "Dec 2024",
    image: "/certificates/codecademy-cpp-oop.png",
  },
  {
    name: "Python (Basic)",
    issuer: "HackerRank",
    date: "Aug 2024",
    image: "/certificates/hackerrank-python-basic.png",
    verifyUrl: "https://www.hackerrank.com/certificates/fa96bfbd67cb",
  },
  {
    name: "Foundational C# with Microsoft",
    issuer: "freeCodeCamp",
    date: "Aug 2024",
    image: "/certificates/freecodecamp-foundational-csharp.png",
    verifyUrl: "https://freecodecamp.org/certification/CalebChuaYangYang/foundational-c-sharp-with-microsoft",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Programming Languages",
    items: ["C++", "C#", "Python", "PHP", "SQL"],
  },
  {
    group: "Software Development",
    items: ["Multithreading", "Concurrency", "Software Testing & Debugging", "Version Control"],
  },
  {
    group: "Development Tools",
    items: ["Git", "GitHub", "VS Code"],
  },
  {
    group: "Languages",
    items: ["English", "Malay", "Chinese (Conversational)"],
  },
];

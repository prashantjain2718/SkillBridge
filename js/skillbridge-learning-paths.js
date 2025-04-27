import { auth, initializeAuth, checkAuth, handleLogout, protectRoute } from '../js/auth.js';
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();

// Default learning paths with enhanced structure
const defaultPaths = [
    {
        id: 'fullstack',
        title: 'Full Stack Development',
        difficulty: 'intermediate',
        description: 'Master both frontend and backend development with the MERN stack. Build complete web applications from scratch.',
        duration: '6 months',
        modules: '12 modules',
        icon: 'fa-code',
        topics: [
            {
                title: 'Frontend Fundamentals',
                items: ['HTML5 & CSS3', 'JavaScript ES6+', 'Responsive Design', 'CSS Frameworks']
            },
            {
                title: 'Frontend Frameworks',
                items: ['React.js', 'State Management', 'Component Architecture', 'Modern UI/UX']
            },
            {
                title: 'Backend Development',
                items: ['Node.js', 'Express.js', 'RESTful APIs', 'Authentication']
            },
            {
                title: 'Database & Deployment',
                items: ['MongoDB', 'Database Design', 'Cloud Deployment', 'DevOps Basics']
            }
        ],
        url: 'https://roadmap.sh/full-stack'
    },
    {
        id: 'frontend',
        title: 'Frontend Development',
        difficulty: 'intermediate',
        description: 'Become a frontend expert with modern JavaScript frameworks and best practices.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-laptop-code',
        topics: [
            {
                title: 'Core Technologies',
                items: ['HTML5', 'CSS3', 'JavaScript', 'DOM Manipulation']
            },
            {
                title: 'Modern Frameworks',
                items: ['React', 'Vue.js', 'Angular', 'State Management']
            },
            {
                title: 'Advanced Concepts',
                items: ['TypeScript', 'Web Components', 'PWA', 'Performance Optimization']
            },
            {
                title: 'Tools & Testing',
                items: ['Webpack', 'Jest', 'Cypress', 'CI/CD']
            }
        ],
        url: 'https://roadmap.sh/frontend'
    },
    {
        id: 'backend',
        title: 'Backend Development',
        difficulty: 'intermediate',
        description: 'Master server-side development with various technologies and architectures.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-server',
        topics: [
            {
                title: 'Server Technologies',
                items: ['Node.js', 'Python', 'Java', 'Go']
            },
            {
                title: 'Frameworks',
                items: ['Express', 'Django', 'Spring Boot', 'Gin']
            },
            {
                title: 'Database Systems',
                items: ['SQL', 'NoSQL', 'ORM', 'Database Design']
            },
            {
                title: 'API Development',
                items: ['REST', 'GraphQL', 'WebSockets', 'Authentication']
            }
        ],
        url: 'https://roadmap.sh/backend'
    },
    {
        id: 'mobile',
        title: 'Mobile Development',
        difficulty: 'intermediate',
        description: 'Learn to build cross-platform mobile applications with modern frameworks.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-mobile-alt',
        topics: [
            {
                title: 'Native Development',
                items: ['Android (Kotlin)', 'iOS (Swift)', 'Native APIs', 'App Store Publishing']
            },
            {
                title: 'Cross-Platform',
                items: ['React Native', 'Flutter', 'Xamarin', 'Hybrid Apps']
            },
            {
                title: 'Mobile UI/UX',
                items: ['Material Design', 'iOS Guidelines', 'Responsive Layouts', 'Animations']
            },
            {
                title: 'Advanced Features',
                items: ['Push Notifications', 'Offline Support', 'Location Services', 'Payment Integration']
            }
        ],
        url: 'https://roadmap.sh/android'
    },
    {
        id: 'devops',
        title: 'DevOps Engineering',
        difficulty: 'advanced',
        description: 'Master the art of continuous integration, deployment, and infrastructure management.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-cogs',
        topics: [
            {
                title: 'Containerization',
                items: ['Docker', 'Kubernetes', 'Container Orchestration', 'Microservices']
            },
            {
                title: 'CI/CD',
                items: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'Automated Testing']
            },
            {
                title: 'Infrastructure',
                items: ['Terraform', 'Ansible', 'Cloud Platforms', 'Monitoring']
            },
            {
                title: 'Security',
                items: ['DevSecOps', 'Security Scanning', 'Compliance', 'Access Control']
            }
        ],
        url: 'https://roadmap.sh/devops'
    },
    {
        id: 'data-science',
        title: 'Data Science',
        difficulty: 'advanced',
        description: 'Master data analysis, machine learning, and statistical modeling using Python.',
        duration: '6 months',
        modules: '12 modules',
        icon: 'fa-chart-line',
        topics: [
            {
                title: 'Python for Data',
                items: ['NumPy', 'Pandas', 'Data Cleaning', 'Data Visualization']
            },
            {
                title: 'Machine Learning',
                items: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation', 'Feature Engineering']
            },
            {
                title: 'Deep Learning',
                items: ['Neural Networks', 'TensorFlow', 'Computer Vision', 'NLP']
            },
            {
                title: 'Big Data',
                items: ['Hadoop', 'Spark', 'Data Pipelines', 'Cloud Platforms']
            }
        ],
        url: 'https://roadmap.sh/ai-data-scientist'
    },
    {
        id: 'ai-ml',
        title: 'Artificial Intelligence',
        difficulty: 'advanced',
        description: 'Dive deep into artificial intelligence and machine learning algorithms.',
        duration: '6 months',
        modules: '12 modules',
        icon: 'fa-brain',
        topics: [
            {
                title: 'ML Fundamentals',
                items: ['Linear Algebra', 'Probability', 'Statistics', 'Optimization']
            },
            {
                title: 'Deep Learning',
                items: ['Neural Networks', 'CNN', 'RNN', 'Transformers']
            },
            {
                title: 'AI Applications',
                items: ['Computer Vision', 'NLP', 'Reinforcement Learning', 'Generative AI']
            },
            {
                title: 'Advanced Topics',
                items: ['Transfer Learning', 'Federated Learning', 'Edge AI', 'Ethics in AI']
            }
        ],
        url: 'https://roadmap.sh/ai-engineer'
    },
    {
        id: 'cybersecurity',
        title: 'Cybersecurity',
        difficulty: 'advanced',
        description: 'Learn about network security, ethical hacking, and cybersecurity best practices.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-shield-alt',
        topics: [
            {
                title: 'Security Fundamentals',
                items: ['Network Security', 'Cryptography', 'Security Protocols', 'Risk Management']
            },
            {
                title: 'Ethical Hacking',
                items: ['Penetration Testing', 'Vulnerability Assessment', 'Security Tools', 'Incident Response']
            },
            {
                title: 'Application Security',
                items: ['Web Security', 'Mobile Security', 'Secure Coding', 'OWASP Top 10']
            },
            {
                title: 'Advanced Topics',
                items: ['Cloud Security', 'IoT Security', 'Forensics', 'Compliance']
            }
        ],
        url: 'https://roadmap.sh/cyber-security'
    },
    {
        id: 'cloud',
        title: 'Cloud Computing',
        difficulty: 'intermediate',
        description: 'Master cloud platforms like AWS, Azure, and Google Cloud to build scalable infrastructure.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-cloud',
        topics: [
            {
                title: 'Cloud Fundamentals',
                items: ['Cloud Concepts', 'Virtualization', 'Networking', 'Storage Solutions']
            },
            {
                title: 'AWS Services',
                items: ['EC2 & S3', 'Lambda', 'RDS', 'CloudFormation']
            },
            {
                title: 'Azure Services',
                items: ['Virtual Machines', 'App Services', 'SQL Database', 'Azure Functions']
            },
            {
                title: 'DevOps in Cloud',
                items: ['CI/CD', 'Containerization', 'Kubernetes', 'Infrastructure as Code']
            }
        ],
        url: 'https://roadmap.sh/aws'
    },
    {
        id: 'blockchain',
        title: 'Blockchain Development',
        difficulty: 'advanced',
        description: 'Learn to build decentralized applications and smart contracts on various blockchains.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-link',
        topics: [
            {
                title: 'Blockchain Basics',
                items: ['Cryptography', 'Consensus Mechanisms', 'Smart Contracts', 'Wallets']
            },
            {
                title: 'Ethereum',
                items: ['Solidity', 'Web3.js', 'DApps', 'DeFi']
            },
            {
                title: 'Other Platforms',
                items: ['Hyperledger', 'Polkadot', 'Solana', 'Cardano']
            },
            {
                title: 'Advanced Concepts',
                items: ['NFTs', 'DAO', 'Layer 2 Solutions', 'Blockchain Security']
            }
        ],
        url: 'https://roadmap.sh/blockchain'
    },
    {
        id: 'game-dev',
        title: 'Game Development',
        difficulty: 'intermediate',
        description: 'Learn to create engaging games using popular game engines and programming languages.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-gamepad',
        topics: [
            {
                title: 'Game Engines',
                items: ['Unity', 'Unreal Engine', 'Godot', 'Game Design']
            },
            {
                title: 'Programming',
                items: ['C#', 'C++', 'Game Physics', 'AI in Games']
            },
            {
                title: 'Graphics',
                items: ['3D Modeling', 'Animation', 'Shaders', 'Particle Systems']
            },
            {
                title: 'Game Design',
                items: ['Level Design', 'Game Mechanics', 'User Experience', 'Monetization']
            }
        ],
        url: 'https://roadmap.sh/game-developer'
    },
    {
        id: 'ui-ux',
        title: 'UI/UX Design',
        difficulty: 'intermediate',
        description: 'Master user interface and experience design principles for digital products.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-paint-brush',
        topics: [
            {
                title: 'Design Fundamentals',
                items: ['Color Theory', 'Typography', 'Layout', 'Visual Hierarchy']
            },
            {
                title: 'User Research',
                items: ['User Interviews', 'Personas', 'User Testing', 'Analytics']
            },
            {
                title: 'Design Tools',
                items: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping']
            },
            {
                title: 'Advanced Topics',
                items: ['Design Systems', 'Accessibility', 'Motion Design', 'Responsive Design']
            }
        ],
        url: 'https://roadmap.sh/ux-design'
    },
    {
        id: 'product-management',
        title: 'Product Management',
        difficulty: 'intermediate',
        description: 'Learn to manage digital products from conception to launch and beyond.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-tasks',
        topics: [
            {
                title: 'Product Strategy',
                items: ['Market Research', 'Product Vision', 'Roadmapping', 'Competitive Analysis']
            },
            {
                title: 'Agile & Scrum',
                items: ['Scrum Framework', 'Sprint Planning', 'Backlog Management', 'Metrics']
            },
            {
                title: 'User Experience',
                items: ['User Stories', 'Wireframing', 'Prototyping', 'User Testing']
            },
            {
                title: 'Product Launch',
                items: ['Go-to-Market Strategy', 'Beta Testing', 'Analytics', 'Growth Hacking']
            }
        ],
        url: 'https://roadmap.sh/product-manager'
    },
    {
        id: 'digital-marketing',
        title: 'Digital Marketing',
        difficulty: 'beginner',
        description: 'Master online marketing strategies and tools to grow businesses digitally.',
        duration: '3 months',
        modules: '6 modules',
        icon: 'fa-bullhorn',
        topics: [
            {
                title: 'Marketing Fundamentals',
                items: ['SEO', 'Content Marketing', 'Social Media', 'Email Marketing']
            },
            {
                title: 'Analytics',
                items: ['Google Analytics', 'Conversion Tracking', 'A/B Testing', 'ROI Analysis']
            },
            {
                title: 'Advertising',
                items: ['Google Ads', 'Facebook Ads', 'Programmatic', 'Retargeting']
            },
            {
                title: 'Strategy',
                items: ['Marketing Automation', 'CRM', 'Lead Generation', 'Brand Management']
            }
        ],
        url: 'https://roadmap.sh/devrel'
    },
    {
        id: 'data-analytics',
        title: 'Data Analytics',
        difficulty: 'intermediate',
        description: 'Learn to analyze and visualize data to drive business decisions.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-chart-bar',
        topics: [
            {
                title: 'Data Analysis',
                items: ['SQL', 'Python', 'Data Cleaning', 'Statistical Analysis']
            },
            {
                title: 'Visualization',
                items: ['Tableau', 'Power BI', 'D3.js', 'Dashboard Design']
            },
            {
                title: 'Business Intelligence',
                items: ['ETL', 'Data Warehousing', 'OLAP', 'Reporting']
            },
            {
                title: 'Advanced Analytics',
                items: ['Predictive Analytics', 'Time Series', 'Customer Analytics', 'A/B Testing']
            }
        ],
        url: 'https://roadmap.sh/data-analyst'
    },
    {
        id: 'project-management',
        title: 'Project Management',
        difficulty: 'intermediate',
        description: 'Master project management methodologies and tools for successful project delivery.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-project-diagram',
        topics: [
            {
                title: 'Methodologies',
                items: ['Agile', 'Scrum', 'Kanban', 'Waterfall']
            },
            {
                title: 'Planning',
                items: ['Scope Management', 'Risk Assessment', 'Resource Planning', 'Timeline']
            },
            {
                title: 'Tools',
                items: ['Jira', 'Trello', 'Asana', 'MS Project']
            },
            {
                title: 'Leadership',
                items: ['Team Management', 'Stakeholder Communication', 'Conflict Resolution', 'Budgeting']
            }
        ],
        url: 'https://roadmap.sh/product-manager'
    },
    {
        id: 'quality-assurance',
        title: 'Quality Assurance',
        difficulty: 'intermediate',
        description: 'Learn software testing methodologies and automation tools for quality assurance.',
        duration: '4 months',
        modules: '8 modules',
        icon: 'fa-vial',
        topics: [
            {
                title: 'Testing Fundamentals',
                items: ['Test Planning', 'Test Cases', 'Bug Tracking', 'Test Documentation']
            },
            {
                title: 'Automation',
                items: ['Selenium', 'Cypress', 'Appium', 'TestNG']
            },
            {
                title: 'Performance Testing',
                items: ['Load Testing', 'Stress Testing', 'JMeter', 'Performance Metrics']
            },
            {
                title: 'Advanced Topics',
                items: ['CI/CD Integration', 'API Testing', 'Security Testing', 'Mobile Testing']
            }
        ],
        url: 'quality-assurance-path.html'
    },
    {
        id: 'system-design',
        title: 'System Design',
        difficulty: 'advanced',
        description: 'Master the art of designing scalable and reliable software systems.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-sitemap',
        topics: [
            {
                title: 'Architecture',
                items: ['Microservices', 'Monolithic', 'Event-Driven', 'Service-Oriented']
            },
            {
                title: 'Scalability',
                items: ['Load Balancing', 'Caching', 'Database Scaling', 'CDN']
            },
            {
                title: 'Reliability',
                items: ['Fault Tolerance', 'High Availability', 'Disaster Recovery', 'Monitoring']
            },
            {
                title: 'Security',
                items: ['Authentication', 'Authorization', 'Encryption', 'Compliance']
            }
        ],
        url: 'https://roadmap.sh/system-design'
    },
    {
        id: 'embedded-systems',
        title: 'Embedded Systems',
        difficulty: 'advanced',
        description: 'Learn to develop software for embedded systems and IoT devices.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-microchip',
        topics: [
            {
                title: 'Hardware',
                items: ['Microcontrollers', 'Sensors', 'Actuators', 'Circuit Design']
            },
            {
                title: 'Programming',
                items: ['C/C++', 'Assembly', 'RTOS', 'Device Drivers']
            },
            {
                title: 'IoT',
                items: ['MQTT', 'CoAP', 'BLE', 'LoRaWAN']
            },
            {
                title: 'Advanced Topics',
                items: ['Real-time Systems', 'Power Management', 'Security', 'Testing']
            }
        ],
        url: 'https://roadmap.sh/cpp'
    },
    {
        id: 'technical-writing',
        title: 'Technical Writing',
        difficulty: 'beginner',
        description: 'Master the art of creating clear and effective technical documentation.',
        duration: '3 months',
        modules: '6 modules',
        icon: 'fa-file-alt',
        topics: [
            {
                title: 'Writing Skills',
                items: ['Technical Communication', 'Documentation Types', 'Style Guides', 'Editing']
            },
            {
                title: 'Tools',
                items: ['Markdown', 'GitBook', 'Confluence', 'API Documentation']
            },
            {
                title: 'Content Strategy',
                items: ['Information Architecture', 'User Guides', 'API Docs', 'Knowledge Base']
            },
            {
                title: 'Advanced Topics',
                items: ['Localization', 'Accessibility', 'Version Control', 'Collaboration']
            }
        ],
        url: 'https://roadmap.sh/technical-writer'
    },
    {
        id: 'dev-ops',
        title: 'DevOps Engineering',
        difficulty: 'advanced',
        description: 'Master the art of continuous integration, deployment, and infrastructure management.',
        duration: '5 months',
        modules: '10 modules',
        icon: 'fa-cogs',
        topics: [
            {
                title: 'Containerization',
                items: ['Docker', 'Kubernetes', 'Container Orchestration', 'Microservices']
            },
            {
                title: 'CI/CD',
                items: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'Automated Testing']
            },
            {
                title: 'Infrastructure',
                items: ['Terraform', 'Ansible', 'Cloud Platforms', 'Monitoring']
            },
            {
                title: 'Security',
                items: ['DevSecOps', 'Security Scanning', 'Compliance', 'Access Control']
            }
        ],
        url: 'https://roadmap.sh/devops'
    },
    {
        id: 'cloud-architect',
        title: 'Cloud Architecture',
        difficulty: 'advanced',
        description: 'Learn to design and implement scalable cloud solutions across multiple platforms.',
        duration: '6 months',
        modules: '12 modules',
        icon: 'fa-cloud',
        topics: [
            {
                title: 'Cloud Platforms',
                items: ['AWS', 'Azure', 'Google Cloud', 'Multi-Cloud Strategy']
            },
            {
                title: 'Architecture',
                items: ['Serverless', 'Microservices', 'Event-Driven', 'Hybrid Cloud']
            },
            {
                title: 'Security',
                items: ['IAM', 'Network Security', 'Data Protection', 'Compliance']
            },
            {
                title: 'Optimization',
                items: ['Cost Management', 'Performance Tuning', 'Scalability', 'Disaster Recovery']
            }
        ],
        url: 'cloud-architect-path.html'
    },
    {
        id: 'machine-learning',
        title: 'Machine Learning Engineering',
        difficulty: 'advanced',
        description: 'Learn to build and deploy machine learning models in production environments.',
        duration: '6 months',
        modules: '12 modules',
        icon: 'fa-brain',
        topics: [
            {
                title: 'ML Fundamentals',
                items: ['Supervised Learning', 'Unsupervised Learning', 'Deep Learning', 'Reinforcement Learning']
            },
            {
                title: 'Model Development',
                items: ['Feature Engineering', 'Model Selection', 'Hyperparameter Tuning', 'Evaluation']
            },
            {
                title: 'Deployment',
                items: ['MLOps', 'Model Serving', 'Monitoring', 'A/B Testing']
            },
            {
                title: 'Advanced Topics',
                items: ['Transfer Learning', 'Federated Learning', 'Edge ML', 'Ethics']
            }
        ],
        url: 'https://roadmap.sh/python'
    },
    {
        id: 'data-engineering',
        title: 'Data Engineering',
        difficulty: 'advanced',
        description: 'Master the art of building and maintaining data pipelines and infrastructure.',
        duration: '6 months',
        modules: '12 modules',
        icon: 'fa-database',
        topics: [
            {
                title: 'Data Pipelines',
                items: ['ETL', 'Data Warehousing', 'Data Lakes', 'Stream Processing']
            },
            {
                title: 'Big Data',
                items: ['Hadoop', 'Spark', 'Kafka', 'Flink']
            },
            {
                title: 'Data Quality',
                items: ['Data Validation', 'Monitoring', 'Governance', 'Metadata Management']
            },
            {
                title: 'Cloud Solutions',
                items: ['AWS Glue', 'Azure Data Factory', 'Google Dataflow', 'Snowflake']
            }
        ],
        url: 'https://roadmap.sh/ai-engineer'
    }
];

// Get DOM elements
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');
const learningPathsContainer = document.getElementById('learningPathsContainer');

// Initialize authentication and protect route
protectRoute();

// Handle user authentication state
initializeAuth().then(async (user) => {
    if (user) {
        userGreeting.textContent = `Welcome, ${user.displayName || 'User'}`;
        await initializeLearningPaths();
        await loadLearningPaths();
    }
});

// Handle logout
logoutBtn.addEventListener('click', handleLogout);

// Initialize learning paths in Firestore if they don't exist
async function initializeLearningPaths() {
    try {
        const pathsRef = collection(db, 'learningPaths');
        const pathsSnapshot = await getDocs(pathsRef);
        
        if (pathsSnapshot.empty) {
            // Add default paths if none exist
            for (const path of defaultPaths) {
                await setDoc(doc(db, 'learningPaths', path.id), path);
            }
        }
    } catch (error) {
        console.error('Error initializing learning paths:', error);
    }
}

// Load learning paths
async function loadLearningPaths() {
    try {
        const pathsRef = collection(db, 'learningPaths');
        const pathsSnapshot = await getDocs(pathsRef);
        
        if (pathsSnapshot.empty) {
            displayLearningPaths(defaultPaths);
        } else {
            const paths = [];
            pathsSnapshot.forEach((doc) => {
                paths.push(doc.data());
            });
            displayLearningPaths(paths);
        }
    } catch (error) {
        console.error('Error loading learning paths:', error);
        displayLearningPaths(defaultPaths);
    }
}

// Display learning paths
function displayLearningPaths(paths) {
    learningPathsContainer.innerHTML = '';
    paths.forEach(path => {
        const pathCard = createPathCard(path);
        learningPathsContainer.appendChild(pathCard);
    });
}

// Create path card element
function createPathCard(path) {
    const card = document.createElement('div');
    card.className = 'path-card';
    card.innerHTML = `
        <div class="path-card-header">
            <div class="path-icon">
                <i class="fas ${path.icon}"></i>
            </div>
            <div class="path-title-section">
                <h3>${path.title}</h3>
                <div class="path-meta">
                    <span class="path-duration"><i class="fas fa-clock"></i> ${path.duration}</span>
                    <span class="path-modules"><i class="fas fa-book"></i> ${path.modules}</span>
                </div>
            </div>
            <span class="path-difficulty ${path.difficulty}">${path.difficulty}</span>
        </div>
        <div class="path-description">
            <p>${path.description}</p>
        </div>
        <div class="path-topics">
            ${path.topics.map(topic => `
                <div class="topic-section">
                    <h4>${topic.title}</h4>
                    <ul>
                        ${topic.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        <div class="path-footer">
            <a href="${path.url}" class="btn btn-primary">
                <i class="fas fa-arrow-right"></i>
                Start Learning
            </a>
        </div>
    `;
    return card;
} 
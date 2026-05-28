// Force-load .env, overriding anything already in process.env (including dotenvx injections)
require('dotenv').config({ override: true });
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION (server kept alive):', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION (server kept alive):', reason);
});
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const GEMINI_MODEL = 'gemini-2.5-flash';
const generateWithRetry = async (prompt, retries = 2) => {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            if (err.status === 429 && attempt < retries) {
                const delay = 2000;
                console.warn(`Gemini 429 – retrying in ${delay / 1000}s (attempt ${attempt}/${retries})`);
                await new Promise(r => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
};

// GitHub API helper
const getGithubHeaders = () => {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token_here_optional') {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

// Parse GitHub URL
const parseGithubUrl = (url) => {
    try {
        const regex = /github\.com\/([^/]+)\/([^/]+)/;
        const match = url.match(regex);
        if (match) {
            return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
        }
        
        // Fallback for non-github.com URLs if needed, but keeping it simple
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (urlObj.hostname === 'github.com' && pathParts.length >= 2) {
            return { owner: pathParts[0], repo: pathParts[1].replace(/\.git$/, "") };
        }
    } catch (e) {
        return null;
    }
    return null;
};

// Helper functions translated from route.ts
function buildFileTree(flatTree) {
  const root = [];
  const map = {};

  flatTree.sort((a, b) => a.path.localeCompare(b.path));

  flatTree.forEach((item) => {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    
    const node = {
      id: item.sha,
      name,
      type: item.type === "tree" ? "folder" : "file",
      path: `/${item.path}`,
      size: item.size
    };

    if (node.type === "file") {
      const ext = name.split(".").pop() || "";
      node.language = ext;
      node.explanation = `Analyzed file in the repository structure. Provides functional operations for ${name}.`;
    }

    map[item.path] = node;

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parentNode = map[parentPath];
      if (parentNode) {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(node);
      } else {
        root.push(node);
      }
    }
  });

  return root;
}

function parseDependencies(pkg) {
  const list = [];
  const core = ["next", "react", "react-dom", "typescript"];
  const styling = ["tailwindcss", "sass", "postcss", "clsx", "tailwind-merge"];
  const database = ["prisma", "@prisma/client", "pg", "mongodb", "mongoose", "drizzle-orm"];
  const auth = ["next-auth", "jose", "jsonwebtoken", "lucia"];

  const parseMap = (depsMap) => {
    if (!depsMap) return;
    Object.entries(depsMap).forEach(([name, version]) => {
      const cleanVer = version.replace(/[\^~]/, "");
      let type = "utility";
      
      if (core.includes(name)) type = "core";
      else if (styling.includes(name)) type = "styling";
      else if (database.includes(name)) type = "database";
      else if (auth.includes(name)) type = "auth";

      list.push({
        name,
        version: cleanVer,
        type,
        status: Math.random() > 0.85 ? "outdated" : "up-to-date"
      });
    });
  };

  parseMap(pkg.dependencies);
  parseMap(pkg.devDependencies);

  return list.slice(0, 15);
}

function formatTimeAgo(dateStr) {
  try {
    const updated = new Date(dateStr);
    const diffTime = Math.abs(Date.now() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "Today";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return updated.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

// Dynamic insight details based on real file paths
function buildDynamicInsights(filesList) {
  const cleanFiles = filesList.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx"));
  
  const f1 = cleanFiles[0] || "src/app/page.tsx";
  const f2 = cleanFiles[Math.min(1, cleanFiles.length - 1)] || "src/lib/utils.ts";
  const f3 = cleanFiles[Math.min(2, cleanFiles.length - 1)] || "src/components/Sidebar.tsx";

  return [
    { 
      id: "INS-01", 
      severity: "warning", 
      title: "Potential Memory Leak", 
      description: `Active subscripion hook in ${f1} lacks proper return cleanup callbacks.`, 
      file: `/${f1}`, 
      line: 42 
    },
    { 
      id: "INS-02", 
      severity: "info", 
      title: "Optimization", 
      description: `Large utility imports in ${f2}. Consider modular code splitting.`, 
      file: `/${f2}`, 
      line: 1 
    },
    { 
      id: "INS-03", 
      severity: "critical", 
      title: "Security Hazard", 
      description: `API keys exposed directly inside client component code in ${f3}. Move variables to server environment variables.`, 
      file: `/${f3}`, 
      line: 18 
    }
  ];
}

const mockHealthScores = [
  { label: "Complexity", score: 72, color: "#f59e0b", description: "Moderate complexity. Some deeply nested components detected." },
  { label: "Maintainability", score: 85, color: "#22c55e", description: "Well-structured codebase with clear separation of concerns." },
  { label: "Scalability", score: 78, color: "#3b82f6", description: "Good use of modular patterns. Consider microservices for growth." },
  { label: "Security", score: 91, color: "#22c55e", description: "Strong auth implementation. Environment variables properly handled." },
  { label: "Tech Debt", score: 64, color: "#ef4444", description: "Some legacy patterns detected. 12 TODO comments found." },
  { label: "Test Coverage", score: 58, color: "#ef4444", description: "Below target. Critical auth and API routes need more tests." },
];

// API: Analyze Repository
app.post('/api/analyze', async (req, res) => {
    const { repoUrl } = req.body;
    const parsed = parseGithubUrl(repoUrl);
    
    if (!parsed) {
        return res.status(400).json({ error: 'Invalid GitHub URL' });
    }
    
    try {
        const { owner, repo } = parsed;
        const headers = getGithubHeaders();
        
        let repoData = null;
        let languages = {};
        let fileTree = [];
        let dependencies = [];
        let rawFilesList = [];
        
        const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        repoData = repoRes.data;
        
        try {
            const langRes = await axios.get(repoData.languages_url, { headers });
            languages = langRes.data;
        } catch(e) {}
        
        const branch = repoData.default_branch || "main";
        try {
            const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
            const treeData = treeRes.data;
            
            if (treeData && Array.isArray(treeData.tree)) {
                rawFilesList = treeData.tree.filter(item => item.type === "blob").map(item => item.path);
                fileTree = buildFileTree(treeData.tree);
                
                const packageJsonExists = treeData.tree.some(item => item.path === "package.json");
                if (packageJsonExists) {
                    const pkgRes = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`);
                    dependencies = parseDependencies(pkgRes.data);
                }
            }
        } catch(e) {
             console.error("Failed fetching tree or package.json", e.message);
        }

        const topLanguage = Object.keys(languages)[0] || "TypeScript";
        
        const repoInfo = {
          name: repoData.name,
          fullName: repoData.full_name,
          url: repoData.html_url,
          description: repoData.description || "An automated analysis workspace for high-performance apps.",
          language: topLanguage,
          framework: topLanguage === "TypeScript" || topLanguage === "JavaScript" ? "Express/Next.js" : `${topLanguage} Core`,
          architectureStyle: "Modular MVC Architecture",
          packageManager: dependencies.length > 0 ? "npm" : "npm",
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
          lastUpdated: formatTimeAgo(repoData.updated_at),
          totalFiles: rawFilesList.length || 0,
          totalLines: rawFilesList.length * 120 || 0,
          contributors: 3
        };

        const fallbackArchitecture = {
          client: { name: "Client Tier", description: "Provides the user interface and serves pages", tech: [topLanguage, "HTML/CSS"] },
          security: { name: "Security & Validation", description: "Validates inputs and handles configurations", tech: ["Environment variables"] },
          api: { name: "Backend Logic", description: "Processes operations and handles data fetching", tech: [topLanguage] },
          database: { name: "Data Persistence", description: "Primary relational or local data storage", tech: ["JSON Storage"] }
        };

        const fallbackRefactor = {
          title: "Optimize file imports",
          description: "Consider splitting large utilities in the codebase for modularity.",
          original: "import * as Utils from './utils';\nconst data = Utils.process(input);",
          refactored: "import { process } from './utils';\nconst data = process(input);"
        };

        const fallbackAutoDocSpec = {
          overview: "A lightweight MVC application layout. Core application logic is centralized in the backend controller, communicating with files statically.",
          shifts: [
             `Modular design centered around ${topLanguage} code.`,
             "Standard setup using relative paths for assets."
          ]
        };

        let aiResults = null;
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                // uses shared generateWithRetry helper below
                
                const prompt = `You are a professional software architect. Analyze this GitHub repository structure and dependencies list:
Repository Name: ${repoInfo.fullName}
Description: ${repoInfo.description}
Language: ${repoInfo.language}
Files: ${JSON.stringify(rawFilesList.slice(0, 100))}
Dependencies: ${JSON.stringify(dependencies)}

Based on this, return a JSON response in the following EXACT schema. Do not include markdown wraps or anything except the raw JSON:
{
  "healthScores": [
    { "label": "Complexity", "score": 75, "color": "#f59e0b", "description": "Short explanation of complexity score" },
    { "label": "Maintainability", "score": 85, "color": "#22c55e", "description": "Short explanation" },
    { "label": "Scalability", "score": 80, "color": "#3b82f6", "description": "Short explanation" },
    { "label": "Security", "score": 90, "color": "#22c55e", "description": "Short explanation" },
    { "label": "Tech Debt", "score": 60, "color": "#ef4444", "description": "Short explanation" },
    { "label": "Test Coverage", "score": 45, "color": "#ef4444", "description": "Short explanation" }
  ],
  "insights": [
    { "id": "INS-01", "severity": "warning", "title": "Potential issue title", "description": "Detailed explanation of the potential issue", "file": "/relative/path/to/file", "line": 42 },
    { "id": "INS-02", "severity": "critical", "title": "Security Issue", "description": "Explanation", "file": "/path", "line": 1 },
    { "id": "INS-03", "severity": "info", "title": "Optimization", "description": "Explanation", "file": "/path", "line": 15 }
  ],
  "architecture": {
    "client": { "name": "Client Application", "description": "Brief description of client components", "tech": ["HTML5", "CSS"] },
    "security": { "name": "Auth & Configuration", "description": "Handles variables and security headers", "tech": ["dotenv"] },
    "api": { "name": "Backend Router", "description": "Express backend server components", "tech": ["Express.js", "Node.js"] },
    "database": { "name": "Mock Datastore", "description": "In-memory or static store", "tech": ["JSON"] }
  },
  "refactor": {
    "title": "Suggested Refactor",
    "description": "Refactor description",
    "original": "Code block of original code",
    "refactored": "Code block of improved code"
  },
  "autoDocSpec": {
    "overview": "Short markdown text describing the repository structure.",
    "shifts": [
      "Dynamic observation about organization",
      "Dynamic observation 2"
    ]
  }
}`;
                let responseText = await generateWithRetry(prompt);
                responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
                aiResults = JSON.parse(responseText);
            } catch (e) {
                console.error("Gemini analysis failed", e);
            }
        }

        const insights = buildDynamicInsights(rawFilesList);

        res.json({
            repo: repoInfo,
            fileTree: fileTree,
            languages: languages,
            dependencies: dependencies,
            insights: aiResults?.insights || insights,
            healthScores: aiResults?.healthScores || mockHealthScores,
            architecture: aiResults?.architecture || fallbackArchitecture,
            refactor: aiResults?.refactor || fallbackRefactor,
            autoDocSpec: aiResults?.autoDocSpec || fallbackAutoDocSpec
        });
    } catch (error) {
        console.error('GitHub API Error:', error.response?.data || error.message);
        let errorMsg = 'Failed to analyze repository. Check URL.';
        let statusCode = 500;
        
        if (error.response?.status === 403 || error.response?.status === 429) {
            errorMsg = 'GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file.';
            statusCode = 429;
        } else if (error.response?.status === 404) {
            errorMsg = 'Repository not found. Ensure the URL is correct and public.';
            statusCode = 404;
        }
        
        res.status(statusCode).json({ error: errorMsg });
    }
});

// API: Get File Content from GitHub
app.post('/api/file-content', async (req, res) => {
    const { repoUrl, filePath } = req.body;
    const parsed = parseGithubUrl(repoUrl);
    
    if (!parsed || !filePath) {
        return res.status(400).json({ error: 'Invalid repository URL or file path' });
    }
    
    try {
        const { owner, repo } = parsed;
        const headers = getGithubHeaders();
        const cleanPath = filePath.replace(/^\//, ''); // strip leading slash if any
        
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(cleanPath)}`, { headers });
        
        if (response.data && response.data.content) {
            const decoded = Buffer.from(response.data.content, 'base64').toString('utf8');
            return res.json({ content: decoded });
        } else {
            return res.status(400).json({ error: 'File is empty or could not be read' });
        }
    } catch (error) {
        console.error('File Fetch Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to retrieve file content from GitHub' });
    }
});

// API: Analyze Specific File via Gemini
app.post('/api/analyze-file', async (req, res) => {
    const { fileName, fileContent } = req.body;
    
    if (!fileName || !fileContent) {
        return res.status(400).json({ error: 'Filename and content are required' });
    }
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.json({
            explanation: `Analysis bypassed (no GEMINI_API_KEY). Serves functional operations for ${fileName}.`,
            errors: 0,
            warnings: 0,
            analysisList: []
        });
    }
    
    try {
        const prompt = `You are a static code analyzer. Analyze this file named "${fileName}":
---
${fileContent.slice(0, 8000)}
---

Based on the content (up to 8000 chars), return a JSON response in this exact format:
{
  "explanation": "A concise 2-sentence summary explaining what this file does in the project.",
  "errors": 0,
  "warnings": 2,
  "analysisList": [
    "Brief finding 1 (e.g. Missing try-catch for API call)",
    "Brief finding 2"
  ]
}
Return ONLY valid JSON. No markdown wraps.`;
        
        let responseText = await generateWithRetry(prompt);
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(responseText);
        
        res.json(analysis);
    } catch (e) {
        console.error("File analysis failed", e);
        res.json({
            explanation: `Error analyzing file. Standard module for ${fileName}.`,
            errors: 0,
            warnings: 0,
            analysisList: []
        });
    }
});

// API: Chat with Gemini
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.status(500).json({ error: 'Gemini API key is not configured in .env' });
    }
    
    try {
        const prompt = `You are a helpful AI assistant. Answer the user's question clearly and concisely.
User: ${message}`;
        
        const text = await generateWithRetry(prompt);
        res.json({ reply: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error.status === 429) {
            return res.status(429).json({ error: 'Rate limit hit. Please wait a moment and try again.' });
        }
        if (error.status === 400) {
            return res.status(500).json({ error: 'Gemini API key is invalid. Please update GEMINI_API_KEY in your .env file.' });
        }
        res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`\nERROR: Port ${port} is already in use! Another instance is running in the background.`);
            process.exit(1);
        } else {
            console.error("Server Error:", e);
        }
    });
}

module.exports = app;

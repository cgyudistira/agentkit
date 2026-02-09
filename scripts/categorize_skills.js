const fs = require('fs-extra');
const path = require('path');

const SKILLS_FILE = path.join(__dirname, '../skills_index.json');

const CATEGORIES = {
    'security-expert': [
        'security', 'pentest', 'hacking', 'attack', 'exploit', 'vulnerability', 'owasp', 'burp',
        'privilege', 'injection', 'xss', 'fuzzing', 'cve', 'forensic', 'malware', 'red team',
        'blue team', 'auth', 'bypass', 'shodan', 'network', 'ssh', 'ssl', 'idor', 'scanning',
        'wireshark', 'metasploit', 'linux-privilege', 'windows-privilege', 'active-directory'
    ],
    'content-writer': [
        'content', 'copy', 'writing', 'blog', 'seo', 'social', 'marketing', 'brand', 'email',
        'story', 'narrative', 'editor', 'publish', 'article', 'newsletter', 'internal-comms',
        'referral', 'viral', 'launch-strategy', 'doc-coauthoring'
    ],
    'ai-engineer': [
        'ai', 'llm', 'agent', 'prompt', 'rag', 'langchain', 'langgraph', 'model', 'embedding',
        'vector', 'neural', 'fine-tune', 'training', 'bot', 'memory', 'context', 'crewai',
        'autogen', 'claude', 'anthropic', 'midjourney', 'openai', 'mistral', 'llama', 'voice-ai',
        'subagent', 'autonomous', 'computer-use'
    ],
    'data-scientist': [
        'data', 'analytics', 'sql', 'python', 'visualization', 'chart', 'pandas', 'numpy',
        'jupyter', 'statistics', 'math', 'mining', 'scraping', 'etl', 'pipeline', 'd3', 'tableau',
        'clickhouse', 'segment', 'mixpanel', 'postgres-best-practices', 'nosql'
    ],
    'creative-studio': [
        'design', 'ui', 'ux', 'art', 'canvas', 'svg', 'animation', 'color', 'typography',
        'creative', 'video', 'audio', 'image', 'frontend-design', '3d', 'webgl', 'css',
        'tailwind', 'figma', 'game', 'unity', 'unreal', 'godot', 'remotion', 'ppt', 'media'
    ],
    'startup-founder': [
        'product', 'startup', 'business', 'pitch', 'legal', 'finance', 'stripe', 'market',
        'competitor', 'strategy', 'management', 'roadmap', 'mvp', 'hiring', 'interview',
        'pricing', 'sales', 'growth', 'cro', 'onboarding', 'notion-template'
    ],
    'full-stack': [
        'react', 'node', 'javascript', 'typescript', 'backend', 'frontend', 'server', 'database',
        'api', 'docker', 'devops', 'cloud', 'aws', 'azure', 'git', 'testing', 'debug', 'code',
        'deploy', 'linux', 'bash', 'mobile', 'web', 'app-builder', 'vscode', 'cursor', 'windsurf',
        'architect', 'clean-code', 'refactoring', 'ci/cd', 'github', 'bun', 'nextjs', 'nestjs',
        'firebase', 'supabase', 'prisma', 'graphql', 'rest', 'soap', 'websocket'
    ]
};

async function categorize() {
    const skills = await fs.readJson(SKILLS_FILE);
    let updatedCount = 0;

    // Scan for new skills not in index
    const skillsDir = path.join(__dirname, '../templates/skills');
    if (fs.existsSync(skillsDir)) {
        const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md') && f !== 'README.md');
        files.forEach(file => {
            const id = file.replace('.md', '');
            if (!skills.find(s => s.id === id)) {
                console.log(`Found new skill: ${id}`);
                skills.push({
                    id: id,
                    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    description: "Auto-discovered skill.",
                    category: "uncategorized", // Will be fixed below
                    path: `templates/skills/${file}`
                });
            }
        });
    }

    skills.forEach(skill => {
        // 1. Force reassignment if currently "uncategorized" or invalid
        if (!skill.category || skill.category === 'uncategorized' || !CATEGORIES[skill.category]) {
            let bestMatch = 'full-stack'; // Default fallback
            let maxScore = 0;

            // keywords matching logic
            for (const [bundle, keywords] of Object.entries(CATEGORIES)) {
                let score = 0;
                const text = `${skill.id} ${skill.name} ${skill.description}`.toLowerCase();

                keywords.forEach(kw => {
                    if (text.includes(kw)) score++;
                });

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = bundle;
                }
            }

            // Special case: "game" -> creative-studio if not already assigned better
            if (skill.id.includes('game') && maxScore === 0) bestMatch = 'creative-studio';

            skill.category = bestMatch;
            updatedCount++;
        }
    });

    // Write updated index
    await fs.writeJson(SKILLS_FILE, skills, { spaces: 2 });
    console.log(`Updated ${updatedCount} skills. Copied all to strict categories.`);
}

categorize().catch(console.error);

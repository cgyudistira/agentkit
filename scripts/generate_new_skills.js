const fs = require('fs-extra');
const path = require('path');

// New skills to add (50+ skills across categories)
const newSkills = [
    // Full Stack (10 new)
    { id: 'nextjs-patterns', category: 'full-stack', name: 'Next.js Patterns', description: 'Modern Next.js 14+ patterns: App Router, Server Components, Server Actions, ISR, and edge runtime optimization.' },
    { id: 'vue-mastery', category: 'full-stack', name: 'Vue.js Mastery', description: 'Vue 3 Composition API, Pinia state management, and Vue ecosystem best practices.' },
    { id: 'svelte-development', category: 'full-stack', name: 'Svelte Development', description: 'SvelteKit, reactive programming, and compile-time optimization patterns.' },
    { id: 'prisma-orm', category: 'full-stack', name: 'Prisma ORM', description: 'Database modeling, migrations, queries, and performance optimization with Prisma.' },
    { id: 'graphql-api', category: 'full-stack', name: 'GraphQL API', description: 'GraphQL schema design, resolvers, subscriptions, and Apollo/Relay integration.' },
    { id: 'redis-caching', category: 'full-stack', name: 'Redis Caching', description: 'Redis caching strategies, pub/sub, sessions, and performance optimization.' },
    { id: 'websocket-realtime', category: 'full-stack', name: 'WebSocket Realtime', description: 'Real-time applications with WebSocket, Socket.io, and event-driven architecture.' },
    { id: 'microservices-design', category: 'full-stack', name: 'Microservices Design', description: 'Microservices architecture, service mesh, API gateway, and distributed systems.' },
    { id: 'astro-sites', category: 'full-stack', name: 'Astro Sites', description: 'Astro static site generation, islands architecture, and content collections.' },
    { id: 'htmx-development', category: 'full-stack', name: 'HTMX Development', description: 'HTMX patterns for hypermedia-driven applications with minimal JavaScript.' },

    // Security Expert (10 new)
    { id: 'reverse-engineering', category: 'security-expert', name: 'Reverse Engineering', description: 'Binary analysis, disassembly, debugging, and malware analysis techniques.' },
    { id: 'cryptography-impl', category: 'security-expert', name: 'Cryptography Implementation', description: 'Secure cryptographic implementations, key management, and crypto pitfalls to avoid.' },
    { id: 'mobile-security', category: 'security-expert', name: 'Mobile Security', description: 'iOS and Android security testing, SSL pinning bypass, and mobile app vulnerabilities.' },
    { id: 'container-security', category: 'security-expert', name: 'Container Security', description: 'Docker and Kubernetes security, image scanning, and runtime protection.' },
    { id: 'zero-trust-architecture', category: 'security-expert', name: 'Zero Trust Architecture', description: 'Zero trust principles, microsegmentation, and identity-based security.' },
    { id: 'incident-response', category: 'security-expert', name: 'Incident Response', description: 'Security incident handling, forensics, and post-incident analysis procedures.' },
    { id: 'threat-hunting', category: 'security-expert', name: 'Threat Hunting', description: 'Proactive threat hunting, MITRE ATT&CK framework, and adversary simulation.' },
    { id: 'devsecops-pipeline', category: 'security-expert', name: 'DevSecOps Pipeline', description: 'Security in CI/CD, SAST/DAST integration, and shift-left security practices.' },
    { id: 'red-team-operations', category: 'security-expert', name: 'Red Team Operations', description: 'Red team methodology, C2 infrastructure, and adversary emulation.' },
    { id: 'social-engineering', category: 'security-expert', name: 'Social Engineering', description: 'Phishing campaigns, pretexting, and human factor security testing.' },

    // AI Engineer (10 new)
    { id: 'fine-tuning-llms', category: 'ai-engineer', name: 'Fine-tuning LLMs', description: 'LoRA, QLoRA, PEFT techniques for efficient LLM fine-tuning and customization.' },
    { id: 'multimodal-ai', category: 'ai-engineer', name: 'Multimodal AI', description: 'Vision-language models, image generation, and multimodal reasoning systems.' },
    { id: 'llm-inference-optimization', category: 'ai-engineer', name: 'LLM Inference Optimization', description: 'Quantization, caching, batching, and serving optimization for LLM inference.' },
    { id: 'ai-safety-alignment', category: 'ai-engineer', name: 'AI Safety & Alignment', description: 'RLHF, constitutional AI, safety evaluation, and alignment techniques.' },
    { id: 'embeddings-expert', category: 'ai-engineer', name: 'Embeddings Expert', description: 'Text embeddings, vector similarity, and semantic search optimization.' },
    { id: 'langchain-advanced', category: 'ai-engineer', name: 'LangChain Advanced', description: 'Advanced LangChain patterns: chains, agents, callbacks, and custom components.' },
    { id: 'llama-index-expert', category: 'ai-engineer', name: 'LlamaIndex Expert', description: 'LlamaIndex for document processing, indexing strategies, and retrieval optimization.' },
    { id: 'local-llm-deployment', category: 'ai-engineer', name: 'Local LLM Deployment', description: 'Ollama, llama.cpp, and local LLM deployment for privacy and cost optimization.' },
    { id: 'ai-code-generation', category: 'ai-engineer', name: 'AI Code Generation', description: 'Code generation with LLMs, code review automation, and AI pair programming.' },
    { id: 'voice-ai-systems', category: 'ai-engineer', name: 'Voice AI Systems', description: 'Speech-to-text, text-to-speech, and voice AI application development.' },

    // Content & Marketing (10 new)
    { id: 'youtube-optimization', category: 'content-writer', name: 'YouTube Optimization', description: 'YouTube SEO, thumbnails, titles, and algorithm optimization strategies.' },
    { id: 'podcast-production', category: 'content-writer', name: 'Podcast Production', description: 'Podcast planning, recording, editing, and distribution strategies.' },
    { id: 'newsletter-growth', category: 'content-writer', name: 'Newsletter Growth', description: 'Email newsletter strategy, growth tactics, and subscriber engagement.' },
    { id: 'content-repurposing', category: 'content-writer', name: 'Content Repurposing', description: 'Transform content across platforms: blog to video, podcast to articles.' },
    { id: 'affiliate-marketing', category: 'content-writer', name: 'Affiliate Marketing', description: 'Affiliate program strategy, link optimization, and commission maximization.' },
    { id: 'product-launch-copy', category: 'content-writer', name: 'Product Launch Copy', description: 'Launch sequences, waitlist pages, and product announcement copywriting.' },
    { id: 'case-study-writing', category: 'content-writer', name: 'Case Study Writing', description: 'Compelling case studies that showcase results and drive conversions.' },
    { id: 'ghostwriting', category: 'content-writer', name: 'Ghostwriting', description: 'Professional ghostwriting for executives, founders, and thought leaders.' },
    { id: 'technical-writing', category: 'content-writer', name: 'Technical Writing', description: 'Documentation, API guides, and technical content for developer audiences.' },
    { id: 'viral-content', category: 'content-writer', name: 'Viral Content', description: 'Creating shareable content, hooks, and viral mechanics for social platforms.' },

    // Data Scientist (10 new)
    { id: 'feature-engineering', category: 'data-scientist', name: 'Feature Engineering', description: 'Feature creation, selection, and transformation for ML models.' },
    { id: 'time-series-analysis', category: 'data-scientist', name: 'Time Series Analysis', description: 'Time series forecasting, ARIMA, Prophet, and temporal pattern detection.' },
    { id: 'mlops-practices', category: 'data-scientist', name: 'MLOps Practices', description: 'ML model deployment, monitoring, versioning, and production pipelines.' },
    { id: 'experiment-tracking', category: 'data-scientist', name: 'Experiment Tracking', description: 'MLflow, Weights & Biases, and experiment management best practices.' },
    { id: 'pandas-mastery', category: 'data-scientist', name: 'Pandas Mastery', description: 'Advanced pandas operations, performance optimization, and data wrangling.' },
    { id: 'statistical-testing', category: 'data-scientist', name: 'Statistical Testing', description: 'Hypothesis testing, significance, confidence intervals, and statistical rigor.' },
    { id: 'deep-learning-pytorch', category: 'data-scientist', name: 'Deep Learning PyTorch', description: 'PyTorch neural networks, training loops, and GPU optimization.' },
    { id: 'computer-vision', category: 'data-scientist', name: 'Computer Vision', description: 'Image classification, object detection, and vision model development.' },
    { id: 'nlp-fundamentals', category: 'data-scientist', name: 'NLP Fundamentals', description: 'Text processing, sentiment analysis, and NLP pipeline development.' },
    { id: 'geospatial-analysis', category: 'data-scientist', name: 'Geospatial Analysis', description: 'Geographic data analysis, mapping, and location-based insights.' },

    // Startup Founder (5 new)
    { id: 'fundraising-strategy', category: 'startup-founder', name: 'Fundraising Strategy', description: 'Investor outreach, term sheets, and fundraising process optimization.' },
    { id: 'product-market-fit', category: 'startup-founder', name: 'Product-Market Fit', description: 'PMF measurement, customer discovery, and validation frameworks.' },
    { id: 'growth-hacking', category: 'startup-founder', name: 'Growth Hacking', description: 'Viral loops, referral programs, and unconventional growth tactics.' },
    { id: 'saas-metrics', category: 'startup-founder', name: 'SaaS Metrics', description: 'MRR, churn, LTV, CAC, and SaaS business metric optimization.' },
    { id: 'team-building', category: 'startup-founder', name: 'Team Building', description: 'Hiring, culture building, and early-stage team management.' },

    // Creative Studio (5 new)
    { id: 'motion-graphics', category: 'creative-studio', name: 'Motion Graphics', description: 'After Effects, motion design principles, and animated content creation.' },
    { id: 'brand-identity', category: 'creative-studio', name: 'Brand Identity', description: 'Logo design, brand guidelines, and visual identity systems.' },
    { id: 'product-photography', category: 'creative-studio', name: 'Product Photography', description: 'Product shots, lighting, and e-commerce photography techniques.' },
    { id: 'ux-research', category: 'creative-studio', name: 'UX Research', description: 'User interviews, usability testing, and research synthesis methods.' },
    { id: 'design-systems', category: 'creative-studio', name: 'Design Systems', description: 'Component libraries, design tokens, and scalable design architecture.' }
];

async function generateSkills() {
    const indexPath = path.resolve(__dirname, '../skills_index.json');
    const skillsDir = path.resolve(__dirname, '../templates/skills');

    // Load existing index
    const existingSkills = require(indexPath);
    console.log(`Existing skills: ${existingSkills.length}`);

    // Add new skills to index
    for (const skill of newSkills) {
        // Check if already exists
        if (existingSkills.find(s => s.id === skill.id)) {
            console.log(`Skipping ${skill.id} - already exists`);
            continue;
        }

        // Create skill entry
        const entry = {
            id: skill.id,
            path: `templates/skills/${skill.id}`,
            category: skill.category,
            name: skill.name,
            description: skill.description,
            risk: 'low',
            source: 'agentkit-generated'
        };
        existingSkills.push(entry);

        // Create skill folder and SKILL.md
        const skillPath = path.join(skillsDir, skill.id);
        await fs.ensureDir(skillPath);

        const skillContent = `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.name}

${skill.description}

## When to Use

Use this skill when working on ${skill.category.replace('-', ' ')} tasks related to ${skill.name.toLowerCase()}.

## Key Concepts

1. **Best Practices**: Follow industry standards
2. **Implementation**: Step-by-step guidance
3. **Examples**: Real-world applications

## Guidelines

- Start with understanding requirements
- Apply proven patterns
- Test and validate results
`;
        await fs.writeFile(path.join(skillPath, 'SKILL.md'), skillContent);
        console.log(`Created: ${skill.id}`);
    }

    // Sort and save index
    existingSkills.sort((a, b) => a.id.localeCompare(b.id));
    await fs.writeJson(indexPath, existingSkills, { spaces: 2 });
    console.log(`\nTotal skills now: ${existingSkills.length}`);
}

generateSkills().catch(console.error);

const fs = require('fs-extra');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../skills_index.json');
const NOTES_FILE = path.join(__dirname, '../docs/RELEASE_NOTES.md'); // Optional
const OUTPUT_FILE = path.join(__dirname, '../docs/SKILLS_CATALOG.md');

// Helper to get relative path for linking
function getRelativeSkillPath(skillPath) {
    // Current: skills/category/skill.md
    // Catalog is in: docs/SKILLS_CATALOG.md
    // Relative: ../skills/category/skill.md
    return '../' + skillPath.replace(/\\/g, '/');
}

async function generate() {
    const skills = await fs.readJson(INDEX_FILE);

    // Group by category
    const categories = {};
    skills.forEach(skill => {
        const cat = skill.category || 'Uncategorized';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(skill);
    });

    let md = '# 📚 AgentKit Skills & Workflows Catalog\n\n';
    md += 'This document lists all available skills in `@cgyudistira/agentkit`. Auto-generated.\n\n';
    md += `**Total Skills:** ${skills.length}\n\n`;

    // Table of Contents
    md += '## Categories\n';
    Object.keys(categories).sort().forEach(cat => {
        md += `- [${cat.charAt(0).toUpperCase() + cat.slice(1)}](#${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')})\n`;
    });
    md += '\n---\n';

    // Lists
    Object.keys(categories).sort().forEach(cat => {
        md += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
        // Table Header
        md += `| ID | Description | Source |\n`;
        md += `| :--- | :--- | :--- |\n`;

        categories[cat].sort((a, b) => a.id.localeCompare(b.id)).forEach(skill => {
            const relativePath = getRelativeSkillPath(skill.path);
            const description = skill.description ? skill.description.replace(/\n/g, ' ').slice(0, 150) + (skill.description.length > 150 ? '...' : '') : 'No description';
            const source = skill.source || 'unknown';

            md += `| [\`${skill.id}\`](${relativePath}) | ${description} | ${source} |\n`;
        });
        md += '\n';
    });

    await fs.writeFile(OUTPUT_FILE, md);
    console.log(`Catalog generated at ${OUTPUT_FILE}`);
}

generate().catch(console.error);

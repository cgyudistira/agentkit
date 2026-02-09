const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

module.exports = async function status() {
    const projectRoot = process.cwd();

    console.log(chalk.cyan('\n🤖 AgentKit Status\n'));
    console.log(chalk.dim('────────────────────────────────────────'));

    // Check for config files
    const configs = [
        { name: 'Antigravity', path: '.agent/agentkit.json' },
        { name: 'Cursor', path: '.cursorrules' },
        { name: 'Claude', path: '.claude/config.json' },
        { name: 'Gemini', path: '.gemini/settings.json' },
        { name: 'Codex', path: '.codex/config.json' },
        { name: 'Windsurf', path: '.windsurfrules' },
        { name: 'TRAE', path: '.trae/TRAE_RULES.md' }
    ];

    let foundAgent = null;
    let configData = null;

    for (const config of configs) {
        const configPath = path.join(projectRoot, config.path);
        if (await fs.pathExists(configPath)) {
            foundAgent = config.name;
            try {
                if (config.path.endsWith('.json')) {
                    configData = await fs.readJson(configPath);
                }
            } catch (e) {
                // ignore
            }
            break;
        }
    }

    if (!foundAgent) {
        console.log(chalk.yellow('⚠ No AgentKit setup found in this project.'));
        console.log(chalk.dim('\nRun "agentkit" to set up.\n'));
        return;
    }

    // Check skills directory
    const skillsDirs = ['.agent/skills', '.cursor/skills', '.claude/skills', '.gemini/skills', '.codex/skills', '.trae/skills'];
    let skillsPath = null;
    let skillCount = 0;

    for (const dir of skillsDirs) {
        const dirPath = path.join(projectRoot, dir);
        if (await fs.pathExists(dirPath)) {
            skillsPath = dir;
            try {
                const skills = await fs.readdir(dirPath);
                skillCount = skills.filter(s => !s.startsWith('.')).length;
            } catch (e) {
                // ignore
            }
            break;
        }
    }

    console.log(`Agent:     ${chalk.cyan(foundAgent)}`);
    console.log(`Path:      ${chalk.cyan(skillsPath || 'Not found')}`);
    console.log(`Installed: ${chalk.cyan(skillCount)} skills`);
    if (configData) {
        console.log(`Bundle:    ${chalk.cyan(configData.installedBundle || 'Unknown')}`);
        console.log(`Version:   ${chalk.cyan(configData.version || '1.0.0')}`);
    }
    console.log(chalk.dim('────────────────────────────────────────\n'));
};

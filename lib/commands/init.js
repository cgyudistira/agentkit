const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');

module.exports = async function init() {
    const spinner = ora('Initializing agentkit...').start();

    const projectRoot = process.cwd();
    const agentDir = path.join(projectRoot, '.agent');
    const skillsDir = path.join(agentDir, 'skills');

    try {
        await fs.ensureDir(skillsDir);

        // Create a default context or config file if needed
        const configFile = path.join(agentDir, 'agentkit.json');
        if (!await fs.pathExists(configFile)) {
            await fs.writeJson(configFile, {
                version: '1.0.0',
                installedSkills: []
            }, { spaces: 2 });
        }

        // Create workflows directory
        const workflowsDir = path.join(agentDir, 'workflows');
        await fs.ensureDir(workflowsDir);
        const workflowsFile = path.join(workflowsDir, 'workflows.json');
        if (!await fs.pathExists(workflowsFile)) {
            await fs.writeJson(workflowsFile, {
                "slash_commands": {
                    "/plan": "templates/skills/full-stack/concise-planning",
                    "/security": "templates/skills/security-expert/ethical-hacking-methodology"
                }
            }, { spaces: 2 });
        }

        spinner.succeed(chalk.green('Agentkit initialized successfully!'));
        console.log(chalk.dim(`\nSkills directory created at: ${skillsDir}`));
        console.log(chalk.cyan(`\nTry installing a skill pack: `) + chalk.bold(`agentkit install --pack web-wizard`));

    } catch (error) {
        spinner.fail(chalk.red('Initialization failed.'));
        console.error(error);
    }
};

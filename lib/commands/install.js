const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getBundles, getSkillsIndex, getSkillPath, PACKAGE_ROOT } = require('../utils');

const readline = require('readline');

// Progress bar helper
function showProgress(current, total, label) {
    const percent = Math.round((current / total) * 100);
    const barLength = 30;
    const filled = Math.round((percent / 100) * barLength);
    const empty = barLength - filled;
    // Use block characters for smoother look
    const bar = chalk.cyan('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));

    // Clear line and move cursor to start
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    // Ensure label doesn't overflow
    const safeLabel = (label || '').substring(0, 25).padEnd(25);
    process.stdout.write(`${bar} ${chalk.bold(percent.toString().padStart(3))}% ${chalk.dim(`(${current}/${total})`)} ${safeLabel}`);
}

module.exports = async function install(skillId, options) {
    const targetDir = path.resolve(process.cwd(), options.out || './.agent/skills');
    const bundles = await getBundles();
    const skillsIndex = await getSkillsIndex();

    let skillsToInstall = [];
    let bundleTitle = '';

    // Mode 1: Install ALL skills
    if (options.all) {
        skillsToInstall = skillsIndex.map(s => s.id);
        bundleTitle = 'ALL Skills (315+)';
        console.log(chalk.cyan(`\nInstalling ${chalk.bold(bundleTitle)}`));
        console.log(chalk.dim(`Found ${skillsToInstall.length} skills total.\n`));
    }
    // Mode 2: Pack installation (Bundle)
    else if (options.pack) {
        const bundle = bundles[options.pack];
        if (!bundle) {
            console.error(chalk.red(`\nBundle '${options.pack}' not found.`));
            console.log(chalk.dim('Available bundles: full-stack, security-expert, content-writer, ai-engineer, data-scientist, startup-founder, creative-studio\n'));
            return;
        }

        const featuredSkills = bundle.skills || [];
        const categorySkills = skillsIndex
            .filter(s => s.category === options.pack)
            .map(s => s.id);

        skillsToInstall = [...new Set([...featuredSkills, ...categorySkills])];
        bundleTitle = bundle.title;

        console.log(chalk.cyan(`\nInstalling Bundle: ${chalk.bold(bundleTitle)}`));
        console.log(chalk.dim(`Found ${skillsToInstall.length} skills.\n`));
    }
    // Mode 3: Single skill
    else if (skillId) {
        skillsToInstall = [skillId];
        bundleTitle = skillId;
        console.log(chalk.cyan(`\nInstalling skill: ${chalk.bold(skillId)}\n`));
    }
    // Mode 4: No args - show help
    else {
        console.log(chalk.yellow('\nUsage:'));
        console.log(chalk.white('  agentkit install <skill>              ') + chalk.dim('Install a single skill'));
        console.log(chalk.white('  agentkit install --pack <bundle>      ') + chalk.dim('Install a bundle'));
        console.log(chalk.white('  agentkit install --all                ') + chalk.dim('Install ALL 315+ skills'));
        console.log('');
        console.log(chalk.dim('Bundles: full-stack, security-expert, content-writer, ai-engineer, data-scientist, startup-founder, creative-studio\n'));
        return;
    }

    let successCount = 0;
    let failCount = 0;
    const total = skillsToInstall.length;

    try {
        await fs.ensureDir(targetDir);

        for (let i = 0; i < skillsToInstall.length; i++) {
            const id = skillsToInstall[i];
            showProgress(i + 1, total, chalk.dim(id.substring(0, 25)));

            const sourcePath = getSkillPath(id, skillsIndex);

            if (!sourcePath || !await fs.pathExists(sourcePath)) {
                failCount++;
                continue;
            }

            const destPath = path.join(targetDir, path.basename(sourcePath));

            try {
                await fs.copy(sourcePath, destPath, { overwrite: true });
                successCount++;
            } catch (err) {
                failCount++;
            }
        }

        // Show 100% complete and move to next line
        showProgress(total, total, 'Complete');
        process.stdout.write('\n');

        if (failCount > 0) {
            console.log(chalk.yellow(`\nInstalled ${successCount}/${total} skills (${failCount} not found)`));
        } else {
            console.log(chalk.green(`\nInstalled ${successCount} skills to ${targetDir}`));
        }
        console.log('');

    } catch (error) {
        console.log(chalk.red('\nInstallation failed.'));
        console.error(error);
    }
};

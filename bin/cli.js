#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const { bold, cyan, green, red, yellow, dim } = require('kleur');
const ora = require('ora');
const bundles = require('../lib/bundles.json');

// Base directories
const PACKAGE_ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(PACKAGE_ROOT, 'skills');

async function main() {
    console.log('\n');
    console.log(bold(cyan('🤖 CODE AGENTS CLI')));
    console.log(dim('   Supercharge your AI Agent with 255+ pro skills.'));
    console.log('\n');

    // 0. Parse arguments (non-interactive mode)
    const args = process.argv.slice(2);
    let bundleKeyArg, targetDirArg;

    args.forEach(arg => {
        if (arg.startsWith('--bundle=')) bundleKeyArg = arg.split('=')[1];
        if (arg.startsWith('--out=')) targetDirArg = arg.split('=')[1];
    });

    let response = {};

    if (bundleKeyArg && targetDirArg) {
        console.log(cyan(`Running in non-interactive mode.`));
        console.log(`Bundle: ${bundleKeyArg}`);
        console.log(`Target: ${targetDirArg}`);
        response = { bundleKey: bundleKeyArg, targetDir: targetDirArg };
    } else {
        // 1. Select Profile / Bundle
        const bundleChoices = Object.entries(bundles).map(([key, data]) => ({
            title: `${bold(data.title)} ${dim(`(${data.skills.length} skills)`)}`,
            description: data.description,
            value: key
        }));

        response = await prompts([
            {
                type: 'select',
                name: 'bundleKey',
                message: 'Choose your Agent Profile:',
                choices: [
                    ...bundleChoices,
                    { title: 'Custom (Install all skills)', value: 'all', description: 'Install the entire library (255+ skills)' },
                    { title: 'Exit', value: 'exit' }
                ],
                initial: 0
            },
            {
                type: (prev) => prev === 'exit' ? null : 'text',
                name: 'targetDir',
                message: 'Where should we install the skills?',
                initial: './.agent/skills',
                validate: value => value.length > 0 ? true : 'Please enter a directory path'
            }
        ]);
    }

    if (!response.bundleKey || response.bundleKey === 'exit') {
        console.log(yellow('   Bye! 👋'));
        process.exit(0);
    }

    const targetDir = path.resolve(process.cwd(), response.targetDir);

    // 2. Resolve Skills list
    let skillsToInstall = [];
    if (response.bundleKey === 'all') {
        // Scan all directories in source skills dir
        if (!fs.existsSync(SKILLS_DIR)) {
            console.error(red(`❌ Error: Skills directory not found at ${SKILLS_DIR}`));
            process.exit(1);
        }
        // Simple logic: walk skills dir
        // For "all", we might just copy the whole folder?
        // But skills are categorized. Let's list all SKILL.md files.
        // Simpler: Just copy the entire "skills" directory contents recursively.
        skillsToInstall = ['ALL'];
    } else {
        // Use bundle definition
        skillsToInstall = bundles[response.bundleKey].skills;
    }

    console.log('\n');
    const spinner = ora(`Installing ${skillsToInstall.length === 1 && skillsToInstall[0] === 'ALL' ? 'ALL' : skillsToInstall.length} skills to ${dim(response.targetDir)}...`).start();

    try {
        await fs.ensureDir(targetDir);

        if (skillsToInstall[0] === 'ALL') {
            await fs.copy(SKILLS_DIR, targetDir, {
                overwrite: true,
                filter: (src) => {
                    return !src.includes('node_modules') && !src.includes('.git');
                }
            });
        } else {
            // Install specific skills
            // Limitation: bundle definition only has skill ID "concise-planning".
            // We need to find where "concise-planning" lives (e.g. skills/concise-planning OR skills/game-development/2d-games).

            // Indexing logic:
            // We need a map of skill_id -> path.
            // We can use skills_index.json if available, or scan on the fly.
            // Let's load skills_index.json
            const index = require('../skills_index.json');
            const skillMap = {};
            index.forEach(s => {
                skillMap[s.id] = s.path; // path is relative to repo root, e.g. "skills/game-development/2d-games"
            });

            let installedCount = 0;
            let missingSkills = [];

            for (const skillId of skillsToInstall) {
                const relativePath = skillMap[skillId];

                // Try fallback if ID match fails (sometimes ID in bundle has different casing?)
                // The generator script used ID from matching ` ... ` in markdown.
                // It might not match exact ID in skils_index.json
                // Let's try exact match first.

                let foundPath = relativePath;
                if (!foundPath) {
                    // fuzzy search manually? or simplified ID?
                    // For now, treat as missing.
                    missingSkills.push(skillId);
                    continue;
                }

                const sourcePath = path.join(PACKAGE_ROOT, foundPath);
                const destPath = path.join(targetDir, path.basename(foundPath)); // Flatten? Or keep structure?
                // Flattening is better for "installing skills" usually, but some might prefer folders.
                // Antigravity usually supports flat or nested.
                // Let's flatten for simplicity unless name collision?
                // Actually, let's keep the folder name but put it directly in targetDir.
                // e.g. .agent/skills/2d-games/SKILL.md

                if (await fs.pathExists(sourcePath)) {
                    await fs.copy(sourcePath, destPath, { overwrite: true });
                    installedCount++;
                } else {
                    console.error(`Warning: Source path not found ${sourcePath}`);
                    missingSkills.push(skillId);
                }
            }

            spinner.succeed(green(`Successfully installed ${installedCount} skills!`));
            if (missingSkills.length > 0) {
                console.log(yellow(`\n⚠️  Could not find ${missingSkills.length} skills:`));
                missingSkills.forEach(id => console.log(dim(`   - ${id}`)));
            }
        }

        if (skillsToInstall[0] === 'ALL') {
            spinner.succeed(green('Successfully installed all skills!'));
        }

        console.log('\n');
        console.log(bold('🚀 Next steps:'));
        console.log(`1. Navigate to your project root.`);
        console.log(`2. If using Cursor, ask: ${cyan('@skill-name help me...')}`);
        console.log(`3. If using CLI, run: ${cyan('/skill-name')}`);
        console.log('\n');

    } catch (err) {
        spinner.fail(red('Installation failed.'));
        console.error(err);
        process.exit(1);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const PACKAGE_ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(PACKAGE_ROOT, 'templates', 'skills');
const INDEX_FILE = path.join(SKILLS_DIR, 'skills_index.json');
const BUNDLES_FILE = path.join(PACKAGE_ROOT, 'lib', 'bundles.json');

async function getSkillsIndex() {
    if (await fs.pathExists(INDEX_FILE)) {
        return await fs.readJson(INDEX_FILE);
    }
    return [];
}

async function getBundles() {
    if (await fs.pathExists(BUNDLES_FILE)) {
        return await fs.readJson(BUNDLES_FILE);
    }
    return {};
}

function getSkillPath(skillId, index) {
    const skill = index.find(s => s.id === skillId);
    if (!skill) return null;
    return path.join(PACKAGE_ROOT, skill.path);
}

module.exports = {
    PACKAGE_ROOT,
    SKILLS_DIR,
    getSkillsIndex,
    getBundles,
    getSkillPath
};

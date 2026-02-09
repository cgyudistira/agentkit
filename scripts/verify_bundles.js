const fs = require('fs');
const path = require('path');

const bundles = require('../lib/bundles.json');
const index = require('../skills_index.json');

const availableSkills = new Set(index.map(s => s.id));

console.log('Verifying Bundles...');
let hasErrors = false;

for (const [bundleId, bundle] of Object.entries(bundles)) {
    console.log(`\nChecking Bundle: ${bundle.title} (${bundleId})`);
    const missing = [];
    for (const skillId of bundle.skills) {
        if (!availableSkills.has(skillId)) {
            missing.push(skillId);
        }
    }

    if (missing.length > 0) {
        hasErrors = true;
        console.log(`❌ Missing Skills (${missing.length}):`);
        missing.forEach(id => console.log(`   - ${id}`));
    } else {
        console.log('✅ All skills valid.');
    }
}

if (hasErrors) {
    console.log('\n❌ Verification Failed: Missing skills found.');
    process.exit(1);
} else {
    console.log('\n✅ Verification Passed: All bundles are valid.');
}

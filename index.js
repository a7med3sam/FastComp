#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function findDuplicates(array) {
    const seen = new Set();
    const duplicates = new Set();
    array.forEach(name => {
        if (seen.has(name)) {
            duplicates.add(name);
        }
        seen.add(name);
    });
    return Array.from(duplicates);
}

function validateComponentName(name) {
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(name);
}

function checkIfComponentExists(folderName) {
    const folderPath = path.join(process.cwd(), folderName);
    const folderNamesInDirectory = fs.readdirSync(process.cwd()); 

    return folderNamesInDirectory.some(existingName => existingName.toLowerCase() === folderName.toLowerCase());
}

function createFolderAndFiles(folderNames, createCSS) {
    const duplicates = findDuplicates(folderNames);
    if (duplicates.length > 0) {
        console.error(`Error: Duplicates detected: ${duplicates.join(', ')}`);
        return;
    }

    folderNames.forEach(folderName => {
        if (!validateComponentName(folderName)) {
            console.log(`⛔ Invalid component name "${folderName}". Use only English letters, numbers, and the "_" or "-" characters. ⛔`);
            return;
        }

        const capitalizedFolderName = folderName.charAt(0).toUpperCase() + folderName.slice(1);
        const folderPath = path.join(process.cwd(), capitalizedFolderName.trim());

        if (checkIfComponentExists(folderName)) {
            console.log(`⛔ Component "${capitalizedFolderName}" already exists.⛔`);
            return;
        }

        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                return console.error(`Error creating folder "${capitalizedFolderName}": ${err.message}`);
            }

            const jsxFilePath = path.join(folderPath, `${capitalizedFolderName}.jsx`);
            let jsxContent = `import React from 'react';\n`;

            if (createCSS) {
                jsxContent += `import './${folderName}.css';\n`;
            }

            jsxContent += `\nconst ${capitalizedFolderName} = () => {\n  return (\n    <div>${capitalizedFolderName}</div>\n  );\n}\n\nexport default ${capitalizedFolderName};`;

            fs.writeFile(jsxFilePath, jsxContent, (err) => {
                if (err) {
                    return console.error(`Error creating JSX file for "${capitalizedFolderName}": ${err.message}`);
                }
                console.log(`Created file: ${jsxFilePath}`);
            });

            if (createCSS) {
                const cssFilePath = path.join(folderPath, `${folderName}.css`);
                fs.writeFile(cssFilePath, '', (err) => {
                    if (err) {
                        return console.error(`Error creating CSS file for "${folderName}": ${err.message}`);
                    }
                    console.log(`Created file: ${cssFilePath}`);
                });
            }
        });
    });
}

let folderNames = process.argv.slice(2).map(name => name.trim()).filter(name => name); 

if (folderNames.length === 0) {
    console.log("📌 \x1b[33m Fast-Components\x1b[0m");

    console.log('');

    rl.question('📂 component name: ', (componentName) => {
        console.log(''); 

        if (!validateComponentName(componentName)) {
            console.log("⛔ Invalid name. Use only English letters, numbers, and the '_' or '-' characters. ⛔");
            console.log(''); 
            rl.close();
            return;
        }

        if (componentName.trim()) {
            if (checkIfComponentExists(componentName)) {
                console.log(`⛔ Component "${componentName}" already exists ⛔`);
                console.log(''); 
                rl.close();
                return;
            }

            rl.question('✨ CSS magic? [Y/n]: ', (answer) => {
                const createCSS = answer.toLowerCase() === 'y';
                createFolderAndFiles([componentName.trim()], createCSS);
                rl.close();
            });
        } else {
            console.log("⛔ You must provide a component name ⛔");
            console.log(''); 
            rl.close();
        }
    });
} else {
    rl.question('\n✨ CSS magic? [Y/n]: ', (answer) => {
        const createCSS = answer.toLowerCase() === 'y';
        createFolderAndFiles(folderNames, createCSS);
        console.log('\n'); 
        rl.close();
    });
}
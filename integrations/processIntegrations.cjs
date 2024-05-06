const fs = require('fs');
const path = require('path');
const readline = require('readline');

const integrationsPath = path.join(__dirname);
const catalystFilePath = path.join(__dirname, '..', 'catalyst.json');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function listIntegrations() {
  const dirs = fs.readdirSync(integrationsPath, { withFileTypes: true });
  const integrations = [];

  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const detailsPath = path.join(integrationsPath, dir.name, 'details.json');
      if (fs.existsSync(detailsPath)) {
        const data = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
        integrations.push({
          path: detailsPath,
          directoryName: dir.name,
          name: data.name,
          description: data.description
        });
      }
    }
  }
  return integrations;
}

function askForSelection(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function askForConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      // Accept 'y' or 'yes' (case-insensitive)
      resolve(answer.trim().toLowerCase().startsWith('y'));
    });
  });
}

async function processIntegration(integration) {
  const details = JSON.parse(fs.readFileSync(integration.path, 'utf8'));

  if (details.preInstall && details.preInstall.instructions) {
    console.log("\nPre-installation Instructions:");
    console.log(details.preInstall.instructions + "\n\n");
    await askForSelection('Press Enter to confirm you have read and understood the pre-installation instructions and wish to proceed...');
  }

  if (details.replaces && details.replaces.length > 0) {
    for (const replacement of details.replaces) {
      const srcPath = path.resolve(__dirname, '..' , 'integrations', integration.directoryName, replacement.with);
      const destPath = path.resolve(__dirname, '..', replacement.dir);

      const confirm = await askForConfirmation(`\nReplace ${destPath} with ${srcPath}? (yes/no) `);
      if (confirm) {
        if (replacement.method === 'fs-copy') {
          fs.cp(srcPath, destPath, { recursive: true }, (err) => {
            if (err) {
              console.error(`Error copying from ${replacement.dir} to ${replacement.with}:`, err);
            } else {
              console.log(`✅ Successfully copied from ${replacement.dir} to ${replacement.with}`);
              recordIntegration(integration.directoryName, 'replaced', replacement);
            }
          });
        } else {
          console.log(`Unknown method ${replacement.method}`);
        }
      } else {
        console.log(`Skipping replacement of ${destPath}`);
      }
    }
  } else {
    console.log('No replacement operations found.');
  }

  if (details.adds && details.adds.length > 0) {
    for (const addition of details.adds) {
      const confirm = await askForConfirmation(`\Add to ${addition.to}? (yes/no) `);
      if (confirm) {
        if (addition.method === 'append' && (addition.fileContents || addition.envVar)) {
          let content = ''
          if (addition.fileContents) {
            const srcPath = path.resolve(__dirname, '..' , 'integrations', integration.directoryName, addition.fileContents);
            content = "\n" + fs.readFileSync(srcPath, 'utf8');
          } else if (addition.envVar) {
            content = "\n" + addition.envVar + '=""';
          }

          const destPath = path.resolve(__dirname, '..', addition.to);
          fs.appendFileSync(destPath, content);
          console.log(`Successfully appended contents to ${addition.to}`);
          recordIntegration(integration.directoryName, 'added', addition);
        } else if (addition.to === 'graphql-client') {
          const { key, source } = addition;
          // Process graphql-client addition here

          recordIntegration(integration.directoryName, 'added', addition);
        } else {
          console.log(`Unknown method ${addition.method}`);
        }
      } else {
        console.log(`Skipping updates to ${addition.to}`);
      }
    }
  } else {
    console.log('No addition operations found.');
  }

  // Output post-install instructions
  if (details.postInstall && details.postInstall.instructions) {
    console.log("\nPost-installation Instructions:");
    console.log(details.postInstall.instructions);
  }

  rl.close();
}

async function recordIntegration(integrationName, action, details) {
  let catalyst = {};
  if (fs.existsSync(catalystFilePath)) {
    catalyst = JSON.parse(fs.readFileSync(catalystFilePath, 'utf8'));
  }

  const currentDate = new Date().toISOString();
  if (!catalyst[integrationName]) {
    catalyst[integrationName] = [];
  }
  catalyst[integrationName].push({ 
    date: currentDate, 
    action, 
    details
  });

  fs.writeFileSync(catalystFilePath, JSON.stringify(catalyst, null, 2));
  console.log(`Recorded ${integrationName} integration on ${currentDate}`);
}

async function main() {
  const integrations = await listIntegrations();
  const selectedIntegration = await selectIntegration(integrations);
  if (selectedIntegration) {
    if (fs.existsSync(catalystFilePath)) {
      const catalyst = JSON.parse(fs.readFileSync(catalystFilePath, 'utf8'));
      const integrationName = selectedIntegration.directoryName;
      if (catalyst[integrationName]) {
        const lastRunDetails = catalyst[integrationName][catalyst[integrationName].length - 1];
        console.log(`ℹ️ This integration was last processed on ${lastRunDetails.date}`);
        const confirmRun = await askForConfirmation('Do you want to run it again? (yes/no) ');
        if (confirmRun) {
          await processIntegration(selectedIntegration);
        } else {
          console.log('Integration process cancelled.');
        }
      } else {
        await processIntegration(selectedIntegration);
      }
    } else {
      await processIntegration(selectedIntegration);
    }
  }
}

async function selectIntegration(integrations) {
  console.log('Available Integrations:');
  integrations.forEach((integration, index) => {
    console.log(`${index + 1}: ${integration.name}`);
  });

  const input = await askForSelection('Enter the number of the integration you want to process: ');
  const index = parseInt(input, 10) - 1;

  if (!isNaN(index) && index >= 0 && index < integrations.length) {
    console.log(`\nSelected: ${integrations[index].name}`);
    console.log(`Description: ${integrations[index].description}`);
    return integrations[index];
  } else {
    console.log('\n*Invalid selection. Please enter a valid number.* \n');
    return selectIntegration(integrations);  // Recurse until a valid input is given
  }
}

main();
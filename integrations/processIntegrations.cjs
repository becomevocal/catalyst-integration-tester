(async () => {
  const chalkModule = await import('chalk');
  const chalk = chalkModule.default;
  const { Command } = await import('commander');
  const inquirerModule = await import('@inquirer/prompts');
  const { input, confirm, select } = inquirerModule;

  const fs = require('fs');
  const path = require('path');
  const cp = require('child_process');
  const { platform } = require('os');

  const WINDOWS_PLATFORM = 'win32';
  const MAC_PLATFORM = 'darwin';
  const osPlatform = platform();

  const integrationsPath = path.join(__dirname);
  const configFilePath = path.join(__dirname, '..', 'tailwind.config.js');
  const catalystFilePath = path.join(__dirname, '..', 'catalyst.json');

  let forceConfirm = false;
  let selectedIntegrationName = null;

  const program = new Command();

  program
    .option('-f, --force', 'Force confirmation for all prompts')
    .option('-s, --select <integration>', 'Select integration by name')
    .parse(process.argv);

  const options = program.opts();
  forceConfirm = options.force || false;
  selectedIntegrationName = options.select || null;

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
            description: data.description,
          });
        }
      }
    }
    return integrations;
  }

  async function askForInput(question, defaultValue) {
    if (forceConfirm) {
      return defaultValue;
    } else {
      const response = await input({
        message: question,
      });
      return response.trim();
    }
  }

  async function askForConfirmation(question) {
    if (forceConfirm) {
      return true;
    } else {
      const response = await confirm({
        message: question,
        default: false,
      });
      return response;
    }
  }

  async function processIntegration(integration) {
    const details = JSON.parse(fs.readFileSync(integration.path, 'utf8'));

    if (details.preInstall && details.preInstall.instructions) {
      console.log(chalk.yellow('\nPre-installation Instructions:'));
      console.log(details.preInstall.instructions + "\n\n");

      // todo: check if preinstall.md exists before prompting this
      // If there is, say "1) open up more details in browser and continue 2) continue without viewing more details"

      const preinstallDocPath = integration.path.replace('details.json', 'preinstall.md');
      if (fs.existsSync(preinstallDocPath)) {
        const confirmation = await askForInput(
          "Enter 'o' to open up more details in your browser, or any other value to confirm you're ready to proceed...",
          '',
        );

        if (confirmation === 'o') {
          let command;
          

          if (osPlatform === WINDOWS_PLATFORM) {
            command = `start microsoft-edge:${preinstallDocPath}`;
          } else if (osPlatform === MAC_PLATFORM) {
            command = `open -a "Google Chrome" ${preinstallDocPath}`;
          } else {
            command = `google-chrome --no-sandbox ${preinstallDocPath}`;
          }
          console.log(`executing command: ${command}`);

          cp.exec(command);
        }
      }
    }

    // Process all 'replace' steps
    if (details.replaces && details.replaces.length > 0) {
      for (const replacement of details.replaces) {
        const srcPath = path.resolve(integrationsPath, integration.directoryName, replacement.with);
        const destPath = path.resolve(__dirname, '..', replacement.dir);

        if (
          !srcPath.startsWith(integrationsPath) ||
          !destPath.startsWith(path.resolve(__dirname, '..'))
        ) {
          console.error(chalk.red('Invalid path detected. Aborting operation.'));
          continue;
        }

        const confirm = await askForConfirmation(`\nReplace ${destPath} with ${srcPath}? (y/N) `);
        if (confirm) {
          if (replacement.method === 'fs-copy') {
            fs.cp(srcPath, destPath, { recursive: true }, (err) => {
              if (err) {
                console.error(chalk.red(`Error copying from ${replacement.dir} to ${replacement.with}:`), err);
              } else {
                console.log(chalk.green(`✅ Successfully copied from ${replacement.dir} to ${replacement.with}`));
                recordIntegration(integration.directoryName, 'replaced', replacement);
              }
            });
          } else {
            console.log(chalk.red(`Unknown method ${replacement.method}`));
          }
        } else {
          console.log(chalk.blue(`Skipping replacement of ${destPath}`));
        }
      }
    } else {
      console.log(chalk.blue('No replacement operations found.'));
    }

    // Process all 'add' steps
    if (details.adds && details.adds.length > 0) {
      for (const addition of details.adds) {
        const confirm = await askForConfirmation(`\nAdd to ${addition.to}? (y/N) `);
        if (confirm) {
          if (addition.method === 'append' && (addition.fileContents || addition.envVar)) {
            let content = '';
            if (addition.fileContents) {
              const srcPath = path.resolve(
                integrationsPath,
                integration.directoryName,
                addition.fileContents,
              );
              if (!srcPath.startsWith(integrationsPath)) {
                console.error(chalk.red('Invalid file content path detected. Aborting operation.'));
                continue;
              }
              content = '\n' + fs.readFileSync(srcPath, 'utf8');
            } else if (addition.envVar) {
              const envVarValue = await askForInput(
                `\nWhat would you like to use as ${addition.envVar}? `,
              );
              content = '\n' + addition.envVar + `="${envVarValue}"`;
            }

            const destPath = path.resolve(__dirname, '..', addition.to);
            fs.appendFileSync(destPath, content);
            console.log(chalk.green(`Successfully appended contents to ${addition.to}`));
            recordIntegration(integration.directoryName, 'added', addition);
          } else if (addition.to === 'tailwind.config.js') {
            fs.readFile(configFilePath, 'utf8', (err, data) => {
              if (err) {
                console.error(chalk.red('Error reading Tailwind config file:'), err);
                return;
              }

              // Define the new path to add
              const newPath = addition.with;

              // Regex to find the content array and add a new path
              const regex = new RegExp(`(${addition.key}:\\s*\\[[^\\]]*)(\\])`, 'g');
              const updatedConfig = data.replace(regex, `$1, '${newPath}'$2`);

              fs.writeFileSync(configFilePath, updatedConfig, 'utf8', (err) => {
                if (err) {
                  console.error(chalk.red('Error writing Tailwind config file:'), err);
                  return;
                }
                console.log(chalk.green(`Tailwind config file '${addition.key}' key updated successfully!`));
              });
            });
          } else if (addition.to === 'graphql-client') {
            const { key, source } = addition;
            // Process graphql-client addition here

            recordIntegration(integration.directoryName, 'added', addition);
          } else if (addition.method === 'function' && addition.file) {
            // Validate that the function file is within the integrations directory
            const functionPath = path.resolve(
              integrationsPath,
              integration.directoryName,
              addition.file,
            );
            if (!functionPath.startsWith(integrationsPath)) {
              console.error(chalk.red(`Function file ${addition.file} is not in the integrations directory.`));
              continue;
            }

            // Dynamically require and execute the function
            try {
              const runFunction = require(functionPath);
              const destPath = path.resolve(__dirname, '..', addition.to);
              if (!destPath.startsWith(path.resolve(__dirname, '..'))) {
                console.error(chalk.red('Invalid destination path detected. Aborting operation.'));
                continue;
              }
              await runFunction(destPath, addition.vars);
              console.log(chalk.green(`Successfully processed ${addition.to} using custom function`));
              recordIntegration(integration.directoryName, 'added', addition);
            } catch (err) {
              console.error(chalk.red(`Error processing ${addition.to} using custom function:`), err);
            }
          } else {
            console.log(chalk.red(`Unknown method ${addition.method}`));
          }
        } else {
          console.log(chalk.blue(`Skipping updates to ${addition.to}`));
        }
      }
    } else {
      console.log(chalk.blue('No addition operations found.'));
    }

    // Output post-install instructions
    if (details.postInstall && details.postInstall.instructions) {
      console.log(chalk.yellow('\nPost-installation Instructions:'));
      console.log(details.postInstall.instructions);
    }
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
      details,
    });

    fs.writeFileSync(catalystFilePath, JSON.stringify(catalyst, null, 2));
    console.log(chalk.green(`Recorded ${integrationName} integration on ${currentDate}`));
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
          console.log(chalk.yellow(`ℹ️ This integration was last processed on ${lastRunDetails.date}`));
          const confirmRun = await askForConfirmation('Do you want to run it again? (y/N) ');
          if (confirmRun) {
            await processIntegration(selectedIntegration);
          } else {
            console.log(chalk.blue('Integration process cancelled.'));
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
    if (selectedIntegrationName) {
      const integration = integrations.find((int) => int.directoryName === selectedIntegrationName);
      if (integration) {
        console.log(chalk.green(`Automatically selected: ${integration.name}`));
        console.log(chalk.blue(`Description: ${integration.description}`));
        return integration;
      } else {
        console.log(chalk.red(`No integration found with directory name: ${selectedIntegrationName}`));
      }
    } else {
      console.log(chalk.yellow('\n◢ Catalyst Integrations:'));

      const response = await select({
        message: 'Select the integration you want to process:',
        choices: integrations.map((integration, index) => ({
          name: `${index + 1}: ${integration.name}`,
          description: integration.description,
          value: integration.directoryName,
        })),
      });

      const selectedIntegration = integrations.find(
        (integration) => integration.directoryName === response
      );

      console.log(chalk.green(`\nSelected: ${selectedIntegration.name}`));
      console.log(chalk.blue(`Description: ${selectedIntegration.description}`));
      return selectedIntegration;
    }
  }

  main();
})();

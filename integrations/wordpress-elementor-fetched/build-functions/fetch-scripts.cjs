const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Determine the environment and load the appropriate .env files
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

if (env === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.production') });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Load .env as fallback
} else {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
}

// Log the environment being used
console.log(`Environment: ${env}`);

// Log the WORDPRESS_GRAPHQL_ENDPOINT environment variable
console.log(`WORDPRESS_GRAPHQL_ENDPOINT: ${process.env.WORDPRESS_GRAPHQL_ENDPOINT}`);

async function scrapeStylesFromURL(url) {
  try {
    // ?LSCWP_CTRL=before_optm removes common Litespeed caching optmizations that prevent 
    // style and link tags from coming across the wire initially
    const response = await fetch(url?.replace("/graphql","?LSCWP_CTRL=before_optm"));
    const html = await response.text();

    const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;

    let matches = html.match(regex);
    let scriptsOutput = '';

    matches.forEach((match, idx) => {
        const tagName = match.match(/<(\w+)/)[1];
        const attributes = {};
        const attrRegex = /(\w+)=["']?([^"']+)["']?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(match)) !== null) {
            attributes[attrMatch[1]] = attrMatch[2];
        }

        if (tagName === 'script') {
            const scriptContent = match.match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1].trim();
            if (scriptContent.length > 0) {
                scriptsOutput += `\n<Script id="${attributes['id'] || "script" + idx}">{\`${scriptContent.replaceAll("`","\\`")}\`}</Script>`;
            } else {
                scriptsOutput += `\n<Script src="${attributes['src']}" id="${attributes['id'] || "script" + idx}"></Script>`;
            }
            console.log(`${tagName} tag attributes:`, attributes, 'Content:', scriptContent.trim());
        } else {
            console.log(`${tagName} tag attributes:`, attributes);
        }
    });

    console.log(scriptsOutput)

    return { scripts: scriptsOutput };
  } catch (err) {
    console.error(`Failed to scrape scripts from ${url}:`, err);
    return { scripts: '' };
  }
}

async function modifyFile(destPath) {
  try {
    // URL to scrape
    const url = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

    // Scrape styles from the URL
    const { scripts } = await scrapeStylesFromURL(url);

    // Read the current content of the destination file
    let currentContent = fs.readFileSync(destPath, 'utf8');

    // Put scripts right before </html>
    currentContent = currentContent.split("</html>");

    // Append the scraped styles to the file content
    currentContent = `${currentContent[0]}\n{/* Scripts (Start) */}${scripts}\n{/* Scripts (End) */}\n</html>${currentContent[1]}`;

    // Write the updated content back to the file
    fs.writeFileSync(destPath, currentContent, 'utf8');
    console.log(`Modified ${destPath} successfully.`);
  } catch (err) {
    console.error(`Failed to modify ${destPath}:`, err);
  }
}

module.exports = modifyFile;

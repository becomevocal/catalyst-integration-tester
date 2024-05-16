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

    let styleImports = '';
    let inlineStyles = '';

    // Regex to match <link rel="stylesheet" href="...">
    const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      styleImports += `@import url("${match[1]}");\n`;
    }

    // Resetting the lastIndex property to ensure multiple matches for styleRegex
    linkRegex.lastIndex = 0;

    // Regex to match <style>...</style>
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    while ((match = styleRegex.exec(html)) !== null) {
      inlineStyles += `${match[1]}\n`;
    }

    // Resetting the lastIndex property to ensure multiple matches for styleRegex
    styleRegex.lastIndex = 0;

    return { styleImports, inlineStyles };
  } catch (err) {
    console.error(`Failed to scrape styles from ${url}:`, err);
    return { styleImports: '', inlineStyles: '' };
  }
}

async function modifyFile(destPath) {
  try {
    // URL to scrape
    const url = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

    // Scrape styles from the URL
    const { styleImports, inlineStyles } = await scrapeStylesFromURL(url);

    // Read the current content of the destination file
    let currentContent = fs.readFileSync(destPath, 'utf8');

    // Append the scraped styles to the file content
    currentContent = `/* Scraped Styles */\n${styleImports}${inlineStyles}\n\n` + currentContent;

    // Write the updated content back to the file
    fs.writeFileSync(destPath, currentContent, 'utf8');
    console.log(`Modified ${destPath} successfully.`);
  } catch (err) {
    console.error(`Failed to modify ${destPath}:`, err);
  }
}

module.exports = modifyFile;

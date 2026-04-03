import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

async function createZip() {
  const outputName = 'news_app_cpanel_deploy.zip';
  const outputPath = path.join(rootDir, outputName);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  return new Promise((resolve, reject) => {
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve();
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        reject(err);
      }
    });

    archive.on('error', function(err) {
      reject(err);
    });

    archive.pipe(output);

    // Add directories
    const dirsToAdd = ['server', 'public', 'src', 'scripts', 'dist'];
    dirsToAdd.forEach(dir => {
      const dirPath = path.join(rootDir, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`Adding folder: ${dir}`);
        archive.directory(dirPath, dir);
      }
    });

    // Add individual files
    const filesToAdd = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      'schema.sql',
      '.env.example',
      '.env.production',
      'metadata.json'
    ];
    filesToAdd.forEach(file => {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Adding file: ${file}`);
        archive.file(filePath, { name: file });
      }
    });

    // Create a README for cPanel deployment
    const readmeContent = `
# cPanel Deployment Instructions

1.  **Upload ZIP**: Upload this ZIP file to your cPanel File Manager (e.g., in a folder named 'news-app' outside public_html).
2.  **Extract**: Extract the ZIP file.
3.  **Database**:
    *   Go to "MySQL Databases" in cPanel.
    *   Create a new database (e.g., 'news_app').
    *   Create a new user and assign it to the database with all privileges.
    *   Go to "phpMyAdmin", select the database, and import 'schema.sql'.
4.  **Node.js App**:
    *   Go to "Setup Node.js App" in cPanel.
    *   Click "Create Application".
    *   **Node.js version**: Select 18 or higher.
    *   **Application mode**: Production.
    *   **Application root**: Path to your extracted folder (e.g., 'news-app').
    *   **Application URL**: Your desired URL.
    *   **Application startup file**: 'dist/server.js' (This is the compiled server file).
5.  **Environment Variables**:
    *   In the "Setup Node.js App" interface, add the following variables:
        *   DB_HOST: localhost
        *   DB_USER: (your db user)
        *   DB_PASS: (your db password)
        *   DB_NAME: (your db name)
        *   JWT_SECRET: (a random secret string)
        *   GEMINI_API_KEY: (your Gemini API key)
6.  **Install Dependencies**:
    *   Click "Run npm install" in the Node.js App interface.
7.  **Start App**:
    *   Click "Start App" or "Restart".
`;
    archive.append(readmeContent, { name: 'README_CPANEL.md' });

    archive.finalize();
  });
}

createZip().catch(err => {
  console.error('Error creating zip:', err);
  process.exit(1);
});

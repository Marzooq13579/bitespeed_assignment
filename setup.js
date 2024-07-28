// setup.js

const { execSync } = require('child_process');
const path = require('path');

// Define the project directory
const projectDir = path.resolve(__dirname);

// Function to execute shell commands
const execCommand = (command) => {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: projectDir });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
};

// Ensure Docker is running
try {
  execCommand('docker info');
} catch {
  console.error('Docker is not running. Please start Docker and try again.');
  process.exit(1);
}

// Start Docker containers
execCommand('docker-compose up -d');

// Install dependencies
execCommand('npm install');

// Run migrations
execCommand('npm run migration:run');

// Start the application
execCommand('npm run start:dev');

console.log('Setup complete!');

# Bitespeed Backend Setup

## Prerequisites

- Docker
- Node.js (v18 or higher)

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/bitespeed-backend.git
   cd bitespeed-backend
   ```

2. Run the setup script:
   ```bash
   node setup.js
   ```

This script will:

- Ensure Docker is running
- Start the Docker containers
- Install the necessary dependencies
- Run any required migrations
- Start the application in development mode

## API Endpoint

- `POST http://localhost:3000/identify`

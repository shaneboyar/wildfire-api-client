# `wildfire-api-client`

`wildfire-api-client` is a client library for interacting with the Wildfire API. It also includes a CLI tool that can be used as an npm script in your project.

## Installation

```console
npm install wildfire-api-client
```

## Environment Variables

To use the Wildfire API client and CLI, you need to set the following environment variables:

- `WILDFIRE_APP_ID`: Your application ID for accessing the Wildfire API.
- `WILDFIRE_APP_SECRET`: Your application secret for accessing the Wildfire API.
- `WILDFIRE_ADMIN_APP_ID`: Your admin application ID for accessing the Wildfire API.
- `WILDFIRE_ADMIN_APP_SECRET`: Your admin application secret for accessing the Wildfire API.

### Setting Environment Variables

You can set these environment variables in your shell configuration file (e.g., `.bashrc`, `.zshrc`):

```bash
export WILDFIRE_APP_ID=your_app_id
export WILDFIRE_APP_SECRET=your_app_secret
export WILDFIRE_ADMIN_APP_ID=admin_app_id
export WILDFIRE_ADMIN_APP_SECRET=admin_app_secret
```

Alternatively, you can use a `.env` file with the `dotenv` package for the client and `dotenv-cli` for the CLI:

1. Install `dotenv` and `dotenv-cli`:

   ```bash
   npm install dotenv
   npm install -g dotenv-cli
   ```

2. Create a `.env` file in your project root:

   ```
    WILDFIRE_APP_ID=your_app_id
    WILDFIRE_APP_SECRET=your_app_secret
    WILDFIRE_ADMIN_APP_ID=admin_app_id
    WILDFIRE_ADMIN_APP_SECRET=admin_app_secret
   ```

3. Load the environment variables in your client code:

   ```javascript
   require('dotenv').config();
   const wildfireApiClient = require('wildfire-api-client');
   ```

4. Run the CLI with `dotenv`:

   ```bash
   dotenv -e .env -- npm run wildfire
   ```

For more detailed documentation, refer to the Wildfire Client Documentation in the docs folder.

## Usage

### Client Library

const wildfireApiClient = require('wildfire-api-client');

// ...existing code...

### CLI Tool

You can use the CLI tool by adding it to your npm scripts in package.json:

```json
{
  "scripts": {
    "wildfire": "wildfire-api-client-cli"
  }
}
```

Then, you can run the CLI tool using:

```console
npm run wildfire
```

For more detailed documentation, refer to the Wildfire Client Documentation in the docs folder.

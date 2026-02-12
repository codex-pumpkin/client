<p align="center">
  <img src="Logo.svg" alt="Project Logo" width="500"/>
</p>

# CodeX Client Component
This repository contains the code for the CodeX client component.

## Project Structure
- `public/`: Public assets
- `src/`: Source files. Main indexand script file
  - `app/environment`: Infrastructure to get environment configuration
  - `app/model/network`: Connection to the REST-API of the backend
  - `app/model/domain`: Domain models for the entities
  - `app/model/authentication`: Abstraction over the authentication. Keeps the currently authenticated account
 
## Containerization
The project can be built into an image using
```bash
docker build . -t codex/client
```

The building process is configured by the `Dockerfile` that contains two stages:
**Building with NPM**
The project is built into a web-distribution with `npm`, that will be located in `/app/dist/codex-client/browser`
**Configuring NGINX**
The built distribution is copied into the path `/usr/share/nginx/html` that by default is served by nginx.

Additionally, the `env.template.json` and `entrypoint.sh` files are also moved to the container.

### Container startup
On startup, the `entrypoint.sh` file is executed.
This file, before running nginx, uses `envsubst` to insert the environment variables provided by docker into the `env.template.json` file.
After that, a `env.json` file is available to the project.

To start the server, `entrypoint.sh` also starts nginx.

## Deployment

After the project has been built into an image, it can be used via docker.

An example docker-compose configuration [is provided](/docker-compose.yaml).

### Environment parameters

| Parameter Name   | Description                                                |
|------------------|------------------------------------------------------------|
| SERVER_BASE_URL  | The base URL of the backend server. No trailing slash.     |
| GOOGLE_CLIENT_ID | The google client ID provided by the google cloud console. |

## Unit tests
Major components are tested using `vitest`.
For a given file `file.ts`, the test file is named `file.spec.ts` and contains exactly one `describe` clause.

To run all unit tests, use
```bash
npm test
```

This will also create a coverage report in `coverage/`.

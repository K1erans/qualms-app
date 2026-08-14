# Qualms CLI

A Node 20+ TypeScript command-line application for registering repositories
with Qualms.

## Install and run

```sh
npm install
npm run build
```

Configure the Qualms application endpoint once in the environment:

```sh
export QUALMS_SERVICE_URL=https://app.qualms.example/api/
```

An existing session token may be supplied as `QUALMS_ACCESS_TOKEN`. It is sent
only as an authorization header. When the service requires login or repository
credentials, setup returns a browser URL instead of accepting secrets as CLI
arguments.

Register a repository by passing its full clone URL:

```sh
npm start -- setup https://github.com/qualms/example.git
npm start -- setup git@gitlab.com:qualms/example.git
npm start -- setup ssh://git@bitbucket.org/qualms/example.git
```

HTTPS, `ssh://`, and SCP-style SSH remotes are supported for GitHub, GitLab,
Bitbucket, and self-hosted Git servers. Local paths, `file://`, `git://`, Git
remote helpers, URLs containing HTTPS credentials, and other transports are
rejected before any request is sent.

The setup command does not inspect the current checkout, accept an endpoint
option, print a request in lieu of submitting it, or create a test. It reports
one of the states returned by the Qualms service:

- `pending_auth`: continue login, credential enrollment, or SSH public-key
  installation at the displayed HTTPS URL;
- `provisioning`: the runner is preparing the project;
- `ready`: the project is available;
- `failed`: setup stopped and details are available in the Qualms service.

## Setup service contract

The CLI sends `POST /setups` with a versioned, provider-neutral request. The
request preserves the complete repository URL, identifies its host and
transport, and describes whether HTTPS credentials or a unique project SSH key
may be needed. Credential values are never part of this request.

The Qualms service and runner own browser authentication, confidential-value
authorization, provider-specific credentials, SSH key generation and storage,
submodule authorization, and the Daytona lifecycle. In particular, the runner
must validate every submodule remote against the same transport and host policy,
must not forward credentials to unapproved hosts, and must remove clone
credentials before running repository-provided commands.

Self-hosted SSH repositories are represented with pending service-side host-key
enrollment. This CLI does not silently accept unknown host keys. Project image
configuration, `.qualms.yml`, snapshot activation and rollback, and runner-side
Daytona provisioning remain separate runner features because this repository
does not contain those systems.

## Development

```sh
npm test
```

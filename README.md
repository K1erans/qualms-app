# Qualms CLI

A small TypeScript command-line application for the Qualms project.

## Run it

```sh
npm install
npm run build
npm start
```

The command prints:

```text
hello kiean
```

To make the `qualms` command available locally, run `npm link` after building,
then invoke it with:

```sh
qualms
```

## Set up a test run

Create a setup payload containing only the current repository and exact commit:

```sh
qualms -s
```

Without a runner URL, the command prints the setup payload as JSON. To execute
the setup workflow, provide the runner's base URL:

```sh
qualms -s --endpoint https://runner.example.com/api
```

The workflow performs two separate operations:

1. `POST /setups` with the setup payload. The runner returns a JSON object with
   the new setup ID, such as `{ "id": "setup-123" }`.
2. `POST /tests` with that setup ID and a `Hello World` test definition. The
   runner returns the created test ID in the same shape.

The command prints both resulting IDs when the workflow succeeds. Goal, test,
and timeout options are deliberately not part of `-s`; test creation is a
separate runner operation.

Set `QUALMS_RUNNER_TOKEN` when the runner requires bearer authentication. This
token authenticates Qualms to the runner; GitHub credentials for cloning private
repositories remain on the runner and are never included in the job payload.

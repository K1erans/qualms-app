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

## Submit a testing job

Create a payload containing the current repository, exact commit, overall goal,
and one or more natural-language subtests:

```sh
qualms -s "Confirm the critical user journey works" \
  --test "Verify the application starts" \
  --test "Verify an existing user can sign in"
```

A web chat or other structured caller can pass the subtests as a JSON array:

```sh
qualms -s --goal "Confirm the critical user journey works" \
  --tests '["Verify the application starts", "Verify login works"]'
```

By default the payload is printed as JSON. To send it to a runner, provide its
job endpoint:

```sh
qualms -s "Confirm the critical user journey works" \
  --test "Verify the application starts" \
  --endpoint https://runner.example.com/jobs
```

Set `QUALMS_RUNNER_TOKEN` when the runner requires bearer authentication. This
token authenticates Qualms to the runner; GitHub credentials for cloning private
repositories remain on the runner and are never included in the job payload.

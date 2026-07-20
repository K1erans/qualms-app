# Publishing

Add a changeset for every user-visible CLI change:

```sh
pnpm changeset
```

The release workflow maintains a version PR and publishes `qualms` after that
PR is merged. Bootstrap the first npm publish with an automation token stored
as the `NPM_TOKEN` repository secret. After the package exists on npm:

1. Add this GitHub repository and `.github/workflows/release.yml` as a trusted
   publisher in the npm package settings.
2. Run a release and confirm npm used trusted publishing.
3. Delete the `NPM_TOKEN` repository secret and revoke the bootstrap token.

The workflow has `id-token: write`, so npm can use GitHub's short-lived OIDC
identity after trusted publishing is configured.

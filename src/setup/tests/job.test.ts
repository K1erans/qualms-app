import assert from "node:assert/strict";
import test from "node:test";

import {
  createSetupRequest,
  inferRepositoryAuthentication,
  parseRepositoryUrl,
  parseSetupArguments,
} from "../job.js";

test("requires one repository URL", () => {
  assert.throws(
    () => parseSetupArguments([]),
    /Repository URL is required\. Usage: qualms setup <repository-url>/,
  );
  assert.throws(
    () => parseSetupArguments(["https://git.example.com/org/one.git", "extra"]),
    /Unexpected setup argument: extra/,
  );
});

test("rejects the removed endpoint option", () => {
  assert.throws(
    () => parseSetupArguments(["--endpoint", "https://runner.example.com"]),
    /Unknown setup option: --endpoint/,
  );
});

test("accepts and preserves HTTPS, SSH URL, and SCP-style remotes", () => {
  assert.deepEqual(
    parseRepositoryUrl("https://gitlab.example.com/group/project.git"),
    {
      url: "https://gitlab.example.com/group/project.git",
      host: "gitlab.example.com",
      transport: "https",
    },
  );
  assert.deepEqual(
    parseRepositoryUrl("ssh://git@bitbucket.org/team/project.git"),
    {
      url: "ssh://git@bitbucket.org/team/project.git",
      host: "bitbucket.org",
      transport: "ssh",
    },
  );
  assert.deepEqual(parseRepositoryUrl("git@git.example.com:team/project.git"), {
    url: "git@git.example.com:team/project.git",
    host: "git.example.com",
    transport: "ssh",
  });
});

test("rejects unsupported and dangerous Git transports", () => {
  for (const remote of [
    "../local-repository",
    "/srv/repository",
    "file:///srv/repository",
    "git://github.com/org/project.git",
    "ext::sh -c exploit",
    "ftp://git.example.com/project.git",
  ]) {
    assert.throws(
      () => parseRepositoryUrl(remote),
      /Repository URL must use HTTPS, ssh:\/\/, or SCP-style SSH/,
    );
  }
});

test("rejects embedded HTTPS credentials without echoing them", () => {
  const secret = "do-not-print-this";
  assert.throws(
    () => parseRepositoryUrl(`https://user:${secret}@github.com/org/project.git`),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /must not contain credentials/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    },
  );
});

test("rejects embedded SSH passwords without echoing them", () => {
  const secret = "ssh-password-must-not-leak";
  assert.throws(
    () => parseRepositoryUrl(`ssh://git:${secret}@git.example.com/team/project.git`),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /must not contain a password/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    },
  );
});

test("creates a provider-neutral setup request without a local commit", () => {
  const repository = parseRepositoryUrl(
    "https://self-hosted.example.net/group/project.git",
  );

  assert.deepEqual(createSetupRequest(repository), {
    version: 1,
    repository,
    authentication: { method: "https_credentials" },
  });
});

test("keeps authentication policy separate from remote parsing", () => {
  assert.deepEqual(
    inferRepositoryAuthentication(
      parseRepositoryUrl("git@git.internal.example:team/project.git"),
    ),
    {
      method: "project_ssh_key",
      hostKeyVerification: "pending_service_enrollment",
    },
  );
});

# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for a security problem. Report it privately in either way:

- GitHub: the **Security** tab of this repository, then **Report a vulnerability**
  (private vulnerability reporting).
- Email: [n.opal@unit42.fr](mailto:n.opal@unit42.fr?subject=presidentielle-2027%20security%20report).

Include what you found, how to reproduce it, and which file or script is affected. I will
acknowledge a report within a few days and tell you what I plan to do about it. This is a
one-person project, so these are best-effort timelines, not guarantees.

## Scope

In scope: the engine and data under `src/`, the scripts under `scripts/` and the GitHub workflow.
A way to make the engine reach the network or browser storage, or to make a score depend on
anything other than the answers and the published data, is in scope.

Out of scope: the website at unit42.fr (report it to the same address, it is not in this
repository), the documents cited as sources, and the platforms the project uses (GitHub, npm).

A wrong or unsourced party position is not a security problem: please use the
*Correction: wrong or unsourced position* issue template instead.

## Supported versions

Only the latest release and the current `main` branch are supported.

## What the repository contains

No secrets, no credentials and no personal data. If you ever find a credential in this
repository or its history, that is a vulnerability: please report it as above.

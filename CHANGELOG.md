# Changelog

All notable changes to this repository are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versions follow
[Semantic Versioning](https://semver.org) loosely while the project is 0.x. The data carries its
own versions (`DATA_VERSION`, `IMPACT_VERSION` in `src/data/meta.ts`).

## [0.1.1] - 2026-10-23

### Security

- Test tooling: `vitest` 4.1.12 clears two advisories in its mocker. No change to the data,
  the method or the engine.

## [0.1.0] - 2026-10-17

The first published version of the data, method and engine behind
[unit42.fr/2027](https://www.unit42.fr/2027), extracted from the website's repository. It covers
the work since the quiz started on 2026-10-11. Data version `2026-10-v1.1`, impact version
`2026-10-i0`.

### Added

- **Data model, scoring and second-round logic** (11 October): two separate scores per party,
  "ce qu'ils disent" from programmes and "ce qu'ils font" from Assemblée nationale group votes,
  ties within 5 points, and the second-round geometry with electoral-silence windows.
- **Unscored European Parliament notes** for the parties without deputies (11 October).
- **Question set v3** (12 October): 31 questions (20 core, 11 optional), 12 parties and 13 vote
  codings, written after neutrality, citizen-profile and party-advocate reviews.
- **Official vote counts** compiled from the Assemblée nationale open data with
  `build-votes`, and a separate display threshold for "fait" (12 October).
- **Robustness report** (`robustness`): how often removing one question changes the leader
  (12 October).
- **Second-round polls with their legal mentions** (12 October).
- **Plain-language explanations** on every answer option, and sourced "cases" showing where a
  measure has been applied, fact-checked (13 to 15 October).
- **Version 1.1** (15 October): three optional questions on the retirement age and on small and
  mid-size entrepreneurs, one of them with a vote (scrutin 468); 34 questions in all.
- **"Impact pour moi" engine and data** (16 October): the profile criteria, a per-measure
  validation, and 26 measures published under a uniform publication rule (at least 3 options
  backed by a solid position, solid positions in at least 2 of the 3 blocs).
- **Standalone package** for this repository: Node-native TypeScript (`.ts` import paths), the
  `validate` report script, a privacy guard limited to this package, demonstration test data with
  fictional parties only (`test/fixtures/`), CI, method documents in French and English, and the
  code and data licences.

### Changed

- Neutral rewordings of options and verified, multi-source context lines (13 October).

### Fixed

- Final review and fact-check findings on the questions and the answer cases (13 and 14 October).
- Three quiz sources corrected without changing any position: the Écologistes' position on
  medical deductibles now rests on their July 2026 programme, the UDR source on production taxes
  is its 2025 booklet, and an LCP article on low-emission zones carries its publication date
  (17 October).

[0.1.1]: https://github.com/LightSeek3r/presidentielle-2027/releases/tag/v0.1.1
[0.1.0]: https://github.com/LightSeek3r/presidentielle-2027/releases/tag/v0.1.0

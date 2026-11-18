# Editorial Roadmap — Modern PHP Mastery: 8.0 → 8.6

Machine-readable source of truth: [src/data/editorial-roadmap.json](file:///Volumes/RobelExt/Web/khorshedpro/src/data/editorial-roadmap.json)

This curriculum tracks **30 planned and published technical articles** across PHP `8.0`–`8.6`. Listing a topic here does **not** imply that the article is written, technically verified, or approved for publication.

---

## Version Allocation (30 Articles)

| PHP Version | Theme | Count | Published | Active Drafts |
| :--- | :--- | :--- | :--- | :--- |
| **PHP 8.0** | Modern PHP Fundamentals | 5 | 0 | 0 |
| **PHP 8.1** | Stronger Types & Concurrency | 4 | 0 | 0 |
| **PHP 8.2** | Maintainable Object Models | 4 | 0 | 0 |
| **PHP 8.3** | Contracts & Validation | 4 | 0 | 0 |
| **PHP 8.4** | Advanced Object-Oriented PHP | 4 | 1 (`php-84-property-hooks`) | 0 |
| **PHP 8.5** | Functional Composition | 4 | 1 (`php-85-pipe-operator`) | 0 |
| **PHP 8.6** | The Next Generation | 5 | 0 | 2 (`php-86-release-overview`, `php-86-partial-function-application`) |
| **Total** | | **30** | **2** | **2** |

---

## Complete 30-Article Curriculum

### PHP 8.0 — Modern PHP Fundamentals (5)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | `mpm-01` | Match Expressions: Beyond the Traditional Switch | `php-80-match-expressions` | Beginner | Language Features | Idea |
| 02 | `mpm-02` | Union Types and Designing Better API Contracts | `php-80-union-types` | Beginner | Object-Oriented Design | Idea |
| 03 | `mpm-03` | Attributes and Metadata-Driven Architecture | `php-80-attributes` | Intermediate | Architecture | Idea |
| 04 | `mpm-04` | Nullsafe Operator, Named Arguments, and Constructor Promotion | `php-80-ergonomic-syntax` | Beginner | Language Features | Idea |
| 05 | `mpm-05` | PHP 8.0 JIT: What It Actually Accelerates and How to Benchmark It Correctly | `php-80-jit-performance` | Advanced | Performance | Idea |

### PHP 8.1 — Stronger Types & Concurrency (4)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 06 | `mpm-06` | Enums in Domain-Driven PHP Applications | `php-81-enums` | Intermediate | Object-Oriented Design | Idea |
| 07 | `mpm-07` | Readonly Properties and Immutable Data Models | `php-81-readonly-properties` | Intermediate | Object-Oriented Design | Idea |
| 08 | `mpm-08` | Fibers: Cooperative Concurrency Explained | `php-81-fibers` | Advanced | Architecture | Idea |
| 09 | `mpm-09` | Intersection Types and First-Class Callables | `php-81-intersection-types-first-class-callables` | Intermediate | Language Features | Idea |

### PHP 8.2 — Maintainable Object Models (4)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 10 | `mpm-10` | Readonly Classes and Immutable Architecture | `php-82-readonly-classes` | Intermediate | Object-Oriented Design | Idea |
| 11 | `mpm-11` | Disjunctive Normal Form Types in Practice | `php-82-dnf-types` | Intermediate | Language Features | Idea |
| 12 | `mpm-12` | Dynamic Property Deprecation and Migration Strategies | `php-82-dynamic-properties-deprecation` | Intermediate | Compatibility | Idea |
| 13 | `mpm-13` | Standalone Types and Modern Type Design | `php-82-standalone-types` | Beginner | Language Features | Idea |

### PHP 8.3 — Contracts & Validation (4)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 14 | `mpm-14` | Typed Class Constants and Better Inheritance Contracts | `php-83-typed-class-constants` | Intermediate | Object-Oriented Design | Idea |
| 15 | `mpm-15` | The Override Attribute and Safer Refactoring | `php-83-override-attribute` | Beginner | Compatibility | Idea |
| 16 | `mpm-16` | `json_validate()` and Efficient JSON Validation | `php-83-json-validate` | Intermediate | Performance | Idea |
| 17 | `mpm-17` | Dynamic Class Constant Fetch and Practical Patterns | `php-83-dynamic-class-constant-fetch` | Beginner | Language Features | Idea |

### PHP 8.4 — Advanced Object-Oriented PHP (4)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 18 | `mpm-18` | PHP 8.4 Property Hooks: Computed and Validated State Without Boilerplate | `php-84-property-hooks` | Intermediate | Object-Oriented Design | **Published** |
| 19 | `mpm-19` | Asymmetric Visibility and Public-Read Private-Write Models | `php-84-asymmetric-visibility` | Intermediate | Object-Oriented Design | Idea |
| 20 | `mpm-20` | Lazy Objects and Dependency-Heavy Applications | `php-84-lazy-objects` | Advanced | Performance | Idea |
| 21 | `mpm-21` | Advanced Property Hooks: Interfaces, Inheritance, and Edge Cases | `php-84-advanced-property-hooks` | Advanced | Object-Oriented Design | Idea |

### PHP 8.5 — Functional Composition (4)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 22 | `mpm-22` | PHP 8.5 Pipe Operator: Readable Left-to-Right Data Transformations | `php-85-pipe-operator` | Intermediate | Functional Programming | **Published** |
| 23 | `mpm-23` | The URI Extension and Reliable URL Handling | `php-85-uri-extension` | Intermediate | Security | Idea |
| 24 | `mpm-24` | Clone With and Immutable Object Updates | `php-85-clone-with` | Intermediate | Object-Oriented Design | Idea |
| 25 | `mpm-25` | NoDiscard and Safer API Usage | `php-85-nodiscard-attribute` | Beginner | Security | Idea |

### PHP 8.6 — The Next Generation (5)

| # | ID | Proposed Title | Slug | Difficulty | Category | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 26 | `mpm-26` | PHP 8.6: The Features That Actually Matter to Professional Developers | `php-86-release-overview` | Intermediate | Language Features | Drafting (Awaiting GA/Verification) |
| 27 | `mpm-27` | PHP 8.6 Partial Function Application: Beyond Simple Callbacks | `php-86-partial-function-application` | Advanced | Functional Programming | Technical Review (Awaiting Runtime) |
| 28 | `mpm-28` | `Time\Duration` and `clamp()`: Practical Applications | `php-86-time-duration-and-clamp` | Beginner | Language Features | Idea |
| 29 | `mpm-29` | The Polling API: Event-Driven PHP and Its Real Capabilities | `php-86-polling-api` | Advanced | Architecture | Idea |
| 30 | `mpm-30` | Upgrading to PHP 8.6: Compatibility and Production Risks | `php-86-migration-and-compatibility` | Intermediate | Compatibility | Idea |

---

## Recommended Initial Publication Sequence (3 Articles / Week)

Although the curriculum orders by PHP version (`01`–`30`), publication prioritizes timely developer interest while preserving strict verification:

1. **PHP 8.6 Release Overview** *(only after official PHP 8.6.0 GA confirmation on/after Nov 19, 2026)*
2. **PHP 8.6 Partial Function Application** *(verified against a provisioned PHP 8.6 runtime)*
3. **PHP 8.5 Pipe Operator** *(already published; continuously refined with real pipeline tests)*
4. **PHP 8.4 Property Hooks** *(already published; backed by `examples/php-8-4/property-hooks/`)*
5. **PHP 8.6 `Time\Duration` and `clamp()`**
6. **Upgrading to PHP 8.6: Compatibility and Production Risks**

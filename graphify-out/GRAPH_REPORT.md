# Graph Report - .  (2026-08-02)

## Corpus Check
- Corpus is ~17,488 words - fits in a single context window. You may not need a graph.

## Summary
- 81 nodes · 82 edges · 13 communities (9 shown, 4 thin omitted)
- Extraction: 90% EXTRACTED · 9% INFERRED · 1% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Development Tooling
- Runtime Dependencies
- Package Scripts
- React App and Supabase
- Environment and Deployment
- Guest Management Workflows
- UI Design
- Runtime Environment Script
- Emergent Metadata
- Test Marker

## God Nodes (most connected - your core abstractions)
1. `scripts` - 5 edges
2. `Admin()` - 4 edges
3. `Admin Guest Management Panel` - 4 edges
4. `Wedding Absen HTML Shell` - 4 edges
5. `buffer` - 3 edges
6. `qrcode` - 3 edges
7. `Icon()` - 3 edges
8. `supabase` - 3 edges
9. `Wedding Absen Environment Setup` - 3 edges
10. `data_tamu Database Schema` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Layered Stack Illustration` --conceptually_related_to--> `Apple Design Analysis`  [AMBIGUOUS]
  wedding-absen/src/assets/hero.png → DESIGN.md
- `SVG Icon Sprite` --conceptually_related_to--> `Wedding Absen HTML Shell`  [INFERRED]
  wedding-absen/public/icons.svg → wedding-absen/index.html
- `React SVG Asset` --conceptually_related_to--> `Wedding Absen HTML Shell`  [INFERRED]
  wedding-absen/src/assets/react.svg → wedding-absen/index.html
- `Vite SVG Asset` --conceptually_related_to--> `Wedding Absen HTML Shell`  [INFERRED]
  wedding-absen/src/assets/vite.svg → wedding-absen/index.html
- `SVG Favicon` --semantically_similar_to--> `Vite SVG Asset`  [INFERRED] [semantically similar]
  wedding-absen/public/favicon.svg → wedding-absen/src/assets/vite.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Supabase Guest Platform** — wedding_absen_env_setup_supabase_configuration, wedding_absen_project_summary_admin_panel, wedding_absen_project_summary_data_tamu_schema [INFERRED 0.95]

## Communities (13 total, 4 thin omitted)

### Community 0 - "Development Tooling"
Cohesion: 0.11
Nodes (19): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom, vite (+11 more)

### Community 1 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (18): @aws-sdk/client-s3, buffer, html5-qrcode, qrcode, react, react-dom, react-router-dom, @supabase/supabase-js (+10 more)

### Community 2 - "Package Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 3 - "React App and Supabase"
Cohesion: 0.38
Nodes (4): App(), Icon(), Scanner(), supabase

### Community 4 - "Environment and Deployment"
Cohesion: 0.22
Nodes (9): Wedding Absen Kubernetes Deployment, Wedding Absen Environment Setup, Environment Secret Management, Supabase Configuration, Wedding Absen HTML Shell, SVG Favicon, SVG Icon Sprite, React SVG Asset (+1 more)

### Community 5 - "Guest Management Workflows"
Cohesion: 0.40
Nodes (6): Admin Guest Management Panel, data_tamu Database Schema, Wedding Absen Project Summary, Wedding Absen Quick Start Guide, Wedding QR Code Check-in System, Wedding Absen Testing Guide

## Ambiguous Edges - Review These
- `Apple Design Analysis` → `Layered Stack Illustration`  [AMBIGUOUS]
  wedding-absen/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **38 isolated node(s):** `env.sh script`, `name`, `private`, `version`, `type` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Apple Design Analysis` and `Layered Stack Illustration`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Scripts`?**
  _High betweenness centrality (0.324) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Tooling` to `Package Scripts`?**
  _High betweenness centrality (0.262) - this node is a cross-community bridge._
- **Why does `Admin()` connect `Runtime Dependencies` to `React App and Supabase`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **What connects `env.sh script`, `name`, `private` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Development Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
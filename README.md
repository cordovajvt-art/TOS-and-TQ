# TOS, TQ, and Examination Printing Request System

This repository contains a mobile-ready interactive frontend prototype and the implementation architecture for an online academic examination authoring, review, approval, and printing workflow.

## Run the website

```bash
npm start
```

Open <http://localhost:4173>. The prototype stores edits in the browser, includes seeded demonstration data, and is intended for workflow validation—not production examination records.

Run the automated checks with `npm test`.

## Deploy the prototype

### Docker Compose

```bash
docker compose up --build -d
curl --fail http://localhost:4173/health/live
```

Set `EXAMFLOW_PORT` to publish a different host port. Stop the deployment with `docker compose down`.

### Render

The included `render.yaml` is a Render Blueprint. Push the repository to a Git provider, create a new Render Blueprint, and select the repository. Render will run `node server.mjs`, supply its assigned `PORT`, and monitor `/health/live`.

These deployment options publish the frontend prototype only. Do not store live examinations in it; production API, identity, database, signature, PDF, and audit services remain to be implemented.

## Documentation

- [System architecture and requirements specification](docs/system-requirements-specification.md)
- [Deployment and production-readiness guide](docs/deployment-guide.md)

The specification defines the end-to-end workflow, user experience, state machine, data model, digital-signature controls, role-based access rules, notification behavior, PDF generation, non-functional requirements, acceptance criteria, and phased delivery plan.

## Is this production-ready?

Not yet. The included website is a deployable **frontend prototype** without the production API, institutional identity integration, database, signature service, PDF renderer, or infrastructure definition. The deployment guide explains what must be implemented, provisioned, configured, tested, and approved before live examination records are used.

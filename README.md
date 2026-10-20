# VEDA_X External Developer Kit — E1.1.0 WORKING (17 October 2026)

**Prepared for:** controlled review by Nithin Ramesh Lalli (identity/contract status not verified).  
**Owner / product authority:** G A Vikram (contract draft proposes G A Vikram Augustine as individual assignee; verify legal title and entity before signing).  
**Status:** WORKING / NON-CANONICAL / locally verifiable reference only. **Not a VEDA_X private engine, not production-ready, not cloud-deployed.**

## What changed from E1.0.0

The original E1.0.0 archive was a client-only kit. This successor includes its **unchanged source files** under `legacy_E1_0_0/`, a public-contract compatibility copy, a local reference HTTP server with a non-production in-memory action simulator, executable tests, a Dockerfile and loopback-bound Compose template, acceptance criteria, and an implementation handoff checklist.

The new example backend demonstrates *interface and control-flow mechanics*, not VEDA_X canonical decision-making. It cannot replace protected owner-governed engines, rules or the complete platform. Cloud exposure remains forbidden until separately authorised and qualified.

## Directory map

- `contracts/` — backwards-compatible public API contract and development-only extension.
- `sdk/python/` — Python client, unchanged from E1.0.0 with an additive optional demonstration helper.
- `reference_backend/` — loopback-only, in-memory, entirely synthetic reference server.
- `examples/` — reproducible local client/approval example.
- `tests/` — local control and regression tests.
- `infra/` — Dockerfile and localhost-only Compose draft (build not claimed without actually building).
- `docs/` — specifications, authority matrix, handoff programme, verification and privacy constraints.
- `legacy_E1_0_0/` — pristine content of the prior developer ZIP.
- `MANIFEST.sha256` — deterministic per-file integrity manifest.

## Quick start: standard-library reference server

Python 3.11+; no server dependencies. Start the server in one terminal:

```bash
export VEDA_X_DEMO_CLIENT_TOKEN='LOCAL_DEV_CLIENT_TOKEN_AT_LEAST_24_CHARS'
export VEDA_X_DEMO_APPROVER_TOKEN='LOCAL_DEV_APPROVER_TOKEN_AT_LEAST_24_CHARS'
python -m reference_backend.app
```

The server binds **127.0.0.1:8765 only**. Choose distinct long random values for both tokens; examples are placeholders, not secrets. The SDK client separately needs `httpx` (`pip install httpx`).

In a second terminal from the kit root:

```bash
python -m unittest discover -s tests -v
```

With the server running and both tokens available in the client shell, run:

```bash
python examples/local_demo.py
python examples/sdk_client_demo.py  # requires httpx
```

No real external resource is created, modified or contacted by the demo backend. The only `EXECUTED` result is for the namespaced `demo.log_event` operation, and it means an in-memory simulation **only**.

## Deployment and authority

- **Allowed now:** internal local demonstration with synthetic, non-sensitive inputs and approved development staff.
- **Not allowed merely by receipt of this kit:** public/cloud ingress, customer/production data, live write connectors, proprietary rule import, external LLM/model egress, real credentials, owner-approval bypass, automated owner canonisation, or uncontrolled subcontractors.
- **Before any real implementation:** independently verify and execute the contract, schedule of work and IP assignment; authorize a specific repository, identity, data boundary and component disclosure receipt.
- **Before cloud pilot:** complete the controls and independent gates in `docs/CLOUD_READINESS_HOLD.md` and `docs/ACCEPTANCE_TESTS.md`.

**Critical distinction:** the demonstration server supplies structural runnable code; it does **not** constitute the complete VEDA_X implementation package requested for production cloud hosting.

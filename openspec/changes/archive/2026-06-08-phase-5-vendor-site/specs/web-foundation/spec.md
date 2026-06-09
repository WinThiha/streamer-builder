## ADDED Requirements

### Requirement: Web supports prototype routes

The web application SHALL register routes for vendor gallery, `/prototype/:preset`, and `/configure` when running in prototype mode.

#### Scenario: Prototype gallery route

- **WHEN** `VITE_APP_MODE=prototype`
- **THEN** `/` shows the prototype preset gallery

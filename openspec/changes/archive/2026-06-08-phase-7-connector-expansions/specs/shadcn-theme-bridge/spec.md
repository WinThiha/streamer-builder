## ADDED Requirements

### Requirement: Admin shell uses brand theme

The admin shell SHALL map published `SiteTheme` colors to shadcn CSS variables on the admin root element.

#### Scenario: Publish new primary color

- **WHEN** admin publishes a new primary color
- **THEN** shadcn Button and form accents reflect the new primary in admin UI

# Public release checklist

Before creating a public remote or publishing a release, verify each item against the exact commit being released.

- [ ] Confirm the license covers the code and every included asset/material.
- [ ] Search the full Git history and release artifacts for credentials, service configuration, contact details, and participant data.
- [ ] Verify no raw or derived research dataset, private notebook output, or identifiable screenshot is tracked.
- [ ] Confirm the sample materials are synthetic or cleared for redistribution.
- [ ] Confirm the consent page still labels itself as a placeholder and cannot be mistaken for approved study wording.
- [ ] Verify the browser demo has no remote data sink and says where it stores responses.
- [ ] Run the app build, lint, analysis tests, and a manual pilot with synthetic data.
- [ ] Review repository description, README, default branch, CI permissions, and deployment settings.

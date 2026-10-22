# Privacy and ethics checklist

This is an engineering checklist, not legal advice or ethics approval. Follow your institution's current policy and approved protocol.

## Before recruitment

- Obtain the required ethics review and use the approved participant information and consent process.
- Specify data items, purpose, lawful/approved basis, access roles, retention period, deletion process, storage region, and any processors.
- Minimise identifiers. Keep recruitment-platform IDs, contact details, consent records, and research responses separate where the protocol requires it.
- Use a secured server-side data store with least-privilege access and tested export/deletion procedures. Dev data must remain separate from formal data. The included Firebase adapter and rules still need configuration and deployment-specific validation before collection.
- Check that public sample files, screenshots, logs, notebooks, and issue reports contain no participant data.

## During the study

- Explain withdrawal and support options in the approved materials.
- Monitor collection failures without writing response content or identifiers to logs.
- Restrict access to raw data and avoid copying it into source control, cloud demos, or public issue trackers.

## After the study

- Validate data handling against the protocol, document exclusions and transformations, and apply the approved retention/deletion schedule.
- Share only data and materials you are authorised to release; assess re-identification risk even after direct identifiers are removed.

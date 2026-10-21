# Analysis starter

`process_events.py` checks and flattens the reference event JSON into a local CSV. The tracked fixture is synthetic and exists only to exercise the workflow.

```bash
python3 -m unittest discover -s analysis/tests -v
python3 analysis/process_events.py analysis/data/sample/demo-events.json --output /tmp/study-events.csv
```

For real data, use an access-controlled local environment, verify that the export matches the approved protocol, and keep source exports outside Git. The script is not a statistical analysis plan; adapt and document analyses before looking at study outcomes.

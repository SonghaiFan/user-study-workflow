# Extraction outcome

The starter now contains one Demo, not the original experiments. `src/study/` owns Study → Block → Quiz flow, Dev/Study mode boundaries, storage and the original news layout/inputs/debug panel. `src/studies/demo/` owns only the replaceable component and question configuration.

The original `news_text_visualisation` checkout remains the reference for the concrete experiment; it was not modified. Narrative/news implementation and assets have been removed from this template.

See [README](../README.md), [component contract](plugins.md), and [runtime modes](runtime-modes.md).

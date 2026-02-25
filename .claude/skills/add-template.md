---
name: add-template
description: Add a new generated file to the experiment-e2e-generator template system. Use when the user asks to add a new output file to the CLI generator.
---

# Add Template Skill

Follow this checklist exactly — skipping any step produces broken generator output.

## Steps

1. **Create the template file** in `templates/<path>/<filename>` using `{{VARIABLE}}` placeholders only from the known list below.

2. **Add a mapping** to the `fileMappings` array in `src/file-operations.js`:
   ```js
   { src: 'templates/<path>/<filename>', dest: '<output-path>/{{EXPERIMENT_NAME_KEBAB}}/<filename>' }
   ```

3. **Register the destination path** in `getGeneratedFilesList()` in `src/file-operations.js` so the pre-flight check and user confirmation display it correctly.

4. **Run tests** to verify nothing regressed:
   ```bash
   yarn test
   ```

5. **Update `CLAUDE.md`** "Template System" section if you introduced a new `{{VARIABLE}}`.

## Known valid template variables

| Variable | Description |
|---|---|
| `{{EXPERIMENT_NAME}}` | Original experiment name as entered |
| `{{EXPERIMENT_NAME_KEBAB}}` | Kebab-case version of experiment name |
| `{{BASE_URL}}` | Application base URL |
| `{{MARKET_GROUP}}` | Market group code (e.g. `SEBN`, `SEUK`) |
| `{{MARKETS_JSON}}` | JSON array of market objects |

Never introduce new variables without also updating `replaceTemplateVars()` in `src/utils.js`.

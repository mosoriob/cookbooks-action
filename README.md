## Tapis App Creation Action

This GitHub Action helps you create and manage Tapis applications in your CI/CD
pipeline. It allows you to create Tapis apps using a JSON specification file.

### Inputs

| Input             | Required | Default                       | Description                                                  |
| ----------------- | -------- | ----------------------------- | ------------------------------------------------------------ |
| `tapis_app_spec`  | Yes      | -                             | Path to the JSON file containing the Tapis app specification |
| `TAPIS_TOKEN`     | Yes      | -                             | Tapis authentication token                                   |
| `TAPIS_BASE_PATH` | No       | `https://portals.tapis.io/v3` | Base URL for the Tapis API                                   |

### Example Usage

```yaml
name: Create Tapis App

on:
  push:
    branches: [main]

jobs:
  create-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create Tapis App
        uses: your-org/cookbooks-action@v1
        with:
          tapis_app_spec: 'path/to/app-spec.json'
          TAPIS_TOKEN: ${{ secrets.TAPIS_TOKEN }}
          # TAPIS_BASE_PATH is optional, defaults to https://portals.tapis.io/v3
```

### App Specification Format

The app specification file should be a valid JSON file that follows the Tapis
app specification format. Here's an example:

```json
{
  "id": "my-app",
  "version": "1.0.0",
  "containerImage": "docker.io/myorg/myapp:1.0.0",
  "execSystemId": "tapisv3-exec",
  "execSystemExecDir": "/home/tapis/apps",
  "execSystemInputDir": "/home/tapis/inputs",
  "execSystemOutputDir": "/home/tapis/outputs"
}
```

### Error Handling

The action will fail if:

- The app specification file is not found
- The app specification is not valid
- The Tapis API request fails
- The authentication token is invalid

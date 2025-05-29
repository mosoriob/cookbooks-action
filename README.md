# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Tapis App Creation Action

This GitHub Action helps you create and manage Tapis applications in your CI/CD
pipeline. It allows you to create Tapis apps using a JSON specification file,
typically after building and pushing a Docker image.

### Inputs

| Input               | Required | Default                       | Description                                                        |
| ------------------- | -------- | ----------------------------- | ------------------------------------------------------------------ |
| `tapis_app_spec`    | Yes      | -                             | Path to the JSON file containing the Tapis app specification       |
| `TAPIS_TOKEN`       | Yes      | -                             | Tapis authentication token                                         |
| `TAPIS_BASE_PATH`   | No       | `https://portals.tapis.io/v3` | Base URL for the Tapis API                                         |
| `docker_image_tags` | Yes      | -                             | Comma-separated list of Docker image tags from the metadata action |

### Example Usage

Here's a complete workflow example that builds a Docker image, pushes it to
GitHub Container Registry, and then creates a Tapis app using the pushed image:

```yaml
name: Build and Deploy Tapis App

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      - name: Create Tapis App
        uses: your-org/cookbooks-action@v1
        with:
          tapis_app_spec: 'path/to/app-spec.json'
          TAPIS_TOKEN: ${{ secrets.TAPIS_TOKEN }}
          docker_image_tags: ${{ steps.meta.outputs.tags }}
```

### App Specification Format

The app specification file should be a valid JSON file that follows the Tapis
app specification format. The `containerImage` field will be automatically
updated with the first Docker image tag from the provided list. Here's an
example:

```json
{
  "id": "my-app",
  "version": "1.0.0",
  "containerImage": "ghcr.io/your-org/your-repo:latest",
  "execSystemId": "tapisv3-exec",
  "execSystemExecDir": "/home/tapis/apps",
  "execSystemInputDir": "/home/tapis/inputs",
  "execSystemOutputDir": "/home/tapis/outputs"
}
```

Note: The `containerImage` value in your app spec will be automatically replaced
with the first tag from the `docker_image_tags` input. You can use any
placeholder value in your app spec file.

### Outputs

| Output       | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| `app_result` | JSON string containing the complete response from the Tapis API |

### Error Handling

The action will fail if:

- The app specification file is not found
- The app specification is not valid
- The Tapis API request fails
- The authentication token is invalid
- No Docker image tags are provided

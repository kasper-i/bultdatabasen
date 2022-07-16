# DigitalOcean Functions

## Deploy

Requires `doctl` to be installed. Refer to the DigitalOcean article [How to Install and Configure doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) for installation instructions.

Before deploying make sure to prepare a .env-formatted file with the environment variables `SPACES_KEY` and `SPACES_SECRET`.

```bash
doctl serverless deploy . --remote-build
```

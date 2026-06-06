# Deployment

## Backend — AWS EC2

- Instance: t3.micro, Ubuntu 26.04
- Port: 8000
- Docker image: krsngth22/origami-cv:latest
- Health check: http://3.17.6.47:8000/health
- API docs: http://3.17.6.47:8000/docs

## Useful commands

SSH in:
```bash
ssh -i ~/.ssh/origami-cv-key.pem ubuntu@3.17.6.47
```

Check logs:
```bash
docker logs origami-cv
```

Restart container:
```bash
docker restart origami-cv
```

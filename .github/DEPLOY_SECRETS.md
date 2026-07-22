# GitHub Repository Secrets — Deploy için Gerekli

Repo → Settings → Secrets and variables → Actions → New repository secret

## CI Secrets

| Secret Adı              | Açıklama                              |
|------------------------|---------------------------------------|
| `NEXT_PUBLIC_API_URL`  | `https://api.mytt.com`               |

## Deploy Secrets (production environment)

| Secret Adı        | Açıklama                                           |
|------------------|----------------------------------------------------|
| `DEPLOY_HOST`    | Sunucu IP veya hostname (örn: `65.21.x.x`)        |
| `DEPLOY_USER`    | SSH kullanıcısı (örn: `ubuntu` veya `root`)       |
| `DEPLOY_SSH_KEY` | Private SSH key (PEM formatı, tüm içerik)         |
| `DEPLOY_PORT`    | SSH portu (varsayılan: `22`)                      |

## Nasıl SSH Key Oluşturulur?

```bash
ssh-keygen -t ed25519 -C "mytt-deploy" -f ~/.ssh/mytt_deploy
# Public key'i sunucuya ekle:
cat ~/.ssh/mytt_deploy.pub >> ~/.ssh/authorized_keys
# Private key içeriğini DEPLOY_SSH_KEY secret'ına yapıştır:
cat ~/.ssh/mytt_deploy
```

## GitHub Environment Ayarı

Settings → Environments → New environment → "production"
- Required reviewers ekle (opsiyonel onay kapısı)
- Deployment branches: Selected branches → main

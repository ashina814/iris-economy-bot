# VPS Deploy

Target path:

```bash
/opt/iris-economy-bot
```

## 1. Install runtime

```bash
apt update
apt install -y git curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v
npm -v
```

## 2. Clone

```bash
cd /opt
git clone https://github.com/YOUR_USER/iris-economy-bot.git
cd /opt/iris-economy-bot
npm install --omit=dev
```

## 3. Environment

Create `/opt/iris-economy-bot/.env`.

```bash
DISCORD_TOKEN=replace_me
DISCORD_CLIENT_ID=replace_me
DISCORD_GUILD_ID=
DISCORD_LOG_CHANNEL_ID=
BOT_PREFIX=!eco
ECONOMY_ADMIN_IDS=
```

`ECONOMY_ADMIN_IDS` is a comma-separated list of Discord user IDs that can change casino house settings.
If empty, house settings are open while developing.

## 4. Service

```bash
cp deploy/iris-economy-bot.service /etc/systemd/system/iris-economy-bot.service
systemctl daemon-reload
systemctl enable iris-economy-bot
systemctl start iris-economy-bot
systemctl status iris-economy-bot --no-pager
```

Logs:

```bash
journalctl -u iris-economy-bot -f
```

Update:

```bash
cd /opt/iris-economy-bot
git pull
npm install --omit=dev
systemctl restart iris-economy-bot
```

## Discord intents

Enable these in the Discord Developer Portal:

- Message Content Intent
- Server Members Intent

The bot also needs permissions to read invites if invite tracking is enabled.

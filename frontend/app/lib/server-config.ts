// Server-only config accessors. Do not import this in client components.
export const cfg = {
  POSTGRES_URL: process.env.POSTGRES_URL,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  DHAN_API_KEY: process.env.DHAN_API_KEY,
  DHAN_ACCESS_TOKEN: process.env.DHAN_ACCESS_TOKEN,
};

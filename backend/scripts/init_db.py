import argparse
from alembic import command
from alembic.config import Config
from app.core.config import settings
from app.seeds import seed_admin_and_sample

def migrate():
    cfg = Config("alembic.ini")
    command.upgrade(cfg, "head")

def seed():
    seed_admin_and_sample(settings.admin_email, settings.admin_password, settings.admin_role)

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--migrate-only", action="store_true")
    p.add_argument("--seed-only", action="store_true")
    args = p.parse_args()
    if not args.seed_only:
        migrate()
    if not args.migrate_only:
        seed()

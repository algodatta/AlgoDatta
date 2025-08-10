from sqlalchemy import text
from app.db.session import engine
def column_exists_sqlite(table: str, column: str) -> bool:
    with engine.connect() as conn:
        res = conn.execute(text(f"PRAGMA table_info({table})")).mappings().all()
        return any(r['name'] == column for r in res)
def main():
    with engine.begin() as conn:
        if engine.url.get_backend_name().startswith("sqlite"):
            if not column_exists_sqlite('users', 'password_reset_token'):
                conn.execute(text("ALTER TABLE users ADD COLUMN password_reset_token VARCHAR"))
            if not column_exists_sqlite('users', 'password_reset_sent_at'):
                conn.execute(text("ALTER TABLE users ADD COLUMN password_reset_sent_at DATETIME"))
        else:
            pass
    print("Migration complete: users.password_reset_* columns present.")
if __name__ == "__main__":
    main()

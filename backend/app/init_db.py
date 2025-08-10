from app.db.session import Base, engine
from app.models import user, broker, strategy, alert, execution, paper_trade, notification, error_log, suppression, audit_log
if __name__=='__main__': Base.metadata.create_all(bind=engine); print('DB tables created.')

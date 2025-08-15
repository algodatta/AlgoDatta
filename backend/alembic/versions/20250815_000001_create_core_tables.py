"""create core tables

Revision ID: 20250815_000001_create_core_tables
Revises: 
Create Date: 2025-08-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20250815_000001_create_core_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    user_role = sa.Enum('user', 'admin', name='user_role')
    user_status = sa.Enum('active', 'disabled', name='user_status')
    broker_type = sa.Enum('dhanhq', 'paper', name='broker_type')
    strategy_status = sa.Enum('active', 'paused', 'error', name='strategy_status')
    execution_type = sa.Enum('live', 'paper', name='execution_type')
    execution_status = sa.Enum('pending', 'success', 'fail', name='execution_status')
    notification_type = sa.Enum('telegram', 'email', name='notification_type')

    user_role.create(op.get_bind(), checkfirst=True)
    user_status.create(op.get_bind(), checkfirst=True)
    broker_type.create(op.get_bind(), checkfirst=True)
    strategy_status.create(op.get_bind(), checkfirst=True)
    execution_type.create(op.get_bind(), checkfirst=True)
    execution_status.create(op.get_bind(), checkfirst=True)
    notification_type.create(op.get_bind(), checkfirst=True)

    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', user_role, nullable=False, server_default='user'),
        sa.Column('status', user_status, nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('ix_users_email', 'users', ['email'])

    op.create_table('brokers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', broker_type, nullable=False),
        sa.Column('auth_token', sa.String(), nullable=True),
        sa.Column('token_expiry', sa.DateTime(timezone=True), nullable=True),
        sa.Column('connected_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_brokers_user_id', 'brokers', ['user_id'])

    op.create_table('strategies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('symbol', sa.String(), nullable=True),
        sa.Column('timeframe', sa.String(), nullable=True),
        sa.Column('qty', sa.String(), nullable=True),
        sa.Column('mode', sa.String(), nullable=True),
        sa.Column('script', sa.String(), nullable=True),
        sa.Column('broker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('brokers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('paper_trading', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('webhook_path', sa.String(), unique=True, nullable=True),
        sa.Column('status', strategy_status, nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('ix_strategies_user_id', 'strategies', ['user_id'])

    op.create_table('alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('strategy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('strategies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('symbol', sa.String(), nullable=True),
        sa.Column('signal', sa.String(), nullable=True),
        sa.Column('price', sa.Numeric(), nullable=True),
        sa.Column('received_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('raw_payload', postgresql.JSONB(), nullable=True),
    )
    op.create_index('ix_alerts_strategy_id', 'alerts', ['strategy_id'])

    op.create_table('executions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('strategy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('strategies.id', ondelete='SET NULL'), nullable=True),
        sa.Column('alert_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('alerts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('side', sa.String(), nullable=True),
        sa.Column('qty', sa.Numeric(), nullable=True),
        sa.Column('price', sa.Numeric(), nullable=True),
        sa.Column('mode', sa.String(), nullable=True),
        sa.Column('broker_order_id', sa.String(), nullable=True),
        sa.Column('type', execution_type, nullable=True),
        sa.Column('status', execution_status, nullable=False, server_default='pending'),
        sa.Column('response', postgresql.JSONB(), nullable=True),
        sa.Column('pnl', sa.Numeric(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('ix_executions_strategy_id', 'executions', ['strategy_id'])
    op.create_index('ix_executions_alert_id', 'executions', ['alert_id'])

    op.create_table('paper_trades',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('strategy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('strategies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('symbol', sa.String(), nullable=True),
        sa.Column('side', sa.String(), nullable=False),
        sa.Column('entry_price', sa.Numeric(), nullable=False),
        sa.Column('exit_price', sa.Numeric(), nullable=True),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('pnl', sa.Numeric(), nullable=True),
        sa.Column('entry_time', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('exit_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('position_qty', sa.Integer(), nullable=True),
        sa.Column('avg_price', sa.Numeric(), nullable=True),
    )
    op.create_index('ix_paper_trades_strategy_id', 'paper_trades', ['strategy_id'])

    op.create_table('notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', notification_type, nullable=False),
        sa.Column('destination', sa.String(), nullable=False),
        sa.Column('verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])

    op.create_table('error_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('context', sa.String(), nullable=True),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('stack', sa.String(), nullable=True),
        sa.Column('extra', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('ix_error_logs_user_id', 'error_logs', ['user_id'])

def downgrade():
    op.drop_index('ix_error_logs_user_id', table_name='error_logs')
    op.drop_table('error_logs')
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_table('notifications')
    op.drop_index('ix_paper_trades_strategy_id', table_name='paper_trades')
    op.drop_table('paper_trades')
    op.drop_index('ix_executions_alert_id', table_name='executions')
    op.drop_index('ix_executions_strategy_id', table_name='executions')
    op.drop_table('executions')
    op.drop_index('ix_alerts_strategy_id', table_name='alerts')
    op.drop_table('alerts')
    op.drop_index('ix_strategies_user_id', table_name='strategies')
    op.drop_table('strategies')
    op.drop_index('ix_brokers_user_id', table_name='brokers')
    op.drop_table('brokers')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
    for enum_name in ['notification_type','execution_status','execution_type','strategy_status','broker_type','user_status','user_role']:
        sa.Enum(name=enum_name).drop(op.get_bind(), checkfirst=True)

"""risk and idempotency

Revision ID: 20250815_000004_risk_and_idempotency
Revises: 20250815_000003_create_dhan_instruments
Create Date: 2025-08-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20250815_000004_risk_and_idempotency'
down_revision = '20250815_000003_create_dhan_instruments'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('strategy_risks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('strategy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('strategies.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('max_position_qty', sa.Integer(), nullable=True),
        sa.Column('max_daily_loss', sa.Numeric(), nullable=True),
        sa.Column('trading_start', sa.String(), nullable=True),
        sa.Column('trading_end', sa.String(), nullable=True),
        sa.Column('allow_weekends', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('max_signals_per_minute', sa.Integer(), nullable=True),
        sa.Column('kill_switch', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_strategy_risks_strategy_id', 'strategy_risks', ['strategy_id'])

    op.create_table('idempotency_keys',
        sa.Column('key', sa.String(), primary_key=True),
        sa.Column('strategy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('strategies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
    )
    op.create_index('ix_idem_strategy_created', 'idempotency_keys', ['strategy_id', 'created_at'])

def downgrade():
    op.drop_index('ix_idem_strategy_created', table_name='idempotency_keys')
    op.drop_table('idempotency_keys')
    op.drop_index('ix_strategy_risks_strategy_id', table_name='strategy_risks')
    op.drop_table('strategy_risks')

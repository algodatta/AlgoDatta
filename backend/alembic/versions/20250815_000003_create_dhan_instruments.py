"""create dhan instruments table

Revision ID: 20250815_000003_create_dhan_instruments
Revises: 20250815_000002_add_dhan_fields
Create Date: 2025-08-15

"""
from alembic import op
import sqlalchemy as sa

revision = '20250815_000003_create_dhan_instruments'
down_revision = '20250815_000002_add_dhan_fields'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'dhan_instruments',
        sa.Column('security_id', sa.String(), primary_key=True),
        sa.Column('trading_symbol', sa.String(), nullable=True),
        sa.Column('exchange_segment', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
    )
    op.create_index('ix_dhan_instruments_symbol_exch', 'dhan_instruments', ['trading_symbol','exchange_segment'])

def downgrade():
    op.drop_index('ix_dhan_instruments_symbol_exch', table_name='dhan_instruments')
    op.drop_table('dhan_instruments')

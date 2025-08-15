"""add dhanhq fields to strategy and broker

Revision ID: 20250815_000002_add_dhan_fields
Revises: 20250815_000001_create_core_tables
Create Date: 2025-08-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250815_000002_add_dhan_fields'
down_revision = '20250815_000001_create_core_tables'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('brokers', sa.Column('client_id', sa.String(), nullable=True))

    op.add_column('strategies', sa.Column('dhan_security_id', sa.String(), nullable=True))
    op.add_column('strategies', sa.Column('dhan_exchange_segment', sa.String(), nullable=True))
    op.add_column('strategies', sa.Column('dhan_product_type', sa.String(), nullable=True))
    op.add_column('strategies', sa.Column('dhan_order_type', sa.String(), nullable=True))
    op.add_column('strategies', sa.Column('dhan_validity', sa.String(), nullable=True))

def downgrade():
    op.drop_column('strategies', 'dhan_validity')
    op.drop_column('strategies', 'dhan_order_type')
    op.drop_column('strategies', 'dhan_product_type')
    op.drop_column('strategies', 'dhan_exchange_segment')
    op.drop_column('strategies', 'dhan_security_id')
    op.drop_column('brokers', 'client_id')

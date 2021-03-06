"""fix nullable

Revision ID: fa2dcf27c553
Revises: 888a30f55f40
Create Date: 2021-10-25 23:43:57.782001

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fa2dcf27c553'
down_revision = '888a30f55f40'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('payment', 'additional_data',
               existing_type=sa.TEXT(),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('payment', 'additional_data',
               existing_type=sa.TEXT(),
               nullable=False)
    # ### end Alembic commands ###

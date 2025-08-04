"""Add streak and badges functionality

Revision ID: add_streak_badges_001
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_streak_badges_001'
down_revision = None
depends_on = None


def upgrade():
    # Handle existing enums gracefully
    connection = op.get_bind()
    
    # Try to create enums, ignore if they already exist
    try:
        user_role_enum = sa.Enum('USER', 'ADMIN', 'SUPER_ADMIN', name='userroleenum')
        user_role_enum.create(connection)
    except Exception as e:
        print(f"UserRoleEnum already exists: {e}")
    
    try:
        badge_type_enum = sa.Enum('WEEKLY_STREAK', 'MONTHLY_STREAK', 'YEARLY_STREAK', 'MEDITATION_MASTER', 'FITNESS_CHAMPION', 'SLEEP_EXPERT', 'STRESS_WARRIOR', name='badgetypeenum')
        badge_type_enum.create(connection)
    except Exception as e:
        print(f"BadgeTypeEnum already exists: {e}")
    
    # Reference the enums for column creation
    user_role_enum = sa.Enum('USER', 'ADMIN', 'SUPER_ADMIN', name='userroleenum')
    badge_type_enum = sa.Enum('WEEKLY_STREAK', 'MONTHLY_STREAK', 'YEARLY_STREAK', 'MEDITATION_MASTER', 'FITNESS_CHAMPION', 'SLEEP_EXPERT', 'STRESS_WARRIOR', name='badgetypeenum')
    
    # Add new columns to users table
    op.add_column('users', sa.Column('role', user_role_enum, server_default='USER', nullable=True))
    op.add_column('users', sa.Column('current_streak', sa.Integer(), server_default='0', nullable=True))
    op.add_column('users', sa.Column('longest_streak', sa.Integer(), server_default='0', nullable=True))
    op.add_column('users', sa.Column('last_activity_date', sa.DateTime(), nullable=True))
    
    # Create badges table
    op.create_table('badges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('badge_type', badge_type_enum, nullable=False),
        sa.Column('icon_url', sa.String(), nullable=True),
        sa.Column('requirement_value', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_badges_id'), 'badges', ['id'], unique=False)
    
    # Create user_badges table
    op.create_table('user_badges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('badge_id', sa.Integer(), nullable=False),
        sa.Column('earned_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('progress', sa.Integer(), server_default='0', nullable=True),
        sa.Column('is_completed', sa.Boolean(), server_default='false', nullable=True),
        sa.ForeignKeyConstraint(['badge_id'], ['badges.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_badges_id'), 'user_badges', ['id'], unique=False)


def downgrade():
    # Drop user_badges table
    op.drop_index(op.f('ix_user_badges_id'), table_name='user_badges')
    op.drop_table('user_badges')
    
    # Drop badges table
    op.drop_index(op.f('ix_badges_id'), table_name='badges')
    op.drop_table('badges')
    
    # Remove columns from users table
    op.drop_column('users', 'last_activity_date')
    op.drop_column('users', 'longest_streak')
    op.drop_column('users', 'current_streak')
    op.drop_column('users', 'role')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS badgetypeenum')
    op.execute('DROP TYPE IF EXISTS userroleenum')
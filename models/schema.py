from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSON, INET
from sqlalchemy_utils import Timestamp
from sqlalchemy import (
  Column,
  Text,
  DateTime,
  String,
  Integer,
  MetaData,
  Numeric,
  ForeignKey
)

NAMING_CONVENTION = {
  "ix": 'ix_%(column_0_label)s',
  "uq": "uq_%(table_name)s_%(column_0_N_name)s",
  "ck": "ck_%(table_name)s_%(constraint_name)s",
  "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
  "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)
Base = declarative_base(metadata=metadata, cls=Timestamp)


class VirtualAccount(Base):
    __tablename__ = 'virtual_account'

    virtual_account = Column(String(18), primary_key=True)
    company_code = Column(Integer, nullable=False)
    expired = Column(DateTime, nullable=False)


class Payment(Base):
    __tablename__ = 'payment'

    reference = Column(String(15), primary_key=True)
    company_code = Column(String(5), nullable=False)
    customer_number = Column(String(18), ForeignKey(VirtualAccount.virtual_account), nullable=False)
    request_id = Column(String(30), nullable=False)
    channel_type = Column(String(4), nullable=False)
    customer_name = Column(String(30), nullable=False)
    currency_code = Column(String(3), nullable=False)
    paid_amount = Column(Numeric(20, 2), nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    sub_company = Column(String(5), nullable=True)
    transaction_date = Column(DateTime, nullable=False)
    flag_advice = Column(String(1), nullable=False)
    additional_data = Column(Text, nullable=True)


class Transaction(Base):
    __tablename__ = 'transaction'
    trx_id = Column(Text, primary_key=True)
    customer_number = Column(String(18), ForeignKey(VirtualAccount.virtual_account), nullable=False)
    currency = Column(String(3), nullable=False)
    customer_name = Column(String(30), nullable=False)
    amount = Column(Numeric(20, 2), nullable=False)
    callback_url = Column(Text, nullable=False)
    status = Column(String(1), nullable=False, server_default='0')
    expired_in_second = Column(Integer, nullable=False)
    expired = Column(DateTime, nullable=False)
    payment_ref = Column(String(15), ForeignKey(Payment.reference), nullable=True)


class ClientLog(Base):
    __tablename__ = 'client_log'
    
    uuid = Column(Text, primary_key=True)
    trx_id = Column(Text, ForeignKey(Transaction.trx_id), nullable=True)
    ip = Column(INET, nullable=True)
    url = Column(Text, nullable=False)
    header = Column(JSON, nullable=True)
    cookie = Column(JSON, nullable=True)
    request = Column(JSON, nullable=False)
    response = Column(JSON, nullable=False)
    response_time = Column(Numeric(20,2), nullable=False)
    status_code = Column(Integer, nullable=False)


class ServerLog(Base):
    __tablename__ = 'server_log'

    uuid = Column(Text, primary_key=True)
    trx_id = Column(Text, ForeignKey(Transaction.trx_id), nullable=True)
    ip = Column(INET, nullable=True)
    url = Column(Text, nullable=False)
    header = Column(JSON, nullable=True)
    cookie = Column(JSON, nullable=True)
    request = Column(JSON, nullable=False)
    response = Column(JSON, nullable=False)
    response_time = Column(Numeric(20,2), nullable=False)
    status_code = Column(Integer, nullable=False)


class CallbackLog(Base):
    __tablename__ = 'callback_log'

    uuid = Column(Text, primary_key=True)
    trx_id = Column(Text, ForeignKey(Transaction.trx_id), nullable=False)
    url = Column(Text, nullable=False)
    header = Column(JSON, nullable=False)
    request = Column(JSON, nullable=False)
    response = Column(JSON, nullable=True)
    response_time = Column(Numeric(20,2), nullable=False)
    status_code = Column(Integer, nullable=False)

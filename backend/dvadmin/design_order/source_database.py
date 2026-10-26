import os
from dataclasses import dataclass
from types import MappingProxyType

import MySQLdb


ENV_KEYS = MappingProxyType({
    "host": "DS_ALL_DB_HOST",
    "port": "DS_ALL_DB_PORT",
    "user": "DS_ALL_DB_USER",
    "password": "DS_ALL_DB_PASSWORD",
    "database": "DS_ALL_DB_NAME",
})


@dataclass(frozen=True)
class SourceDatabaseConfig:
    host: str
    port: int
    user: str
    password: str
    database: str

    @classmethod
    def from_environment(cls):
        values = {name: os.environ.get(key, "") for name, key in ENV_KEYS.items()}
        missing = [ENV_KEYS[name] for name, value in values.items() if not value]
        if missing:
            raise ValueError(f"缺少源数据库环境变量: {', '.join(missing)}")
        return cls(
            host=values["host"],
            port=int(values["port"]),
            user=values["user"],
            password=values["password"],
            database=values["database"],
        )


def connect_source_database(config: SourceDatabaseConfig):
    return MySQLdb.connect(
        host=config.host,
        port=config.port,
        user=config.user,
        passwd=config.password,
        db=config.database,
        charset="utf8mb4",
    )

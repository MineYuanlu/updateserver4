import { drizzle as drizzle_sqlite3 } from 'drizzle-orm/better-sqlite3';
import DatabaseSqlite3 from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

type DatabaseType = 'sqlite3' | 'mysql' | 'postgresql';
export const DATABASE_TYPE: DatabaseType = 'sqlite3';

export const db = ((type: DatabaseType) => {
	switch (type) {
		case 'sqlite3': {
			if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
			const db = new DatabaseSqlite3(env.DATABASE_URL, {
				verbose: dev
					? (msg, ...args) => {
							console.log(msg, args);
						}
					: undefined,
			});
			// db.exec('PRAGMA journal_mode = WAL');
			// db.exec('PRAGMA synchronous = NORMAL');
			return drizzle_sqlite3(db);
		}
		case 'mysql': {
			throw new Error('MySQL is not supported yet');
		}
		case 'postgresql': {
			throw new Error('PostgreSQL is not supported yet');
		}
		default: {
			throw new Error(`Unsupported database type: ${type}`);
		}
	}
})(DATABASE_TYPE);

import { SqliteError } from 'better-sqlite3';
/**
 * 判断是否是Primary/Unique冲突
 */
export function isConflictError(e: any): boolean {
	if (e instanceof SqliteError) {
		return e.code === 'SQLITE_CONSTRAINT_UNIQUE';
	}
	return false;
}

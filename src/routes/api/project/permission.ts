import BitSet from 'bitset';

export enum Perm {
	/** 所有者 */
	Owner,
	/** 管理员 */
	Maintainer,

	/** 查看项目基础 */
	ProjView,
	/** 修改项目基础 */
	ProjEdit,

	/** 列出用户 */
	MemberList,
	/** 列出所有用户 */
	MemberListAll,
	/** 修改用户权限 */
	MemberManage,

	/** 读取版本 */
	VersionRead,
	/** 推送版本 */
	VersionPush,
	/** 修改版本 */
	VersionEdit,
	/** 删除版本 */
	VersionDelete,
	/** 设置主版本 */
	VersionMainSet,

	/** 列出机器人 */
	RobotList,
	/** 创建机器人 */
	RobotCreate,
	/** 更新机器人令牌 */
	RobotToken,
	/** 修改机器人 */
	RobotUpdate,
	/** 移除机器人 */
	RobotDelete,
}

export type PermInfo = BitSet;

export function hasAnyPerm(perm: PermInfo | undefined, ...perms: Perm[]) {
	if (!perm) return false;
	for (let p of perms) {
		if (perm.get(p)) return true;
	}
	return false;
}

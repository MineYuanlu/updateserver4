<script lang="ts">
	// 定义菜单类型
	interface Menu {
		path: string;
		name: string;
		desc: string;
	}

	// 示例菜单数据
	const menus: Menu[] = [
		{ path: '/admin/oauth', name: 'OAuth 管理', desc: '管理和配置 OAuth 供应商' },
		{ path: '/admin/users', name: '用户管理', desc: '管理系统中的用户和权限' },
		{ path: '/admin/settings', name: '系统设置', desc: '配置系统的各项参数' },
		{ path: '/admin/reports', name: '报表中心', desc: '查看和生成系统报表' },
		// 你可以根据需要添加更多菜单项
	];
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-8 text-3xl font-bold text-gray-800 dark:text-gray-100">管理员面板</h1>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each menus as menu}
			<div
				class="card flex flex-col justify-between rounded-lg bg-white p-6 shadow-md ring-1 ring-blue-300 transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800"
			>
				<div>
					<h2 class="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">{menu.name}</h2>
					<p class="text-gray-600 dark:text-gray-400">{menu.desc}</p>
				</div>
				<a
					href={menu.path}
					class="mt-4 inline-block rounded-lg bg-blue-500 px-4 py-2 text-center font-semibold text-white shadow hover:bg-blue-600"
				>
					进入
				</a>
			</div>
		{/each}
	</div>
</div>

<style>
	.card {
		transition: transform 0.2s;
	}

	.card:hover {
		transform: translateY(-5px);
	}
</style>

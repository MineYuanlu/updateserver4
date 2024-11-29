<script lang="ts">
	import { colorPackNames } from '$lib/components/color';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Notification, { notiTypes } from '$lib/components/Notifications/Notification.svelte';
	import Table from '$lib/components/Table/Table.svelte';
	import { si1password, si2k, siFreelancer, siGithub } from 'simple-icons';
	import Dark from './Dark.svelte';
	import {
		addNotification,
		removeNotification
	} from '$lib/components/Notifications/NotificationList.svelte';
	import { demoMakeErrorResp } from '$lib/api/demo';
</script>

<h1>This is a demo page</h1>
<h3>Button</h3>

<h6>Default</h6>

{#each [false, true] as dark}
	<Dark {dark}>
		{#each colorPackNames as color}
			<Button {color} class="m-1">{color}</Button>
		{/each}
	</Dark>
{/each}

<h3>Input</h3>
<h6>Default</h6>
<Input />
<h6>Dropdown</h6>
<Input
	options={colorPackNames.flatMap((c, i) =>
		Array(i)
			.fill(c)
			.map((_, j) => `${c}-${j + 1}`)
	)}
/>

<h3>Table</h3>
<h6>Immediate</h6>
<Table
	hover
	striped
	centering
	headers={['Name', 'Age', 'Gender']}
	data={Array.from({ length: 10 }).flatMap((_, i) => [
		['John', i, 'Male'],
		['Jane', i, 'Female'],
		['Bob', i, 'Male']
	])}
/>
<h6>Fetcher</h6>
<Dark>
	<Table
		hover
		striped
		centering
		headers={['Name', 'Age', 'Gender']}
		data={async (off, len) => {
			console.log('Fetching data', off, len);
			await new Promise((resolve) => setTimeout(resolve, 1000 * 10));
			console.log('OK');
			const max = 45;
			len = Math.min(len, max - off);
			return {
				data: Array.from({ length: len }).map((_, i) => ['John', off + i, 'Male']),
				total: max
			};
		}}
	/>
</Dark>

<h3>Notification</h3>

{#each [false, true] as dark}
	<Dark {dark}>
		<div class="grid grid-cols-4 gap-4 p-4">
			{#each notiTypes as type, i}
				<Notification
					title="Notification"
					message="This is a notification for '{type}'"
					{type}
					icon
					showClose
					preClose={() => {
						addNotification({
							title: 'Demo禁止关闭',
							message: `关闭事件生效了 ${type}`
						});
						return false;
					}}
					btn1={i === 0 ? 'Btn1' : undefined}
					action1={() => {
						console.log('Btn1 clicked');
					}}
					btn2={i === 0 ? 'Btn2' : undefined}
				/>
				{#each [si1password, si2k, siGithub] as icon}
					<Notification
						title="Notification"
						message="This is a notification for '{type}' and '{icon.title}'"
						{type}
						{icon}
						showClose
						preClose={() => {
							addNotification({
								title: 'Demo禁止关闭',
								message: `关闭事件生效了 ${type} ${icon.title}`,
								type,
								icon
							});
							return false;
						}}
					/>
				{/each}
			{/each}
		</div>
	</Dark>
{/each}
{#snippet notification(id: number, [title, message]: string[])}
	<Notification
		{title}
		{message}
		type="success"
		icon
		showClose
		preClose={() => {
			removeNotification(id);
			return false;
		}}
	/>
{/snippet}
<Button
	onclick={() => {
		addNotification(
			notification,
			[`Notification ${Math.random()}`, `This is a notification ${Date.now()}`],
			3000,
			0
		);
	}}
>
	添加通知
</Button>
<Button
	onclick={() => {
		demoMakeErrorResp();
	}}
>
	API报错
</Button>

<script lang="ts">
	import { EditorView, minimalSetup, basicSetup } from 'codemirror';
	import { StateEffect, Transaction } from '@codemirror/state';
	export { minimalSetup, basicSetup };
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let dom: HTMLElement;

	let _mounted = false;
	onMount(() => {
		_mounted = true;
		return () => {
			_mounted = false;
		};
	});

	export let view: EditorView | null = null;

	/* `doc` 被故意设置为非响应式，以避免在编辑器之外存储冗余字符串。
     此外，将 doc 设置为 undefined 不会触发更新，因此您可以在设置后清除它。 */
	export let doc;

	/* 如果您希望通过 `update` 事件监听所有事务，请设置此项。 */
	export let verbose = false;

	/* 缓存的文档字符串，以避免重复提取字符串。 */
	let _docCached: string | null = null;

	/* 覆盖指定文本。 */
	function _setText(text: string) {
		if (view === null) return;
		view.dispatch({
			changes: { from: 0, to: view.state.doc.length, insert: text },
		});
	}

	const subscribers = new Set<Function>();

	/* 这里开始是响应性，实现为读/写存储。 */
	export const docStore = {
		ready: () => view !== null,
		subscribe(cb: (value: string | null) => void) {
			subscribers.add(cb);

			if (!this.ready()) {
				cb(null);
			} else {
				if (_docCached == null) {
					_docCached = view!.state.doc.toString();
				}
				cb(_docCached);
			}

			return () => void subscribers.delete(cb);
		},
		set(newValue: string) {
			if (!_mounted) {
				throw new Error('Cannot set docStore when the component is not mounted.');
			}

			const inited = _initEditorView(newValue);
			if (!inited) _setText(newValue);
		},
	};

	export let extensions = minimalSetup;

	function _reconfigureExtensions() {
		if (view === null) return;
		view.dispatch({
			effects: StateEffect.reconfigure.of(extensions),
		});
	}

	$: extensions, _reconfigureExtensions();

	function _editorTxHandler(trs: readonly Transaction[], view: EditorView) {
		view.update(trs);

		if (verbose) {
			dispatch('update', trs);
		}

		let lastChangingTr;
		if ((lastChangingTr = trs.findLast((tr) => tr.docChanged))) {
			_docCached = null;
			if (subscribers.size) {
				dispatchDocStore((_docCached = lastChangingTr.newDoc.toString()));
			}
			dispatch('change', { view, trs });
		}
	}

	function dispatchDocStore(s: string) {
		for (const cb of subscribers) {
			cb(s);
		}
	}

	// 视图将使用文档（只要它不是 `undefined`）或设置后的 docStore 中的值进行初始化
	function _initEditorView(initialDoc: string) {
		if (view !== null) {
			return false;
		}

		view = new EditorView({
			doc: initialDoc,
			extensions,
			parent: dom,
			dispatchTransactions: _editorTxHandler,
		});
		return true;
	}

	$: if (_mounted && doc !== undefined) {
		const inited = _initEditorView(doc);
		dispatchDocStore(doc);
	}

	onDestroy(() => {
		if (view !== null) {
			view.destroy();
		}
	});
</script>

<div class="codemirror" bind:this={dom}></div>

<style>
	.codemirror {
		display: contents;
	}
</style>

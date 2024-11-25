import type { DefaultColors } from 'tailwindcss/types/generated/colors';

export const specialColors = ['black', 'white'] as const;

/** `black`/`white` 等颜色名 */
export type ColorSpecial = (typeof specialColors)[number];
/** `gray-100`/`gray-200`/`red-500` 等颜色名的前半部分 */
export type ColorLightable = {
	[K in keyof DefaultColors]: DefaultColors[K] extends Record<string, any> ? K : never;
}[keyof DefaultColors];
/** `gray-100`/`gray-200`/`red-500` 等颜色名 */
export type ColorNormal = {
	[K in ColorLightable]: {
		[L in keyof DefaultColors[K]]: L extends string ? `${K}-${L}` : never;
	}[keyof DefaultColors[K]];
}[ColorLightable];
/** `gray-100`/`gray-200`/`red-500`/`white`/`black` 等颜色名 */
export type Color = ColorSpecial | ColorNormal;

export type TextColor<T extends string = Color> = `text-${T}`;
export type DarkTextColor<T extends string = Color> = `dark:text-${T}`;
export type BackgroundColor<T extends string = Color> = `bg-${T}`;
export type HoverBackgroundColor<T extends string = Color> = `hover:bg-${T}`;
export type DarkBackgroundColor<T extends string = Color> = `dark:bg-${T}`;
export type DarkHoverBackgroundColor<T extends string = Color> = `dark:hover:bg-${T}`;
export type BorderColor<T extends string = Color> = `border-${T}`;
export type DarkBorderColor<T extends string = Color> = `dark:border-${T}`;

/** 颜色用途 */
export type ColorUsage =
	| 'text'
	| 'dark:text'
	| 'bg'
	| 'hover:bg'
	| 'dark:hover:bg'
	| 'border'
	| 'dark:border';

/**
 * 所有亮度类型, 数字/字符串
 */
export type AllLight =
	| { [K in ColorLightable]: keyof DefaultColors[K] }[ColorLightable]
	| ({
			[K in ColorLightable]: keyof DefaultColors[K];
	  }[ColorLightable] extends `${infer N extends number}`
			? N
			: never);

/**
 * 颜色包, 描述了一个组件的颜色风格
 */
export type ColorPack = {
	/** 文字颜色 */
	t?: Color;
	/** 暗色模式下文字颜色 */
	dt?: Color;
	/** 背景颜色 */
	bg?: Color;
	/** 悬浮背景颜色 */
	hbg?: Color;
	/** 暗色模式下背景颜色 */
	dbg?: Color;
	/** 暗色模式下悬浮背景颜色 */
	dhbg?: Color;
	/** 边框颜色 */
	b?: Color;
	/** 暗色模式下边框颜色 */
	db?: Color;
};
export type ColorPackClass = {
	t: '' | TextColor;
	dt: '' | DarkTextColor;
	bg: '' | BackgroundColor;
	hbg: '' | HoverBackgroundColor;
	dbg: '' | DarkBackgroundColor;
	dhbg: '' | DarkHoverBackgroundColor;
	b: '' | BorderColor;
	db: '' | DarkBorderColor;
};

/** 预设颜色包名 */
export type PreSetColorPacks =
	| 'blue'
	| 'red'
	| 'yellow'
	| 'orange'
	| 'white'
	| 'warning'
	| 'error'
	| 'info'
	| 'primary'
	| 'secondary'
	| 'green'
	| 'success';
/** 预设颜色包名/颜色包 */
export type PreableColorPacks = PreSetColorPacks | ColorPack;
export const colorPacks: Record<PreSetColorPacks, ColorPack> = {
	blue: {
		t: 'white',
		dt: 'gray-100',
		bg: 'blue-500',
		hbg: 'blue-700',
		dbg: 'blue-600',
		dhbg: 'blue-800'
	},
	red: {
		t: 'white',
		dt: 'gray-100',
		bg: 'red-500',
		hbg: 'red-700',
		dbg: 'red-600',
		dhbg: 'red-800'
	},
	yellow: {
		t: 'gray-900',
		dt: 'gray-100',
		bg: 'yellow-500',
		hbg: 'yellow-600',
		dbg: 'yellow-700',
		dhbg: 'yellow-800'
	},
	orange: {
		t: 'white',
		dt: 'gray-100',
		bg: 'orange-500',
		hbg: 'orange-700',
		dbg: 'orange-600',
		dhbg: 'orange-800'
	},
	white: {
		t: 'gray-900',
		dt: 'gray-100',
		bg: 'white',
		hbg: 'gray-100',
		dbg: 'gray-800',
		dhbg: 'gray-900',
		b: 'gray-800',
		db: 'gray-50'
	},
	warning: {
		t: 'gray-900',
		dt: 'gray-100',
		bg: 'yellow-400',
		hbg: 'yellow-500',
		dbg: 'yellow-600',
		dhbg: 'yellow-700'
	},
	error: {
		t: 'white',
		dt: 'gray-100',
		bg: 'red-500',
		hbg: 'red-600',
		dbg: 'red-700',
		dhbg: 'red-800'
	},
	info: {
		t: 'white',
		dt: 'gray-100',
		bg: 'blue-500',
		hbg: 'blue-600',
		dbg: 'blue-700',
		dhbg: 'blue-800'
	},
	primary: {
		t: 'white',
		dt: 'gray-100',
		bg: 'blue-600',
		hbg: 'blue-700',
		dbg: 'blue-800',
		dhbg: 'blue-900'
	},
	secondary: {
		t: 'gray-100',
		dt: 'gray-100',
		bg: 'gray-400',
		hbg: 'gray-500',
		dbg: 'gray-600',
		dhbg: 'gray-700'
	},
	green: {
		t: 'white',
		dt: 'gray-100',
		bg: 'green-500',
		hbg: 'green-600',
		dbg: 'green-700',
		dhbg: 'green-800'
	},
	success: {
		t: 'white',
		dt: 'gray-100',
		bg: 'green-400',
		hbg: 'green-500',
		dbg: 'green-600',
		dhbg: 'green-700'
	}
};
export const colorPackNames = Object.keys(colorPacks) as PreSetColorPacks[];
/**
 * 将(预设)颜色包转换为颜色类名
 * @param v (预设)颜色包
 * @returns 颜色类名, 不存在的将为空字符串
 */
export const colorPack2Class = (v: ColorPack | PreSetColorPacks): ColorPackClass => {
	const { t, dt, bg, hbg, dbg, dhbg, b, db } = (typeof v === 'string' ? colorPacks[v] : v) ?? {};
	return {
		t: t ? `text-${t}` : '',
		dt: dt ? `dark:text-${dt}` : '',
		bg: bg ? `bg-${bg}` : '',
		hbg: hbg ? `hover:bg-${hbg}` : '',
		dbg: dbg ? `dark:bg-${dbg}` : '',
		dhbg: dhbg ? `dark:hover:bg-${dhbg}` : '',
		b: b ? `border-${b}` : '',
		db: db ? `dark:border-${db}` : ''
	};
};

/**
 * 将颜色转换为颜色类名
 *
 * 对于已指定亮度的颜色或特殊颜色, 则不会再添加亮度
 * @param usage 颜色用途
 * @param color 颜色
 * @param light 默认亮度
 * @returns 颜色类名
 */
export const color2Class = <U extends ColorUsage>(
	usage: U,
	color: ColorLightable | Color | `${U}-${ColorLightable}` | `${U}-${Color}`,
	light: AllLight
): `${U}-${Color}` => {
	if (!color.includes('-') && !specialColors.includes(color as ColorSpecial))
		color = `${color}-${light}` as ColorNormal;

	return (color.startsWith(usage) ? color : `${usage}-${color}`) as any;
};

import type { Options } from '@node-rs/argon2';

export const passwordCheckOpt: Readonly<Options> = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
} as const;

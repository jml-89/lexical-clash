import prand from 'pure-rand'

export function shuffle<T>(xs: T[], prng: RandomGenerator): [T[], RandomGenerator] {
	let ys = new Array(xs.length);

	let curr = prng
	for (const [i, x] of xs.entries()) {
		const [j, next] = prand.uniformIntDistribution(0, i, curr)
		if (j !== i) {
			ys[i] = ys[j];
		}
		ys[j] = x;
		curr = next
	}

	return [ys, curr];
}

export function pickN<T>(m: Map<string, T>, n: number, prng: RandomGenerator): [Map<string, T>, RandomGenerator] {
	const res = new Map<string, T>
	const [keys, next] = shuffle([...m.keys()], prng)

	for (const key of keys.slice(0, n)) {
		res.set(key, m.get(key))
	}

	return [res, next]
}

// naive Levenshtein distance implementation
export function distance(x: string, y: string): number {
	let v0: Array<number> = Array(y.length+1).fill(0);
	let v1: Array<number> = Array(y.length+1).fill(0);
	for (let i = 0; i < v0.length; i++) {
		v0[i] = i;
	}

	for (let i = 0; i < x.length; i++) {
		v1[0] = i + 1;
		for (let j = 0; j < y.length; j++) {
			const del = v0[j+1] + 1;
			const ins = v1[j] + 1;
			const sub = (x[i] === y[j]) ? v0[j] : v0[j] + 1;
			v1[j+1] = Math.min(del, ins, sub);
		}

		for (let k = 0; k < v0.length; k++) {
			v0[k] = v1[k];
		}
	}

	return v0[v0.length-1];
}



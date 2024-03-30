

export function randn(n: number): number {
	return Math.floor(Math.random() * n);
}

export function randelem<T>(xs: Array<T>): T {
	return xs[randn(xs.length)];
}

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



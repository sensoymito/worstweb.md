//#region src/core/inline-parser.ts
function e(e, t) {
	let n = 1;
	for (let r = t; r < e.length; r++) if (e[r] === "[") n++;
	else if (e[r] === "]") {
		if (n--, n === 0) return r;
	} else if (e[r] === "\n") return -1;
	return -1;
}
function t(e, t) {
	let n = 1;
	for (let r = t; r < e.length; r++) if (e[r] === "(") n++;
	else if (e[r] === ")" && (n--, n === 0)) return r;
	return -1;
}
function n(e) {
	e = e.trim();
	let t = e.match(/^(\S+)\s+"([^"]*)"$/) ?? e.match(/^(\S+)\s+'([^']*)'$/) ?? e.match(/^(\S+)\s+\(([^)]*)\)$/);
	return t ? {
		href: t[1],
		title: t[2]
	} : { href: e };
}
function r(e) {
	e = e.trim();
	let t = e.match(/\s+=(\d*)x(\d*)\s*$/), r, i;
	return t && (t[1] && (r = parseInt(t[1], 10)), t[2] && (i = parseInt(t[2], 10)), e = e.slice(0, -t[0].length).trim()), {
		...n(e),
		width: r,
		height: i
	};
}
function i(e, t) {
	if (e[t] !== "`") return null;
	let n = 0;
	for (; t + n < e.length && e[t + n] === "`";) n++;
	let r = "`".repeat(n), i = t + n, a = i;
	for (; a < e.length;) {
		let t = e.indexOf(r, a);
		if (t === -1) return null;
		if (e[t + n] !== "`") {
			let r = e.slice(i, t);
			return n > 1 && r.startsWith(" ") && r.endsWith(" ") && (r = r.slice(1, -1)), {
				node: {
					type: "code_span",
					code: r
				},
				end: t + n
			};
		}
		a = t + 1;
	}
	return null;
}
function a(n, i, a) {
	if (n[i] !== "!" || n[i + 1] !== "[") return null;
	let o = e(n, i + 2);
	if (o === -1 || n[o + 1] !== "(") return null;
	let s = t(n, o + 2);
	if (s === -1) return null;
	let c = n.slice(i + 2, o), { href: l, title: u, width: d, height: f } = r(n.slice(o + 2, s));
	return {
		node: {
			type: "image",
			alt: c,
			src: l,
			title: u,
			width: d,
			height: f
		},
		end: s + 1
	};
}
function o(t, n, r) {
	if (t[n] !== "^" || t[n + 1] !== "[") return null;
	let i = e(t, n + 2);
	if (i === -1) return null;
	let a = t.slice(n + 2, i);
	r.inlineFootnoteCount++;
	let o = `__inline_${r.inlineFootnoteCount}`;
	r.footnoteRefs.push(o);
	let s = p(a, r);
	return r.footnoteDefs[o] = s, {
		node: {
			type: "inline_footnote",
			children: s
		},
		end: i + 1
	};
}
function s(e, t, n) {
	if (e[t] !== "[" || e[t + 1] !== "^") return null;
	let r = e.indexOf("]", t + 2);
	if (r === -1) return null;
	let i = e.slice(t + 2, r);
	return i.includes(" ") ? null : (n.footnoteRefs.includes(i) || n.footnoteRefs.push(i), {
		node: {
			type: "footnote_ref",
			id: i
		},
		end: r + 1
	});
}
function c(e, t) {
	if (e[t] !== "[" || e[t + 1] !== "~") return null;
	let n = e.indexOf("]", t + 2);
	if (n === -1) return null;
	let r = e.slice(t + 2, n);
	return !r || r.includes(" ") ? null : {
		node: {
			type: "warp_ref",
			id: r
		},
		end: n + 1
	};
}
function l(r, i, a) {
	if (r[i] !== "[") return null;
	if (r[i + 1] === "^") return s(r, i, a);
	if (r[i + 1] === "~") return c(r, i);
	let o = e(r, i + 1);
	if (o === -1) return null;
	let l = r.slice(i + 1, o), u = o + 1;
	if (r[u] === "(") {
		let e = t(r, u + 1);
		if (e !== -1) {
			let { href: t, title: i } = n(r.slice(u + 1, e));
			return {
				node: {
					type: "inline_link",
					text: p(l, a),
					href: t,
					title: i
				},
				end: e + 1
			};
		}
	}
	if (r[u] === "[") {
		let e = r.indexOf("]", u + 1);
		if (e !== -1) {
			let t = (r.slice(u + 1, e).trim() || l.trim()).toLowerCase(), n = a.linkDefs[t];
			if (n) return {
				node: {
					type: "link",
					text: p(l, a),
					href: n.href,
					title: n.title
				},
				end: e + 1
			};
		}
	}
	if (r[u] === "[" && r[u + 1] === "]") {
		let e = l.trim().toLowerCase(), t = a.linkDefs[e];
		if (t) return {
			node: {
				type: "link",
				text: p(l, a),
				href: t.href,
				title: t.title
			},
			end: u + 2
		};
	}
	let d = l.trim().toLowerCase(), f = a.linkDefs[d];
	return f ? {
		node: {
			type: "link",
			text: p(l, a),
			href: f.href,
			title: f.title
		},
		end: u
	} : null;
}
function u(e, t, n) {
	let r = e[t];
	if (r !== "*" && r !== "_" || e[t + 1] !== r || e[t + 2] === r) return null;
	let i = r + r, a = t + 2, o = e.indexOf(i, a);
	if (o === -1) return null;
	let s = e.slice(a, o);
	return s.includes("\n") ? null : {
		node: {
			type: "strong",
			children: p(s, n)
		},
		end: o + 2
	};
}
function d(e, t, n) {
	let r = e[t];
	if (r !== "*" && r !== "_" || e[t + 1] === r) return null;
	let i = t + 1, a = i;
	for (; a < e.length;) {
		let t = e.indexOf(r, a);
		if (t === -1) return null;
		if (e[t + 1] === r) {
			a = t + 2;
			continue;
		}
		let o = e.slice(i, t);
		return o.includes("\n") ? null : {
			node: {
				type: "emphasis",
				children: p(o, n)
			},
			end: t + 1
		};
	}
	return null;
}
function f(e, t, n) {
	if (e[t] !== "~" || e[t + 1] !== "~" || e[t + 2] === "~") return null;
	let r = t + 2, i = e.indexOf("~~", r);
	if (i === -1) return null;
	let a = e.slice(r, i);
	return a.includes("\n") ? null : {
		node: {
			type: "strikethrough",
			children: p(a, n)
		},
		end: i + 2
	};
}
function p(e, t) {
	let n = [], r = 0, s = 0;
	function c() {
		r > s && n.push({
			type: "text",
			text: e.slice(s, r)
		}), s = r;
	}
	for (; r < e.length;) {
		let p = e[r], m = null;
		if (p === "`") m = i(e, r);
		else if (p === "!" && e[r + 1] === "[") m = a(e, r, t);
		else if (p === "^" && e[r + 1] === "[") m = o(e, r, t);
		else if (p === "[") m = l(e, r, t);
		else if ((p === "*" || p === "_") && e[r + 1] === p && e[r + 2] !== p) m = u(e, r, t);
		else if ((p === "*" || p === "_") && e[r + 1] !== p) m = d(e, r, t);
		else if (p === "~" && e[r + 1] === "~" && e[r + 2] !== "~") m = f(e, r, t);
		else if (p === "\n") {
			c(), n.push({ type: "line_break" }), r++, s = r;
			continue;
		} else if ((p === "*" || p === "_") && e[r + 1] === p && e[r + 2] === p) {
			r++;
			continue;
		}
		m ? (c(), n.push(m.node), r = m.end, s = r) : r++;
	}
	return c(), n;
}
//#endregion
//#region src/core/block-parser.ts
function m(e) {
	return e.map((e) => typeof e === "string" ? e.trimEnd() : e);
}
function h(e) {
	return e.trim() === "";
}
function g(e) {
	return /^\s*(-\s*){3,}$/.test(e) || /^\s*(\*\s*){3,}$/.test(e);
}
function _(e) {
	let t = e.match(/^(#{1,6})\s+(.+?)(\s+#+\s*)?$/);
	if (!t) return null;
	let n = t[2].trimEnd(), r = n.match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
	return r ? {
		level: t[1].length,
		text: r[1].trimEnd(),
		id: r[2]
	} : {
		level: t[1].length,
		text: n
	};
}
function v(e) {
	let t = e.match(/^(`{3,}|~{3,})([\w+-]*)(?::(.+))?/);
	return t ? {
		marker: t[1],
		language: t[2] || void 0,
		filename: t[3] || void 0
	} : null;
}
function ee(e) {
	return e.map((e) => e.replace(/^>\s?/, ""));
}
function y(e) {
	let t = e.match(/^(\s*)([-*+])\s+(.*)/);
	if (t) {
		let e = t[1].length, n = e + 2, r = t[3], i, a = r.match(/^\[([ xX])\]\s+(.*)/);
		return a && (i = a[1] !== " ", r = a[2]), {
			indent: e,
			marker: "bullet",
			checked: i,
			textStart: n,
			text: r
		};
	}
	let n = e.match(/^(\s*)(\d+)\.\s+(.*)/);
	if (n) {
		let e = n[1].length, t = parseInt(n[2], 10), r = e + n[2].length + 2, i = n[3], a, o = i.match(/^\[([ xX])\]\s+(.*)/);
		return o && (a = o[1] !== " ", i = o[2]), {
			indent: e,
			marker: "ordered",
			start: t,
			checked: a,
			textStart: r,
			text: i
		};
	}
	return null;
}
function b(e) {
	let t = e.replace(/^\s*~?\s*\|?\s*/, "").replace(/\s*\|?\s*$/, ""), n = [], r = "", i = !1;
	for (let e of t) e === "`" ? (i = !i, r += e) : e === "|" && !i ? (n.push(r.trim()), r = "") : r += e;
	return n.push(r.trim()), n;
}
function x(e) {
	let t = e.trim(), n = t.startsWith(":"), r = t.endsWith(":");
	return n && r ? "center" : n ? "left" : r ? "right" : "default";
}
function S(e) {
	let t = b(e);
	return t.length > 0 && t.every((e) => /^:?-+:?$/.test(e));
}
function C(e, t, n) {
	let r = [], i = 0;
	for (; i < e.length;) {
		let a = e[i];
		if (a.endsWith("\\") && !/^\\-+$/.test(a)) {
			let n = a.slice(0, -1).trimEnd(), o = 2;
			for (i++; i < e.length;) if (e[i] === "\\") o++, i++;
			else if (e[i] === "") {
				i++;
				break;
			} else break;
			r.push({
				children: p(n, t),
				colspan: o
			});
			continue;
		}
		if (n && /^\\-+$/.test(a)) {
			r.push({ children: [{
				type: "text",
				text: "__ROWSPAN__"
			}] }), i++;
			continue;
		}
		r.push({ children: p(a, t) }), i++;
	}
	return r;
}
var w = /^\[([^\]]+)\]:\s+(\S+)(?:\s+(?:"([^"]+)"|'([^']+)'|\(([^)]+)\)))?/, T = /^\[\^([^\]\s]+)\]:\s*(.*)/;
function te(e) {
	let t = {}, n = {};
	for (let r of e) {
		let e = r.match(T);
		if (e) {
			n[e[1]] = e[2];
			continue;
		}
		let i = r.match(w);
		if (i) {
			let e = i[1].toLowerCase();
			t[e] = {
				href: i[2],
				title: i[3] ?? i[4] ?? i[5]
			};
			continue;
		}
	}
	return {
		linkDefs: t,
		rawFootnoteDefs: n
	};
}
function ne(e) {
	return e.filter((e) => !w.test(e) && !T.test(e));
}
function E(e, t) {
	let n, r, i = {}, a = [], o = [], s = 0, c = null;
	for (; s < e.length;) {
		let l = e[s], u = l.match(/^(`{3,}|~{3,})/);
		if (u) {
			c === null ? c = u[1] : l.startsWith(c[0]) && l.trimEnd().length >= c.length && l.trimEnd() === c[0].repeat(l.trimEnd().length) && (c = null), a.push(l), s++;
			continue;
		}
		if (c !== null) {
			a.push(l), s++;
			continue;
		}
		if (/^:::header\s*$/.test(l)) {
			let r = [];
			s++;
			{
				let t = 0;
				for (; s < e.length;) {
					let n = e[s];
					if (/^:::(header|footer)\s*$/.test(n) || /^:::warp\s+\S/.test(n) || /^:::details\s+/.test(n)) t++;
					else if (/^\s*:::\s*$/.test(n)) {
						if (t === 0) break;
						t--;
					}
					r.push(n), s++;
				}
				s++;
			}
			let a = E(r, t);
			Object.assign(i, a.warpDefs);
			let o = P(a.remainingLines, t);
			a.detailsBlocks.length > 0 && (o = o.map((e) => {
				if (e.type === "paragraph" && e.children.length === 1 && e.children[0].type === "text") {
					let t = e.children[0].text.match(/^__DETAILS_PLACEHOLDER_(\d+)__$/);
					if (t) {
						let e = parseInt(t[1], 10);
						if (a.detailsBlocks[e]) return a.detailsBlocks[e].node;
					}
				}
				return e;
			})), n = {
				type: "header_container",
				children: o
			};
			continue;
		}
		if (/^:::footer\s*$/.test(l)) {
			let n = [];
			s++;
			{
				let t = 0;
				for (; s < e.length;) {
					let r = e[s];
					if (/^:::(header|footer)\s*$/.test(r) || /^:::warp\s+\S/.test(r) || /^:::details\s+/.test(r)) t++;
					else if (/^\s*:::\s*$/.test(r)) {
						if (t === 0) break;
						t--;
					}
					n.push(r), s++;
				}
				s++;
			}
			let a = E(n, t);
			Object.assign(i, a.warpDefs);
			let o = P(a.remainingLines, t);
			a.detailsBlocks.length > 0 && (o = o.map((e) => {
				if (e.type === "paragraph" && e.children.length === 1 && e.children[0].type === "text") {
					let t = e.children[0].text.match(/^__DETAILS_PLACEHOLDER_(\d+)__$/);
					if (t) {
						let e = parseInt(t[1], 10);
						if (a.detailsBlocks[e]) return a.detailsBlocks[e].node;
					}
				}
				return e;
			})), r = {
				type: "footer_container",
				children: o
			};
			continue;
		}
		let d = l.match(/^:::warp\s+(\S+)\s*$/);
		if (d) {
			let n = d[1], r = [];
			s++;
			{
				let t = 0;
				for (; s < e.length;) {
					let n = e[s];
					if (/^:::(header|footer)\s*$/.test(n) || /^:::warp\s+\S/.test(n) || /^:::details\s+/.test(n)) t++;
					else if (/^\s*:::\s*$/.test(n)) {
						if (t === 0) break;
						t--;
					}
					r.push(n), s++;
				}
				s++;
			}
			let a = {
				type: "warp_definition",
				id: n,
				children: []
			}, o = E(r, t);
			Object.assign(i, o.warpDefs);
			let c = P(o.remainingLines, t);
			o.detailsBlocks.length > 0 && (c = c.map((e) => {
				if (e.type === "paragraph" && e.children.length === 1 && e.children[0].type === "text") {
					let t = e.children[0].text.match(/^__DETAILS_PLACEHOLDER_(\d+)__$/);
					if (t) {
						let e = parseInt(t[1], 10);
						if (o.detailsBlocks[e]) return o.detailsBlocks[e].node;
					}
				}
				return e;
			})), a.children = c, i[n] && (a.id = `__duplicate_${n}`), i[d[1]] = a;
			continue;
		}
		let f = l.match(/^:::details\s+(.*?)\s*$/);
		if (f) {
			let n = f[1], r = [], c = a.length;
			s++;
			{
				let t = 0;
				for (; s < e.length;) {
					let n = e[s];
					if (/^:::(header|footer)\s*$/.test(n) || /^:::warp\s+\S/.test(n) || /^:::details\s+/.test(n)) t++;
					else if (/^\s*:::\s*$/.test(n)) {
						if (t === 0) break;
						t--;
					}
					r.push(n), s++;
				}
				s++;
			}
			let l = E(r, t);
			Object.assign(i, l.warpDefs);
			let u = P(l.remainingLines, t);
			l.detailsBlocks.length > 0 && (u = u.map((e) => {
				if (e.type === "paragraph" && e.children.length === 1 && e.children[0].type === "text") {
					let t = e.children[0].text.match(/^__DETAILS_PLACEHOLDER_(\d+)__$/);
					if (t) {
						let e = parseInt(t[1], 10);
						if (l.detailsBlocks[e]) return l.detailsBlocks[e].node;
					}
				}
				return e;
			}));
			let d = {
				type: "details",
				title: n,
				children: u
			};
			a.push(`__DETAILS_PLACEHOLDER_${o.length}__`), o.push({
				startIdx: c,
				node: d
			});
			continue;
		}
		let htmlMatch = l.match(/^:::html\s*$/);
		if (htmlMatch) {
			let htmlLines = [];
			s++;
			{
				let t = 0;
				for (; s < e.length;) {
					let n = e[s];
					if (/^:::html\s*$/.test(n)) t++;
					else if (/^\s*:::\s*$/.test(n)) {
						if (t === 0) break;
						t--;
					}
					htmlLines.push(n), s++;
				}
				s++;
			}
			a.push({ type: "raw_html", html: htmlLines.join("\n") });
			continue;
		}
		a.push(l), s++;
	}
	return {
		header: n,
		footer: r,
		warpDefs: i,
		remainingLines: a,
		detailsBlocks: o
	};
}
function D(e, t, n) {
	let r = _(e[t]);
	return r ? {
		node: {
			type: "heading",
			level: r.level,
			...r.id !== void 0 && { id: r.id },
			children: p(r.text, n)
		},
		nextIndex: t + 1
	} : null;
}
function O(e, t) {
	return g(e[t]) ? {
		node: { type: "horizontal_rule" },
		nextIndex: t + 1
	} : null;
}
function k(e, t) {
	let n = v(e[t]);
	if (!n) return null;
	let r = [], i = n.marker[0], a = n.marker.length, o = t + 1;
	for (; o < e.length;) {
		if (e[o].match(/^(`{3,}|~{3,})$/) && e[o][0] === i && e[o].length >= a) {
			o++;
			break;
		}
		r.push(e[o]), o++;
	}
	return {
		node: {
			type: "code_block",
			language: n.language,
			filename: n.filename,
			code: r.join("\n")
		},
		nextIndex: o
	};
}
function A(e, t, n) {
	if (!e[t].startsWith(">")) return null;
	let r = [], i = t;
	for (; i < e.length && e[i].startsWith(">");) r.push(e[i]), i++;
	return {
		node: {
			type: "blockquote",
			children: P(ee(r), n)
		},
		nextIndex: i
	};
}
function j(e, t, n) {
	let r = y(e[t]);
	return r ? r.marker === "bullet" ? M(e, t, 0, n) : N(e, t, 0, n) : null;
}
function M(e, t, n, r) {
	let i = [], a = t;
	for (; a < e.length;) {
		if (h(e[a])) {
			a++;
			continue;
		}
		let t = y(e[a]);
		if (!t || t.marker !== "bullet" || t.indent < n) break;
		let o = [t.text];
		for (a++; a < e.length && !h(e[a]);) {
			let n = y(e[a]);
			if (n) {
				if (n.indent > t.indent) break;
				break;
			}
			if (e[a].match(/^\s/)) o.push(e[a].trimStart()), a++;
			else break;
		}
		let s;
		if (a < e.length) {
			let n = y(e[a]);
			if (n && n.indent > t.indent) {
				let t = n.marker === "bullet" ? M(e, a, n.indent, r) : N(e, a, n.indent, r);
				s = t.node, a = t.nextIndex;
			}
		}
		i.push({
			checked: t.checked,
			children: p(o.join(" "), r),
			sublist: s
		});
	}
	return {
		node: {
			type: "bullet_list",
			depth: n,
			items: i
		},
		nextIndex: a
	};
}
function N(e, t, n, r) {
	let i = [], a = t, o = 1, s = !0;
	for (; a < e.length;) {
		if (h(e[a])) {
			a++;
			continue;
		}
		let t = y(e[a]);
		if (!t || t.marker !== "ordered" || t.indent < n) break;
		s &&= (o = t.start ?? 1, !1);
		let c = [t.text];
		for (a++; a < e.length && !(h(e[a]) || y(e[a])) && e[a].match(/^\s/);) c.push(e[a].trimStart()), a++;
		let l;
		if (a < e.length) {
			let n = y(e[a]);
			if (n && n.indent > t.indent) {
				let t = n.marker === "bullet" ? M(e, a, n.indent, r) : N(e, a, n.indent, r);
				l = t.node, a = t.nextIndex;
			}
		}
		i.push({
			checked: t.checked,
			children: p(c.join(" "), r),
			sublist: l
		});
	}
	return {
		node: {
			type: "ordered_list",
			depth: n,
			start: o,
			items: i
		},
		nextIndex: a
	};
}
function re(e, t, n) {
	let r = e[t], i = /^\s*~\s+\|/.test(r) || /^\s*~\s+/.test(r), a = (e) => i ? /^\s*~\s*\|/.test(e) || /^\s*~\s+/.test(e) : /^\s*\|/.test(e) || e.includes("|");
	if (!a(r) || t + 1 >= e.length || !S(e[t + 1]) && !(i && S(e[t + 1].replace(/^\s*~\s*/, "")))) return null;
	let o = C(b(i ? r.replace(/^\s*~\s*/, "") : r), n, !1), s = b(i ? e[t + 1].replace(/^\s*~\s*/, "") : e[t + 1]).map(x), c = o.reduce((e, t) => e + (t.colspan ?? 1), 0), l = [], u = t + 2;
	for (; u < e.length && a(e[u]);) {
		let t = b(i ? e[u].replace(/^\s*~\s*/, "") : e[u]);
		for (; t.length < c;) t.push("");
		l.push(C(t, n, !0)), u++;
	}
	let d = (e) => e.children.length === 1 && e.children[0].type === "text" && e.children[0].text === "__ROWSPAN__", f = l.map((e) => {
		let t = /* @__PURE__ */ new Map(), n = 0;
		for (let r of e) t.set(n, r), n += r.colspan ?? 1;
		return t;
	});
	for (let e = 0; e < l.length; e++) {
		let t = 0;
		for (let n of l[e]) {
			if (d(n)) for (let n = e - 1; n >= 0; n--) {
				let e = f[n].get(t);
				if (e && !d(e)) {
					e.rowspan = (e.rowspan ?? 1) + 1;
					break;
				}
			}
			t += n.colspan ?? 1;
		}
	}
	return {
		node: {
			type: "table",
			isSilent: i,
			headers: o,
			alignments: s,
			rows: l
		},
		nextIndex: u
	};
}
function ie(e, t, n) {
	let r = [], i = t;
	for (; i < e.length;) {
		let t = e[i];
		if (h(t) || _(t) || g(t) || v(t) || t.startsWith(">") || y(t) || /^\s*\|/.test(t) || /^\s*~\s*\|/.test(t) || /^:::/.test(t) || /^__DETAILS_PLACEHOLDER_/.test(t)) break;
		r.push(t), i++;
	}
	let a = p(r.join("\n"), n);
	for (; a.length > 0 && a[a.length - 1].type === "line_break";) a.pop();
	return {
		node: {
			type: "paragraph",
			children: a
		},
		nextIndex: i
	};
}
function P(e, t) {
	let n = [], r = m(e), i = 0;
	for (; i < r.length;) {
		let e = r[i];
		if (typeof e !== "string") {
			n.push(e), i++;
			continue;
		}
		if (h(e)) {
			i++;
			continue;
		}
		if (/^__DETAILS_PLACEHOLDER_\d+__$/.test(e)) {
			n.push({
				type: "paragraph",
				children: [{
					type: "text",
					text: e
				}]
			}), i++;
			continue;
		}
		let a = null;
		a ??= D(r, i, t), a ??= O(r, i), a ??= k(r, i), a ??= A(r, i, t), a ??= j(r, i, t), a ??= re(r, i, t), a ||= ie(r, i, t), n.push(a.node), i = a.nextIndex;
	}
	return n;
}
function F(e) {
	let t = m(e.split("\n")), { linkDefs: n, rawFootnoteDefs: r } = te(t), i = ne(t), a = {
		linkDefs: n,
		footnoteDefs: {},
		warpDefs: {},
		footnoteRefs: [],
		inlineFootnoteCount: 0
	};
	for (let [e, t] of Object.entries(r)) a.footnoteDefs[e] = p(t, a);
	let o = E(i, a);
	a.warpDefs = o.warpDefs;
	let s = P(o.remainingLines, t);
	return o.detailsBlocks.length > 0 && (s = s.map((e) => {
		if (e.type === "paragraph" && e.children.length === 1 && e.children[0].type === "text") {
			let t = e.children[0].text.match(/^__DETAILS_PLACEHOLDER_(\d+)__$/);
			if (t) {
				let e = parseInt(t[1], 10);
				return o.detailsBlocks[e].node;
			}
		}
		return e;
	})), {
		header: o.header,
		footer: o.footer,
		body: s,
		linkDefs: n,
		footnoteDefs: a.footnoteDefs,
		footnoteRefs: a.footnoteRefs,
		warpDefs: o.warpDefs
	};
}
//#endregion
//#region src/renderer/html/renderer.ts
function I(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function L(e, t) {
	return e.map((e) => R(e, t)).join("");
}
function R(e, t) {
	switch (e.type) {
		case "text": return I(e.text);
		case "line_break": return "<br>";
		case "emphasis": return `<span class="lbs-emphasis">${L(e.children, t)}</span>`;
		case "strong": return `<span class="lbs-strong">${L(e.children, t)}</span>`;
		case "strikethrough": return `<span class="lbs-strikethrough">${L(e.children, t)}</span>`;
		case "code_span": return `<code class="lbs-code-span">${I(e.code)}</code>`;
		case "inline_link": {
			let n = e, r = n.title ? ` title="${I(n.title)}"` : "";
			return `<a href="${I(n.href)}"${r}>${L(n.text, t)}</a>`;
		}
		case "link": {
			let n = e, r = n.title ? ` title="${I(n.title)}"` : "";
			return `<a href="${I(n.href)}"${r}>${L(n.text, t)}</a>`;
		}
		case "image": {
			let t = e, n = t.title ? ` title="${I(t.title)}"` : "", r = t.width ? ` width="${t.width}"` : "", i = t.height ? ` height="${t.height}"` : "";
			return `<img src="${I(t.src)}" alt="${I(t.alt)}"${n}${r}${i} class="lbs-image">`;
		}
		case "footnote_ref": {
			let n = e, r = t.footnoteRefs.indexOf(n.id) + 1, i = t.footnoteRefCount[n.id] ?? 0;
			t.footnoteRefCount[n.id] = i + 1;
			let a = `[${r}${i === 0 ? "" : `:${i}`}]`;
			return `<sup class="lbs-footnote-ref"><a href="#lbs-fn-${I(n.id)}" id="lbs-fnref-${I(n.id)}-${i}">${a}</a></sup>`;
		}
		case "inline_footnote": {
			let n = e, r = t.footnoteRefs.find((e) => e.startsWith("__inline_") && t.footnoteDefs[e] === n.children);
			if (!r) return L(n.children, t);
			let i = t.footnoteRefs.indexOf(r) + 1;
			return `<sup class="lbs-footnote-ref"><a href="#lbs-fn-${I(r)}">[${i}]</a></sup>`;
		}
		case "warp_ref": {
			let n = e, r = t.warpDefs[n.id];
			return r ? z(r.children, t) : "";
		}
		default: return "";
	}
}
function z(e, t) {
	return e.map((e) => B(e, t)).join("\n");
}
function B(e, t) {
	switch (e.type) {
		case "heading": return V(e, t);
		case "paragraph": return H(e, t);
		case "horizontal_rule": return "<hr class=\"lbs-hr\">";
		case "code_block": return U(e);
		case "blockquote": return W(e, t);
		case "bullet_list": return K(e, t);
		case "ordered_list": return q(e, t);
		case "table": return J(e, t);
		case "header_container": return Y(e, t);
		case "footer_container": return X(e, t);
		case "details": return ae(e, t);
		case "raw_html": return e.html;
		case "warp_definition": return "";
		default: return "";
	}
}
function V(e, t) {
	let n = L(e.children, t), r = e.id ? ` id="${e.id}"` : "";
	return `<h${e.level} class="lbs-heading-${e.level}"${r}>${n}</h${e.level}>`;
}
function H(e, t) {
	return `<p class="lbs-paragraph">${L(e.children, t)}</p>`;
}
function U(e) {
	let t = e.language ? ` data-language="${I(e.language)}"` : "", n = e.filename ? ` data-filename="${I(e.filename)}"` : "";
	return `<div class="lbs-code-block">${e.filename ? `<div class="lbs-code-filename">${I(e.filename)}</div>` : ""}<pre${t}${n}><code${e.language ? ` class="language-${I(e.language)}"` : ""}>${I(e.code)}</code></pre></div>`;
}
function W(e, t) {
	return `<blockquote class="lbs-blockquote">${z(e.children, t)}</blockquote>`;
}
function G(e, t) {
	return `<li class="lbs-list-item">${e.checked === void 0 ? "" : `<input type="checkbox" class="lbs-checkbox"${e.checked ? " checked" : ""} disabled> `}${L(e.children, t)}${e.sublist ? "\n" + B(e.sublist, t) : ""}</li>`;
}
function K(e, t) {
	let n = e.items.map((e) => G(e, t)).join("\n");
	return `<ul class="lbs-ul lbs-ul-depth-${e.depth}">\n${n}\n</ul>`;
}
function q(e, t) {
	let n = e.start === 1 ? "" : ` start="${e.start}"`, r = e.items.map((e) => G(e, t)).join("\n");
	return `<ol class="lbs-ol lbs-ol-depth-${e.depth}"${n}>\n${r}\n</ol>`;
}
function J(e, t) {
	return `<table class="${e.isSilent ? "lbs-table lbs-table-silent" : "lbs-table"}">\n<thead><tr>${e.headers.map((n, r) => {
		let i = e.alignments[r], a = i && i !== "default" ? ` style="text-align:${i}"` : "";
		return `<th${n.colspan ? ` colspan="${n.colspan}"` : ""}${a}>${L(n.children, t)}</th>`;
	}).join("")}</tr></thead>\n<tbody>\n${e.rows.map((n) => `<tr>${n.map((n, r) => {
		let i = e.alignments[r], a = i && i !== "default" ? ` style="text-align:${i}"` : "", o = n.colspan ? ` colspan="${n.colspan}"` : "", s = n.rowspan ? ` rowspan="${n.rowspan}"` : "";
		return n.children.length === 1 && n.children[0].type === "text" && n.children[0].text === "__ROWSPAN__" ? "" : `<td${o}${s}${a}>${L(n.children, t)}</td>`;
	}).join("")}</tr>`).join("\n")}\n</tbody>\n</table>`;
}
function Y(e, t) {
	return `<header class="lbs-header">${z(e.children, t)}</header>`;
}
function X(e, t) {
	return `<footer class="lbs-footer">${z(e.children, t)}</footer>`;
}
function ae(e, t) {
	let n = z(e.children, t);
	return `<details class="lbs-details">\n<summary class="lbs-summary">${I(e.title)}</summary>\n${n}\n</details>`;
}
function oe(e, t) {
	return t.footnoteRefs.length === 0 ? "" : `<section class="lbs-footnotes">\n<ol>\n${t.footnoteRefs.map((e, n) => {
		let r = n + 1, i = t.footnoteDefs[e], a = i ? L(i, t) : "";
		return `<li id="lbs-fn-${I(e)}" class="lbs-footnote-item">[${r}] ${a}</li>`;
	}).join("\n")}\n</ol>\n</section>`;
}
function Z(e) {
	let t = {
		footnoteRefs: e.footnoteRefs,
		footnoteRefCount: {},
		footnoteDefs: e.footnoteDefs,
		warpDefs: e.warpDefs
	}, n = [];
	return e.header && n.push(Y(e.header, t)), n.push(z(e.body, t)), e.footnoteRefs.length > 0 && n.push(oe(e, t)), e.footer && n.push(X(e.footer, t)), n.filter(Boolean).join("\n");
}
//#endregion
//#region src/renderer/html/dom.ts
function Q(e, t) {
	t.innerHTML = Z(e);
}
async function $(e, t = document.body) {
	let n = Array.isArray(e) ? e : [e], r = await Promise.all(n.map(async (e) => {
		let t = new URL(e, location.href).href, n = await fetch(t);
		if (!n.ok) throw Error(`Failed to fetch ${e}: ${n.status} ${n.statusText}`);
		return {
			text: await n.text(),
			base: t
		};
	}));
	Q(F(r.map((e) => e.text).join("\n\n")), t);
	let i = r[0].base;
	t.querySelectorAll("img.lbs-image").forEach((e) => {
		let t = e.getAttribute("src");
		t && !/^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(t) && (e.src = new URL(t, i).href);
	});
}
function se() {
	if (typeof document > "u") return;
	let e = document.querySelectorAll("script[src*=\"lobster\"]"), t = null;
	e.forEach((e) => {
		e.dataset.src && (t = e.dataset.src);
	}), t && document.addEventListener("DOMContentLoaded", () => {
		$(t).catch(console.error);
	});
}
//#endregion
//#region src/index.ts
function ce(e) {
	return Z(F(e));
}
//#endregion
export { se as autoInit, $ as loadMarkdown, P as parseBlocks, F as parseDocument, p as parseInline, Z as renderDocument, Q as renderToDOM, ce as toHTML };

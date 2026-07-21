/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = globalThis, wt = at.ShadowRoot && (at.ShadyCSS === void 0 || at.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, At = Symbol(), St = /* @__PURE__ */ new WeakMap();
let Ft = class {
  constructor(t, o, r) {
    if (this._$cssResult$ = !0, r !== At) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = o;
  }
  get styleSheet() {
    let t = this.o;
    const o = this.t;
    if (wt && t === void 0) {
      const r = o !== void 0 && o.length === 1;
      r && (t = St.get(o)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && St.set(o, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Yt = (i) => new Ft(typeof i == "string" ? i : i + "", void 0, At), v = (i, ...t) => {
  const o = i.length === 1 ? i[0] : t.reduce((r, e, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(e) + i[s + 1], i[0]);
  return new Ft(o, i, At);
}, Jt = (i, t) => {
  if (wt) i.adoptedStyleSheets = t.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
  else for (const o of t) {
    const r = document.createElement("style"), e = at.litNonce;
    e !== void 0 && r.setAttribute("nonce", e), r.textContent = o.cssText, i.appendChild(r);
  }
}, zt = wt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let o = "";
  for (const r of t.cssRules) o += r.cssText;
  return Yt(o);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Gt, defineProperty: Qt, getOwnPropertyDescriptor: te, getOwnPropertyNames: ee, getOwnPropertySymbols: oe, getPrototypeOf: re } = Object, x = globalThis, Dt = x.trustedTypes, ie = Dt ? Dt.emptyScript : "", gt = x.reactiveElementPolyfillSupport, Z = (i, t) => i, nt = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? ie : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let o = i;
  switch (t) {
    case Boolean:
      o = i !== null;
      break;
    case Number:
      o = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        o = JSON.parse(i);
      } catch {
        o = null;
      }
  }
  return o;
} }, Pt = (i, t) => !Gt(i, t), jt = { attribute: !0, type: String, converter: nt, reflect: !1, useDefault: !1, hasChanged: Pt };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), x.litPropertyMetadata ?? (x.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let T = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, o = jt) {
    if (o.state && (o.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((o = Object.create(o)).wrapped = !0), this.elementProperties.set(t, o), !o.noAccessor) {
      const r = Symbol(), e = this.getPropertyDescriptor(t, r, o);
      e !== void 0 && Qt(this.prototype, t, e);
    }
  }
  static getPropertyDescriptor(t, o, r) {
    const { get: e, set: s } = te(this.prototype, t) ?? { get() {
      return this[o];
    }, set(a) {
      this[o] = a;
    } };
    return { get: e, set(a) {
      const c = e == null ? void 0 : e.call(this);
      s == null || s.call(this, a), this.requestUpdate(t, c, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? jt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Z("elementProperties"))) return;
    const t = re(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Z("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Z("properties"))) {
      const o = this.properties, r = [...ee(o), ...oe(o)];
      for (const e of r) this.createProperty(e, o[e]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const o = litPropertyMetadata.get(t);
      if (o !== void 0) for (const [r, e] of o) this.elementProperties.set(r, e);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [o, r] of this.elementProperties) {
      const e = this._$Eu(o, r);
      e !== void 0 && this._$Eh.set(e, o);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const o = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const e of r) o.unshift(zt(e));
    } else t !== void 0 && o.push(zt(t));
    return o;
  }
  static _$Eu(t, o) {
    const r = o.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((o) => this.enableUpdating = o), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((o) => o(this));
  }
  addController(t) {
    var o;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((o = t.hostConnected) == null || o.call(t));
  }
  removeController(t) {
    var o;
    (o = this._$EO) == null || o.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), o = this.constructor.elementProperties;
    for (const r of o.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Jt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((o) => {
      var r;
      return (r = o.hostConnected) == null ? void 0 : r.call(o);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((o) => {
      var r;
      return (r = o.hostDisconnected) == null ? void 0 : r.call(o);
    });
  }
  attributeChangedCallback(t, o, r) {
    this._$AK(t, r);
  }
  _$ET(t, o) {
    var s;
    const r = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, r);
    if (e !== void 0 && r.reflect === !0) {
      const a = (((s = r.converter) == null ? void 0 : s.toAttribute) !== void 0 ? r.converter : nt).toAttribute(o, r.type);
      this._$Em = t, a == null ? this.removeAttribute(e) : this.setAttribute(e, a), this._$Em = null;
    }
  }
  _$AK(t, o) {
    var s, a;
    const r = this.constructor, e = r._$Eh.get(t);
    if (e !== void 0 && this._$Em !== e) {
      const c = r.getPropertyOptions(e), n = typeof c.converter == "function" ? { fromAttribute: c.converter } : ((s = c.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? c.converter : nt;
      this._$Em = e;
      const f = n.fromAttribute(o, c.type);
      this[e] = f ?? ((a = this._$Ej) == null ? void 0 : a.get(e)) ?? f, this._$Em = null;
    }
  }
  requestUpdate(t, o, r, e = !1, s) {
    var a;
    if (t !== void 0) {
      const c = this.constructor;
      if (e === !1 && (s = this[t]), r ?? (r = c.getPropertyOptions(t)), !((r.hasChanged ?? Pt)(s, o) || r.useDefault && r.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(t)) && !this.hasAttribute(c._$Eu(t, r)))) return;
      this.C(t, o, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, o, { useDefault: r, reflect: e, wrapped: s }, a) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, a ?? o ?? this[t]), s !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (o = void 0), this._$AL.set(t, o)), e === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (o) {
      Promise.reject(o);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const e = this.constructor.elementProperties;
      if (e.size > 0) for (const [s, a] of e) {
        const { wrapped: c } = a, n = this[s];
        c !== !0 || this._$AL.has(s) || n === void 0 || this.C(s, void 0, a, n);
      }
    }
    let t = !1;
    const o = this._$AL;
    try {
      t = this.shouldUpdate(o), t ? (this.willUpdate(o), (r = this._$EO) == null || r.forEach((e) => {
        var s;
        return (s = e.hostUpdate) == null ? void 0 : s.call(e);
      }), this.update(o)) : this._$EM();
    } catch (e) {
      throw t = !1, this._$EM(), e;
    }
    t && this._$AE(o);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var o;
    (o = this._$EO) == null || o.forEach((r) => {
      var e;
      return (e = r.hostUpdated) == null ? void 0 : e.call(r);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((o) => this._$ET(o, this[o]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
T.elementStyles = [], T.shadowRootOptions = { mode: "open" }, T[Z("elementProperties")] = /* @__PURE__ */ new Map(), T[Z("finalized")] = /* @__PURE__ */ new Map(), gt == null || gt({ ReactiveElement: T }), (x.reactiveElementVersions ?? (x.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, Mt = (i) => i, lt = K.trustedTypes, Tt = lt ? lt.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, It = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, qt = "?" + _, se = `<${qt}>`, C = document, X = () => C.createComment(""), Y = (i) => i === null || typeof i != "object" && typeof i != "function", Et = Array.isArray, ae = (i) => Et(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", $t = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ut = /-->/g, Rt = />/g, P = RegExp(`>|${$t}(?:([^\\s"'>=/]+)(${$t}*=${$t}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ht = /'/g, kt = /"/g, Vt = /^(?:script|style|textarea|title)$/i, ne = (i) => (t, ...o) => ({ _$litType$: i, strings: t, values: o }), p = ne(1), U = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Nt = /* @__PURE__ */ new WeakMap(), E = C.createTreeWalker(C, 129);
function Wt(i, t) {
  if (!Et(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Tt !== void 0 ? Tt.createHTML(t) : t;
}
const le = (i, t) => {
  const o = i.length - 1, r = [];
  let e, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = W;
  for (let c = 0; c < o; c++) {
    const n = i[c];
    let f, b, d = -1, $ = 0;
    for (; $ < n.length && (a.lastIndex = $, b = a.exec(n), b !== null); ) $ = a.lastIndex, a === W ? b[1] === "!--" ? a = Ut : b[1] !== void 0 ? a = Rt : b[2] !== void 0 ? (Vt.test(b[2]) && (e = RegExp("</" + b[2], "g")), a = P) : b[3] !== void 0 && (a = P) : a === P ? b[0] === ">" ? (a = e ?? W, d = -1) : b[1] === void 0 ? d = -2 : (d = a.lastIndex - b[2].length, f = b[1], a = b[3] === void 0 ? P : b[3] === '"' ? kt : Ht) : a === kt || a === Ht ? a = P : a === Ut || a === Rt ? a = W : (a = P, e = void 0);
    const y = a === P && i[c + 1].startsWith("/>") ? " " : "";
    s += a === W ? n + se : d >= 0 ? (r.push(f), n.slice(0, d) + It + n.slice(d) + _ + y) : n + _ + (d === -2 ? c : y);
  }
  return [Wt(i, s + (i[o] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class J {
  constructor({ strings: t, _$litType$: o }, r) {
    let e;
    this.parts = [];
    let s = 0, a = 0;
    const c = t.length - 1, n = this.parts, [f, b] = le(t, o);
    if (this.el = J.createElement(f, r), E.currentNode = this.el.content, o === 2 || o === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (e = E.nextNode()) !== null && n.length < c; ) {
      if (e.nodeType === 1) {
        if (e.hasAttributes()) for (const d of e.getAttributeNames()) if (d.endsWith(It)) {
          const $ = b[a++], y = e.getAttribute(d).split(_), st = /([.?@])?(.*)/.exec($);
          n.push({ type: 1, index: s, name: st[2], strings: y, ctor: st[1] === "." ? he : st[1] === "?" ? pe : st[1] === "@" ? de : dt }), e.removeAttribute(d);
        } else d.startsWith(_) && (n.push({ type: 6, index: s }), e.removeAttribute(d));
        if (Vt.test(e.tagName)) {
          const d = e.textContent.split(_), $ = d.length - 1;
          if ($ > 0) {
            e.textContent = lt ? lt.emptyScript : "";
            for (let y = 0; y < $; y++) e.append(d[y], X()), E.nextNode(), n.push({ type: 2, index: ++s });
            e.append(d[$], X());
          }
        }
      } else if (e.nodeType === 8) if (e.data === qt) n.push({ type: 2, index: s });
      else {
        let d = -1;
        for (; (d = e.data.indexOf(_, d + 1)) !== -1; ) n.push({ type: 7, index: s }), d += _.length - 1;
      }
      s++;
    }
  }
  static createElement(t, o) {
    const r = C.createElement("template");
    return r.innerHTML = t, r;
  }
}
function R(i, t, o = i, r) {
  var a, c;
  if (t === U) return t;
  let e = r !== void 0 ? (a = o._$Co) == null ? void 0 : a[r] : o._$Cl;
  const s = Y(t) ? void 0 : t._$litDirective$;
  return (e == null ? void 0 : e.constructor) !== s && ((c = e == null ? void 0 : e._$AO) == null || c.call(e, !1), s === void 0 ? e = void 0 : (e = new s(i), e._$AT(i, o, r)), r !== void 0 ? (o._$Co ?? (o._$Co = []))[r] = e : o._$Cl = e), e !== void 0 && (t = R(i, e._$AS(i, t.values), e, r)), t;
}
class ce {
  constructor(t, o) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = o;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: o }, parts: r } = this._$AD, e = ((t == null ? void 0 : t.creationScope) ?? C).importNode(o, !0);
    E.currentNode = e;
    let s = E.nextNode(), a = 0, c = 0, n = r[0];
    for (; n !== void 0; ) {
      if (a === n.index) {
        let f;
        n.type === 2 ? f = new tt(s, s.nextSibling, this, t) : n.type === 1 ? f = new n.ctor(s, n.name, n.strings, this, t) : n.type === 6 && (f = new fe(s, this, t)), this._$AV.push(f), n = r[++c];
      }
      a !== (n == null ? void 0 : n.index) && (s = E.nextNode(), a++);
    }
    return E.currentNode = C, e;
  }
  p(t) {
    let o = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, o), o += r.strings.length - 2) : r._$AI(t[o])), o++;
  }
}
class tt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, o, r, e) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = o, this._$AM = r, this.options = e, this._$Cv = (e == null ? void 0 : e.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const o = this._$AM;
    return o !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = o.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, o = this) {
    t = R(this, t, o), Y(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== U && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ae(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && Y(this._$AH) ? this._$AA.nextSibling.data = t : this.T(C.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var s;
    const { values: o, _$litType$: r } = t, e = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = J.createElement(Wt(r.h, r.h[0]), this.options)), r);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === e) this._$AH.p(o);
    else {
      const a = new ce(e, this), c = a.u(this.options);
      a.p(o), this.T(c), this._$AH = a;
    }
  }
  _$AC(t) {
    let o = Nt.get(t.strings);
    return o === void 0 && Nt.set(t.strings, o = new J(t)), o;
  }
  k(t) {
    Et(this._$AH) || (this._$AH = [], this._$AR());
    const o = this._$AH;
    let r, e = 0;
    for (const s of t) e === o.length ? o.push(r = new tt(this.O(X()), this.O(X()), this, this.options)) : r = o[e], r._$AI(s), e++;
    e < o.length && (this._$AR(r && r._$AB.nextSibling, e), o.length = e);
  }
  _$AR(t = this._$AA.nextSibling, o) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, o); t !== this._$AB; ) {
      const e = Mt(t).nextSibling;
      Mt(t).remove(), t = e;
    }
  }
  setConnected(t) {
    var o;
    this._$AM === void 0 && (this._$Cv = t, (o = this._$AP) == null || o.call(this, t));
  }
}
class dt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, o, r, e, s) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = o, this._$AM = e, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = h;
  }
  _$AI(t, o = this, r, e) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) t = R(this, t, o, 0), a = !Y(t) || t !== this._$AH && t !== U, a && (this._$AH = t);
    else {
      const c = t;
      let n, f;
      for (t = s[0], n = 0; n < s.length - 1; n++) f = R(this, c[r + n], o, n), f === U && (f = this._$AH[n]), a || (a = !Y(f) || f !== this._$AH[n]), f === h ? t = h : t !== h && (t += (f ?? "") + s[n + 1]), this._$AH[n] = f;
    }
    a && !e && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class he extends dt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class pe extends dt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class de extends dt {
  constructor(t, o, r, e, s) {
    super(t, o, r, e, s), this.type = 5;
  }
  _$AI(t, o = this) {
    if ((t = R(this, t, o, 0) ?? h) === U) return;
    const r = this._$AH, e = t === h && r !== h || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, s = t !== h && (r === h || e);
    e && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var o;
    typeof this._$AH == "function" ? this._$AH.call(((o = this.options) == null ? void 0 : o.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class fe {
  constructor(t, o, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = o, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    R(this, t);
  }
}
const yt = K.litHtmlPolyfillSupport;
yt == null || yt(J, tt), (K.litHtmlVersions ?? (K.litHtmlVersions = [])).push("3.3.3");
const ue = (i, t, o) => {
  const r = (o == null ? void 0 : o.renderBefore) ?? t;
  let e = r._$litPart$;
  if (e === void 0) {
    const s = (o == null ? void 0 : o.renderBefore) ?? null;
    r._$litPart$ = e = new tt(t.insertBefore(X(), s), s, void 0, o ?? {});
  }
  return e._$AI(i), e;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
class u extends T {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var o;
    const t = super.createRenderRoot();
    return (o = this.renderOptions).renderBefore ?? (o.renderBefore = t.firstChild), t;
  }
  update(t) {
    const o = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ue(o, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return U;
  }
}
var Bt;
u._$litElement$ = !0, u.finalized = !0, (Bt = O.litElementHydrateSupport) == null || Bt.call(O, { LitElement: u });
const _t = O.litElementPolyfillSupport;
_t == null || _t({ LitElement: u });
(O.litElementVersions ?? (O.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const m = (i) => (t, o) => {
  o !== void 0 ? o.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ve = { attribute: !0, type: String, converter: nt, reflect: !1, hasChanged: Pt }, me = (i = ve, t, o) => {
  const { kind: r, metadata: e } = o;
  let s = globalThis.litPropertyMetadata.get(e);
  if (s === void 0 && globalThis.litPropertyMetadata.set(e, s = /* @__PURE__ */ new Map()), r === "setter" && ((i = Object.create(i)).wrapped = !0), s.set(o.name, i), r === "accessor") {
    const { name: a } = o;
    return { set(c) {
      const n = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(a, n, i, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, i, c), c;
    } };
  }
  if (r === "setter") {
    const { name: a } = o;
    return function(c) {
      const n = this[a];
      t.call(this, c), this.requestUpdate(a, n, i, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function l(i) {
  return (t, o) => typeof o == "object" ? me(i, t, o) : ((r, e, s) => {
    const a = e.hasOwnProperty(s);
    return e.constructor.createProperty(s, r), a ? Object.getOwnPropertyDescriptor(e, s) : void 0;
  })(i, t, o);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function F(i) {
  return l({ ...i, state: !0, attribute: !1 });
}
const M = v`
  :focus-visible {
    outline: 2px solid var(--folio-color-accent);
    outline-offset: 3px;
    border-radius: var(--folio-radius-none);
  }
  :focus:not(:focus-visible) {
    outline: none;
  }
`, g = v`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`, I = v`
  .mono-label {
    font-family: var(--folio-font-family-mono);
    font-size: var(--folio-text-label);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;
var be = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, q = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? ge(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && be(t, o, e), e;
};
let w = class extends u {
  constructor() {
    super(...arguments), this.variant = "card", this.disabled = !1, this.type = "button";
  }
  render() {
    const i = p`<slot name="icon"></slot><slot></slot>`;
    return this.href && !this.disabled ? p`<a
          part="button"
          class="btn"
          href=${this.href}
          target=${this.target ?? h}
          rel=${this.target === "_blank" ? "noopener noreferrer" : h}
          >${i}</a
        >` : p`<button
          part="button"
          class="btn"
          type=${this.type}
          ?disabled=${this.disabled}
          aria-disabled=${this.disabled ? "true" : h}
        >
          ${i}
        </button>`;
  }
};
w.styles = [
  M,
  g,
  v`
      :host {
        display: inline-block;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--folio-space-2);
        padding: var(--folio-space-2) 14px;
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-caption);
        font-weight: 500;
        letter-spacing: -0.01em;
        color: var(--folio-color-text);
        background: var(--folio-color-bg-card);
        border: 1px solid var(--folio-color-border-hover);
        border-radius: var(--folio-radius-none);
        cursor: pointer;
        text-decoration: none;
        transition:
          background var(--folio-transition-fast),
          border-color var(--folio-transition-fast),
          transform var(--folio-transition-fast);
      }
      .btn:hover {
        background: var(--folio-color-bg-elevated);
        transform: translateY(-1px);
      }
      :host([variant='ghost']) .btn {
        background: transparent;
        border-color: transparent;
        color: var(--folio-color-text-muted);
        padding-inline: var(--folio-space-1);
      }
      :host([variant='ghost']) .btn:hover {
        color: var(--folio-color-text);
        background: transparent;
        transform: none;
      }
      :host([disabled]) .btn {
        color: var(--folio-color-text-dim);
        border-color: var(--folio-color-border);
        cursor: not-allowed;
        pointer-events: none;
        transform: none;
      }
      ::slotted(svg) {
        display: block;
        width: 16px;
        height: 16px;
      }
    `
];
q([
  l({ reflect: !0 })
], w.prototype, "variant", 2);
q([
  l()
], w.prototype, "href", 2);
q([
  l()
], w.prototype, "target", 2);
q([
  l({ type: Boolean, reflect: !0 })
], w.prototype, "disabled", 2);
q([
  l()
], w.prototype, "type", 2);
w = q([
  m("folio-button")
], w);
var $e = Object.getOwnPropertyDescriptor, ye = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? $e(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = a(e) || e);
  return e;
};
let xt = class extends u {
  render() {
    return p`<span class="tag mono-label"><slot></slot></span>`;
  }
};
xt.styles = [
  I,
  v`
      :host {
        display: inline-block;
      }
      .tag {
        display: inline-block;
        padding: var(--folio-space-1) var(--folio-space-3);
        border: 1px solid var(--folio-color-border);
        border-radius: var(--folio-radius-none);
        color: var(--folio-color-text-muted);
        letter-spacing: 0.08em;
      }
    `
];
xt = ye([
  m("folio-tag")
], xt);
var _e = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, Ot = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? xe(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && _e(t, o, e), e;
};
let G = class extends u {
  constructor() {
    super(...arguments), this.selected = !1, this.disabled = !1;
  }
  toggle() {
    this.disabled || (this.selected = !this.selected, this.dispatchEvent(
      new CustomEvent("folio-change", {
        detail: { selected: this.selected },
        bubbles: !0,
        composed: !0
      })
    ));
  }
  render() {
    return p`<button
      part="button"
      class="chip"
      aria-pressed=${this.selected ? "true" : "false"}
      ?disabled=${this.disabled}
      @click=${this.toggle}
    >
      <slot></slot>
    </button>`;
  }
};
G.styles = [
  M,
  g,
  v`
      :host {
        display: inline-block;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--folio-space-2);
        padding: 6px var(--folio-space-3);
        font-family: var(--folio-font-family-sans);
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        color: var(--folio-color-text-muted);
        background: transparent;
        border: 1px solid var(--folio-color-border);
        border-radius: var(--folio-radius-none);
        cursor: pointer;
        transition:
          color var(--folio-transition-fast),
          background var(--folio-transition-fast),
          border-color var(--folio-transition-fast);
      }
      .chip:hover {
        color: var(--folio-color-text);
        border-color: var(--folio-color-border-hover);
      }
      :host([selected]) .chip {
        color: var(--folio-color-bg);
        background: var(--folio-color-text);
        border-color: var(--folio-color-text);
      }
      :host([disabled]) .chip {
        color: var(--folio-color-text-dim);
        cursor: not-allowed;
        pointer-events: none;
      }
    `
];
Ot([
  l({ type: Boolean, reflect: !0 })
], G.prototype, "selected", 2);
Ot([
  l({ type: Boolean, reflect: !0 })
], G.prototype, "disabled", 2);
G = Ot([
  m("folio-chip")
], G);
var we = Object.defineProperty, Ae = Object.getOwnPropertyDescriptor, Zt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ae(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && we(t, o, e), e;
};
let ct = class extends u {
  constructor() {
    super(...arguments), this.tone = "accent";
  }
  render() {
    return p`<span class="badge mono-label"><slot></slot></span>`;
  }
};
ct.styles = [
  I,
  v`
      :host {
        display: inline-block;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding-inline: var(--folio-space-2);
        border-radius: var(--folio-radius-none);
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--folio-color-accent);
        background: var(--folio-color-accent-soft);
      }
      :host([tone='ok']) .badge {
        color: var(--folio-color-status-ok);
        background: var(--folio-color-status-ok-soft);
      }
      :host([tone='warn']) .badge {
        color: var(--folio-color-status-warn);
        background: var(--folio-color-status-warn-soft);
      }
      :host([tone='danger']) .badge {
        color: var(--folio-color-status-danger);
        background: var(--folio-color-status-danger-soft);
      }
      :host([tone='info']) .badge {
        color: var(--folio-color-status-info);
        background: var(--folio-color-status-info-soft);
      }
    `
];
Zt([
  l({ reflect: !0 })
], ct.prototype, "tone", 2);
ct = Zt([
  m("folio-badge")
], ct);
var Pe = Object.defineProperty, Ee = Object.getOwnPropertyDescriptor, et = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ee(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Pe(t, o, e), e;
};
let S = class extends u {
  constructor() {
    super(...arguments), this.href = "#", this.variant = "inline", this.active = !1;
  }
  render() {
    return p`<a
      part="anchor"
      href=${this.href}
      target=${this.target ?? h}
      rel=${this.target === "_blank" ? "noopener noreferrer" : h}
      aria-current=${this.active ? "page" : h}
    >
      ${this.variant === "back" ? p`<span class="arrow" aria-hidden="true">←</span>` : h}
      <slot></slot>
    </a>`;
  }
};
S.styles = [
  M,
  g,
  v`
      :host {
        display: inline-block;
      }
      a {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--folio-space-2);
        font-family: var(--folio-font-family-sans);
        text-decoration: none;
        transition: color var(--folio-transition-fast);
      }

      /* nav */
      :host([variant='nav']) a {
        font-size: var(--folio-text-small);
        color: var(--folio-color-text-muted);
        letter-spacing: 0.01em;
      }
      :host([variant='nav']) a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1px;
        background: var(--folio-color-text);
        transition: width var(--folio-transition);
      }
      :host([variant='nav']) a:hover,
      :host([variant='nav'][active]) a {
        color: var(--folio-color-text);
      }
      :host([variant='nav']) a:hover::after {
        width: 100%;
      }

      /* inline */
      :host([variant='inline']) a {
        color: var(--folio-color-accent);
        text-decoration: underline;
        text-underline-offset: 3px;
        text-decoration-color: color-mix(in srgb, var(--folio-color-accent) 40%, transparent);
      }
      :host([variant='inline']) a:hover {
        color: var(--folio-color-accent-strong);
        text-decoration-color: currentColor;
      }

      /* back */
      :host([variant='back']) a {
        font-size: var(--folio-text-caption);
        color: var(--folio-color-text-muted);
      }
      :host([variant='back']) a:hover {
        color: var(--folio-color-text);
      }
      :host([variant='back']) .arrow {
        transition: transform var(--folio-transition-fast);
      }
      :host([variant='back']) a:hover .arrow {
        transform: translateX(-3px);
      }
    `
];
et([
  l()
], S.prototype, "href", 2);
et([
  l({ reflect: !0 })
], S.prototype, "variant", 2);
et([
  l({ type: Boolean, reflect: !0 })
], S.prototype, "active", 2);
et([
  l()
], S.prototype, "target", 2);
S = et([
  m("folio-link")
], S);
var Oe = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, Ct = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ce(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Oe(t, o, e), e;
};
let Q = class extends u {
  constructor() {
    super(...arguments), this.level = 2, this.dim = !1;
  }
  render() {
    const i = Math.min(6, Math.max(1, this.level));
    return p`<p class="title mono-label" role="heading" aria-level=${i}>
      <slot></slot>
    </p>`;
  }
};
Q.styles = [
  I,
  v`
      :host {
        display: block;
      }
      .title {
        margin: 0;
        color: var(--folio-color-text-muted);
        letter-spacing: 0.14em;
      }
      :host([dim]) .title {
        color: var(--folio-color-text-dim);
      }
    `
];
Ct([
  l({ type: Number })
], Q.prototype, "level", 2);
Ct([
  l({ type: Boolean, reflect: !0 })
], Q.prototype, "dim", 2);
Q = Ct([
  m("folio-section-title")
], Q);
var Se = Object.defineProperty, ze = Object.getOwnPropertyDescriptor, Kt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? ze(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Se(t, o, e), e;
};
const Lt = "folio-theme";
let ht = class extends u {
  constructor() {
    super(...arguments), this.theme = "dark";
  }
  connectedCallback() {
    super.connectedCallback();
    const i = localStorage.getItem(Lt), t = document.documentElement.getAttribute("data-theme");
    this.theme = i === "light" || t === "light" ? "light" : "dark", this.apply(!1);
  }
  apply(i) {
    document.documentElement.setAttribute("data-theme", this.theme), this.setAttribute("data-current", this.theme), i && (localStorage.setItem(Lt, this.theme), this.dispatchEvent(
      new CustomEvent("folio-theme-change", {
        detail: { theme: this.theme },
        bubbles: !0,
        composed: !0
      })
    ));
  }
  toggle() {
    this.theme = this.theme === "dark" ? "light" : "dark", this.apply(!0);
  }
  render() {
    const i = this.theme === "dark" ? "light" : "dark";
    return p`<button
      part="button"
      aria-label=${`Switch to ${i} theme`}
      title=${`Switch to ${i} theme`}
      @click=${this.toggle}
    >
      <svg class="sun" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
        <circle cx="8" cy="8" r="3.2" />
        <path d="M8 .8v2M8 13.2v2M.8 8h2M13.2 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M13.1 2.9l-1.4 1.4M4.3 11.7l-1.4 1.4" />
      </svg>
      <svg class="moon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
        <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" />
      </svg>
    </button>`;
  }
};
ht.styles = [
  M,
  g,
  v`
      :host {
        display: inline-block;
      }
      button {
        position: relative;
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--folio-radius-none);
        color: var(--folio-color-text-muted);
        cursor: pointer;
        transition: color var(--folio-transition-fast);
      }
      button:hover {
        color: var(--folio-color-text);
      }
      svg {
        grid-area: 1 / 1;
        width: 16px;
        height: 16px;
        transition:
          opacity var(--folio-transition),
          transform var(--folio-transition);
      }
      .sun {
        opacity: 0;
        transform: rotate(-90deg) scale(0.6);
      }
      .moon {
        opacity: 1;
        transform: rotate(0) scale(1);
      }
      :host([data-current='light']) .sun {
        opacity: 1;
        transform: rotate(0) scale(1);
      }
      :host([data-current='light']) .moon {
        opacity: 0;
        transform: rotate(90deg) scale(0.6);
      }
    `
];
Kt([
  F()
], ht.prototype, "theme", 2);
ht = Kt([
  m("folio-theme-toggle")
], ht);
var De = Object.defineProperty, je = Object.getOwnPropertyDescriptor, ft = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? je(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && De(t, o, e), e;
};
let H = class extends u {
  constructor() {
    super(...arguments), this.timezone = "Europe/Paris", this.label = "", this.now = /* @__PURE__ */ new Date();
  }
  connectedCallback() {
    super.connectedCallback(), this.timer = setInterval(() => this.now = /* @__PURE__ */ new Date(), 3e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), clearInterval(this.timer);
  }
  render() {
    const i = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.timezone
    }).format(this.now);
    return p`<time datetime=${this.now.toISOString()}>${i}</time>${this.label ? p`<span class="label">${this.label}</span>` : ""}`;
  }
};
H.styles = v`
    :host {
      display: inline-flex;
      align-items: baseline;
      gap: var(--folio-space-2);
      font-family: var(--folio-font-family-mono);
      font-size: var(--folio-text-caption);
      color: var(--folio-color-text-muted);
      font-variant-numeric: tabular-nums;
    }
    .label {
      font-size: var(--folio-text-label);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--folio-color-text-dim);
    }
  `;
ft([
  l()
], H.prototype, "timezone", 2);
ft([
  l()
], H.prototype, "label", 2);
ft([
  F()
], H.prototype, "now", 2);
H = ft([
  m("folio-local-time")
], H);
var Me = Object.defineProperty, Te = Object.getOwnPropertyDescriptor, ut = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Te(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Me(t, o, e), e;
};
let Ue = 0, k = class extends u {
  constructor() {
    super(...arguments), this.text = "", this.position = "top", this.visible = !1, this.id_ = `folio-tooltip-${++Ue}`, this.show = () => this.visible = !0, this.hide = () => this.visible = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("mouseenter", this.show), this.addEventListener("mouseleave", this.hide), this.addEventListener("focusin", this.show), this.addEventListener("focusout", this.hide), this.addEventListener("keydown", (i) => {
      i.key === "Escape" && this.hide();
    });
  }
  render() {
    return p`<slot aria-describedby=${this.id_}></slot>
      <span id=${this.id_} role="tooltip" class="bubble ${this.visible ? "visible" : ""}"
        >${this.text}</span
      >`;
  }
};
k.styles = [
  g,
  v`
      :host {
        position: relative;
        display: inline-block;
      }
      .bubble {
        position: absolute;
        left: 50%;
        z-index: var(--folio-z-tooltip);
        transform: translateX(-50%) translateY(2px);
        padding: 6px 10px;
        font-family: var(--folio-font-family-sans);
        font-size: 0.72rem;
        font-weight: 500;
        white-space: nowrap;
        color: var(--folio-color-bg);
        background: var(--folio-color-text);
        border-radius: var(--folio-radius-none);
        opacity: 0;
        pointer-events: none;
        transition:
          opacity var(--folio-transition-fast),
          transform var(--folio-transition-fast);
      }
      .bubble::before {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
      }
      :host([position='top']) .bubble {
        bottom: calc(100% + 8px);
      }
      :host([position='top']) .bubble::before {
        top: 100%;
        border-top-color: var(--folio-color-text);
      }
      :host([position='bottom']) .bubble {
        top: calc(100% + 8px);
      }
      :host([position='bottom']) .bubble::before {
        bottom: 100%;
        border-bottom-color: var(--folio-color-text);
      }
      .bubble.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    `
];
ut([
  l()
], k.prototype, "text", 2);
ut([
  l({ reflect: !0 })
], k.prototype, "position", 2);
ut([
  F()
], k.prototype, "visible", 2);
k = ut([
  m("folio-tooltip")
], k);
var Re = Object.defineProperty, He = Object.getOwnPropertyDescriptor, vt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? He(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Re(t, o, e), e;
};
let N = class extends u {
  constructor() {
    super(...arguments), this.value = "", this.label = "", this.variant = "plain";
  }
  render() {
    return p`<div class="stat">
      <span class="value"><slot name="value">${this.value}</slot></span>
      <span class="label mono-label"><slot name="label">${this.label}</slot></span>
    </div>`;
  }
};
N.styles = [
  I,
  v`
      :host {
        display: block;
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: var(--folio-space-1);
      }
      :host([variant='bar']) .stat {
        border-left: 2px solid var(--folio-color-accent);
        padding-left: var(--folio-space-4);
      }
      .value {
        font-family: var(--folio-font-family-mono);
        font-size: 1.6rem;
        font-weight: 500;
        color: var(--folio-color-text);
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .label {
        color: var(--folio-color-text-muted);
        letter-spacing: 0.08em;
      }
    `
];
vt([
  l()
], N.prototype, "value", 2);
vt([
  l()
], N.prototype, "label", 2);
vt([
  l({ reflect: !0 })
], N.prototype, "variant", 2);
N = vt([
  m("folio-stat")
], N);
var ke = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, Xt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ne(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && ke(t, o, e), e;
};
let pt = class extends u {
  constructor() {
    super(...arguments), this.exclusive = !1, this.onToggle = (i) => {
      if (!this.exclusive) return;
      const t = i.detail, o = i.target;
      if (t.open)
        for (const r of this.querySelectorAll("folio-accordion-item"))
          r !== o && (r.open = !1);
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("folio-toggle", this.onToggle);
  }
  render() {
    return p`<slot></slot>`;
  }
};
pt.styles = v`
    :host {
      display: block;
    }
  `;
Xt([
  l({ type: Boolean })
], pt.prototype, "exclusive", 2);
pt = Xt([
  m("folio-accordion")
], pt);
var Le = Object.defineProperty, Be = Object.getOwnPropertyDescriptor, mt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Be(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Le(t, o, e), e;
};
let Fe = 0, L = class extends u {
  constructor() {
    super(...arguments), this.heading = "", this.meta = "", this.open = !1, this.id_ = `folio-acc-${++Fe}`;
  }
  toggle() {
    this.open = !this.open, this.dispatchEvent(
      new CustomEvent("folio-toggle", {
        detail: { open: this.open },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    return p`
      <button
        part="header"
        class="header"
        aria-expanded=${this.open ? "true" : "false"}
        aria-controls="${this.id_}-panel"
        @click=${this.toggle}
      >
        <span class="heading"><slot name="heading">${this.heading}</slot></span>
        ${this.meta ? p`<span class="meta">${this.meta}</span>` : ""}
        <span class="toggle" aria-hidden="true">+</span>
      </button>
      <div id="${this.id_}-panel" part="panel" class="panel" role="region" aria-label=${this.heading}>
        <div class="panel-inner">
          <div class="panel-content"><slot></slot></div>
        </div>
      </div>
    `;
  }
};
L.styles = [
  M,
  g,
  v`
      :host {
        display: block;
        border-top: 1px solid var(--folio-color-border);
      }
      :host(:last-of-type) {
        border-bottom: 1px solid var(--folio-color-border);
      }
      .header {
        display: flex;
        align-items: baseline;
        gap: var(--folio-space-4);
        width: 100%;
        padding: var(--folio-space-4) 0;
        background: none;
        border: none;
        border-radius: var(--folio-radius-none);
        font-family: var(--folio-font-family-sans);
        text-align: left;
        color: var(--folio-color-text);
        cursor: pointer;
      }
      .heading {
        font-size: var(--folio-text-body);
        font-weight: 500;
        letter-spacing: -0.01em;
      }
      .meta {
        margin-left: auto;
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-label);
        color: var(--folio-color-text-muted);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .toggle {
        flex: none;
        font-family: var(--folio-font-family-mono);
        font-size: 0.9rem;
        color: var(--folio-color-accent);
        transition: transform var(--folio-transition);
        transform-origin: center;
        line-height: 1;
        align-self: center;
      }
      :host([open]) .toggle {
        transform: rotate(45deg);
      }
      .panel {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--folio-transition);
      }
      :host([open]) .panel {
        grid-template-rows: 1fr;
      }
      .panel-inner {
        overflow: hidden;
      }
      .panel-content {
        padding: 0 0 var(--folio-space-5);
        font-size: var(--folio-text-body);
        line-height: 1.65;
        color: var(--folio-color-text-muted);
        max-width: 60ch;
      }
    `
];
mt([
  l()
], L.prototype, "heading", 2);
mt([
  l()
], L.prototype, "meta", 2);
mt([
  l({ type: Boolean, reflect: !0 })
], L.prototype, "open", 2);
L = mt([
  m("folio-accordion-item")
], L);
var Ie = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, V = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? qe(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ie(t, o, e), e;
};
let A = class extends u {
  constructor() {
    super(...arguments), this.index = "", this.name = "", this.company = "", this.kind = "", this.href = "#";
  }
  render() {
    return p`<a part="row" href=${this.href}>
      ${this.index ? p`<span class="index">${this.index}</span>` : h}
      <span class="name"><slot name="name">${this.name}</slot></span>
      ${this.company ? p`<span class="company">${this.company}</span>` : h}
      ${this.kind ? p`<span class="kind">${this.kind}</span>` : h}
      <span class="arrow" aria-hidden="true">→</span>
    </a>`;
  }
};
A.styles = [
  M,
  g,
  v`
      :host {
        display: block;
        border-top: 1px solid var(--folio-color-border);
      }
      :host(:last-of-type) {
        border-bottom: 1px solid var(--folio-color-border);
      }
      a {
        display: flex;
        align-items: baseline;
        gap: var(--folio-space-5);
        padding: var(--folio-space-4) var(--folio-space-2);
        text-decoration: none;
        font-family: var(--folio-font-family-sans);
        transition: background var(--folio-transition-fast);
      }
      .index {
        flex: none;
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-label);
        color: var(--folio-color-text-dim);
        font-variant-numeric: tabular-nums;
        transition: color var(--folio-transition-fast);
      }
      .name {
        font-size: 1.05rem;
        font-weight: 500;
        letter-spacing: -0.01em;
        color: var(--folio-color-text);
        transition: color var(--folio-transition-fast);
      }
      .company {
        font-size: var(--folio-text-caption);
        color: var(--folio-project-row-company, var(--folio-color-text-muted));
      }
      .kind {
        margin-left: auto;
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-label);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--folio-color-text-dim);
        white-space: nowrap;
      }
      .arrow {
        flex: none;
        color: var(--folio-color-text-dim);
        transition:
          color var(--folio-transition-fast),
          transform var(--folio-transition-fast);
      }
      a:hover .index,
      a:hover .name,
      a:hover .arrow {
        color: var(--folio-color-accent);
      }
      a:hover .arrow {
        transform: translateX(4px);
      }
      @media (max-width: 768px) {
        .kind {
          display: none;
        }
      }
    `
];
V([
  l()
], A.prototype, "index", 2);
V([
  l()
], A.prototype, "name", 2);
V([
  l()
], A.prototype, "company", 2);
V([
  l()
], A.prototype, "kind", 2);
V([
  l()
], A.prototype, "href", 2);
A = V([
  m("folio-project-row")
], A);
var Ve = Object.defineProperty, We = Object.getOwnPropertyDescriptor, ot = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? We(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ve(t, o, e), e;
};
let z = class extends u {
  constructor() {
    super(...arguments), this.label = "", this.value = "", this.href = "#";
  }
  render() {
    const i = this.target === "_blank";
    return p`<a
      part="row"
      href=${this.href}
      target=${this.target ?? ""}
      rel=${i ? "noopener noreferrer" : ""}
    >
      <span class="label mono-label">${this.label}</span>
      <span class="value">${this.value}</span>
    </a>`;
  }
};
z.styles = [
  M,
  g,
  I,
  v`
      :host {
        display: block;
        border-top: 1px solid var(--folio-color-border);
      }
      :host(:last-of-type) {
        border-bottom: 1px solid var(--folio-color-border);
      }
      a {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--folio-space-5);
        padding: var(--folio-space-4) 0;
        text-decoration: none;
        transition: padding-left var(--folio-transition);
      }
      a:hover {
        padding-left: var(--folio-space-3);
      }
      .label {
        color: var(--folio-color-text-dim);
        transition: color var(--folio-transition-fast);
      }
      .value {
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-small);
        color: var(--folio-color-text-muted);
        transition: color var(--folio-transition-fast);
      }
      a:hover .label {
        color: var(--folio-color-text-muted);
      }
      a:hover .value {
        color: var(--folio-color-text);
      }
    `
];
ot([
  l()
], z.prototype, "label", 2);
ot([
  l()
], z.prototype, "value", 2);
ot([
  l()
], z.prototype, "href", 2);
ot([
  l()
], z.prototype, "target", 2);
z = ot([
  m("folio-contact-row")
], z);
var Ze = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, rt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ke(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ze(t, o, e), e;
};
let D = class extends u {
  constructor() {
    super(...arguments), this.src = "", this.alt = "", this.caption = "", this.zoomable = !1;
  }
  zoom() {
    !this.zoomable || !this.src || this.dispatchEvent(
      new CustomEvent("folio-zoom", {
        detail: { src: this.src, alt: this.alt },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    return p`<figure>
      <div class="frame" @click=${this.zoom}>
        ${this.src ? p`<img part="image" src=${this.src} alt=${this.alt} loading="lazy" />` : p`<div class="placeholder mono-label" role="img" aria-label=${this.alt || "Missing image"}>
              image à venir
            </div>`}
      </div>
      ${this.caption ? p`<figcaption part="caption">${this.caption}</figcaption>` : h}
    </figure>`;
  }
};
D.styles = [
  g,
  I,
  v`
      :host {
        display: block;
      }
      figure {
        margin: 0;
      }
      .frame {
        overflow: hidden;
        border: 1px solid var(--folio-color-border);
        border-radius: var(--folio-radius-none);
        background: var(--folio-color-bg-elevated);
      }
      img {
        display: block;
        width: 100%;
        height: auto;
        transition: transform var(--folio-transition);
      }
      :host([zoomable]) img {
        cursor: zoom-in;
      }
      :host([zoomable]) .frame:hover img {
        transform: scale(1.02);
      }
      .placeholder {
        display: grid;
        place-items: center;
        aspect-ratio: 16 / 9;
        color: var(--folio-color-text-dim);
        letter-spacing: 0.14em;
      }
      figcaption {
        padding-top: var(--folio-space-2);
        font-size: var(--folio-text-caption);
        color: var(--folio-color-text-muted);
        line-height: 1.5;
      }
    `
];
rt([
  l()
], D.prototype, "src", 2);
rt([
  l()
], D.prototype, "alt", 2);
rt([
  l()
], D.prototype, "caption", 2);
rt([
  l({ type: Boolean, reflect: !0 })
], D.prototype, "zoomable", 2);
D = rt([
  m("folio-figure")
], D);
var Xe = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, bt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ye(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Xe(t, o, e), e;
};
let B = class extends u {
  constructor() {
    super(...arguments), this.message = "", this.duration = 4e3, this.open = !1;
  }
  /** Shows the toast (optionally overriding the message), restarts the timer. */
  show(i) {
    i !== void 0 && (this.message = i), this.open = !0, clearTimeout(this.timer), this.duration > 0 && (this.timer = setTimeout(() => this.hide(), this.duration));
  }
  /** Hides the toast and fires `folio-dismiss`. */
  hide() {
    this.open && (this.open = !1, clearTimeout(this.timer), this.dispatchEvent(new CustomEvent("folio-dismiss", { bubbles: !0, composed: !0 })));
  }
  render() {
    return p`<div class="toast" role="status" aria-live="polite">
      <slot>${this.message}</slot>
    </div>`;
  }
};
B.styles = [
  g,
  v`
      :host {
        position: fixed;
        bottom: var(--folio-space-6);
        left: 50%;
        transform: translateX(-50%);
        z-index: var(--folio-z-toast);
        pointer-events: none;
      }
      .toast {
        padding: var(--folio-space-3) var(--folio-space-5);
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-caption);
        font-weight: 500;
        color: var(--folio-color-bg);
        background: var(--folio-color-text);
        border-radius: var(--folio-radius-none);
        opacity: 0;
        transform: translateY(8px);
        transition:
          opacity var(--folio-transition),
          transform var(--folio-transition);
      }
      :host([open]) .toast {
        opacity: 1;
        transform: translateY(0);
      }
    `
];
bt([
  l()
], B.prototype, "message", 2);
bt([
  l({ type: Number })
], B.prototype, "duration", 2);
bt([
  l({ type: Boolean, reflect: !0 })
], B.prototype, "open", 2);
B = bt([
  m("folio-toast")
], B);
var Je = Object.defineProperty, Ge = Object.getOwnPropertyDescriptor, it = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ge(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Je(t, o, e), e;
};
let j = class extends u {
  constructor() {
    super(...arguments), this.manual = !1, this.src = "", this.alt = "", this.open = !1, this.previousFocus = null, this.onZoom = (i) => {
      const { src: t, alt: o } = i.detail;
      this.show(t, o);
    }, this.onKeydown = (i) => {
      i.key === "Escape" && this.open && this.hide();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.manual || document.addEventListener("folio-zoom", this.onZoom), document.addEventListener("keydown", this.onKeydown);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("folio-zoom", this.onZoom), document.removeEventListener("keydown", this.onKeydown);
  }
  /** Opens the lightbox on the given image. */
  show(i, t = "") {
    this.src = i, this.alt = t, this.open = !0, this.previousFocus = document.activeElement, document.body.style.overflow = "hidden", this.updateComplete.then(
      () => {
        var o, r;
        return (r = (o = this.shadowRoot) == null ? void 0 : o.querySelector(".close")) == null ? void 0 : r.focus();
      }
    );
  }
  /** Closes the lightbox and fires `folio-close`. */
  hide() {
    var i;
    this.open = !1, document.body.style.overflow = "", (i = this.previousFocus) == null || i.focus(), this.dispatchEvent(new CustomEvent("folio-close", { bubbles: !0, composed: !0 }));
  }
  render() {
    return p`<div
      class="overlay ${this.open ? "open" : ""}"
      role="dialog"
      aria-modal="true"
      aria-label=${this.alt || "Image agrandie"}
      aria-hidden=${this.open ? "false" : "true"}
      @click=${this.hide}
    >
      ${this.src ? p`<img part="image" src=${this.src} alt=${this.alt} />` : ""}
      <button class="close" aria-label="Fermer" @click=${this.hide}>✕</button>
    </div>`;
  }
};
j.styles = [
  g,
  v`
      .overlay {
        position: fixed;
        inset: 0;
        z-index: var(--folio-z-overlay);
        display: grid;
        place-items: center;
        padding: var(--folio-space-6);
        background: color-mix(in srgb, var(--folio-color-bg) 88%, transparent);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
          opacity var(--folio-transition),
          visibility var(--folio-transition);
        cursor: zoom-out;
      }
      .overlay.open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        backdrop-filter: blur(6px);
      }
      img {
        max-width: min(1200px, 100%);
        max-height: 100%;
        border: 1px solid var(--folio-color-border);
        transform: scale(0.98);
        transition: transform var(--folio-transition);
      }
      .overlay.open img {
        transform: scale(1);
      }
      .close {
        position: absolute;
        top: var(--folio-space-5);
        right: var(--folio-space-5);
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        background: none;
        border: 1px solid var(--folio-color-border);
        border-radius: var(--folio-radius-none);
        color: var(--folio-color-text-muted);
        font-family: var(--folio-font-family-mono);
        font-size: 1rem;
        cursor: pointer;
        transition:
          color var(--folio-transition-fast),
          border-color var(--folio-transition-fast);
      }
      .close:hover {
        color: var(--folio-color-text);
        border-color: var(--folio-color-border-hover);
      }
    `
];
it([
  l({ type: Boolean })
], j.prototype, "manual", 2);
it([
  F()
], j.prototype, "src", 2);
it([
  F()
], j.prototype, "alt", 2);
it([
  F()
], j.prototype, "open", 2);
j = it([
  m("folio-lightbox")
], j);
export {
  pt as FolioAccordion,
  L as FolioAccordionItem,
  ct as FolioBadge,
  w as FolioButton,
  G as FolioChip,
  z as FolioContactRow,
  D as FolioFigure,
  j as FolioLightbox,
  S as FolioLink,
  H as FolioLocalTime,
  A as FolioProjectRow,
  Q as FolioSectionTitle,
  N as FolioStat,
  xt as FolioTag,
  ht as FolioThemeToggle,
  B as FolioToast,
  k as FolioTooltip
};

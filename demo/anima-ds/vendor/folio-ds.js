/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const st = globalThis, wt = st.ShadowRoot && (st.ShadyCSS === void 0 || st.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, At = Symbol(), Ct = /* @__PURE__ */ new WeakMap();
let Bt = class {
  constructor(t, o, r) {
    if (this._$cssResult$ = !0, r !== At) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = o;
  }
  get styleSheet() {
    let t = this.o;
    const o = this.t;
    if (wt && t === void 0) {
      const r = o !== void 0 && o.length === 1;
      r && (t = Ct.get(o)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && Ct.set(o, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Xt = (i) => new Bt(typeof i == "string" ? i : i + "", void 0, At), u = (i, ...t) => {
  const o = i.length === 1 ? i[0] : t.reduce((r, e, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(e) + i[s + 1], i[0]);
  return new Bt(o, i, At);
}, Jt = (i, t) => {
  if (wt) i.adoptedStyleSheets = t.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
  else for (const o of t) {
    const r = document.createElement("style"), e = st.litNonce;
    e !== void 0 && r.setAttribute("nonce", e), r.textContent = o.cssText, i.appendChild(r);
  }
}, St = wt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let o = "";
  for (const r of t.cssRules) o += r.cssText;
  return Xt(o);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Gt, defineProperty: Qt, getOwnPropertyDescriptor: te, getOwnPropertyNames: ee, getOwnPropertySymbols: oe, getPrototypeOf: re } = Object, w = globalThis, zt = w.trustedTypes, ie = zt ? zt.emptyScript : "", gt = w.reactiveElementPolyfillSupport, K = (i, t) => i, at = { toAttribute(i, t) {
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
} }, Pt = (i, t) => !Gt(i, t), jt = { attribute: !0, type: String, converter: at, reflect: !1, useDefault: !1, hasChanged: Pt };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), w.litPropertyMetadata ?? (w.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let M = class extends HTMLElement {
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
    if (this.hasOwnProperty(K("elementProperties"))) return;
    const t = re(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(K("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(K("properties"))) {
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
      for (const e of r) o.unshift(St(e));
    } else t !== void 0 && o.push(St(t));
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
      const a = (((s = r.converter) == null ? void 0 : s.toAttribute) !== void 0 ? r.converter : at).toAttribute(o, r.type);
      this._$Em = t, a == null ? this.removeAttribute(e) : this.setAttribute(e, a), this._$Em = null;
    }
  }
  _$AK(t, o) {
    var s, a;
    const r = this.constructor, e = r._$Eh.get(t);
    if (e !== void 0 && this._$Em !== e) {
      const c = r.getPropertyOptions(e), n = typeof c.converter == "function" ? { fromAttribute: c.converter } : ((s = c.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? c.converter : at;
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
M.elementStyles = [], M.shadowRootOptions = { mode: "open" }, M[K("elementProperties")] = /* @__PURE__ */ new Map(), M[K("finalized")] = /* @__PURE__ */ new Map(), gt == null || gt({ ReactiveElement: M }), (w.reactiveElementVersions ?? (w.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis, kt = (i) => i, nt = Y.trustedTypes, Dt = nt ? nt.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Ft = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, It = "?" + x, se = `<${It}>`, C = document, Z = () => C.createComment(""), X = (i) => i === null || typeof i != "object" && typeof i != "function", Et = Array.isArray, ae = (i) => Et(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", yt = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Tt = /-->/g, Mt = />/g, P = RegExp(`>|${yt}(?:([^\\s"'>=/]+)(${yt}*=${yt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ut = /'/g, Rt = /"/g, qt = /^(?:script|style|textarea|title)$/i, ne = (i) => (t, ...o) => ({ _$litType$: i, strings: t, values: o }), p = ne(1), U = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Ht = /* @__PURE__ */ new WeakMap(), E = C.createTreeWalker(C, 129);
function Vt(i, t) {
  if (!Et(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Dt !== void 0 ? Dt.createHTML(t) : t;
}
const le = (i, t) => {
  const o = i.length - 1, r = [];
  let e, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = W;
  for (let c = 0; c < o; c++) {
    const n = i[c];
    let f, b, d = -1, y = 0;
    for (; y < n.length && (a.lastIndex = y, b = a.exec(n), b !== null); ) y = a.lastIndex, a === W ? b[1] === "!--" ? a = Tt : b[1] !== void 0 ? a = Mt : b[2] !== void 0 ? (qt.test(b[2]) && (e = RegExp("</" + b[2], "g")), a = P) : b[3] !== void 0 && (a = P) : a === P ? b[0] === ">" ? (a = e ?? W, d = -1) : b[1] === void 0 ? d = -2 : (d = a.lastIndex - b[2].length, f = b[1], a = b[3] === void 0 ? P : b[3] === '"' ? Rt : Ut) : a === Rt || a === Ut ? a = P : a === Tt || a === Mt ? a = W : (a = P, e = void 0);
    const _ = a === P && i[c + 1].startsWith("/>") ? " " : "";
    s += a === W ? n + se : d >= 0 ? (r.push(f), n.slice(0, d) + Ft + n.slice(d) + x + _) : n + x + (d === -2 ? c : _);
  }
  return [Vt(i, s + (i[o] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
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
        if (e.hasAttributes()) for (const d of e.getAttributeNames()) if (d.endsWith(Ft)) {
          const y = b[a++], _ = e.getAttribute(d).split(x), it = /([.?@])?(.*)/.exec(y);
          n.push({ type: 1, index: s, name: it[2], strings: _, ctor: it[1] === "." ? he : it[1] === "?" ? pe : it[1] === "@" ? de : dt }), e.removeAttribute(d);
        } else d.startsWith(x) && (n.push({ type: 6, index: s }), e.removeAttribute(d));
        if (qt.test(e.tagName)) {
          const d = e.textContent.split(x), y = d.length - 1;
          if (y > 0) {
            e.textContent = nt ? nt.emptyScript : "";
            for (let _ = 0; _ < y; _++) e.append(d[_], Z()), E.nextNode(), n.push({ type: 2, index: ++s });
            e.append(d[y], Z());
          }
        }
      } else if (e.nodeType === 8) if (e.data === It) n.push({ type: 2, index: s });
      else {
        let d = -1;
        for (; (d = e.data.indexOf(x, d + 1)) !== -1; ) n.push({ type: 7, index: s }), d += x.length - 1;
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
  const s = X(t) ? void 0 : t._$litDirective$;
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
        n.type === 2 ? f = new Q(s, s.nextSibling, this, t) : n.type === 1 ? f = new n.ctor(s, n.name, n.strings, this, t) : n.type === 6 && (f = new fe(s, this, t)), this._$AV.push(f), n = r[++c];
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
class Q {
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
    t = R(this, t, o), X(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== U && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ae(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && X(this._$AH) ? this._$AA.nextSibling.data = t : this.T(C.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var s;
    const { values: o, _$litType$: r } = t, e = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = J.createElement(Vt(r.h, r.h[0]), this.options)), r);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === e) this._$AH.p(o);
    else {
      const a = new ce(e, this), c = a.u(this.options);
      a.p(o), this.T(c), this._$AH = a;
    }
  }
  _$AC(t) {
    let o = Ht.get(t.strings);
    return o === void 0 && Ht.set(t.strings, o = new J(t)), o;
  }
  k(t) {
    Et(this._$AH) || (this._$AH = [], this._$AR());
    const o = this._$AH;
    let r, e = 0;
    for (const s of t) e === o.length ? o.push(r = new Q(this.O(Z()), this.O(Z()), this, this.options)) : r = o[e], r._$AI(s), e++;
    e < o.length && (this._$AR(r && r._$AB.nextSibling, e), o.length = e);
  }
  _$AR(t = this._$AA.nextSibling, o) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, o); t !== this._$AB; ) {
      const e = kt(t).nextSibling;
      kt(t).remove(), t = e;
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
    if (s === void 0) t = R(this, t, o, 0), a = !X(t) || t !== this._$AH && t !== U, a && (this._$AH = t);
    else {
      const c = t;
      let n, f;
      for (t = s[0], n = 0; n < s.length - 1; n++) f = R(this, c[r + n], o, n), f === U && (f = this._$AH[n]), a || (a = !X(f) || f !== this._$AH[n]), f === h ? t = h : t !== h && (t += (f ?? "") + s[n + 1]), this._$AH[n] = f;
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
const $t = Y.litHtmlPolyfillSupport;
$t == null || $t(J, Q), (Y.litHtmlVersions ?? (Y.litHtmlVersions = [])).push("3.3.3");
const ve = (i, t, o) => {
  const r = (o == null ? void 0 : o.renderBefore) ?? t;
  let e = r._$litPart$;
  if (e === void 0) {
    const s = (o == null ? void 0 : o.renderBefore) ?? null;
    r._$litPart$ = e = new Q(t.insertBefore(Z(), s), s, void 0, o ?? {});
  }
  return e._$AI(i), e;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
class v extends M {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ve(o, this.renderRoot, this.renderOptions);
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
var Lt;
v._$litElement$ = !0, v.finalized = !0, (Lt = O.litElementHydrateSupport) == null || Lt.call(O, { LitElement: v });
const _t = O.litElementPolyfillSupport;
_t == null || _t({ LitElement: v });
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
const ue = { attribute: !0, type: String, converter: at, reflect: !1, hasChanged: Pt }, me = (i = ue, t, o) => {
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
function I(i) {
  return l({ ...i, state: !0, attribute: !1 });
}
const D = u`
  :focus-visible {
    outline: 2px solid var(--folio-color-accent);
    outline-offset: 3px;
    border-radius: var(--folio-radius-none);
  }
  :focus:not(:focus-visible) {
    outline: none;
  }
`, g = u`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`, q = u`
  .mono-label {
    font-family: var(--folio-font-family-mono);
    font-size: var(--folio-text-small);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;
var be = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, T = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? ge(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && be(t, o, e), e;
};
let $ = class extends v {
  constructor() {
    super(...arguments), this.variant = "card", this.pixel = !1, this.disabled = !1, this.type = "button";
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
$.styles = [
  D,
  g,
  u`
      :host {
        display: inline-block;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--folio-space-8);
        box-sizing: border-box;
        height: var(--folio-control-lg);
        padding-inline: var(--folio-space-16);
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-body);
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
      /* Primary: the one filled treatment. The blue is fixed across themes
         on purpose — see --folio-color-cta. */
      :host([variant='primary']) .btn {
        height: var(--folio-control-xl);
        padding-inline: var(--folio-space-24);
        /* The card variant tightens tracking; the CTA does not. */
        letter-spacing: normal;
        color: var(--folio-color-cta-ink);
        background: var(--folio-color-cta);
        border-color: var(--folio-color-cta);
      }
      :host([variant='primary']) .btn:hover {
        background: var(--folio-color-cta-hot);
        border-color: var(--folio-color-cta-hot);
        transform: translateY(-2px);
      }
      /* Notched corners. Cut with clip-path so the shape survives any
         background; the border is drawn by the fill, not by the border box. */
      :host([variant='primary'][pixel]) .btn {
        --n: var(--folio-pixel-notch);
        --i: var(--folio-pixel-notch-inner);
        clip-path: polygon(
          var(--n) 0, calc(100% - var(--n)) 0,
          calc(100% - var(--n)) var(--i), calc(100% - var(--i)) var(--i),
          calc(100% - var(--i)) var(--n), 100% var(--n),
          100% calc(100% - var(--n)), calc(100% - var(--i)) calc(100% - var(--n)),
          calc(100% - var(--i)) calc(100% - var(--i)), calc(100% - var(--n)) calc(100% - var(--i)),
          calc(100% - var(--n)) 100%, var(--n) 100%,
          var(--n) calc(100% - var(--i)), var(--i) calc(100% - var(--i)),
          var(--i) calc(100% - var(--n)), 0 calc(100% - var(--n)),
          0 var(--n), var(--i) var(--n),
          var(--i) var(--i), var(--n) var(--i)
        );
      }
      :host([variant='primary'][pixel]) .btn:focus-visible {
        outline-color: currentColor;
        outline-offset: -6px;
      }

      :host([variant='ghost']) .btn {
        background: transparent;
        border-color: transparent;
        color: var(--folio-color-text-muted);
        padding-inline: var(--folio-space-8);
      }
      :host([variant='ghost']) .btn:hover {
        color: var(--folio-color-text);
        background: transparent;
        transform: none;
      }
      /* A disabled primary must stop reading as the page's one live action,
         so it drops the fill entirely rather than just dimming its label. */
      :host([variant='primary'][disabled]) .btn {
        background: var(--folio-color-bg-card);
        border-color: var(--folio-color-border);
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
      ::slotted(svg) {
        flex-shrink: 0;
      }
    `
];
T([
  l({ reflect: !0 })
], $.prototype, "variant", 2);
T([
  l({ type: Boolean, reflect: !0 })
], $.prototype, "pixel", 2);
T([
  l()
], $.prototype, "href", 2);
T([
  l()
], $.prototype, "target", 2);
T([
  l({ type: Boolean, reflect: !0 })
], $.prototype, "disabled", 2);
T([
  l()
], $.prototype, "type", 2);
$ = T([
  m("folio-button")
], $);
var ye = Object.getOwnPropertyDescriptor, $e = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? ye(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = a(e) || e);
  return e;
};
let xt = class extends v {
  render() {
    return p`<span class="tag mono-label"><slot></slot></span>`;
  }
};
xt.styles = [
  q,
  u`
      :host {
        display: inline-block;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        height: var(--folio-control-sm);
        padding-inline: var(--folio-space-16);
        border: 1px solid var(--folio-color-border);
        border-radius: var(--folio-radius-none);
        color: var(--folio-color-text-muted);
        letter-spacing: 0.08em;
      }
    `
];
xt = $e([
  m("folio-tag")
], xt);
var _e = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, Ot = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? xe(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && _e(t, o, e), e;
};
let G = class extends v {
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
  D,
  g,
  u`
      :host {
        display: inline-block;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--folio-space-8);
        box-sizing: border-box;
        height: var(--folio-control-md);
        padding-inline: var(--folio-space-16);
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-small);
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
var we = Object.defineProperty, Ae = Object.getOwnPropertyDescriptor, Wt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ae(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && we(t, o, e), e;
};
let lt = class extends v {
  constructor() {
    super(...arguments), this.tone = "accent";
  }
  render() {
    return p`<span class="badge mono-label"><slot></slot></span>`;
  }
};
lt.styles = [
  q,
  u`
      :host {
        display: inline-block;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        /* border-box so the bordered key tone keeps the same height as the
           filled tones instead of growing by its border. */
        box-sizing: border-box;
        height: var(--folio-control-sm);
        padding-inline: var(--folio-space-8);
        border-radius: var(--folio-radius-none);
        font-size: var(--folio-text-small);
        font-weight: 700;
        letter-spacing: 0.08em;
        line-height: 1;
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
      /* Key projects. Tinted rather than filled so it reads as a marker,
         not a status, and keeps its weight against a page of blue. */
      :host([tone='key']) .badge {
        color: var(--folio-color-key-ink);
        background: color-mix(in srgb, var(--folio-color-key) 13%, transparent);
        border: 1px solid color-mix(in srgb, var(--folio-color-key) 55%, transparent);
        letter-spacing: 0.04em;
      }
    `
];
Wt([
  l({ reflect: !0 })
], lt.prototype, "tone", 2);
lt = Wt([
  m("folio-badge")
], lt);
var Pe = Object.defineProperty, Ee = Object.getOwnPropertyDescriptor, tt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ee(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Pe(t, o, e), e;
};
let S = class extends v {
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
  D,
  g,
  u`
      :host {
        display: inline-block;
      }
      a {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--folio-space-8);
        font-family: var(--folio-font-family-sans);
        text-decoration: none;
        transition: color var(--folio-transition-fast);
      }

      /* nav */
      :host([variant='nav']) a {
        font-size: var(--folio-text-body);
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
        --n: var(--folio-pixel-notch);
        --i: var(--folio-pixel-notch-inner);
        font-size: var(--folio-text-small);
        font-weight: 500;
        color: var(--folio-color-accent-strong);
        /* Padding gives the hover shape room; the negative margin keeps the
           label aligned with the column. */
        padding: var(--folio-space-8) var(--folio-space-16);
        margin-left: calc(-1 * var(--folio-space-16));
        clip-path: polygon(
          var(--n) 0, calc(100% - var(--n)) 0,
          calc(100% - var(--n)) var(--i), calc(100% - var(--i)) var(--i),
          calc(100% - var(--i)) var(--n), 100% var(--n),
          100% calc(100% - var(--n)), calc(100% - var(--i)) calc(100% - var(--n)),
          calc(100% - var(--i)) calc(100% - var(--i)), calc(100% - var(--n)) calc(100% - var(--i)),
          calc(100% - var(--n)) 100%, var(--n) 100%,
          var(--n) calc(100% - var(--i)), var(--i) calc(100% - var(--i)),
          var(--i) calc(100% - var(--n)), 0 calc(100% - var(--n)),
          0 var(--n), var(--i) var(--n),
          var(--i) var(--i), var(--n) var(--i)
        );
        transition: color var(--folio-transition-fast), background var(--folio-transition-fast);
      }
      :host([variant='back']) a:hover {
        color: var(--folio-color-cta-ink);
        background: var(--folio-color-cta);
      }
      :host([variant='back']) a:focus-visible {
        outline-color: currentColor;
        outline-offset: -6px;
      }
      :host([variant='back']) .arrow {
        transition: transform var(--folio-transition-fast);
      }
      :host([variant='back']) a:hover .arrow {
        transform: translateX(-3px);
      }
    `
];
tt([
  l()
], S.prototype, "href", 2);
tt([
  l({ reflect: !0 })
], S.prototype, "variant", 2);
tt([
  l({ type: Boolean, reflect: !0 })
], S.prototype, "active", 2);
tt([
  l()
], S.prototype, "target", 2);
S = tt([
  m("folio-link")
], S);
var Oe = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, Kt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ce(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Oe(t, o, e), e;
};
let ct = class extends v {
  constructor() {
    super(...arguments), this.level = 2;
  }
  render() {
    const i = Math.min(6, Math.max(1, this.level));
    return p`<p class="title mono-label" role="heading" aria-level=${i}>
      <slot></slot>
    </p>`;
  }
};
ct.styles = [
  q,
  u`
      :host {
        display: block;
      }
      .title {
        margin: 0;
        color: var(--folio-color-text-muted);
        letter-spacing: 0.14em;
      }
    `
];
Kt([
  l({ type: Number })
], ct.prototype, "level", 2);
ct = Kt([
  m("folio-section-title")
], ct);
var Se = Object.defineProperty, ze = Object.getOwnPropertyDescriptor, Yt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? ze(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Se(t, o, e), e;
};
const Nt = "folio-theme";
let ht = class extends v {
  constructor() {
    super(...arguments), this.theme = "dark";
  }
  connectedCallback() {
    super.connectedCallback();
    const i = localStorage.getItem(Nt), t = document.documentElement.getAttribute("data-theme");
    this.theme = i === "light" || t === "light" ? "light" : "dark", this.apply(!1);
  }
  apply(i) {
    document.documentElement.setAttribute("data-theme", this.theme), this.setAttribute("data-current", this.theme), i && (localStorage.setItem(Nt, this.theme), this.dispatchEvent(
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
  D,
  g,
  u`
      :host {
        display: inline-block;
      }
      button {
        position: relative;
        display: grid;
        place-items: center;
        width: var(--folio-control-md);
        height: var(--folio-control-md);
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
Yt([
  I()
], ht.prototype, "theme", 2);
ht = Yt([
  m("folio-theme-toggle")
], ht);
var je = Object.defineProperty, ke = Object.getOwnPropertyDescriptor, ft = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? ke(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && je(t, o, e), e;
};
let H = class extends v {
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
H.styles = u`
    :host {
      display: inline-flex;
      align-items: baseline;
      gap: var(--folio-space-8);
      font-family: var(--folio-font-family-mono);
      font-size: var(--folio-text-small);
      color: var(--folio-color-text-muted);
      font-variant-numeric: tabular-nums;
    }
    .label {
      font-size: var(--folio-text-small);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--folio-color-text-muted);
    }
  `;
ft([
  l()
], H.prototype, "timezone", 2);
ft([
  l()
], H.prototype, "label", 2);
ft([
  I()
], H.prototype, "now", 2);
H = ft([
  m("folio-local-time")
], H);
var De = Object.defineProperty, Te = Object.getOwnPropertyDescriptor, vt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Te(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && De(t, o, e), e;
};
let Me = 0, N = class extends v {
  constructor() {
    super(...arguments), this.text = "", this.position = "top", this.visible = !1, this.id_ = `folio-tooltip-${++Me}`, this.show = () => this.visible = !0, this.hide = () => this.visible = !1;
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
N.styles = [
  g,
  u`
      :host {
        position: relative;
        display: inline-block;
      }
      .bubble {
        position: absolute;
        left: 50%;
        z-index: var(--folio-z-tooltip);
        transform: translateX(-50%) translateY(2px);
        padding: var(--folio-space-8) var(--folio-space-16);
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-small);
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
vt([
  l()
], N.prototype, "text", 2);
vt([
  l({ reflect: !0 })
], N.prototype, "position", 2);
vt([
  I()
], N.prototype, "visible", 2);
N = vt([
  m("folio-tooltip")
], N);
var Ue = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, ut = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Re(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ue(t, o, e), e;
};
let L = class extends v {
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
L.styles = [
  q,
  u`
      :host {
        display: block;
      }
      /* 32px value + 16px label = 48px, so a stat occupies exactly six
         grid rows with no gap of its own. */
      .stat {
        display: flex;
        flex-direction: column;
      }
      :host([variant='bar']) .stat {
        border-left: 2px solid var(--folio-color-accent);
        padding-left: var(--folio-space-16);
      }
      .value {
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-heading);
        font-weight: 500;
        color: var(--folio-color-text);
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.02em;
        line-height: var(--folio-leading-heading);
      }
      .label {
        color: var(--folio-color-text-muted);
        letter-spacing: 0.08em;
        line-height: var(--folio-leading-small);
      }
    `
];
ut([
  l()
], L.prototype, "value", 2);
ut([
  l()
], L.prototype, "label", 2);
ut([
  l({ reflect: !0 })
], L.prototype, "variant", 2);
L = ut([
  m("folio-stat")
], L);
var He = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, Zt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ne(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && He(t, o, e), e;
};
let pt = class extends v {
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
pt.styles = u`
    :host {
      display: block;
    }
  `;
Zt([
  l({ type: Boolean })
], pt.prototype, "exclusive", 2);
pt = Zt([
  m("folio-accordion")
], pt);
var Le = Object.defineProperty, Be = Object.getOwnPropertyDescriptor, mt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Be(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Le(t, o, e), e;
};
let Fe = 0, B = class extends v {
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
B.styles = [
  D,
  g,
  u`
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
        gap: var(--folio-space-16);
        width: 100%;
        padding: var(--folio-space-16) 0;
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
        font-size: var(--folio-text-small);
        color: var(--folio-color-text-muted);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .toggle {
        flex: none;
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-body);
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
        padding: 0 0 var(--folio-space-24);
        font-size: var(--folio-text-body);
        line-height: 1.65;
        color: var(--folio-color-text-muted);
        max-width: 60ch;
      }
    `
];
mt([
  l()
], B.prototype, "heading", 2);
mt([
  l()
], B.prototype, "meta", 2);
mt([
  l({ type: Boolean, reflect: !0 })
], B.prototype, "open", 2);
B = mt([
  m("folio-accordion-item")
], B);
var Ie = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, V = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? qe(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ie(t, o, e), e;
};
let A = class extends v {
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
  D,
  g,
  u`
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
        gap: var(--folio-space-24);
        padding: var(--folio-space-16) var(--folio-space-8);
        text-decoration: none;
        font-family: var(--folio-font-family-sans);
        transition: background var(--folio-transition-fast);
      }
      .index {
        flex: none;
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-small);
        color: var(--folio-color-text-muted);
        font-variant-numeric: tabular-nums;
        transition: color var(--folio-transition-fast);
      }
      .name {
        font-size: var(--folio-text-subtitle);
        font-weight: 500;
        letter-spacing: -0.01em;
        color: var(--folio-color-text);
        transition: color var(--folio-transition-fast);
      }
      .company {
        font-size: var(--folio-text-small);
        color: var(--folio-project-row-company, var(--folio-color-text-muted));
      }
      .kind {
        margin-left: auto;
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-small);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--folio-color-text-muted);
        white-space: nowrap;
      }
      .arrow {
        flex: none;
        color: var(--folio-color-text-muted);
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
var Ve = Object.defineProperty, We = Object.getOwnPropertyDescriptor, et = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? We(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ve(t, o, e), e;
};
let z = class extends v {
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
  D,
  g,
  q,
  u`
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
        gap: var(--folio-space-24);
        padding: var(--folio-space-16) 0;
        text-decoration: none;
        transition: padding-left var(--folio-transition);
      }
      a:hover {
        padding-left: var(--folio-space-16);
      }
      .label {
        color: var(--folio-color-text-muted);
        transition: color var(--folio-transition-fast);
      }
      .value {
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-body);
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
et([
  l()
], z.prototype, "label", 2);
et([
  l()
], z.prototype, "value", 2);
et([
  l()
], z.prototype, "href", 2);
et([
  l()
], z.prototype, "target", 2);
z = et([
  m("folio-contact-row")
], z);
var Ke = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, ot = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ye(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ke(t, o, e), e;
};
let j = class extends v {
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
j.styles = [
  g,
  q,
  u`
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
        color: var(--folio-color-text-muted);
        letter-spacing: 0.14em;
      }
      figcaption {
        padding-top: var(--folio-space-8);
        font-size: var(--folio-text-small);
        color: var(--folio-color-text-muted);
        line-height: 1.5;
      }
    `
];
ot([
  l()
], j.prototype, "src", 2);
ot([
  l()
], j.prototype, "alt", 2);
ot([
  l()
], j.prototype, "caption", 2);
ot([
  l({ type: Boolean, reflect: !0 })
], j.prototype, "zoomable", 2);
j = ot([
  m("folio-figure")
], j);
var Ze = Object.defineProperty, Xe = Object.getOwnPropertyDescriptor, bt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Xe(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Ze(t, o, e), e;
};
let F = class extends v {
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
F.styles = [
  g,
  u`
      :host {
        position: fixed;
        bottom: var(--folio-space-32);
        left: 50%;
        transform: translateX(-50%);
        z-index: var(--folio-z-toast);
        pointer-events: none;
      }
      .toast {
        padding: var(--folio-space-16) var(--folio-space-24);
        font-family: var(--folio-font-family-sans);
        font-size: var(--folio-text-small);
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
], F.prototype, "message", 2);
bt([
  l({ type: Number })
], F.prototype, "duration", 2);
bt([
  l({ type: Boolean, reflect: !0 })
], F.prototype, "open", 2);
F = bt([
  m("folio-toast")
], F);
var Je = Object.defineProperty, Ge = Object.getOwnPropertyDescriptor, rt = (i, t, o, r) => {
  for (var e = r > 1 ? void 0 : r ? Ge(t, o) : t, s = i.length - 1, a; s >= 0; s--)
    (a = i[s]) && (e = (r ? a(t, o, e) : a(e)) || e);
  return r && e && Je(t, o, e), e;
};
let k = class extends v {
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
k.styles = [
  g,
  u`
      .overlay {
        position: fixed;
        inset: 0;
        z-index: var(--folio-z-overlay);
        display: grid;
        place-items: center;
        padding: var(--folio-space-32);
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
        top: var(--folio-space-24);
        right: var(--folio-space-24);
        width: var(--folio-control-lg);
        height: var(--folio-control-lg);
        display: grid;
        place-items: center;
        background: none;
        border: 1px solid var(--folio-color-border);
        border-radius: var(--folio-radius-none);
        color: var(--folio-color-text-muted);
        font-family: var(--folio-font-family-mono);
        font-size: var(--folio-text-body);
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
rt([
  l({ type: Boolean })
], k.prototype, "manual", 2);
rt([
  I()
], k.prototype, "src", 2);
rt([
  I()
], k.prototype, "alt", 2);
rt([
  I()
], k.prototype, "open", 2);
k = rt([
  m("folio-lightbox")
], k);
export {
  pt as FolioAccordion,
  B as FolioAccordionItem,
  lt as FolioBadge,
  $ as FolioButton,
  G as FolioChip,
  z as FolioContactRow,
  j as FolioFigure,
  k as FolioLightbox,
  S as FolioLink,
  H as FolioLocalTime,
  A as FolioProjectRow,
  ct as FolioSectionTitle,
  L as FolioStat,
  xt as FolioTag,
  ht as FolioThemeToggle,
  F as FolioToast,
  N as FolioTooltip
};

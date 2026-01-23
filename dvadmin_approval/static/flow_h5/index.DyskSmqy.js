import { onUnmounted as yn, onDeactivated as ot, isRef as gu, watch as U, inject as Mt, getCurrentInstance as Xe, computed as E, ref as A, reactive as ke, onMounted as Ce, nextTick as ne, onActivated as st, unref as Se, provide as At, isVNode as Tl, onBeforeUnmount as yt, createVNode as i, defineComponent as z, watchEffect as ao, mergeProps as Q, Transition as wn, Teleport as Lt, withDirectives as De, vShow as Ie, Fragment as be, onBeforeUpdate as bu, Comment as li, createTextVNode as mt, createApp as E1, resolveDirective as P1, withKeys as I1, onUpdated as $1, Text as j1, toRefs as z1, renderSlot as so, createBlock as Wn, openBlock as at, withCtx as Fe, createElementVNode as ho, createElementBlock as Xt, createCommentVNode as Ir, toDisplayString as _n, renderList as Yn, createSlots as yu, withModifiers as Wi, toRaw as R1, h as N1, resolveComponent as M1, defineAsyncComponent as L1 } from "vue";
import Dn from "xe-utils";
function $r() {
}
const ae = Object.assign, bt = typeof window < "u", oo = (e) => e !== null && typeof e == "object", fe = (e) => e != null, vn = (e) => typeof e == "function", ri = (e) => oo(e) && vn(e.then) && vn(e.catch), Xn = (e) => Object.prototype.toString.call(e) === "[object Date]" && !Number.isNaN(e.getTime());
function wu(e) {
  return e = e.replace(/[^-|\d]/g, ""), /^((\+86)|(86))?(1)\d{10}$/.test(e) || /^0[0-9-]{10,13}$/.test(e);
}
const xu = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e);
function Yi(e, t) {
  const o = t.split(".");
  let n = e;
  return o.forEach((a) => {
    var l;
    n = oo(n) && (l = n[a]) != null ? l : "";
  }), n;
}
function he(e, t, o) {
  return t.reduce((n, a) => (o && e[a] === void 0 || (n[a] = e[a]), n), {});
}
const Rt = (e, t) => JSON.stringify(e) === JSON.stringify(t), il = (e) => Array.isArray(e) ? e : [e], Ae = null, G = [Number, String], W = { type: Boolean, default: !0 }, We = (e) => ({ type: e, required: !0 }), Ve = () => ({ type: Array, default: () => [] }), _e = (e) => ({ type: Number, default: e }), te = (e) => ({ type: G, default: e }), J = (e) => ({ type: String, default: e });
var wo = typeof window < "u";
function Ke(e) {
  return wo ? requestAnimationFrame(e) : -1;
}
function sl(e) {
  wo && cancelAnimationFrame(e);
}
function go(e) {
  Ke(() => Ke(e));
}
var Xi = (e, t) => ({ top: 0, left: 0, right: e, bottom: t, width: e, height: t }), we = (e) => {
  const t = Se(e);
  if (t === window) {
    const o = t.innerWidth, n = t.innerHeight;
    return Xi(o, n);
  }
  return t != null && t.getBoundingClientRect ? t.getBoundingClientRect() : Xi(0, 0);
};
function Ge(e) {
  const t = Mt(e, null);
  if (t) {
    const o = Xe(), { link: n, unlink: a, internalChildren: l } = t;
    return n(o), yn(() => a(o)), { parent: t, index: E(() => l.indexOf(o)) };
  }
  return { parent: null, index: A(-1) };
}
var Gi = (e, t) => {
  const o = e.indexOf(t);
  return o === -1 ? e.findIndex((n) => t.key !== void 0 && t.key !== null && n.type === t.type && n.key === t.key) : o;
};
function F1(e, t, o) {
  const n = function(l) {
    const r = [], s = (c) => {
      Array.isArray(c) && c.forEach((d) => {
        var u;
        Tl(d) && (r.push(d), (u = d.component) != null && u.subTree && (r.push(d.component.subTree), s(d.component.subTree.children)), d.children && s(d.children));
      });
    };
    return s(l), r;
  }(e.subTree.children);
  o.sort((l, r) => Gi(n, l.vnode) - Gi(n, r.vnode));
  const a = o.map((l) => l.proxy);
  t.sort((l, r) => a.indexOf(l) - a.indexOf(r));
}
function Qe(e) {
  const t = ke([]), o = ke([]), n = Xe();
  return { children: t, linkChildren: (a) => {
    At(e, Object.assign({ link: (l) => {
      l.proxy && (o.push(l), t.push(l.proxy), F1(n, t, o));
    }, unlink: (l) => {
      const r = o.indexOf(l);
      t.splice(r, 1), o.splice(r, 1);
    }, children: t, internalChildren: o }, a));
  } };
}
var va, ql, Zi = 1e3, Ki = 6e4, jr = 36e5, Ji = 24 * jr;
function _1(e) {
  let t, o, n, a;
  const l = A(e.time), r = E(() => {
    return { total: h = l.value, days: Math.floor(h / Ji), hours: Math.floor(h % Ji / jr), minutes: Math.floor(h % jr / Ki), seconds: Math.floor(h % Ki / Zi), milliseconds: Math.floor(h % Zi) };
    var h;
  }), s = () => {
    n = !1, sl(t);
  }, c = () => Math.max(o - Date.now(), 0), d = (h) => {
    var g, f;
    l.value = h, (g = e.onChange) == null || g.call(e, r.value), h === 0 && (s(), (f = e.onFinish) == null || f.call(e));
  }, u = () => {
    t = Ke(() => {
      n && (d(c()), l.value > 0 && u());
    });
  }, p = () => {
    t = Ke(() => {
      if (n) {
        const f = c();
        h = f, g = l.value, (Math.floor(h / 1e3) !== Math.floor(g / 1e3) || f === 0) && d(f), l.value > 0 && p();
      }
      var h, g;
    });
  }, v = () => {
    wo && (e.millisecond ? u() : p());
  };
  return yt(s), st(() => {
    a && (n = !0, a = !1, v());
  }), ot(() => {
    n && (s(), a = !0);
  }), { start: () => {
    n || (o = Date.now() + l.value, n = !0, v());
  }, pause: s, reset: (h = e.time) => {
    s(), l.value = h;
  }, current: r };
}
function xn(e) {
  let t;
  Ce(() => {
    e(), ne(() => {
      t = !0;
    });
  }), st(() => {
    t && e();
  });
}
function Ne(e, t, o = {}) {
  if (!wo) return;
  const { target: n = window, passive: a = !1, capture: l = !1 } = o;
  let r, s = !1;
  const c = (p) => {
    if (s) return;
    const v = Se(p);
    v && !r && (v.addEventListener(e, t, { capture: l, passive: a }), r = !0);
  }, d = (p) => {
    if (s) return;
    const v = Se(p);
    v && r && (v.removeEventListener(e, t, l), r = !1);
  };
  let u;
  return yn(() => d(n)), ot(() => d(n)), xn(() => c(n)), gu(n) && (u = U(n, (p, v) => {
    d(v), c(p);
  })), () => {
    u == null || u(), d(n), s = !0;
  };
}
function Ol(e, t, o = {}) {
  if (!wo) return;
  const { eventName: n = "click" } = o;
  Ne(n, (a) => {
    (Array.isArray(e) ? e : [e]).every((l) => {
      const r = Se(l);
      return r && !r.contains(a.target);
    }) && t(a);
  }, { target: document });
}
var fa, H1 = /scroll|auto|overlay/i, Su = wo ? window : void 0;
function U1(e) {
  return e.tagName !== "HTML" && e.tagName !== "BODY" && e.nodeType === 1;
}
function ii(e, t = Su) {
  let o = e;
  for (; o && o !== t && U1(o); ) {
    const { overflowY: n } = window.getComputedStyle(o);
    if (H1.test(n)) return o;
    o = o.parentNode;
  }
  return t;
}
function Sn(e, t = Su) {
  const o = A();
  return Ce(() => {
    e.value && (o.value = ii(e.value, t));
  }), o;
}
var ku = Symbol("van-field");
function xo(e) {
  const t = Mt(ku, null);
  t && !t.customValue.value && (t.customValue.value = e, U(e, () => {
    t.resetValidation(), t.validateWithTrigger("onChange");
  }));
}
function no(e) {
  const t = "scrollTop" in e ? e.scrollTop : e.pageYOffset;
  return Math.max(t, 0);
}
function cl(e, t) {
  "scrollTop" in e ? e.scrollTop = t : e.scrollTo(e.scrollX, t);
}
function Io() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
function ea(e) {
  cl(window, e), cl(document.body, e);
}
function Qi(e, t) {
  if (e === window) return 0;
  const o = t ? no(t) : Io();
  return we(e).top + o;
}
const q1 = !!bt && /ios|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
function Cu() {
  q1 && ea(Io());
}
const si = (e) => e.stopPropagation();
function Oe(e, t) {
  (typeof e.cancelable != "boolean" || e.cancelable) && e.preventDefault(), t && si(e);
}
function zo(e) {
  const t = Se(e);
  if (!t) return !1;
  const o = window.getComputedStyle(t), n = o.display === "none", a = t.offsetParent === null && o.position !== "fixed";
  return n || a;
}
const { width: Vt, height: ht } = function() {
  if (!va && (va = A(0), ql = A(0), wo)) {
    const e = () => {
      va.value = window.innerWidth, ql.value = window.innerHeight;
    };
    e(), window.addEventListener("resize", e, { passive: !0 }), window.addEventListener("orientationchange", e, { passive: !0 });
  }
  return { width: va, height: ql };
}();
function W1(e) {
  const t = window.getComputedStyle(e);
  return t.transform !== "none" || t.perspective !== "none" || ["transform", "perspective", "filter"].some((o) => (t.willChange || "").includes(o));
}
function ce(e) {
  if (fe(e)) return xu(e) ? `${e}px` : String(e);
}
function lo(e) {
  if (fe(e)) {
    if (Array.isArray(e)) return { width: ce(e[0]), height: ce(e[1]) };
    const t = ce(e);
    return { width: t, height: t };
  }
}
function ro(e) {
  const t = {};
  return e !== void 0 && (t.zIndex = +e), t;
}
let Wl;
function Y1(e) {
  return +(e = e.replace(/rem/g, "")) * function() {
    if (!Wl) {
      const t = document.documentElement, o = t.style.fontSize || window.getComputedStyle(t).fontSize;
      Wl = parseFloat(o);
    }
    return Wl;
  }();
}
function ci(e) {
  if (typeof e == "number") return e;
  if (bt) {
    if (e.includes("rem")) return Y1(e);
    if (e.includes("vw")) return function(t) {
      return +(t = t.replace(/vw/g, "")) * Vt.value / 100;
    }(e);
    if (e.includes("vh")) return function(t) {
      return +(t = t.replace(/vh/g, "")) * ht.value / 100;
    }(e);
  }
  return parseFloat(e);
}
const X1 = /-(\w)/g, Tu = (e) => e.replace(X1, (t, o) => o.toUpperCase());
function Tt(e, t = 2) {
  let o = e + "";
  for (; o.length < t; ) o = "0" + o;
  return o;
}
const qe = (e, t, o) => Math.min(Math.max(e, t), o);
function es(e, t, o) {
  const n = e.indexOf(t);
  return n === -1 ? e : t === "-" && n !== 0 ? e.slice(0, n) : e.slice(0, n + 1) + e.slice(n).replace(o, "");
}
function zr(e, t = !0, o = !0) {
  e = t ? es(e, ".", /\./g) : e.split(".")[0];
  const n = t ? /[^-0-9.]/g : /[^-0-9]/g;
  return (e = o ? es(e, "-", /-/g) : e.replace(/-/, "")).replace(n, "");
}
function Ou(e, t) {
  return Math.round((e + t) * 1e10) / 1e10;
}
const { hasOwnProperty: G1 } = Object.prototype;
function Bu(e, t) {
  return Object.keys(t).forEach((o) => {
    (function(n, a, l) {
      const r = a[l];
      fe(r) && (G1.call(n, l) && oo(r) ? n[l] = Bu(Object(n[l]), r) : n[l] = r);
    })(e, t, o);
  }), e;
}
const ts = A("zh-CN"), os = ke({ "zh-CN": { name: "姓名", tel: "电话", save: "保存", clear: "清空", cancel: "取消", confirm: "确认", delete: "删除", loading: "加载中...", noCoupon: "暂无优惠券", nameEmpty: "请填写姓名", addContact: "添加联系人", telInvalid: "请填写正确的电话", vanCalendar: { end: "结束", start: "开始", title: "日期选择", weekdays: ["日", "一", "二", "三", "四", "五", "六"], monthTitle: (e, t) => `${e}年${t}月`, rangePrompt: (e) => `最多选择 ${e} 天` }, vanCascader: { select: "请选择" }, vanPagination: { prev: "上一页", next: "下一页" }, vanPullRefresh: { pulling: "下拉即可刷新...", loosing: "释放即可刷新..." }, vanSubmitBar: { label: "合计:" }, vanCoupon: { unlimited: "无门槛", discount: (e) => `${e}折`, condition: (e) => `满${e}元可用` }, vanCouponCell: { title: "优惠券", count: (e) => `${e}张可用` }, vanCouponList: { exchange: "兑换", close: "不使用", enable: "可用", disabled: "不可用", placeholder: "输入优惠码" }, vanAddressEdit: { area: "地区", areaEmpty: "请选择地区", addressEmpty: "请填写详细地址", addressDetail: "详细地址", defaultAddress: "设为默认收货地址" }, vanAddressList: { add: "新增地址" } } }), Vu = { messages: () => os[ts.value], use(e, t) {
  ts.value = e, this.add({ [e]: t });
}, add(e = {}) {
  Bu(os, e);
} };
var Z1 = Vu;
function K1(e) {
  const t = Tu(e) + ".";
  return (o, ...n) => {
    const a = Z1.messages(), l = Yi(a, t + o) || Yi(a, o);
    return vn(l) ? l(...n) : l;
  };
}
function Rr(e, t) {
  return t ? typeof t == "string" ? ` ${e}--${t}` : Array.isArray(t) ? t.reduce((o, n) => o + Rr(e, n), "") : Object.keys(t).reduce((o, n) => o + (t[n] ? Rr(e, n) : ""), "") : "";
}
function J1(e) {
  return (t, o) => (t && typeof t != "string" && (o = t, t = ""), `${t = t ? `${e}__${t}` : e}${Rr(t, o)}`);
}
function Y(e) {
  const t = `van-${e}`;
  return [t, J1(t), K1(t)];
}
const io = "van-hairline", Du = `${io}--top`, Au = `${io}--left`, Q1 = `${io}--right`, ui = `${io}--bottom`, Gn = `${io}--surround`, Bl = `${io}--top-bottom`, ep = `${io}-unset--top-bottom`, Je = "van-haptics-feedback", Eu = Symbol("van-form");
function So(e, { args: t = [], done: o, canceled: n, error: a }) {
  if (e) {
    const l = e.apply(null, t);
    ri(l) ? l.then((r) => {
      r ? o() : n && n();
    }).catch(a || $r) : l ? o() : n && n();
  } else o();
}
function Z(e) {
  return e.install = (t) => {
    const { name: o } = e;
    o && (t.component(o, e), t.component(Tu(`-${o}`), e));
  }, e;
}
function ul(e, t) {
  return e.reduce((o, n) => Math.abs(o - t) < Math.abs(n - t) ? o : n);
}
const Pu = Symbol();
function Vl(e) {
  const t = Mt(Pu, null);
  t && U(t, (o) => {
    o && e();
  });
}
const Iu = (e, t) => {
  const o = A(), n = () => {
    o.value = we(e).height;
  };
  return Ce(() => {
    if (ne(n), t) for (let a = 1; a <= 3; a++) setTimeout(n, 100 * a);
  }), Vl(() => ne(n)), U([Vt, ht], n), o;
};
function Dl(e, t) {
  const o = Iu(e, !0);
  return (n) => i("div", { class: t("placeholder"), style: { height: o.value ? `${o.value}px` : void 0 } }, [n()]);
}
const [$u, ns] = Y("action-bar"), di = Symbol($u);
var tp = z({ name: $u, props: { placeholder: Boolean, safeAreaInsetBottom: W }, setup(e, { slots: t }) {
  const o = A(), n = Dl(o, ns), { linkChildren: a } = Qe(di);
  a();
  const l = () => {
    var r;
    return i("div", { ref: o, class: [ns(), { "van-safe-area-bottom": e.safeAreaInsetBottom }] }, [(r = t.default) == null ? void 0 : r.call(t)]);
  };
  return () => e.placeholder ? n(l) : l();
} });
const ju = Z(tp);
function pe(e) {
  const t = Xe();
  t && ae(t.proxy, e);
}
const ko = { to: [String, Object], url: String, replace: Boolean };
function zu({ to: e, url: t, replace: o, $router: n }) {
  e && n ? n[o ? "replace" : "push"](e) : t && (o ? location.replace(t) : location.href = t);
}
function Mo() {
  const e = Xe().proxy;
  return () => zu(e);
}
const [op, as] = Y("badge");
var np = z({ name: op, props: { dot: Boolean, max: G, tag: J("div"), color: String, offset: Array, content: G, showZero: W, position: J("top-right") }, setup(e, { slots: t }) {
  const o = () => {
    if (t.content) return !0;
    const { content: s, showZero: c } = e;
    return fe(s) && s !== "" && (c || s !== 0 && s !== "0");
  }, n = () => {
    const { dot: s, max: c, content: d } = e;
    if (!s && o()) return t.content ? t.content() : fe(c) && xu(d) && +d > +c ? `${c}+` : d;
  }, a = (s) => s.startsWith("-") ? s.replace("-", "") : `-${s}`, l = E(() => {
    const s = { background: e.color };
    if (e.offset) {
      const [c, d] = e.offset, { position: u } = e, [p, v] = u.split("-");
      t.default ? (s[p] = typeof d == "number" ? ce(p === "top" ? d : -d) : p === "top" ? ce(d) : a(d), s[v] = typeof c == "number" ? ce(v === "left" ? c : -c) : v === "left" ? ce(c) : a(c)) : (s.marginTop = ce(d), s.marginLeft = ce(c));
    }
    return s;
  }), r = () => {
    if (o() || e.dot) return i("div", { class: as([e.position, { dot: e.dot, fixed: !!t.default }]), style: l.value }, [n()]);
  };
  return () => {
    if (t.default) {
      const { tag: s } = e;
      return i(s, { class: as("wrapper") }, { default: () => [t.default(), r()] });
    }
    return r();
  };
} });
const Lo = Z(np);
let Ru = 2e3;
const [Nu, ap] = Y("config-provider"), Mu = Symbol(Nu);
function ma(e = {}, t = {}) {
  Object.keys(e).forEach((o) => {
    e[o] !== t[o] && document.documentElement.style.setProperty(o, e[o]);
  }), Object.keys(t).forEach((o) => {
    e[o] || document.documentElement.style.removeProperty(o);
  });
}
var lp = z({ name: Nu, props: { tag: J("div"), theme: J("light"), zIndex: Number, themeVars: Object, themeVarsDark: Object, themeVarsLight: Object, themeVarsScope: J("local"), iconPrefix: String }, setup(e, { slots: t }) {
  const o = E(() => function(n) {
    const a = {};
    return Object.keys(n).forEach((l) => {
      const r = l.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "").replace(/([a-zA-Z])(\d)/g, "$1-$2");
      a[`--van-${r}`] = n[l];
    }), a;
  }(ae({}, e.themeVars, e.theme === "dark" ? e.themeVarsDark : e.themeVarsLight)));
  if (bt) {
    const n = () => {
      document.documentElement.classList.add(`van-theme-${e.theme}`);
    }, a = (l = e.theme) => {
      document.documentElement.classList.remove(`van-theme-${l}`);
    };
    U(() => e.theme, (l, r) => {
      r && a(r), n();
    }, { immediate: !0 }), st(n), ot(a), yt(a), U(o, (l, r) => {
      e.themeVarsScope === "global" && ma(l, r);
    }), U(() => e.themeVarsScope, (l, r) => {
      r === "global" && ma({}, o.value), l === "global" && ma(o.value, {});
    }), e.themeVarsScope === "global" && ma(o.value, {});
  }
  return At(Mu, e), ao(() => {
    var n;
    e.zIndex !== void 0 && (n = e.zIndex, Ru = n);
  }), () => i(e.tag, { class: ap(), style: e.themeVarsScope === "local" ? o.value : void 0 }, { default: () => {
    var n;
    return [(n = t.default) == null ? void 0 : n.call(t)];
  } });
} });
const [rp, ls] = Y("icon");
var ip = z({ name: rp, props: { dot: Boolean, tag: J("i"), name: String, size: G, badge: G, color: String, badgeProps: Object, classPrefix: String }, setup(e, { slots: t }) {
  const o = Mt(Mu, null), n = E(() => e.classPrefix || (o == null ? void 0 : o.iconPrefix) || ls());
  return () => {
    const { tag: a, dot: l, name: r, size: s, badge: c, color: d } = e, u = ((p) => p == null ? void 0 : p.includes("/"))(r);
    return i(Lo, Q({ dot: l, tag: a, class: [n.value, u ? "" : `${n.value}-${r}`], style: { color: d, fontSize: ce(s) }, content: c }, e.badgeProps), { default: () => {
      var p;
      return [(p = t.default) == null ? void 0 : p.call(t), u && i("img", { class: ls("image"), src: r }, null)];
    } });
  };
} });
const ie = Z(ip);
var sp = ie;
const [cp, Zn] = Y("loading"), up = Array(12).fill(null).map((e, t) => i("i", { class: Zn("line", String(t + 1)) }, null)), dp = i("svg", { class: Zn("circular"), viewBox: "25 25 50 50" }, [i("circle", { cx: "50", cy: "50", r: "20", fill: "none" }, null)]);
var pp = z({ name: cp, props: { size: G, type: J("circular"), color: String, vertical: Boolean, textSize: G, textColor: String }, setup(e, { slots: t }) {
  const o = E(() => ae({ color: e.color }, lo(e.size))), n = () => {
    const l = e.type === "spinner" ? up : dp;
    return i("span", { class: Zn("spinner", e.type), style: o.value }, [t.icon ? t.icon() : l]);
  }, a = () => {
    var l;
    if (t.default) return i("span", { class: Zn("text"), style: { fontSize: ce(e.textSize), color: (l = e.textColor) != null ? l : e.color } }, [t.default()]);
  };
  return () => {
    const { type: l, vertical: r } = e;
    return i("div", { class: Zn([l, { vertical: r }]), "aria-live": "polite", "aria-busy": !0 }, [n(), a()]);
  };
} });
const Et = Z(pp), [vp, Wo] = Y("button");
var fp = z({ name: vp, props: ae({}, ko, { tag: J("button"), text: String, icon: String, type: J("default"), size: J("normal"), color: String, block: Boolean, plain: Boolean, round: Boolean, square: Boolean, loading: Boolean, hairline: Boolean, disabled: Boolean, iconPrefix: String, nativeType: J("button"), loadingSize: G, loadingText: String, loadingType: String, iconPosition: J("left") }), emits: ["click"], setup(e, { emit: t, slots: o }) {
  const n = Mo(), a = () => e.loading ? o.loading ? o.loading() : i(Et, { size: e.loadingSize, type: e.loadingType, class: Wo("loading") }, null) : o.icon ? i("div", { class: Wo("icon") }, [o.icon()]) : e.icon ? i(ie, { name: e.icon, class: Wo("icon"), classPrefix: e.iconPrefix }, null) : void 0, l = () => {
    let c;
    if (c = e.loading ? e.loadingText : o.default ? o.default() : e.text, c) return i("span", { class: Wo("text") }, [c]);
  }, r = () => {
    const { color: c, plain: d } = e;
    if (c) {
      const u = { color: d ? c : "white" };
      return d || (u.background = c), c.includes("gradient") ? u.border = 0 : u.borderColor = c, u;
    }
  }, s = (c) => {
    e.loading ? Oe(c) : e.disabled || (t("click", c), n());
  };
  return () => {
    const { tag: c, type: d, size: u, block: p, round: v, plain: h, square: g, loading: f, disabled: b, hairline: w, nativeType: y, iconPosition: k } = e, C = [Wo([d, u, { plain: h, block: p, round: v, square: g, loading: f, disabled: b, hairline: w }]), { [Gn]: w }];
    return i(c, { type: y, class: C, style: r(), disabled: b, onClick: s }, { default: () => [i("div", { class: Wo("content") }, [k === "left" && a(), l(), k === "right" && a()])] });
  };
} });
const Le = Z(fp), [mp, hp] = Y("action-bar-button");
var gp = z({ name: mp, props: ae({}, ko, { type: String, text: String, icon: String, color: String, loading: Boolean, disabled: Boolean }), setup(e, { slots: t }) {
  const o = Mo(), { parent: n, index: a } = Ge(di), l = E(() => {
    if (n) {
      const s = n.children[a.value - 1];
      return !(s && "isButton" in s);
    }
  }), r = E(() => {
    if (n) {
      const s = n.children[a.value + 1];
      return !(s && "isButton" in s);
    }
  });
  return pe({ isButton: !0 }), () => {
    const { type: s, icon: c, text: d, color: u, loading: p, disabled: v } = e;
    return i(Le, { class: hp([s, { last: r.value, first: l.value }]), size: "large", type: s, icon: c, color: u, loading: p, disabled: v, onClick: o }, { default: () => [t.default ? t.default() : d] });
  };
} });
const Nr = Z(gp), [bp, Yl] = Y("action-bar-icon");
var yp = z({ name: bp, props: ae({}, ko, { dot: Boolean, text: String, icon: String, color: String, badge: G, iconClass: Ae, badgeProps: Object, iconPrefix: String }), setup(e, { slots: t }) {
  const o = Mo();
  Ge(di);
  const n = () => {
    const { dot: a, badge: l, icon: r, color: s, iconClass: c, badgeProps: d, iconPrefix: u } = e;
    return t.icon ? i(Lo, Q({ dot: a, class: Yl("icon"), content: l }, d), { default: t.icon }) : i(ie, { tag: "div", dot: a, name: r, badge: l, color: s, class: [Yl("icon"), c], badgeProps: d, classPrefix: u }, null);
  };
  return () => i("div", { role: "button", class: Yl(), tabindex: 0, onClick: o }, [n(), t.default ? t.default() : e.text]);
} });
const wp = Z(yp), kn = { show: Boolean, zIndex: G, overlay: W, duration: G, teleport: [String, Object], lockScroll: W, lazyRender: W, beforeClose: Function, overlayStyle: Object, overlayClass: Ae, transitionAppear: Boolean, closeOnClickOverlay: W }, pi = Object.keys(kn);
function wt() {
  const e = A(0), t = A(0), o = A(0), n = A(0), a = A(0), l = A(0), r = A(""), s = A(!0), c = () => {
    o.value = 0, n.value = 0, a.value = 0, l.value = 0, r.value = "", s.value = !0;
  };
  return { move: (d) => {
    const u = d.touches[0];
    o.value = (u.clientX < 0 ? 0 : u.clientX) - e.value, n.value = u.clientY - t.value, a.value = Math.abs(o.value), l.value = Math.abs(n.value);
    var p, v;
    (!r.value || a.value < 10 && l.value < 10) && (r.value = (p = a.value, v = l.value, p > v ? "horizontal" : v > p ? "vertical" : "")), s.value && (a.value > 5 || l.value > 5) && (s.value = !1);
  }, start: (d) => {
    c(), e.value = d.touches[0].clientX, t.value = d.touches[0].clientY;
  }, reset: c, startX: e, startY: t, deltaX: o, deltaY: n, offsetX: a, offsetY: l, direction: r, isVertical: () => r.value === "vertical", isHorizontal: () => r.value === "horizontal", isTap: s };
}
let An = 0;
const rs = "van-overflow-hidden";
function Lu(e, t) {
  const o = wt(), n = (s) => {
    o.move(s);
    const c = o.deltaY.value > 0 ? "10" : "01", d = ii(s.target, e.value), { scrollHeight: u, offsetHeight: p, scrollTop: v } = d;
    let h = "11";
    v === 0 ? h = p >= u ? "00" : "01" : v + p >= u && (h = "10"), h === "11" || !o.isVertical() || parseInt(h, 2) & parseInt(c, 2) || Oe(s, !0);
  }, a = () => {
    document.addEventListener("touchstart", o.start), document.addEventListener("touchmove", n, { passive: !1 }), An || document.body.classList.add(rs), An++;
  }, l = () => {
    An && (document.removeEventListener("touchstart", o.start), document.removeEventListener("touchmove", n), An--, An || document.body.classList.remove(rs));
  }, r = () => t() && l();
  xn(() => t() && a()), ot(r), yt(r), U(t, (s) => {
    s ? a() : l();
  });
}
function vi(e) {
  const t = A(!1);
  return U(e, (o) => {
    o && (t.value = o);
  }, { immediate: !0 }), (o) => () => t.value ? o() : null;
}
const dl = () => {
  var e;
  const { scopeId: t } = ((e = Xe()) == null ? void 0 : e.vnode) || {};
  return t ? { [t]: "" } : null;
}, [xp, Sp] = Y("overlay");
var kp = z({ name: xp, props: { show: Boolean, zIndex: G, duration: G, className: Ae, lockScroll: W, lazyRender: W, customStyle: Object, teleport: [String, Object] }, setup(e, { slots: t }) {
  const o = A(), n = vi(() => e.show || !e.lazyRender)(() => {
    var a;
    const l = ae(ro(e.zIndex), e.customStyle);
    return fe(e.duration) && (l.animationDuration = `${e.duration}s`), De(i("div", { ref: o, style: l, class: [Sp(), e.className] }, [(a = t.default) == null ? void 0 : a.call(t)]), [[Ie, e.show]]);
  });
  return Ne("touchmove", (a) => {
    e.lockScroll && Oe(a, !0);
  }, { target: o }), () => {
    const a = i(wn, { name: "van-fade", appear: !0 }, { default: n });
    return e.teleport ? i(Lt, { to: e.teleport }, { default: () => [a] }) : a;
  };
} });
const Fu = Z(kp), Cp = ae({}, kn, { round: Boolean, position: J("center"), closeIcon: J("cross"), closeable: Boolean, transition: String, iconPrefix: String, closeOnPopstate: Boolean, closeIconPosition: J("top-right"), destroyOnClose: Boolean, safeAreaInsetTop: Boolean, safeAreaInsetBottom: Boolean }), [Tp, is] = Y("popup");
var Op = z({ name: Tp, inheritAttrs: !1, props: Cp, emits: ["open", "close", "opened", "closed", "keydown", "update:show", "clickOverlay", "clickCloseIcon"], setup(e, { emit: t, attrs: o, slots: n }) {
  let a, l;
  const r = A(), s = A(), c = vi(() => e.show || !e.lazyRender), d = E(() => {
    const O = { zIndex: r.value };
    return fe(e.duration) && (O[e.position === "center" ? "animationDuration" : "transitionDuration"] = `${e.duration}s`), O;
  }), u = () => {
    a || (a = !0, r.value = e.zIndex !== void 0 ? +e.zIndex : ++Ru, t("open"));
  }, p = () => {
    a && So(e.beforeClose, { done() {
      a = !1, t("close"), t("update:show", !1);
    } });
  }, v = (O) => {
    t("clickOverlay", O), e.closeOnClickOverlay && p();
  }, h = () => {
    if (e.overlay) return i(Fu, Q({ show: e.show, class: e.overlayClass, zIndex: r.value, duration: e.duration, customStyle: e.overlayStyle, role: e.closeOnClickOverlay ? "button" : void 0, tabindex: e.closeOnClickOverlay ? 0 : void 0 }, dl(), { onClick: v }), { default: n["overlay-content"] });
  }, g = (O) => {
    t("clickCloseIcon", O), p();
  }, f = () => {
    if (e.closeable) return i(ie, { role: "button", tabindex: 0, name: e.closeIcon, class: [is("close-icon", e.closeIconPosition), Je], classPrefix: e.iconPrefix, onClick: g }, null);
  };
  let b;
  const w = () => {
    b && clearTimeout(b), b = setTimeout(() => {
      t("opened");
    });
  }, y = () => t("closed"), k = (O) => t("keydown", O), C = c(() => {
    var O;
    const { destroyOnClose: B, round: m, position: x, safeAreaInsetTop: T, safeAreaInsetBottom: V, show: P } = e;
    if (P || !B) return De(i("div", Q({ ref: s, style: d.value, role: "dialog", tabindex: 0, class: [is({ round: m, [x]: x }), { "van-safe-area-top": T, "van-safe-area-bottom": V }], onKeydown: k }, o, dl()), [(O = n.default) == null ? void 0 : O.call(n), f()]), [[Ie, P]]);
  }), S = () => {
    const { position: O, transition: B, transitionAppear: m } = e;
    return i(wn, { name: B || (O === "center" ? "van-fade" : `van-popup-slide-${O}`), appear: m, onAfterEnter: w, onAfterLeave: y }, { default: C });
  };
  return U(() => e.show, (O) => {
    O && !a && (u(), o.tabindex === 0 && ne(() => {
      var B;
      (B = s.value) == null || B.focus();
    })), !O && a && (a = !1, t("close"));
  }), pe({ popupRef: s }), Lu(s, () => e.show && e.lockScroll), Ne("popstate", () => {
    e.closeOnPopstate && (p(), l = !1);
  }), Ce(() => {
    e.show && u();
  }), st(() => {
    l && (t("update:show", !0), l = !1);
  }), ot(() => {
    e.show && e.teleport && (p(), l = !0);
  }), At(Pu, () => e.show), () => e.teleport ? i(Lt, { to: e.teleport }, { default: () => [h(), S()] }) : i(be, null, [h(), S()]);
} });
const xt = Z(Op), [Bp, pt] = Y("action-sheet"), Vp = ae({}, kn, { title: String, round: W, actions: Ve(), closeIcon: J("cross"), closeable: W, cancelText: String, description: String, closeOnPopstate: W, closeOnClickAction: Boolean, safeAreaInsetBottom: W }), Dp = [...pi, "round", "closeOnPopstate", "safeAreaInsetBottom"];
var Ap = z({ name: Bp, props: Vp, emits: ["select", "cancel", "update:show"], setup(e, { slots: t, emit: o }) {
  const n = (p) => o("update:show", p), a = () => {
    n(!1), o("cancel");
  }, l = () => {
    if (e.title) return i("div", { class: pt("header") }, [e.title, e.closeable && i(ie, { name: e.closeIcon, class: [pt("close"), Je], onClick: a }, null)]);
  }, r = () => {
    if (t.cancel || e.cancelText) return [i("div", { class: pt("gap") }, null), i("button", { type: "button", class: pt("cancel"), onClick: a }, [t.cancel ? t.cancel() : e.cancelText])];
  }, s = (p) => {
    if (p.icon) return i(ie, { class: pt("item-icon"), name: p.icon }, null);
  }, c = (p, v) => p.loading ? i(Et, { class: pt("loading-icon") }, null) : t.action ? t.action({ action: p, index: v }) : [i("span", { class: pt("name") }, [p.name]), p.subname && i("div", { class: pt("subname") }, [p.subname])], d = (p, v) => {
    const { color: h, loading: g, callback: f, disabled: b, className: w } = p;
    return i("button", { type: "button", style: { color: h }, class: [pt("item", { loading: g, disabled: b }), w], onClick: () => {
      b || g || (f && f(p), e.closeOnClickAction && n(!1), ne(() => o("select", p, v)));
    } }, [s(p), c(p, v)]);
  }, u = () => {
    if (e.description || t.description) {
      const p = t.description ? t.description() : e.description;
      return i("div", { class: pt("description") }, [p]);
    }
  };
  return () => i(xt, Q({ class: pt(), position: "bottom", "onUpdate:show": n }, he(e, Dp)), { default: () => {
    var p;
    return [l(), u(), i("div", { class: pt("content") }, [e.actions.map(d), (p = t.default) == null ? void 0 : p.call(t)]), r()];
  } });
} });
const Ep = Z(Ap), [Pp, Gt, ss] = Y("picker"), cs = (e) => e.find((t) => !t.disabled) || e[0];
function Ja(e, t) {
  for (let o = t = qe(t, 0, e.length); o < e.length; o++) if (!e[o].disabled) return o;
  for (let o = t - 1; o >= 0; o--) if (!e[o].disabled) return o;
  return 0;
}
const us = (e, t, o) => t !== void 0 && !!e.find((n) => n[o.value] === t);
function Xl(e, t, o) {
  const n = e.findIndex((a) => a[o.value] === t);
  return e[Ja(e, n)];
}
const [_u, Gl] = Y("picker-column"), Hu = Symbol(_u);
var Ip = z({ name: _u, props: { value: G, fields: We(Object), options: Ve(), readonly: Boolean, allowHtml: Boolean, optionHeight: We(Number), swipeDuration: We(G), visibleOptionNum: We(G) }, emits: ["change", "clickOption", "scrollInto"], setup(e, { emit: t, slots: o }) {
  let n, a, l, r, s;
  const c = A(), d = A(), u = A(0), p = A(0), v = wt(), h = () => e.options.length, g = () => e.optionHeight * (+e.visibleOptionNum - 1) / 2, f = (B) => {
    let m = Ja(e.options, B);
    const x = -m * e.optionHeight, T = () => {
      m > h() - 1 && (m = Ja(e.options, B));
      const V = e.options[m][e.fields.value];
      V !== e.value && t("change", V);
    };
    n && x !== u.value ? s = T : T(), u.value = x;
  }, b = () => e.readonly || !e.options.length, w = (B) => qe(Math.round(-B / e.optionHeight), 0, h() - 1), y = E(() => w(u.value)), k = () => {
    n = !1, p.value = 0, s && (s(), s = null);
  }, C = (B) => {
    if (!b()) {
      if (v.start(B), n) {
        const m = function(x) {
          const { transform: T } = window.getComputedStyle(x), V = T.slice(7, T.length - 1).split(", ")[5];
          return Number(V);
        }(d.value);
        u.value = Math.min(0, m - g());
      }
      p.value = 0, a = u.value, l = Date.now(), r = a, s = null;
    }
  }, S = () => {
    if (b()) return;
    const B = u.value - r, m = Date.now() - l;
    if (m < 300 && Math.abs(B) > 15) return void ((T, V) => {
      const P = Math.abs(T / V);
      T = u.value + P / 3e-3 * (T < 0 ? -1 : 1);
      const N = w(T);
      p.value = +e.swipeDuration, f(N);
    })(B, m);
    const x = w(u.value);
    p.value = 200, f(x), setTimeout(() => {
      n = !1;
    }, 0);
  }, O = () => {
    const B = { height: `${e.optionHeight}px` };
    return e.options.map((m, x) => {
      const T = m[e.fields.text], { disabled: V } = m, P = m[e.fields.value], N = { role: "button", style: B, tabindex: V ? -1 : 0, class: [Gl("item", { disabled: V, selected: P === e.value }), m.className], onClick: () => ((F) => {
        n || b() || (s = null, p.value = 200, f(F), t("clickOption", e.options[F]));
      })(x) }, j = { class: "van-ellipsis", [e.allowHtml ? "innerHTML" : "textContent"]: T };
      return i("li", N, [o.option ? o.option(m, x) : i("div", j, null)]);
    });
  };
  return Ge(Hu), pe({ stopMomentum: k }), ao(() => {
    const B = n ? Math.floor(-u.value / e.optionHeight) : e.options.findIndex((T) => T[e.fields.value] === e.value), m = Ja(e.options, B), x = -m * e.optionHeight;
    n && m < B && k(), u.value = x;
  }), Ne("touchmove", (B) => {
    if (b()) return;
    v.move(B), v.isVertical() && (n = !0, Oe(B, !0));
    const m = qe(a + v.deltaY.value, -h() * e.optionHeight, e.optionHeight), x = w(m);
    x !== y.value && t("scrollInto", e.options[x]), u.value = m;
    const T = Date.now();
    T - l > 300 && (l = T, r = m);
  }, { target: c }), () => i("div", { ref: c, class: Gl(), onTouchstartPassive: C, onTouchend: S, onTouchcancel: S }, [i("ul", { ref: d, style: { transform: `translate3d(0, ${u.value + g()}px, 0)`, transitionDuration: `${p.value}ms`, transitionProperty: p.value ? "all" : "none" }, class: Gl("wrapper"), onTransitionend: k }, [O()])]);
} });
const [$p] = Y("picker-toolbar"), Al = { title: String, cancelButtonText: String, confirmButtonText: String }, Uu = ["cancel", "confirm", "title", "toolbar"], jp = Object.keys(Al);
var qu = z({ name: $p, props: Al, emits: ["confirm", "cancel"], setup(e, { emit: t, slots: o }) {
  const n = () => t("cancel"), a = () => t("confirm"), l = () => {
    var s;
    const c = (s = e.cancelButtonText) != null ? s : ss("cancel");
    if (o.cancel || c) return i("button", { type: "button", class: [Gt("cancel"), Je], onClick: n }, [o.cancel ? o.cancel() : c]);
  }, r = () => {
    var s;
    const c = (s = e.confirmButtonText) != null ? s : ss("confirm");
    if (o.confirm || c) return i("button", { type: "button", class: [Gt("confirm"), Je], onClick: a }, [o.confirm ? o.confirm() : c]);
  };
  return () => i("div", { class: Gt("toolbar") }, [o.toolbar ? o.toolbar() : [l(), o.title ? o.title() : e.title ? i("div", { class: [Gt("title"), "van-ellipsis"] }, [e.title]) : void 0, r()]]);
} });
const fi = (e, t) => {
  const o = A(e());
  return U(e, (n) => {
    n !== o.value && (o.value = n);
  }), U(o, (n) => {
    n !== e() && t(n);
  }), o;
}, Wu = Array.isArray, ta = (e) => typeof e == "string", Yu = (e) => e !== null && typeof e == "object", zp = /\B([A-Z])/g, Rp = /* @__PURE__ */ ((e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (o) => t[o] || (t[o] = e(o));
})((e) => e.replace(zp, "-$1").toLowerCase());
function Xu(e) {
  if (Wu(e)) {
    const t = {};
    for (let o = 0; o < e.length; o++) {
      const n = e[o], a = ta(n) ? Fp(n) : Xu(n);
      if (a) for (const l in a) t[l] = a[l];
    }
    return t;
  }
  if (ta(e) || Yu(e)) return e;
}
const Np = /;(?![^(]*\))/g, Mp = /:([^]+)/, Lp = /\/\*[^]*?\*\//g;
function Fp(e) {
  const t = {};
  return e.replace(Lp, "").split(Np).forEach((o) => {
    if (o) {
      const n = o.split(Mp);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function Gu(e) {
  let t = "";
  if (ta(e)) t = e;
  else if (Wu(e)) for (let o = 0; o < e.length; o++) {
    const n = Gu(e[o]);
    n && (t += n + " ");
  }
  else if (Yu(e)) for (const o in e) e[o] && (t += o + " ");
  return t.trim();
}
var _p = {};
let Hp = 0;
function Cn() {
  const e = Xe(), { name: t = "unknown" } = (e == null ? void 0 : e.type) || {};
  return _p.NODE_ENV === "test" ? t : `${t}-${++Hp}`;
}
function ia() {
  const e = A([]), t = [];
  return bu(() => {
    e.value = [];
  }), [e, (o) => (t[o] || (t[o] = (n) => {
    e.value[o] = n;
  }), t[o])];
}
function Zu(e, t) {
  if (!bt || !window.IntersectionObserver) return;
  const o = new IntersectionObserver((a) => {
    t(a[0].intersectionRatio > 0);
  }, { root: document.body }), n = () => {
    e.value && o.unobserve(e.value);
  };
  ot(n), yt(n), xn(() => {
    e.value && o.observe(e.value);
  });
}
const [Up, qp] = Y("sticky");
var Wp = z({ name: Up, props: { zIndex: G, position: J("top"), container: Object, offsetTop: te(0), offsetBottom: te(0) }, emits: ["scroll", "change"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = Sn(n), l = ke({ fixed: !1, width: 0, height: 0, transform: 0 }), r = A(!1), s = E(() => ci(e.position === "top" ? e.offsetTop : e.offsetBottom)), c = E(() => {
    if (r.value) return;
    const { fixed: p, height: v, width: h } = l;
    return p ? { width: `${h}px`, height: `${v}px` } : void 0;
  }), d = E(() => {
    if (!l.fixed || r.value) return;
    const p = ae(ro(e.zIndex), { width: `${l.width}px`, height: `${l.height}px`, [e.position]: `${s.value}px` });
    return l.transform && (p.transform = `translate3d(0, ${l.transform}px, 0)`), p;
  }), u = () => {
    if (!n.value || zo(n)) return;
    const { container: p, position: v } = e, h = we(n), g = no(window);
    if (l.width = h.width, l.height = h.height, v === "top") if (p) {
      const f = we(p), b = f.bottom - s.value - l.height;
      l.fixed = s.value > h.top && f.bottom > 0, l.transform = b < 0 ? b : 0;
    } else l.fixed = s.value > h.top;
    else {
      const { clientHeight: f } = document.documentElement;
      if (p) {
        const b = we(p), w = f - b.top - s.value - l.height;
        l.fixed = f - s.value < h.bottom && f > b.top, l.transform = w < 0 ? -w : 0;
      } else l.fixed = f - s.value < h.bottom;
    }
    ((f) => {
      t("scroll", { scrollTop: f, isFixed: l.fixed });
    })(g);
  };
  return U(() => l.fixed, (p) => t("change", p)), Ne("scroll", u, { target: a, passive: !0 }), Zu(n, u), U([Vt, ht], () => {
    n.value && !zo(n) && l.fixed && (r.value = !0, ne(() => {
      const p = we(n);
      l.width = p.width, l.height = p.height, r.value = !1;
    }));
  }), () => {
    var p;
    return i("div", { ref: n, style: c.value }, [i("div", { class: qp({ fixed: l.fixed && !r.value }), style: d.value }, [(p = o.default) == null ? void 0 : p.call(o)])]);
  };
} });
const Ku = Z(Wp), [Ju, ha] = Y("swipe"), Yp = { loop: W, width: G, height: G, vertical: Boolean, autoplay: te(0), duration: te(500), touchable: W, lazyRender: Boolean, initialSwipe: te(0), indicatorColor: String, showIndicators: W, stopPropagation: W }, Qu = Symbol(Ju);
var Xp = z({ name: Ju, props: Yp, emits: ["change", "dragStart", "dragEnd"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(), l = ke({ rect: null, width: 0, height: 0, offset: 0, active: 0, swiping: !1 });
  let r = !1;
  const s = wt(), { children: c, linkChildren: d } = Qe(Qu), u = E(() => c.length), p = E(() => l[e.vertical ? "height" : "width"]), v = E(() => e.vertical ? s.deltaY.value : s.deltaX.value), h = E(() => l.rect ? (e.vertical ? l.rect.height : l.rect.width) - p.value * u.value : 0), g = E(() => p.value ? Math.ceil(Math.abs(h.value) / p.value) : u.value), f = E(() => u.value * p.value), b = E(() => (l.active + u.value) % u.value), w = E(() => {
    const I = e.vertical ? "vertical" : "horizontal";
    return s.direction.value === I;
  }), y = E(() => {
    const I = { transitionDuration: `${l.swiping ? 0 : e.duration}ms`, transform: `translate${e.vertical ? "Y" : "X"}(${+l.offset.toFixed(2)}px)` };
    if (p.value) {
      const R = e.vertical ? "height" : "width", _ = e.vertical ? "width" : "height";
      I[R] = `${f.value}px`, I[_] = e[_] ? `${e[_]}px` : "";
    }
    return I;
  }), k = (I, R = 0) => {
    let _ = I * p.value;
    e.loop || (_ = Math.min(_, -h.value));
    let $ = R - _;
    return e.loop || ($ = qe($, h.value, 0)), $;
  }, C = ({ pace: I = 0, offset: R = 0, emitChange: _ }) => {
    if (u.value <= 1) return;
    const { active: $ } = l, L = ((D) => {
      const { active: M } = l;
      return D ? e.loop ? qe(M + D, -1, u.value) : qe(M + D, 0, g.value) : M;
    })(I), K = k(L, R);
    if (e.loop) {
      if (c[0] && K !== h.value) {
        const D = K < h.value;
        c[0].setOffset(D ? f.value : 0);
      }
      if (c[u.value - 1] && K !== 0) {
        const D = K > 0;
        c[u.value - 1].setOffset(D ? -f.value : 0);
      }
    }
    l.active = L, l.offset = K, _ && L !== $ && t("change", b.value);
  }, S = () => {
    l.swiping = !0, l.active <= -1 ? C({ pace: u.value }) : l.active >= u.value && C({ pace: -u.value });
  }, O = () => {
    S(), s.reset(), go(() => {
      l.swiping = !1, C({ pace: 1, emitChange: !0 });
    });
  };
  let B;
  const m = () => clearTimeout(B), x = () => {
    m(), +e.autoplay > 0 && u.value > 1 && (B = setTimeout(() => {
      O(), x();
    }, +e.autoplay));
  }, T = (I = +e.initialSwipe) => {
    if (!n.value) return;
    const R = () => {
      var _, $;
      if (!zo(n)) {
        const L = { width: n.value.offsetWidth, height: n.value.offsetHeight };
        l.rect = L, l.width = +((_ = e.width) != null ? _ : L.width), l.height = +(($ = e.height) != null ? $ : L.height);
      }
      u.value && (I = Math.min(u.value - 1, I)) === -1 && (I = u.value - 1), l.active = I, l.swiping = !0, l.offset = k(I), c.forEach((L) => {
        L.setOffset(0);
      }), x();
    };
    zo(n) ? ne().then(R) : R();
  }, V = () => T(l.active);
  let P;
  const N = (I) => {
    !e.touchable || I.touches.length > 1 || (s.start(I), r = !1, P = Date.now(), m(), S());
  }, j = () => {
    if (!e.touchable || !l.swiping) return;
    const I = Date.now() - P, R = v.value / I;
    if ((Math.abs(R) > 0.25 || Math.abs(v.value) > p.value / 2) && w.value) {
      const _ = e.vertical ? s.offsetY.value : s.offsetX.value;
      let $ = 0;
      $ = e.loop ? _ > 0 ? v.value > 0 ? -1 : 1 : 0 : -Math[v.value > 0 ? "ceil" : "floor"](v.value / p.value), C({ pace: $, emitChange: !0 });
    } else v.value && C({ pace: 0 });
    r = !1, l.swiping = !1, t("dragEnd", { index: b.value }), x();
  }, F = (I, R) => {
    const _ = R === b.value, $ = _ ? { backgroundColor: e.indicatorColor } : void 0;
    return i("i", { style: $, class: ha("indicator", { active: _ }) }, null);
  };
  return pe({ prev: () => {
    S(), s.reset(), go(() => {
      l.swiping = !1, C({ pace: -1, emitChange: !0 });
    });
  }, next: O, state: l, resize: V, swipeTo: (I, R = {}) => {
    S(), s.reset(), go(() => {
      let _;
      _ = e.loop && I === u.value ? l.active === 0 ? 0 : I : I % u.value, R.immediate ? go(() => {
        l.swiping = !1;
      }) : l.swiping = !1, C({ pace: _ - l.active, emitChange: !0 });
    });
  } }), d({ size: p, props: e, count: u, activeIndicator: b }), U(() => e.initialSwipe, (I) => T(+I)), U(u, () => T(l.active)), U(() => e.autoplay, x), U([Vt, ht, () => e.width, () => e.height], V), U(function() {
    if (!fa && (fa = A("visible"), wo)) {
      const I = () => {
        fa.value = document.hidden ? "hidden" : "visible";
      };
      I(), window.addEventListener("visibilitychange", I);
    }
    return fa;
  }(), (I) => {
    I === "visible" ? x() : m();
  }), Ce(T), st(() => T(l.active)), Vl(() => T(l.active)), ot(m), yt(m), Ne("touchmove", (I) => {
    e.touchable && l.swiping && (s.move(I), w.value) && (!e.loop && (l.active === 0 && v.value > 0 || l.active === u.value - 1 && v.value < 0) || (Oe(I, e.stopPropagation), C({ offset: v.value }), r || (t("dragStart", { index: b.value }), r = !0)));
  }, { target: a }), () => {
    var I;
    return i("div", { ref: n, class: ha() }, [i("div", { ref: a, style: y.value, class: ha("track", { vertical: e.vertical }), onTouchstartPassive: N, onTouchend: j, onTouchcancel: j }, [(I = o.default) == null ? void 0 : I.call(o)]), o.indicator ? o.indicator({ active: b.value, total: u.value }) : e.showIndicators && u.value > 1 ? i("div", { class: ha("indicators", { vertical: e.vertical }) }, [Array(u.value).fill("").map(F)]) : void 0]);
  };
} });
const mi = Z(Xp), [Gp, ds] = Y("tabs");
var Zp = z({ name: Gp, props: { count: We(Number), inited: Boolean, animated: Boolean, duration: We(G), swipeable: Boolean, lazyRender: Boolean, currentIndex: We(Number) }, emits: ["change"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = (s) => t("change", s), l = () => {
    var s;
    const c = (s = o.default) == null ? void 0 : s.call(o);
    return e.animated || e.swipeable ? i(mi, { ref: n, loop: !1, class: ds("track"), duration: 1e3 * +e.duration, touchable: e.swipeable, lazyRender: e.lazyRender, showIndicators: !1, onChange: a }, { default: () => [c] }) : c;
  }, r = (s) => {
    const c = n.value;
    c && c.state.active !== s && c.swipeTo(s, { immediate: !e.inited });
  };
  return U(() => e.currentIndex, r), Ce(() => {
    r(e.currentIndex);
  }), pe({ swipeRef: n }), () => i("div", { class: ds("content", { animated: e.animated || e.swipeable }) }, [l()]);
} });
const [ed, ga] = Y("tabs"), Kp = { type: J("line"), color: String, border: Boolean, sticky: Boolean, shrink: Boolean, active: te(0), duration: te(0.3), animated: Boolean, ellipsis: W, swipeable: Boolean, scrollspy: Boolean, offsetTop: te(0), background: String, lazyRender: W, showHeader: W, lineWidth: G, lineHeight: G, beforeChange: Function, swipeThreshold: te(5), titleActiveColor: String, titleInactiveColor: String }, td = Symbol(ed);
var Jp = z({ name: ed, props: Kp, emits: ["change", "scroll", "rendered", "clickTab", "update:active"], setup(e, { emit: t, slots: o }) {
  let n, a, l, r, s;
  const c = A(), d = A(), u = A(), p = A(), v = Cn(), h = Sn(c), [g, f] = ia(), { children: b, linkChildren: w } = Qe(td), y = ke({ inited: !1, position: "", lineStyle: {}, currentIndex: -1 }), k = E(() => b.length > +e.swipeThreshold || !e.ellipsis || e.shrink), C = E(() => ({ borderColor: e.color, background: e.background })), S = ($, L) => {
    var K;
    return (K = $.name) != null ? K : L;
  }, O = E(() => {
    const $ = b[y.currentIndex];
    if ($) return S($, y.currentIndex);
  }), B = E(() => ci(e.offsetTop)), m = E(() => e.sticky ? B.value + n : 0), x = ($) => {
    const L = d.value, K = g.value;
    if (!(k.value && L && K && K[y.currentIndex])) return;
    const D = K[y.currentIndex].$el, M = D.offsetLeft - (L.offsetWidth - D.offsetWidth) / 2;
    r && r(), r = function(q, X, ee) {
      let oe, se = 0;
      const le = q.scrollLeft, ve = ee === 0 ? 1 : Math.round(1e3 * ee / 16);
      let ye = le;
      return function Ye() {
        ye += (X - le) / ve, q.scrollLeft = ye, ++se < ve && (oe = Ke(Ye));
      }(), function() {
        sl(oe);
      };
    }(L, M, $ ? 0 : +e.duration);
  }, T = () => {
    const $ = y.inited;
    ne(() => {
      const L = g.value;
      if (!L || !L[y.currentIndex] || e.type !== "line" || zo(c.value)) return;
      const K = L[y.currentIndex].$el, { lineWidth: D, lineHeight: M } = e, q = K.offsetLeft + K.offsetWidth / 2, X = { width: ce(D), backgroundColor: e.color, transform: `translateX(${q}px) translateX(-50%)` };
      if ($ && (X.transitionDuration = `${e.duration}s`), fe(M)) {
        const ee = ce(M);
        X.height = ee, X.borderRadius = ee;
      }
      y.lineStyle = X;
    });
  }, V = ($, L) => {
    const K = ((X) => {
      const ee = X < y.currentIndex ? -1 : 1;
      for (; X >= 0 && X < b.length; ) {
        if (!b[X].disabled) return X;
        X += ee;
      }
    })($);
    if (!fe(K)) return;
    const D = b[K], M = S(D, K), q = y.currentIndex !== null;
    y.currentIndex !== K && (y.currentIndex = K, L || x(), T()), M !== e.active && (t("update:active", M), q && t("change", M, D.title)), l && !e.scrollspy && ea(Math.ceil(Qi(c.value) - B.value));
  }, P = ($, L) => {
    const K = b.find((M, q) => S(M, q) === $), D = K ? b.indexOf(K) : 0;
    V(D, L);
  }, N = ($ = !1) => {
    if (e.scrollspy) {
      const L = b[y.currentIndex].$el;
      if (L && h.value) {
        const K = Qi(L, h.value) - m.value;
        a = !0, s && s(), s = function(D, M, q, X) {
          let ee, oe = no(D);
          const se = oe < M, le = q === 0 ? 1 : Math.round(1e3 * q / 16), ve = (M - oe) / le;
          return function ye() {
            oe += ve, (se && oe > M || !se && oe < M) && (oe = M), cl(D, oe), se && oe < M || !se && oe > M ? ee = Ke(ye) : X && (ee = Ke(X));
          }(), function() {
            sl(ee);
          };
        }(h.value, K, $ ? 0 : +e.duration, () => {
          a = !1;
        });
      }
    }
  }, j = ($, L, K) => {
    const { title: D, disabled: M } = b[L], q = S(b[L], L);
    M || (So(e.beforeChange, { args: [q], done: () => {
      V(L), N();
    } }), zu($)), t("clickTab", { name: q, title: D, event: K, disabled: M });
  }, F = ($) => {
    l = $.isFixed, t("scroll", $);
  }, I = () => {
    if (e.type === "line" && b.length) return i("div", { class: ga("line"), style: y.lineStyle }, null);
  }, R = () => {
    var $, L, K;
    const { type: D, border: M, sticky: q } = e, X = [i("div", { ref: q ? void 0 : u, class: [ga("wrap"), { [Bl]: D === "line" && M }] }, [i("div", { ref: d, role: "tablist", class: ga("nav", [D, { shrink: e.shrink, complete: k.value }]), style: C.value, "aria-orientation": "horizontal" }, [($ = o["nav-left"]) == null ? void 0 : $.call(o), b.map((ee) => ee.renderTitle(j)), I(), (L = o["nav-right"]) == null ? void 0 : L.call(o)])]), (K = o["nav-bottom"]) == null ? void 0 : K.call(o)];
    return q ? i("div", { ref: u }, [X]) : X;
  }, _ = () => {
    T(), ne(() => {
      var $, L;
      x(!0), (L = ($ = p.value) == null ? void 0 : $.swipeRef.value) == null || L.resize();
    });
  };
  return U(() => [e.color, e.duration, e.lineWidth, e.lineHeight], T), U(Vt, _), U(() => e.active, ($) => {
    $ !== O.value && P($);
  }), U(() => b.length, () => {
    y.inited && (P(e.active), T(), ne(() => {
      x(!0);
    }));
  }), pe({ resize: _, scrollTo: ($) => {
    ne(() => {
      P($), N(!0);
    });
  } }), st(T), Vl(T), xn(() => {
    P(e.active, !0), ne(() => {
      y.inited = !0, u.value && (n = we(u.value).height), x(!0);
    });
  }), Zu(c, T), Ne("scroll", () => {
    if (e.scrollspy && !a) {
      const $ = (() => {
        for (let L = 0; L < b.length; L++) {
          const { top: K } = we(b[L].$el);
          if (K > m.value) return L === 0 ? 0 : L - 1;
        }
        return b.length - 1;
      })();
      V($);
    }
  }, { target: h, passive: !0 }), w({ id: v, props: e, setLine: T, scrollable: k, onRendered: ($, L) => t("rendered", $, L), currentName: O, setTitleRefs: f, scrollIntoView: x }), () => i("div", { ref: c, class: ga([e.type]) }, [e.showHeader ? e.sticky ? i(Ku, { container: c.value, offsetTop: B.value, onScroll: F }, { default: () => [R()] }) : R() : null, i(Zp, { ref: p, count: b.length, inited: y.inited, animated: e.animated, duration: e.duration, swipeable: e.swipeable, lazyRender: e.lazyRender, currentIndex: y.currentIndex, onChange: V }, { default: () => {
    var $;
    return [($ = o.default) == null ? void 0 : $.call(o)];
  } })]);
} });
const od = Symbol(), [Qp, ps] = Y("tab"), ev = z({ name: Qp, props: { id: String, dot: Boolean, type: String, color: String, title: String, badge: G, shrink: Boolean, isActive: Boolean, disabled: Boolean, controls: String, scrollable: Boolean, activeColor: String, inactiveColor: String, showZeroBadge: W }, setup(e, { slots: t }) {
  const o = E(() => {
    const a = {}, { type: l, color: r, disabled: s, isActive: c, activeColor: d, inactiveColor: u } = e;
    r && l === "card" && (a.borderColor = r, s || (c ? a.backgroundColor = r : a.color = r));
    const p = c ? d : u;
    return p && (a.color = p), a;
  }), n = () => {
    const a = i("span", { class: ps("text", { ellipsis: !e.scrollable }) }, [t.title ? t.title() : e.title]);
    return e.dot || fe(e.badge) && e.badge !== "" ? i(Lo, { dot: e.dot, content: e.badge, showZero: e.showZeroBadge }, { default: () => [a] }) : a;
  };
  return () => i("div", { id: e.id, role: "tab", class: [ps([e.type, { grow: e.scrollable && !e.shrink, shrink: e.shrink, active: e.isActive, disabled: e.disabled }])], style: o.value, tabindex: e.disabled ? void 0 : e.isActive ? 0 : -1, "aria-selected": e.isActive, "aria-disabled": e.disabled || void 0, "aria-controls": e.controls, "data-allow-mismatch": "attribute" }, [n()]);
} });
var tv = {};
const [ov, nv] = Y("swipe-item");
var av = z({ name: ov, setup(e, { slots: t }) {
  let o;
  const n = ke({ offset: 0, inited: !1, mounted: !1 }), { parent: a, index: l } = Ge(Qu);
  if (!a) return void (tv.NODE_ENV !== "production" && console.error("[Vant] <SwipeItem> must be a child component of <Swipe>."));
  const r = E(() => {
    const c = {}, { vertical: d } = a.props;
    return a.size.value && (c[d ? "height" : "width"] = `${a.size.value}px`), n.offset && (c.transform = `translate${d ? "Y" : "X"}(${n.offset}px)`), c;
  }), s = E(() => {
    const { loop: c, lazyRender: d } = a.props;
    if (!d || o) return !0;
    if (!n.mounted) return !1;
    const u = a.activeIndicator.value, p = a.count.value - 1, v = u === 0 && c ? p : u - 1, h = u === p && c ? 0 : u + 1;
    return o = l.value === u || l.value === v || l.value === h, o;
  });
  return Ce(() => {
    ne(() => {
      n.mounted = !0;
    });
  }), pe({ setOffset: (c) => {
    n.offset = c;
  } }), () => {
    var c;
    return i("div", { class: nv(), style: r.value }, [s.value ? (c = t.default) == null ? void 0 : c.call(t) : null]);
  };
} });
const hi = Z(av);
var lv = {};
const [rv, Zl] = Y("tab");
var iv = z({ name: rv, props: ae({}, ko, { dot: Boolean, name: G, badge: G, title: String, disabled: Boolean, titleClass: Ae, titleStyle: [String, Object], showZeroBadge: W }), setup(e, { slots: t }) {
  const o = Cn(), n = A(!1), a = Xe(), { parent: l, index: r } = Ge(td);
  if (!l) return void (lv.NODE_ENV !== "production" && console.error("[Vant] <Tab> must be a child component of <Tabs>."));
  const s = () => {
    var v;
    return (v = e.name) != null ? v : r.value;
  }, c = E(() => {
    const v = s() === l.currentName.value;
    return v && !n.value && (n.value = !0, l.props.lazyRender && ne(() => {
      l.onRendered(s(), e.title);
    })), v;
  }), d = A(""), u = A("");
  ao(() => {
    const { titleClass: v, titleStyle: h } = e;
    d.value = v ? Gu(v) : "", u.value = h && typeof h != "string" ? function(g) {
      if (!g) return "";
      if (ta(g)) return g;
      let f = "";
      for (const b in g) {
        const w = g[b];
        (ta(w) || typeof w == "number") && (f += `${b.startsWith("--") ? b : Rp(b)}:${w};`);
      }
      return f;
    }(Xu(h)) : h;
  });
  const p = A(!c.value);
  return U(c, (v) => {
    v ? p.value = !1 : go(() => {
      p.value = !0;
    });
  }), U(() => e.title, () => {
    l.setLine(), l.scrollIntoView();
  }), At(od, c), pe({ id: o, renderTitle: (v) => i(ev, Q({ key: o, id: `${l.id}-${r.value}`, ref: l.setTitleRefs(r.value), style: u.value, class: d.value, isActive: c.value, controls: o, scrollable: l.scrollable.value, activeColor: l.props.titleActiveColor, inactiveColor: l.props.titleInactiveColor, onClick: (h) => v(a.proxy, r.value, h) }, he(l.props, ["type", "color", "shrink"]), he(e, ["dot", "badge", "title", "disabled", "showZeroBadge"])), { title: t.title }) }), () => {
    var v;
    const h = `${l.id}-${r.value}`, { animated: g, swipeable: f, scrollspy: b, lazyRender: w } = l.props;
    if (!t.default && !g) return;
    const y = b || c.value;
    if (g || f) return i(hi, { id: o, role: "tabpanel", class: Zl("panel-wrapper", { inactive: p.value }), tabindex: c.value ? 0 : -1, "aria-hidden": !c.value, "aria-labelledby": h, "data-allow-mismatch": "attribute" }, { default: () => {
      var C;
      return [i("div", { class: Zl("panel") }, [(C = t.default) == null ? void 0 : C.call(t)])];
    } });
    const k = n.value || b || !w ? (v = t.default) == null ? void 0 : v.call(t) : null;
    return De(i("div", { id: o, role: "tabpanel", class: Zl("panel"), tabindex: y ? 0 : -1, "aria-labelledby": h, "data-allow-mismatch": "attribute" }, [k]), [[Ie, y]]);
  };
} });
const oa = Z(iv), El = Z(Jp), [nd, Kl] = Y("picker-group"), ad = Symbol(nd);
var sv = z({ name: nd, props: ae({ tabs: Ve(), activeTab: te(0), nextStepText: String, showToolbar: W }, Al), emits: ["confirm", "cancel", "update:activeTab"], setup(e, { emit: t, slots: o }) {
  const n = fi(() => e.activeTab, (d) => t("update:activeTab", d)), { children: a, linkChildren: l } = Qe(ad);
  l();
  const r = () => +n.value < e.tabs.length - 1 && e.nextStepText, s = () => {
    r() ? n.value = +n.value + 1 : t("confirm", a.map((d) => d.confirm()));
  }, c = () => t("cancel");
  return () => {
    var d, u;
    let p = (u = (d = o.default) == null ? void 0 : d.call(o)) == null ? void 0 : u.filter((h) => h.type !== li).map((h) => h.type === be ? h.children : h);
    p && (p = p.reduce((h, g) => h.concat(g), []));
    const v = r() ? e.nextStepText : e.confirmButtonText;
    return i("div", { class: Kl() }, [e.showToolbar ? i(qu, { title: e.title, cancelButtonText: e.cancelButtonText, confirmButtonText: v, onConfirm: s, onCancel: c }, he(o, Uu)) : null, i(El, { active: n.value, "onUpdate:active": (h) => n.value = h, class: Kl("tabs"), shrink: !0, animated: !0, lazyRender: !1 }, { default: () => [e.tabs.map((h, g) => i(oa, { title: h, titleClass: Kl("tab-title") }, { default: () => [p == null ? void 0 : p[g]] }))] })]);
  };
} });
const Pl = ae({ loading: Boolean, readonly: Boolean, allowHtml: Boolean, optionHeight: te(44), showToolbar: W, swipeDuration: te(1e3), visibleOptionNum: te(6) }, Al);
var cv = z({ name: Pp, props: ae({}, Pl, { columns: Ve(), modelValue: Ve(), toolbarPosition: J("top"), columnsFieldNames: Object }), emits: ["confirm", "cancel", "change", "scrollInto", "clickOption", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(e.modelValue.slice(0)), { parent: l } = Ge(ad), { children: r, linkChildren: s } = Qe(Hu);
  s();
  const c = E(() => function(m) {
    return ae({ text: "text", value: "value", children: "children" }, m);
  }(e.columnsFieldNames)), d = E(() => ci(e.optionHeight)), u = E(() => function(m, x) {
    const T = m[0];
    if (T) {
      if (Array.isArray(T)) return "multiple";
      if (x.children in T) return "cascade";
    }
    return "default";
  }(e.columns, c.value)), p = E(() => {
    const { columns: m } = e;
    switch (u.value) {
      case "multiple":
        return m;
      case "cascade":
        return function(x, T, V) {
          const P = [];
          let N = { [T.children]: x }, j = 0;
          for (; N && N[T.children]; ) {
            const F = N[T.children], I = V.value[j];
            N = fe(I) ? Xl(F, I, T) : void 0, !N && F.length && (N = Xl(F, cs(F)[T.value], T)), j++, P.push(F);
          }
          return P;
        }(m, c.value, a);
      default:
        return [m];
    }
  }), v = E(() => p.value.some((m) => m.length)), h = E(() => p.value.map((m, x) => Xl(m, a.value[x], c.value))), g = E(() => p.value.map((m, x) => m.findIndex((T) => T[c.value.value] === a.value[x]))), f = (m, x) => {
    if (a.value[m] !== x) {
      const T = a.value.slice(0);
      T[m] = x, a.value = T;
    }
  }, b = () => ({ selectedValues: a.value.slice(0), selectedOptions: h.value, selectedIndexes: g.value }), w = () => {
    r.forEach((x) => x.stopMomentum());
    const m = b();
    return ne(() => {
      t("confirm", m);
    }), m;
  }, y = () => t("cancel", b()), k = () => p.value.map((m, x) => i(Ip, { value: a.value[x], fields: c.value, options: m, readonly: e.readonly, allowHtml: e.allowHtml, optionHeight: d.value, swipeDuration: e.swipeDuration, visibleOptionNum: e.visibleOptionNum, onChange: (T) => ((V, P) => {
    f(P, V), u.value === "cascade" && a.value.forEach((N, j) => {
      const F = p.value[j];
      us(F, N, c.value) || f(j, F.length ? F[0][c.value.value] : void 0);
    }), ne(() => {
      t("change", ae({ columnIndex: P }, b()));
    });
  })(T, x), onClickOption: (T) => ((V, P) => {
    const N = { columnIndex: P, currentOption: V };
    t("clickOption", ae(b(), N)), t("scrollInto", N);
  })(T, x), onScrollInto: (T) => {
    t("scrollInto", { currentOption: T, columnIndex: x });
  } }, { option: o.option })), C = (m) => {
    if (v.value) {
      const x = { height: `${d.value}px` }, T = { backgroundSize: `100% ${(m - d.value) / 2}px` };
      return [i("div", { class: Gt("mask"), style: T }, null), i("div", { class: [ep, Gt("frame")], style: x }, null)];
    }
  }, S = () => {
    const m = d.value * +e.visibleOptionNum, x = { height: `${m}px` };
    return e.loading || v.value || !o.empty ? i("div", { ref: n, class: Gt("columns"), style: x }, [k(), C(m)]) : o.empty();
  }, O = () => {
    if (e.showToolbar && !l) return i(qu, Q(he(e, jp), { onConfirm: w, onCancel: y }), he(o, Uu));
  };
  let B;
  return U(p, (m) => {
    m.forEach((x, T) => {
      x.length && !us(x, a.value[T], c.value) && f(T, cs(x)[c.value.value]);
    });
  }, { immediate: !0 }), U(() => e.modelValue, (m) => {
    Rt(m, a.value) || Rt(m, B) || (a.value = m.slice(0), B = m.slice(0));
  }, { deep: !0 }), U(a, (m) => {
    Rt(m, e.modelValue) || (B = m.slice(0), t("update:modelValue", B));
  }, { immediate: !0 }), Ne("touchmove", Oe, { target: n }), pe({ confirm: w, getSelectedOptions: () => h.value }), () => {
    var m, x;
    return i("div", { class: Gt() }, [e.toolbarPosition === "top" ? O() : null, e.loading ? i(Et, { class: Gt("loading") }, null) : null, (m = o["columns-top"]) == null ? void 0 : m.call(o), S(), (x = o["columns-bottom"]) == null ? void 0 : x.call(o), e.toolbarPosition === "bottom" ? O() : null]);
  };
} });
const cn = "000000", uv = ["title", "cancel", "confirm", "toolbar", "columns-top", "columns-bottom"], vs = ["title", "loading", "readonly", "optionHeight", "swipeDuration", "visibleOptionNum", "cancelButtonText", "confirmButtonText"], co = (e = "", t = cn, o = void 0) => ({ text: e, value: t, children: o });
function dv({ areaList: e, columnsNum: t, columnsPlaceholder: o }) {
  const { city_list: n = {}, county_list: a = {}, province_list: l = {} } = e, r = +t > 1, s = +t > 2, c = /* @__PURE__ */ new Map();
  Object.keys(l).forEach((p) => {
    c.set(p.slice(0, 2), co(l[p], p, (() => {
      if (r) return o.length > 1 ? [co(o[1], cn, s ? [] : void 0)] : [];
    })()));
  });
  const d = /* @__PURE__ */ new Map();
  if (r) {
    const p = () => {
      if (s) return o.length > 2 ? [co(o[2])] : [];
    };
    Object.keys(n).forEach((v) => {
      const h = co(n[v], v, p());
      d.set(v.slice(0, 4), h);
      const g = c.get(v.slice(0, 2));
      g && g.children.push(h);
    });
  }
  s && Object.keys(a).forEach((p) => {
    const v = d.get(p.slice(0, 4));
    v && v.children.push(co(a[p], p));
  });
  const u = Array.from(c.values());
  if (o.length) {
    const p = s ? [co(o[2])] : void 0, v = r ? [co(o[1], cn, p)] : void 0;
    u.unshift(co(o[0], cn, v));
  }
  return u;
}
const Il = Z(cv), [pv, vv] = Y("area");
var fv = z({ name: pv, props: ae({}, he(Pl, vs), { modelValue: String, columnsNum: te(3), columnsPlaceholder: Ve(), areaList: { type: Object, default: () => ({}) } }), emits: ["change", "confirm", "cancel", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A([]), a = A(), l = E(() => dv(e)), r = (...d) => t("change", ...d), s = (...d) => t("cancel", ...d), c = (...d) => t("confirm", ...d);
  return U(n, (d) => {
    const u = d.length ? d[d.length - 1] : "";
    u && u !== e.modelValue && t("update:modelValue", u);
  }, { deep: !0 }), U(() => e.modelValue, (d) => {
    d ? d !== (n.value.length ? n.value[n.value.length - 1] : "") && (n.value = [`${d.slice(0, 2)}0000`, `${d.slice(0, 4)}00`, d].slice(0, +e.columnsNum)) : n.value = [];
  }, { immediate: !0 }), pe({ confirm: () => {
    var d;
    return (d = a.value) == null ? void 0 : d.confirm();
  }, getSelectedOptions: () => {
    var d;
    return ((d = a.value) == null ? void 0 : d.getSelectedOptions()) || [];
  } }), () => i(Il, Q({ ref: a, modelValue: n.value, "onUpdate:modelValue": (d) => n.value = d, class: vv(), columns: l.value, onChange: r, onCancel: s, onConfirm: c }, he(e, vs)), he(o, uv));
} });
const ld = Z(fv), [mv, Yo] = Y("cell"), pl = { tag: J("div"), icon: String, size: String, title: G, value: G, label: G, center: Boolean, isLink: Boolean, border: W, iconPrefix: String, valueClass: Ae, labelClass: Ae, titleClass: Ae, titleStyle: null, arrowDirection: String, required: { type: [Boolean, String], default: null }, clickable: { type: Boolean, default: null } };
var hv = z({ name: mv, props: ae({}, pl, ko), setup(e, { slots: t }) {
  const o = Mo(), n = () => {
    if (t.label || fe(e.label)) return i("div", { class: [Yo("label"), e.labelClass] }, [t.label ? t.label() : e.label]);
  }, a = () => {
    var s;
    if (t.title || fe(e.title)) {
      const c = (s = t.title) == null ? void 0 : s.call(t);
      return Array.isArray(c) && c.length === 0 ? void 0 : i("div", { class: [Yo("title"), e.titleClass], style: e.titleStyle }, [c || i("span", null, [e.title]), n()]);
    }
  }, l = () => {
    const s = t.value || t.default;
    if (s || fe(e.value)) return i("div", { class: [Yo("value"), e.valueClass] }, [s ? s() : i("span", null, [e.value])]);
  }, r = () => {
    if (t["right-icon"]) return t["right-icon"]();
    if (e.isLink) {
      const s = e.arrowDirection && e.arrowDirection !== "right" ? `arrow-${e.arrowDirection}` : "arrow";
      return i(ie, { name: s, class: Yo("right-icon") }, null);
    }
  };
  return () => {
    var s;
    const { tag: c, size: d, center: u, border: p, isLink: v, required: h } = e, g = (s = e.clickable) != null ? s : v, f = { center: u, required: !!h, clickable: g, borderless: !p };
    return d && (f[d] = !!d), i(c, { class: Yo(f), role: g ? "button" : void 0, tabindex: g ? 0 : void 0, onClick: o }, { default: () => {
      var b;
      return [t.icon ? t.icon() : e.icon ? i(ie, { name: e.icon, class: Yo("left-icon"), classPrefix: e.iconPrefix }, null) : void 0, a(), l(), r(), (b = t.extra) == null ? void 0 : b.call(t)];
    } });
  };
} });
const dt = Z(hv), [gv, bv] = Y("form");
var yv = z({ name: gv, props: { colon: Boolean, disabled: Boolean, readonly: Boolean, required: [Boolean, String], showError: Boolean, labelWidth: G, labelAlign: String, inputAlign: String, scrollToError: Boolean, scrollToErrorPosition: String, validateFirst: Boolean, submitOnEnter: W, showErrorMessage: W, errorMessageAlign: String, validateTrigger: { type: [String, Array], default: "onBlur" } }, emits: ["submit", "failed"], setup(e, { emit: t, slots: o }) {
  const { children: n, linkChildren: a } = Qe(Eu), l = (p) => p ? n.filter((v) => p.includes(v.name)) : n, r = (p) => {
    return typeof p == "string" ? ((h) => {
      const g = n.find((f) => f.name === h);
      return g ? new Promise((f, b) => {
        g.validate().then((w) => {
          w ? b(w) : f();
        });
      }) : Promise.reject();
    })(p) : e.validateFirst ? (v = p, new Promise((h, g) => {
      const f = [];
      l(v).reduce((b, w) => b.then(() => {
        if (!f.length) return w.validate().then((y) => {
          y && f.push(y);
        });
      }), Promise.resolve()).then(() => {
        f.length ? g(f) : h();
      });
    })) : ((h) => new Promise((g, f) => {
      const b = l(h);
      Promise.all(b.map((w) => w.validate())).then((w) => {
        (w = w.filter(Boolean)).length ? f(w) : g();
      });
    }))(p);
    var v;
  }, s = (p, v) => {
    n.some((h) => h.name === p && (h.$el.scrollIntoView(v), !0));
  }, c = () => n.reduce((p, v) => (v.name !== void 0 && (p[v.name] = v.formValue.value), p), {}), d = () => {
    const p = c();
    r().then(() => t("submit", p)).catch((v) => {
      t("failed", { values: p, errors: v });
      const { scrollToError: h, scrollToErrorPosition: g } = e;
      h && v[0].name && s(v[0].name, g ? { block: g } : void 0);
    });
  }, u = (p) => {
    Oe(p), d();
  };
  return a({ props: e }), pe({ submit: d, validate: r, getValues: c, scrollToField: s, resetValidation: (p) => {
    typeof p == "string" && (p = [p]), l(p).forEach((v) => {
      v.resetValidation();
    });
  }, getValidationStatus: () => n.reduce((p, v) => (p[v.name] = v.getValidationStatus(), p), {}) }), () => {
    var p;
    return i("form", { class: bv(), onSubmit: u }, [(p = o.default) == null ? void 0 : p.call(o)]);
  };
} });
const gi = Z(yv);
function fs(e) {
  return Array.isArray(e) ? !e.length : e !== 0 && !e;
}
function ms(e, t) {
  const { message: o } = t;
  return vn(o) ? o(e, t) : o || "";
}
function wv({ target: e }) {
  e.composing = !0;
}
function hs({ target: e }) {
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
function _t(e) {
  return [...e].length;
}
function Jl(e, t) {
  return [...e].slice(0, t).join("");
}
const [xv, vt] = Y("field"), Mr = { id: String, name: String, leftIcon: String, rightIcon: String, autofocus: Boolean, clearable: Boolean, maxlength: G, max: Number, min: Number, formatter: Function, clearIcon: J("clear"), modelValue: te(""), inputAlign: String, placeholder: String, autocomplete: String, autocapitalize: String, autocorrect: String, errorMessage: String, enterkeyhint: String, clearTrigger: J("focus"), formatTrigger: J("onChange"), spellcheck: { type: Boolean, default: null }, error: { type: Boolean, default: null }, disabled: { type: Boolean, default: null }, readonly: { type: Boolean, default: null }, inputmode: String };
var Sv = z({ name: xv, props: ae({}, pl, Mr, { rows: G, type: J("text"), rules: Array, autosize: [Boolean, Object], labelWidth: G, labelClass: Ae, labelAlign: String, showWordLimit: Boolean, errorMessageAlign: String, colon: { type: Boolean, default: null } }), emits: ["blur", "focus", "clear", "keypress", "clickInput", "endValidate", "startValidate", "clickLeftIcon", "clickRightIcon", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = Cn(), a = ke({ status: "unvalidated", focused: !1, validateMessage: "" }), l = A(), r = A(), s = A(), { parent: c } = Ge(Eu), d = () => {
    var D;
    return String((D = e.modelValue) != null ? D : "");
  }, u = (D) => fe(e[D]) ? e[D] : c && fe(c.props[D]) ? c.props[D] : void 0, p = E(() => {
    const D = u("readonly");
    if (e.clearable && !D) {
      const M = d() !== "", q = e.clearTrigger === "always" || e.clearTrigger === "focus" && a.focused;
      return M && q;
    }
    return !1;
  }), v = E(() => s.value && o.input ? s.value() : e.modelValue), h = E(() => {
    var D;
    const M = u("required");
    return M === "auto" ? (D = e.rules) == null ? void 0 : D.some((q) => q.required) : M;
  }), g = (D) => D.reduce((M, q) => M.then(() => {
    if (a.status === "failed") return;
    let { value: X } = v;
    if (q.formatter && (X = q.formatter(X, q)), !function(ee, oe) {
      if (fs(ee)) {
        if (oe.required) return !1;
        if (oe.validateEmpty === !1) return !0;
      }
      return !(oe.pattern && !oe.pattern.test(String(ee)));
    }(X, q)) return a.status = "failed", void (a.validateMessage = ms(X, q));
    if (q.validator)
      return fs(X) && q.validateEmpty === !1 ? void 0 : function(ee, oe) {
        return new Promise((se) => {
          const le = oe.validator(ee, oe);
          ri(le) ? le.then(se) : se(le);
        });
      }(X, q).then((ee) => {
        ee && typeof ee == "string" ? (a.status = "failed", a.validateMessage = ee) : ee === !1 && (a.status = "failed", a.validateMessage = ms(X, q));
      });
  }), Promise.resolve()), f = () => {
    a.status = "unvalidated", a.validateMessage = "";
  }, b = () => t("endValidate", { status: a.status, message: a.validateMessage }), w = (D = e.rules) => new Promise((M) => {
    f(), D ? (t("startValidate"), g(D).then(() => {
      a.status === "failed" ? (M({ name: e.name, message: a.validateMessage }), b()) : (a.status = "passed", M(), b());
    })) : M();
  }), y = (D) => {
    if (c && e.rules) {
      const { validateTrigger: M } = c.props, q = il(M).includes(D), X = e.rules.filter((ee) => ee.trigger ? il(ee.trigger).includes(D) : q);
      X.length && w(X);
    }
  }, k = (D, M = "onChange") => {
    var q, X;
    const ee = D;
    D = ((le) => {
      var ve;
      const { maxlength: ye } = e;
      if (fe(ye) && _t(le) > +ye) {
        const Ye = d();
        if (Ye && _t(Ye) === +ye) return Ye;
        const Bn = (ve = l.value) == null ? void 0 : ve.selectionEnd;
        if (a.focused && Bn) {
          const To = [...le], Vn = To.length - +ye;
          return To.splice(Bn - Vn, Vn), To.join("");
        }
        return Jl(le, +ye);
      }
      return le;
    })(D);
    const oe = _t(ee) - _t(D);
    if (e.type === "number" || e.type === "digit") {
      const le = e.type === "number";
      if (D = zr(D, le, le), M === "onBlur" && D !== "" && (e.min !== void 0 || e.max !== void 0)) {
        const ve = qe(+D, (q = e.min) != null ? q : -1 / 0, (X = e.max) != null ? X : 1 / 0);
        +D !== ve && (D = ve.toString());
      }
    }
    let se = 0;
    if (e.formatter && M === e.formatTrigger) {
      const { formatter: le, maxlength: ve } = e;
      if (D = le(D), fe(ve) && _t(D) > +ve && (D = Jl(D, +ve)), l.value && a.focused) {
        const { selectionEnd: ye } = l.value, Ye = Jl(ee, ye);
        se = _t(le(Ye)) - _t(Ye);
      }
    }
    if (l.value && l.value.value !== D) if (a.focused) {
      let { selectionStart: le, selectionEnd: ve } = l.value;
      if (l.value.value = D, fe(le) && fe(ve)) {
        const ye = _t(D);
        oe ? (le -= oe, ve -= oe) : se && (le += se, ve += se), l.value.setSelectionRange(Math.min(le, ye), Math.min(ve, ye));
      }
    } else l.value.value = D;
    D !== e.modelValue && t("update:modelValue", D);
  }, C = (D) => {
    D.target.composing || k(D.target.value);
  }, S = () => {
    var D;
    return (D = l.value) == null ? void 0 : D.blur();
  }, O = () => {
    var D;
    return (D = l.value) == null ? void 0 : D.focus();
  }, B = () => {
    const D = l.value;
    e.type === "textarea" && e.autosize && D && function(M, q) {
      const X = Io();
      M.style.height = "auto";
      let ee = M.scrollHeight;
      if (oo(q)) {
        const { maxHeight: oe, minHeight: se } = q;
        oe !== void 0 && (ee = Math.min(ee, oe)), se !== void 0 && (ee = Math.max(ee, se));
      }
      ee && (M.style.height = `${ee}px`, ea(X));
    }(D, e.autosize);
  }, m = (D) => {
    a.focused = !0, t("focus", D), ne(B), u("readonly") && S();
  }, x = (D) => {
    a.focused = !1, k(d(), "onBlur"), t("blur", D), u("readonly") || (y("onBlur"), ne(B), Cu());
  }, T = (D) => t("clickInput", D), V = (D) => t("clickLeftIcon", D), P = (D) => t("clickRightIcon", D), N = E(() => typeof e.error == "boolean" ? e.error : !(!c || !c.props.showError || a.status !== "failed") || void 0), j = E(() => {
    const D = u("labelWidth"), M = u("labelAlign");
    if (D && M !== "top") return { width: ce(D) };
  }), F = (D) => {
    D.keyCode === 13 && (c && c.props.submitOnEnter || e.type === "textarea" || Oe(D), e.type === "search" && S()), t("keypress", D);
  }, I = () => e.id || `${n}-input`, R = () => {
    const D = vt("control", [u("inputAlign"), { error: N.value, custom: !!o.input, "min-height": e.type === "textarea" && !e.autosize }]);
    if (o.input) return i("div", { class: D, onClick: T }, [o.input()]);
    const M = { id: I(), ref: l, name: e.name, rows: e.rows !== void 0 ? +e.rows : void 0, class: D, disabled: u("disabled"), readonly: u("readonly"), autofocus: e.autofocus, placeholder: e.placeholder, autocomplete: e.autocomplete, autocapitalize: e.autocapitalize, autocorrect: e.autocorrect, enterkeyhint: e.enterkeyhint, spellcheck: e.spellcheck, "aria-labelledby": e.label ? `${n}-label` : void 0, "data-allow-mismatch": "attribute", onBlur: x, onFocus: m, onInput: C, onClick: T, onChange: hs, onKeypress: F, onCompositionend: hs, onCompositionstart: wv };
    return e.type === "textarea" ? i("textarea", Q(M, { inputmode: e.inputmode }), null) : i("input", Q((q = e.type, X = e.inputmode, q === "number" && (q = "text", X != null || (X = "decimal")), q === "digit" && (q = "tel", X != null || (X = "numeric")), { type: q, inputmode: X }), M), null);
    var q, X;
  }, _ = () => {
    const D = o["right-icon"];
    if (e.rightIcon || D) return i("div", { class: vt("right-icon"), onClick: P }, [D ? D() : i(ie, { name: e.rightIcon, classPrefix: e.iconPrefix }, null)]);
  }, $ = () => {
    if (e.showWordLimit && e.maxlength) {
      const D = _t(d());
      return i("div", { class: vt("word-limit") }, [i("span", { class: vt("word-num") }, [D]), mt("/"), e.maxlength]);
    }
  }, L = () => {
    if (c && c.props.showErrorMessage === !1) return;
    const D = e.errorMessage || a.validateMessage;
    if (D) {
      const M = o["error-message"], q = u("errorMessageAlign");
      return i("div", { class: vt("error-message", q) }, [M ? M({ message: D }) : D]);
    }
  }, K = () => [i("div", { class: vt("body") }, [R(), p.value && i(ie, { ref: r, name: e.clearIcon, class: vt("clear") }, null), _(), o.button && i("div", { class: vt("button") }, [o.button()])]), $(), L()];
  return pe({ blur: S, focus: O, validate: w, formValue: v, resetValidation: f, getValidationStatus: () => a.status }), At(ku, { customValue: s, resetValidation: f, validateWithTrigger: y }), U(() => e.modelValue, () => {
    k(d()), f(), y("onChange"), ne(B);
  }), Ce(() => {
    k(d(), e.formatTrigger), ne(B);
  }), Ne("touchstart", (D) => {
    Oe(D), t("update:modelValue", ""), t("clear", D);
  }, { target: E(() => {
    var D;
    return (D = r.value) == null ? void 0 : D.$el;
  }) }), () => {
    const D = u("disabled"), M = u("labelAlign"), q = (() => {
      const X = o["left-icon"];
      if (e.leftIcon || X) return i("div", { class: vt("left-icon"), onClick: V }, [X ? X() : i(ie, { name: e.leftIcon, classPrefix: e.iconPrefix }, null)]);
    })();
    return i(dt, { size: e.size, class: vt({ error: N.value, disabled: D, [`label-${M}`]: M }), center: e.center, border: e.border, isLink: e.isLink, clickable: e.clickable, titleStyle: j.value, valueClass: vt("value"), titleClass: [vt("label", [M, { required: h.value }]), e.labelClass], arrowDirection: e.arrowDirection }, { icon: q && M !== "top" ? () => q : null, title: () => {
      const X = (() => {
        const ee = u("labelWidth"), oe = u("labelAlign"), se = u("colon") ? ":" : "";
        return o.label ? [o.label(), se] : e.label ? i("label", { id: `${n}-label`, for: o.input ? void 0 : I(), "data-allow-mismatch": "attribute", onClick: (le) => {
          Oe(le), O();
        }, style: oe === "top" && ee ? { width: ce(ee) } : void 0 }, [e.label + se]) : void 0;
      })();
      return M === "top" ? [q, X].filter(Boolean) : X || [];
    }, value: K, extra: o.extra });
  };
} });
const Qt = Z(Sv);
let En = 0;
const [kv, Xo] = Y("toast"), Cv = ["show", "overlay", "teleport", "transition", "overlayClass", "overlayStyle", "closeOnClickOverlay", "zIndex"];
var rd = z({ name: kv, props: { icon: String, show: Boolean, type: J("text"), overlay: Boolean, message: G, iconSize: G, duration: _e(2e3), position: J("middle"), teleport: [String, Object], wordBreak: String, className: Ae, iconPrefix: String, transition: J("van-fade"), loadingType: String, forbidClick: Boolean, overlayClass: Ae, overlayStyle: Object, closeOnClick: Boolean, closeOnClickOverlay: Boolean, zIndex: G }, emits: ["update:show"], setup(e, { emit: t, slots: o }) {
  let n, a = !1;
  const l = () => {
    const p = e.show && e.forbidClick;
    a !== p && (a = p, a ? (En || document.body.classList.add("van-toast--unclickable"), En++) : En && (En--, En || document.body.classList.remove("van-toast--unclickable")));
  }, r = (p) => t("update:show", p), s = () => {
    e.closeOnClick && r(!1);
  }, c = () => clearTimeout(n), d = () => {
    const { icon: p, type: v, iconSize: h, iconPrefix: g, loadingType: f } = e;
    return p || v === "success" || v === "fail" ? i(ie, { name: p || v, size: h, class: Xo("icon"), classPrefix: g }, null) : v === "loading" ? i(Et, { class: Xo("loading"), size: h, type: f }, null) : void 0;
  }, u = () => {
    const { type: p, message: v } = e;
    return o.message ? i("div", { class: Xo("text") }, [o.message()]) : fe(v) && v !== "" ? p === "html" ? i("div", { key: 0, class: Xo("text"), innerHTML: String(v) }, null) : i("div", { class: Xo("text") }, [v]) : void 0;
  };
  return U(() => [e.show, e.forbidClick], l), U(() => [e.show, e.type, e.message, e.duration], () => {
    c(), e.show && e.duration > 0 && (n = setTimeout(() => {
      r(!1);
    }, e.duration));
  }), Ce(l), yn(l), () => i(xt, Q({ class: [Xo([e.position, e.wordBreak === "normal" ? "break-normal" : e.wordBreak, { [e.type]: !e.icon }]), e.className], lockScroll: !1, onClick: s, onClosed: c, "onUpdate:show": r }, he(e, Cv)), { default: () => [d(), u()] });
} });
function id() {
  const e = ke({ show: !1 }), t = (a) => {
    e.show = a;
  }, o = (a) => {
    ae(e, a, { transitionAppear: !0 }), t(!0);
  }, n = () => t(!1);
  return pe({ open: o, close: n, toggle: t }), { open: o, close: n, state: e, toggle: t };
}
function sd(e) {
  const t = E1(e), o = document.createElement("div");
  return document.body.appendChild(o), { instance: t.mount(o), unmount() {
    t.unmount(), document.body.removeChild(o);
  } };
}
let ba = [], gs = ae({}, { icon: "", type: "text", message: "", className: "", overlay: !1, onClose: void 0, onOpened: void 0, duration: 2e3, teleport: "body", iconSize: void 0, iconPrefix: void 0, position: "middle", transition: "van-fade", forbidClick: !1, loadingType: void 0, overlayClass: "", overlayStyle: void 0, closeOnClick: !1, closeOnClickOverlay: !1 });
const Tv = /* @__PURE__ */ new Map();
function cd(e) {
  return oo(e) ? e : { message: e };
}
function Ov() {
  if (!ba.length) {
    const e = function() {
      const { instance: t } = sd({ setup() {
        const o = A(""), { open: n, state: a, close: l, toggle: r } = id(), s = () => {
        };
        return U(o, (c) => {
          a.message = c;
        }), Xe().render = () => i(rd, Q(a, { onClosed: s, "onUpdate:show": r }), null), { open: n, close: l, message: o };
      } });
      return t;
    }();
    ba.push(e);
  }
  return ba[ba.length - 1];
}
function vl(e = {}) {
  if (!bt) return {};
  const t = Ov(), o = cd(e);
  return t.open(ae({}, gs, Tv.get(o.type || gs.type), o)), t;
}
const Bv = (bs = "fail", (e) => vl(ae({ type: bs }, cd(e))));
var bs;
const Vv = Z(rd), [Dv, Ql] = Y("switch");
var Av = z({ name: Dv, props: { size: G, loading: Boolean, disabled: Boolean, modelValue: Ae, activeColor: String, inactiveColor: String, activeValue: { type: Ae, default: !0 }, inactiveValue: { type: Ae, default: !1 } }, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = () => e.modelValue === e.activeValue, a = () => {
    if (!e.disabled && !e.loading) {
      const r = n() ? e.inactiveValue : e.activeValue;
      t("update:modelValue", r), t("change", r);
    }
  }, l = () => {
    if (e.loading) {
      const r = n() ? e.activeColor : e.inactiveColor;
      return i(Et, { class: Ql("loading"), color: r }, null);
    }
    if (o.node) return o.node();
  };
  return xo(() => e.modelValue), () => {
    var r;
    const { size: s, loading: c, disabled: d, activeColor: u, inactiveColor: p } = e, v = n(), h = { fontSize: ce(s), backgroundColor: v ? u : p };
    return i("div", { role: "switch", class: Ql({ on: v, loading: c, disabled: d }), style: h, tabindex: d ? void 0 : 0, "aria-checked": v, onClick: a }, [i("div", { class: Ql("node") }, [l()]), (r = o.background) == null ? void 0 : r.call(o)]);
  };
} });
const bi = Z(Av), [Ev, ys] = Y("address-edit-detail"), ws = Y("address-edit")[2];
var Pv = z({ name: Ev, props: { show: Boolean, rows: G, value: String, rules: Array, focused: Boolean, maxlength: G, searchResult: Array, showSearchResult: Boolean }, emits: ["blur", "focus", "input", "selectSearch"], setup(e, { emit: t }) {
  const o = A(), n = () => e.focused && e.searchResult && e.showSearchResult, a = () => {
    if (!n()) return;
    const { searchResult: c } = e;
    return c.map((d) => i(dt, { clickable: !0, key: (d.name || "") + (d.address || ""), icon: "location-o", title: d.name, label: d.address, class: ys("search-item"), border: !1, onClick: () => ((u) => {
      t("selectSearch", u), t("input", `${u.address || ""} ${u.name || ""}`.trim());
    })(d) }, null));
  }, l = (c) => t("blur", c), r = (c) => t("focus", c), s = (c) => t("input", c);
  return () => {
    if (e.show) return i(be, null, [i(Qt, { autosize: !0, clearable: !0, ref: o, class: ys(), rows: e.rows, type: "textarea", rules: e.rules, label: ws("addressDetail"), border: !n(), maxlength: e.maxlength, modelValue: e.value, placeholder: ws("addressDetail"), onBlur: l, onFocus: r, "onUpdate:modelValue": s }, null), a()]);
  };
} });
const [Iv, Go, et] = Y("address-edit"), xs = { name: "", tel: "", city: "", county: "", province: "", areaCode: "", isDefault: !1, addressDetail: "" };
var $v = z({ name: Iv, props: { areaList: Object, isSaving: Boolean, isDeleting: Boolean, validator: Function, showArea: W, showDetail: W, showDelete: Boolean, disableArea: Boolean, searchResult: Array, telMaxlength: G, showSetDefault: Boolean, saveButtonText: String, areaPlaceholder: String, deleteButtonText: String, showSearchResult: Boolean, detailRows: te(1), detailMaxlength: te(200), areaColumnsPlaceholder: Ve(), addressInfo: { type: Object, default: () => ae({}, xs) }, telValidator: { type: Function, default: wu } }, emits: ["save", "focus", "change", "delete", "clickArea", "changeArea", "changeDetail", "selectSearch", "changeDefault"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = ke({}), l = A(!1), r = A(!1), s = E(() => oo(e.areaList) && Object.keys(e.areaList).length), c = E(() => {
    const { province: C, city: S, county: O, areaCode: B } = a;
    if (B) {
      const m = [C, S, O];
      return C && C === S && m.splice(1, 1), m.filter(Boolean).join("/");
    }
    return "";
  }), d = E(() => {
    var C;
    return ((C = e.searchResult) == null ? void 0 : C.length) && r.value;
  }), u = (C) => {
    r.value = C === "addressDetail", t("focus", C);
  }, p = (C, S) => {
    t("change", { key: C, value: S });
  }, v = E(() => {
    const { validator: C, telValidator: S } = e, O = (B, m) => ({ validator: (x) => {
      if (C) {
        const T = C(B, x);
        if (T) return T;
      }
      return !!x || m;
    } });
    return { name: [O("name", et("nameEmpty"))], tel: [O("tel", et("telInvalid")), { validator: S, message: et("telInvalid") }], areaCode: [O("areaCode", et("areaEmpty"))], addressDetail: [O("addressDetail", et("addressEmpty"))] };
  }), h = () => t("save", a), g = (C) => {
    a.addressDetail = C, t("changeDetail", C);
  }, f = (C) => {
    a.province = C[0].text, a.city = C[1].text, a.county = C[2].text;
  }, b = ({ selectedValues: C, selectedOptions: S }) => {
    C.some((O) => O === cn) ? vl(et("areaEmpty")) : (l.value = !1, f(S), t("changeArea", S));
  }, w = () => t("delete", a), y = () => {
    setTimeout(() => {
      r.value = !1;
    });
  }, k = () => {
    if (e.showSetDefault) {
      const C = { "right-icon": () => i(bi, { modelValue: a.isDefault, "onUpdate:modelValue": (S) => a.isDefault = S, onChange: (S) => t("changeDefault", S) }, null) };
      return De(i(dt, { center: !0, border: !1, title: et("defaultAddress"), class: Go("default") }, C), [[Ie, !d.value]]);
    }
  };
  return pe({ setAreaCode: (C) => {
    a.areaCode = C || "";
  }, setAddressDetail: (C) => {
    a.addressDetail = C;
  } }), U(() => e.addressInfo, (C) => {
    ae(a, xs, C), ne(() => {
      var S;
      const O = (S = n.value) == null ? void 0 : S.getSelectedOptions();
      O && O.every((B) => B && B.value !== cn) && f(O);
    });
  }, { deep: !0, immediate: !0 }), () => {
    const { disableArea: C } = e;
    return i(gi, { class: Go(), onSubmit: h }, { default: () => {
      var S;
      return [i("div", { class: Go("fields") }, [i(Qt, { modelValue: a.name, "onUpdate:modelValue": [(O) => a.name = O, (O) => p("name", O)], clearable: !0, label: et("name"), rules: v.value.name, placeholder: et("name"), onFocus: () => u("name") }, null), i(Qt, { modelValue: a.tel, "onUpdate:modelValue": [(O) => a.tel = O, (O) => p("tel", O)], clearable: !0, type: "tel", label: et("tel"), rules: v.value.tel, maxlength: e.telMaxlength, placeholder: et("tel"), onFocus: () => u("tel") }, null), De(i(Qt, { readonly: !0, label: et("area"), "is-link": !C, modelValue: c.value, rules: e.showArea ? v.value.areaCode : void 0, placeholder: e.areaPlaceholder || et("area"), onFocus: () => u("areaCode"), onClick: () => {
        t("clickArea"), l.value = !C;
      } }, null), [[Ie, e.showArea]]), i(Pv, { show: e.showDetail, rows: e.detailRows, rules: v.value.addressDetail, value: a.addressDetail, focused: r.value, maxlength: e.detailMaxlength, searchResult: e.searchResult, showSearchResult: e.showSearchResult, onBlur: y, onFocus: () => u("addressDetail"), onInput: g, onSelectSearch: (O) => t("selectSearch", O) }, null), (S = o.default) == null ? void 0 : S.call(o)]), k(), De(i("div", { class: Go("buttons") }, [i(Le, { block: !0, round: !0, type: "primary", text: e.saveButtonText || et("save"), class: Go("button"), loading: e.isSaving, nativeType: "submit" }, null), e.showDelete && i(Le, { block: !0, round: !0, class: Go("button"), loading: e.isDeleting, text: e.deleteButtonText || et("delete"), onClick: w }, null)]), [[Ie, !d.value]]), i(xt, { show: l.value, "onUpdate:show": (O) => l.value = O, round: !0, teleport: "body", position: "bottom", lazyRender: !1 }, { default: () => [i(ld, { modelValue: a.areaCode, "onUpdate:modelValue": (O) => a.areaCode = O, ref: n, loading: !s.value, areaList: e.areaList, columnsPlaceholder: e.areaColumnsPlaceholder, onConfirm: b, onCancel: () => {
        l.value = !1;
      } }, null)] })];
    } });
  };
} });
const jv = Z($v), [ud, zv] = Y("radio-group"), Rv = { shape: String, disabled: Boolean, iconSize: G, direction: String, modelValue: Ae, checkedColor: String }, dd = Symbol(ud);
var Nv = z({ name: ud, props: Rv, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { linkChildren: n } = Qe(dd);
  return U(() => e.modelValue, (a) => t("change", a)), n({ props: e, updateValue: (a) => t("update:modelValue", a) }), xo(() => e.modelValue), () => {
    var a;
    return i("div", { class: zv([e.direction]), role: "radiogroup" }, [(a = o.default) == null ? void 0 : a.call(o)]);
  };
} });
const yi = Z(Nv), [pd, Mv] = Y("checkbox-group"), Lv = { max: G, shape: J("round"), disabled: Boolean, iconSize: G, direction: String, modelValue: Ve(), checkedColor: String }, vd = Symbol(pd);
var Fv = z({ name: pd, props: Lv, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { children: n, linkChildren: a } = Qe(vd), l = (r) => t("update:modelValue", r);
  return U(() => e.modelValue, (r) => t("change", r)), pe({ toggleAll: (r = {}) => {
    typeof r == "boolean" && (r = { checked: r });
    const { checked: s, skipDisabled: c } = r, d = n.filter((u) => !!u.props.bindGroup && (u.props.disabled && c ? u.checked.value : s ?? !u.checked.value)).map((u) => u.name);
    l(d);
  } }), xo(() => e.modelValue), a({ props: e, updateValue: l }), () => {
    var r;
    return i("div", { class: Mv([e.direction]) }, [(r = o.default) == null ? void 0 : r.call(o)]);
  };
} });
const wi = Z(Fv), [_v, Ss] = Y("tag");
var Hv = z({ name: _v, props: { size: String, mark: Boolean, show: W, type: J("default"), color: String, plain: Boolean, round: Boolean, textColor: String, closeable: Boolean }, emits: ["close"], setup(e, { slots: t, emit: o }) {
  const n = (l) => {
    l.stopPropagation(), o("close", l);
  }, a = () => {
    var l;
    const { type: r, mark: s, plain: c, round: d, size: u, closeable: p } = e, v = { mark: s, plain: c, round: d };
    u && (v[u] = u);
    const h = p && i(ie, { name: "cross", class: [Ss("close"), Je], onClick: n }, null);
    return i("span", { style: e.plain ? { color: e.textColor || e.color, borderColor: e.color } : { color: e.textColor, background: e.color }, class: Ss([v, r]) }, [(l = t.default) == null ? void 0 : l.call(t), h]);
  };
  return () => i(wn, { name: e.closeable ? "van-fade" : void 0 }, { default: () => [e.show ? a() : null] });
} });
const Ro = Z(Hv), xi = { name: Ae, disabled: Boolean, iconSize: G, modelValue: Ae, checkedColor: String, labelPosition: String, labelDisabled: Boolean };
var fd = z({ props: ae({}, xi, { bem: We(Function), role: String, shape: String, parent: Object, checked: Boolean, bindGroup: W, indeterminate: { type: Boolean, default: null } }), emits: ["click", "toggle"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = (v) => {
    if (e.parent && e.bindGroup) return e.parent.props[v];
  }, l = E(() => {
    if (e.parent && e.bindGroup) {
      const v = a("disabled") || e.disabled;
      if (e.role === "checkbox") {
        const h = a("modelValue").length, g = a("max");
        return v || g && h >= +g && !e.checked;
      }
      return v;
    }
    return e.disabled;
  }), r = E(() => a("direction")), s = E(() => {
    const v = e.checkedColor || a("checkedColor");
    if (v && e.checked && !l.value) return { borderColor: v, backgroundColor: v };
  }), c = E(() => e.shape || a("shape") || "round"), d = (v) => {
    const { target: h } = v, g = n.value, f = g === h || (g == null ? void 0 : g.contains(h));
    l.value || !f && e.labelDisabled || t("toggle"), t("click", v);
  }, u = () => {
    var v, h;
    const { bem: g, checked: f, indeterminate: b } = e, w = e.iconSize || a("iconSize");
    return i("div", { ref: n, class: g("icon", [c.value, { disabled: l.value, checked: f, indeterminate: b }]), style: c.value !== "dot" ? { fontSize: ce(w) } : { width: ce(w), height: ce(w), borderColor: (v = s.value) == null ? void 0 : v.borderColor } }, [o.icon ? o.icon({ checked: f, disabled: l.value }) : c.value !== "dot" ? i(ie, { name: b ? "minus" : "success", style: s.value }, null) : i("div", { class: g("icon--dot__icon"), style: { backgroundColor: (h = s.value) == null ? void 0 : h.backgroundColor } }, null)]);
  }, p = () => {
    const { checked: v } = e;
    if (o.default) return i("span", { class: e.bem("label", [e.labelPosition, { disabled: l.value }]) }, [o.default({ checked: v, disabled: l.value })]);
  };
  return () => {
    const v = e.labelPosition === "left" ? [p(), u()] : [u(), p()];
    return i("div", { role: e.role, class: e.bem([{ disabled: l.value, "label-disabled": e.labelDisabled }, r.value]), tabindex: l.value ? void 0 : 0, "aria-checked": e.checked, onClick: d }, [v]);
  };
} });
const Uv = ae({}, xi, { shape: String }), [qv, Wv] = Y("radio");
var Yv = z({ name: qv, props: Uv, emits: ["update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { parent: n } = Ge(dd), a = () => {
    n ? n.updateValue(e.name) : t("update:modelValue", e.name);
  };
  return () => i(fd, Q({ bem: Wv, role: "radio", parent: n, checked: (n ? n.props.modelValue : e.modelValue) === e.name, onToggle: a }, e), he(o, ["default", "icon"]));
} });
const Si = Z(Yv), [Xv, Gv] = Y("checkbox");
var Zv = z({ name: Xv, props: ae({}, xi, { shape: String, bindGroup: W, indeterminate: { type: Boolean, default: null } }), emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { parent: n } = Ge(vd), a = E(() => n && e.bindGroup ? n.props.modelValue.indexOf(e.name) !== -1 : !!e.modelValue), l = (r = !a.value) => {
    n && e.bindGroup ? ((s) => {
      const { name: c } = e, { max: d, modelValue: u } = n.props, p = u.slice();
      if (s) d && p.length >= +d || p.includes(c) || (p.push(c), e.bindGroup && n.updateValue(p));
      else {
        const v = p.indexOf(c);
        v !== -1 && (p.splice(v, 1), e.bindGroup && n.updateValue(p));
      }
    })(r) : t("update:modelValue", r), e.indeterminate !== null && t("change", r);
  };
  return U(() => e.modelValue, (r) => {
    e.indeterminate === null && t("change", r);
  }), pe({ toggle: l, props: e, checked: a }), xo(() => e.modelValue), () => i(fd, Q({ bem: Gv, role: "checkbox", parent: n, checked: a.value, onToggle: l }, e), he(o, ["default", "icon"]));
} });
const na = Z(Zv), [Kv, Zo] = Y("address-item");
var Jv = z({ name: Kv, props: { address: We(Object), disabled: Boolean, switchable: Boolean, singleChoice: Boolean, defaultTagText: String, rightIcon: J("edit") }, emits: ["edit", "click", "select"], setup(e, { slots: t, emit: o }) {
  const n = (r) => {
    e.switchable && o("select"), o("click", r);
  }, a = () => i(ie, { name: e.rightIcon, class: Zo("edit"), onClick: (r) => {
    r.stopPropagation(), o("edit"), o("click", r);
  } }, null), l = () => {
    const { address: r, disabled: s, switchable: c, singleChoice: d } = e, u = [i("div", { class: Zo("name") }, [`${r.name} ${r.tel}`, t.tag ? t.tag(e.address) : e.address.isDefault && e.defaultTagText ? i(Ro, { type: "primary", round: !0, class: Zo("tag") }, { default: () => [e.defaultTagText] }) : void 0]), i("div", { class: Zo("address") }, [r.address])];
    return c && !s ? i(d ? Si : na, { name: r.id, iconSize: 18 }, { default: () => [u] }) : u;
  };
  return () => {
    var r;
    const { disabled: s } = e;
    return i("div", { class: Zo({ disabled: s }), onClick: n }, [i(dt, { border: !1, titleClass: Zo("title") }, { title: l, "right-icon": a }), (r = t.bottom) == null ? void 0 : r.call(t, ae({}, e.address, { disabled: s }))]);
  };
} });
const [Qv, ya, e2] = Y("address-list");
var t2 = z({ name: Qv, props: { list: Ve(), modelValue: [...G, Array], switchable: W, disabledText: String, disabledList: Ve(), showAddButton: W, addButtonText: String, defaultTagText: String, rightIcon: J("edit") }, emits: ["add", "edit", "select", "clickItem", "editDisabled", "selectDisabled", "update:modelValue"], setup(e, { slots: t, emit: o }) {
  const n = E(() => !Array.isArray(e.modelValue)), a = (l, r) => {
    if (l) return l.map((s, c) => ((d, u, p) => i(Jv, { key: d.id, address: d, disabled: p, switchable: e.switchable, singleChoice: n.value, defaultTagText: e.defaultTagText, rightIcon: e.rightIcon, onEdit: () => o(p ? "editDisabled" : "edit", d, u), onClick: (v) => o("clickItem", d, u, { event: v }), onSelect: () => {
      if (o(p ? "selectDisabled" : "select", d, u), !p) if (n.value) o("update:modelValue", d.id);
      else {
        const v = e.modelValue;
        v.includes(d.id) ? o("update:modelValue", v.filter((h) => h !== d.id)) : o("update:modelValue", [...v, d.id]);
      }
    } }, { bottom: t["item-bottom"], tag: t.tag }))(s, c, r));
  };
  return () => {
    var l, r;
    const s = a(e.list), c = a(e.disabledList, !0), d = e.disabledText && i("div", { class: ya("disabled-text") }, [e.disabledText]);
    return i("div", { class: ya() }, [(l = t.top) == null ? void 0 : l.call(t), !n.value && Array.isArray(e.modelValue) ? i(wi, { modelValue: e.modelValue }, { default: () => [s] }) : i(yi, { modelValue: e.modelValue }, { default: () => [s] }), d, c, (r = t.default) == null ? void 0 : r.call(t), e.showAddButton ? i("div", { class: [ya("bottom"), "van-safe-area-bottom"] }, [i(Le, { round: !0, block: !0, type: "primary", text: e.addButtonText || e2("add"), class: ya("add"), onClick: () => o("add") }, null)]) : void 0]);
  };
} });
const o2 = Z(t2);
var n2 = {};
const [a2, er] = Y("back-top");
var l2 = z({ name: a2, inheritAttrs: !1, props: { right: G, bottom: G, zIndex: G, target: [String, Object], offset: te(200), immediate: Boolean, teleport: { type: [String, Object], default: "body" } }, emits: ["click"], setup(e, { emit: t, slots: o, attrs: n }) {
  let a = !1;
  const l = A(!1), r = A(), s = A(), c = E(() => ae(ro(e.zIndex), { right: ce(e.right), bottom: ce(e.bottom) })), d = (v) => {
    var h;
    t("click", v), (h = s.value) == null || h.scrollTo({ top: 0, behavior: e.immediate ? "auto" : "smooth" });
  }, u = () => {
    l.value = !!s.value && no(s.value) >= +e.offset;
  }, p = () => {
    bt && ne(() => {
      s.value = e.target ? (() => {
        const { target: v } = e;
        if (typeof v != "string") return v;
        {
          const h = document.querySelector(v);
          if (h) return h;
          n2.NODE_ENV !== "production" && console.error(`[Vant] BackTop: target element "${v}" was not found, the BackTop component will not be rendered.`);
        }
      })() : ii(r.value), u();
    });
  };
  return Ne("scroll", /* @__PURE__ */ function(v, h) {
    let g = null, f = 0;
    return function(...b) {
      if (g) return;
      const w = () => {
        f = Date.now(), g = !1, v.apply(this, b);
      };
      Date.now() - f >= h ? w() : g = setTimeout(w, h);
    };
  }(u, 100), { target: s }), Ce(p), st(() => {
    a && (l.value = !0, a = !1);
  }), ot(() => {
    l.value && e.teleport && (l.value = !1, a = !0);
  }), U(() => e.target, p), () => {
    const v = i("div", Q({ ref: e.teleport ? void 0 : r, class: er({ active: l.value }), style: c.value, onClick: d }, n), [o.default ? o.default() : i(ie, { name: "back-top", class: er("icon") }, null)]);
    return e.teleport ? [i("div", { ref: r, class: er("placeholder") }, null), i(Lt, { to: e.teleport }, { default: () => [v] })] : v;
  };
} });
const r2 = Z(l2), i2 = { top: te(10), rows: te(4), duration: te(4e3), autoPlay: W, delay: _e(300), modelValue: Ve() }, [s2, ks] = Y("barrage");
var c2 = z({ name: s2, props: i2, emits: ["update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = ks("item"), l = A(0), r = [], s = A(!0), c = A(e.autoPlay), d = ({ id: v, text: h }, g) => {
    var f;
    const b = ((y, k = e.delay) => {
      const C = document.createElement("span");
      return C.className = a, C.innerText = String(y), C.style.animationDuration = `${e.duration}ms`, C.style.animationDelay = `${k}ms`, C.style.animationName = "van-barrage", C.style.animationTimingFunction = "linear", C;
    })(h, s.value ? g * e.delay : void 0);
    e.autoPlay || c.value !== !1 || (b.style.animationPlayState = "paused"), (f = n.value) == null || f.append(b), l.value++;
    const w = (l.value - 1) % +e.rows * b.offsetHeight + +e.top;
    b.style.top = `${w}px`, b.dataset.id = String(v), r.push(b), b.addEventListener("animationend", () => {
      t("update:modelValue", [...e.modelValue].filter((y) => String(y.id) !== b.dataset.id));
    });
  }, u = (v, h) => {
    const g = new Map(h.map((f) => [f.id, f]));
    v.forEach((f, b) => {
      g.has(f.id) ? g.delete(f.id) : d(f, b);
    }), g.forEach((f) => {
      const b = r.findIndex((w) => w.dataset.id === String(f.id));
      b > -1 && (r[b].remove(), r.splice(b, 1));
    }), s.value = !1;
  };
  U(() => e.modelValue.slice(), (v, h) => u(v ?? [], h ?? []), { deep: !0 });
  const p = A({});
  return Ce(() => {
    return v = this, h = null, g = function* () {
      var f;
      p.value["--move-distance"] = `-${(f = n.value) == null ? void 0 : f.offsetWidth}px`, yield ne(), u(e.modelValue, []);
    }, new Promise((f, b) => {
      var w = (C) => {
        try {
          k(g.next(C));
        } catch (S) {
          b(S);
        }
      }, y = (C) => {
        try {
          k(g.throw(C));
        } catch (S) {
          b(S);
        }
      }, k = (C) => C.done ? f(C.value) : Promise.resolve(C.value).then(w, y);
      k((g = g.apply(v, h)).next());
    });
    var v, h, g;
  }), pe({ play: () => {
    c.value = !0, r.forEach((v) => {
      v.style.animationPlayState = "running";
    });
  }, pause: () => {
    c.value = !1, r.forEach((v) => {
      v.style.animationPlayState = "paused";
    });
  } }), () => {
    var v;
    return i("div", { class: ks(), ref: n, style: p.value }, [(v = o.default) == null ? void 0 : v.call(o)]);
  };
} });
const u2 = Z(c2), [d2, je, Kt] = Y("calendar");
function Eo(e, t) {
  const o = e.getFullYear(), n = t.getFullYear();
  if (o === n) {
    const a = e.getMonth(), l = t.getMonth();
    return a === l ? 0 : a > l ? 1 : -1;
  }
  return o > n ? 1 : -1;
}
function lt(e, t) {
  const o = Eo(e, t);
  if (o === 0) {
    const n = e.getDate(), a = t.getDate();
    return n === a ? 0 : n > a ? 1 : -1;
  }
  return o;
}
const fn = (e) => new Date(e), Cs = (e) => Array.isArray(e) ? e.map(fn) : fn(e);
function ki(e, t) {
  const o = fn(e);
  return o.setDate(o.getDate() + t), o;
}
function Ci(e, t) {
  const o = fn(e);
  return o.setMonth(o.getMonth() + t), o.getDate() !== e.getDate() && o.setDate(0), o;
}
function md(e, t) {
  const o = fn(e);
  return o.setFullYear(o.getFullYear() + t), o.getDate() !== e.getDate() && o.setDate(0), o;
}
const Lr = (e) => ki(e, -1), Fr = (e) => ki(e, 1), Ts = (e) => Ci(e, -1), Os = (e) => Ci(e, 1), Bs = (e) => md(e, -1), Vs = (e) => md(e, 1), wa = () => {
  const e = /* @__PURE__ */ new Date();
  return e.setHours(0, 0, 0, 0), e;
}, hd = ae({}, Pl, { modelValue: Ve(), filter: Function, formatter: { type: Function, default: (e, t) => t } }), gd = Object.keys(Pl), bd = (e, t) => 32 - new Date(e, t - 1, 32).getDate(), un = (e, t, o, n, a, l) => {
  const r = function(s, c) {
    if (s < 0) return [];
    const d = Array(s);
    let u = -1;
    for (; ++u < s; ) d[u] = c(u);
    return d;
  }(t - e + 1, (s) => {
    const c = Tt(e + s);
    return n(o, { text: c, value: c });
  });
  return a ? a(o, r, l) : r;
}, yd = (e, t) => e.map((o, n) => {
  const a = t[n];
  if (a.length) {
    const l = +a[0].value, r = +a[a.length - 1].value;
    return Tt(qe(+o, l, r));
  }
  return o;
}), [p2] = Y("calendar-day");
var v2 = z({ name: p2, props: { item: We(Object), color: String, index: Number, offset: _e(0), rowHeight: String }, emits: ["click", "clickDisabledDate"], setup(e, { emit: t, slots: o }) {
  const n = E(() => {
    const { item: c, index: d, color: u, offset: p, rowHeight: v } = e, h = { height: v };
    if (c.type === "placeholder") return h.width = "100%", h;
    if (d === 0 && (h.marginLeft = 100 * p / 7 + "%"), u) switch (c.type) {
      case "end":
      case "start":
      case "start-end":
      case "multiple-middle":
      case "multiple-selected":
        h.background = u;
        break;
      case "middle":
        h.color = u;
    }
    return c.date && function(g, f = 0) {
      const b = new Date(g.getFullYear(), g.getMonth() + 1, 0), w = f + g.getDate() - 1, y = f + b.getDate() - 1;
      return Math.floor(w / 7) === Math.floor(y / 7);
    }(c.date, p) && (h.marginBottom = 0), h;
  }), a = () => {
    e.item.type !== "disabled" ? t("click", e.item) : t("clickDisabledDate", e.item);
  }, l = () => {
    const { topInfo: c } = e.item;
    if (c || o["top-info"]) return i("div", { class: je("top-info") }, [o["top-info"] ? o["top-info"](e.item) : c]);
  }, r = () => {
    const { bottomInfo: c } = e.item;
    if (c || o["bottom-info"]) return i("div", { class: je("bottom-info") }, [o["bottom-info"] ? o["bottom-info"](e.item) : c]);
  }, s = () => {
    const { item: c, color: d, rowHeight: u } = e, { type: p } = c, v = [l(), o.text ? o.text(e.item) : e.item.text, r()];
    return p === "selected" ? i("div", { class: je("selected-day"), style: { width: u, height: u, background: d } }, [v]) : v;
  };
  return () => {
    const { type: c, className: d } = e.item;
    return c === "placeholder" ? i("div", { class: je("day"), style: n.value }, null) : i("div", { role: "gridcell", style: n.value, class: [je("day", c), d], tabindex: c === "disabled" ? void 0 : -1, onClick: a }, [s()]);
  };
} });
const [f2] = Y("calendar-month");
var m2 = z({ name: f2, props: { date: We(Date), type: String, color: String, minDate: Date, maxDate: Date, showMark: Boolean, rowHeight: G, formatter: Function, lazyRender: Boolean, currentDate: [Date, Array], allowSameDay: Boolean, showSubtitle: Boolean, showMonthTitle: Boolean, firstDayOfWeek: Number }, emits: ["click", "clickDisabledDate"], setup(e, { emit: t, slots: o }) {
  const [n, a] = function(S = !1) {
    const O = A(S);
    return [O, (B = !O.value) => {
      O.value = B;
    }];
  }(), l = A(), r = A(), s = Iu(r), c = E(() => {
    return S = e.date, Kt("monthTitle", S.getFullYear(), S.getMonth() + 1);
    var S;
  }), d = E(() => ce(e.rowHeight)), u = E(() => {
    const S = e.date.getDate(), O = (e.date.getDay() - S % 7 + 8) % 7;
    return e.firstDayOfWeek ? (O + 7 - e.firstDayOfWeek) % 7 : O;
  }), p = E(() => bd(e.date.getFullYear(), e.date.getMonth() + 1)), v = E(() => n.value || !e.lazyRender), h = (S) => {
    const { type: O, minDate: B, maxDate: m, currentDate: x } = e;
    if (B && lt(S, B) < 0 || m && lt(S, m) > 0) return "disabled";
    if (x === null) return "";
    if (Array.isArray(x)) {
      if (O === "multiple") return ((T) => {
        const V = (P) => e.currentDate.some((N) => lt(N, P) === 0);
        if (V(T)) {
          const P = Lr(T), N = Fr(T), j = V(P), F = V(N);
          return j && F ? "multiple-middle" : j ? "end" : F ? "start" : "multiple-selected";
        }
        return "";
      })(S);
      if (O === "range") return ((T) => {
        const [V, P] = e.currentDate;
        if (!V) return "";
        const N = lt(T, V);
        if (!P) return N === 0 ? "start" : "";
        const j = lt(T, P);
        return e.allowSameDay && N === 0 && j === 0 ? "start-end" : N === 0 ? "start" : j === 0 ? "end" : N > 0 && j < 0 ? "middle" : "";
      })(S);
    } else if (O === "single") return lt(S, x) === 0 ? "selected" : "";
    return "";
  }, g = (S) => {
    if (e.type === "range") {
      if (S === "start" || S === "end") return Kt(S);
      if (S === "start-end") return `${Kt("start")}/${Kt("end")}`;
    }
  }, f = () => {
    if (e.showMonthTitle) return i("div", { class: je("month-title") }, [o["month-title"] ? o["month-title"]({ date: e.date, text: c.value }) : c.value]);
  }, b = () => {
    if (e.showMark && v.value) return i("div", { class: je("month-mark") }, [e.date.getMonth() + 1]);
  }, w = E(() => {
    const S = Math.ceil((p.value + u.value) / 7);
    return Array(S).fill({ type: "placeholder" });
  }), y = E(() => {
    const S = [], O = e.date.getFullYear(), B = e.date.getMonth();
    for (let m = 1; m <= p.value; m++) {
      const x = new Date(O, B, m), T = h(x);
      let V = { date: x, type: T, text: m, bottomInfo: g(T) };
      e.formatter && (V = e.formatter(V)), S.push(V);
    }
    return S;
  }), k = E(() => y.value.filter((S) => S.type === "disabled")), C = (S, O) => i(v2, { item: S, index: O, color: e.color, offset: u.value, rowHeight: d.value, onClick: (B) => t("click", B), onClickDisabledDate: (B) => t("clickDisabledDate", B) }, he(o, ["top-info", "bottom-info", "text"]));
  return pe({ getTitle: () => c.value, getHeight: () => s.value, setVisible: a, scrollToDate: (S, O) => {
    if (l.value) {
      const B = we(l.value), m = w.value.length, x = (Math.ceil((O.getDate() + u.value) / 7) - 1) * B.height / m;
      cl(S, B.top + x + S.scrollTop - we(S).top);
    }
  }, disabledDays: k }), () => i("div", { class: je("month"), ref: r }, [f(), i("div", { ref: l, role: "grid", class: je("days") }, [b(), (v.value ? y : w).value.map(C)])]);
} });
const [h2] = Y("calendar-header");
var g2 = z({ name: h2, props: { date: Date, minDate: Date, maxDate: Date, title: String, subtitle: String, showTitle: Boolean, showSubtitle: Boolean, firstDayOfWeek: Number, switchMode: J("none") }, emits: ["clickSubtitle", "panelChange"], setup(e, { slots: t, emit: o }) {
  const n = E(() => e.date && e.minDate && Eo(Ts(e.date), e.minDate) < 0), a = E(() => e.date && e.minDate && Eo(Bs(e.date), e.minDate) < 0), l = E(() => e.date && e.maxDate && Eo(Os(e.date), e.maxDate) > 0), r = E(() => e.date && e.maxDate && Eo(Vs(e.date), e.maxDate) > 0), s = () => {
    if (e.showTitle) {
      const h = e.title || Kt("title"), g = t.title ? t.title() : h;
      return i("div", { class: je("header-title") }, [g]);
    }
  }, c = (h) => o("clickSubtitle", h), d = (h) => o("panelChange", h), u = (h) => {
    const g = e.switchMode === "year-month", f = t[h ? "next-month" : "prev-month"], b = t[h ? "next-year" : "prev-year"], w = h ? l.value : n.value, y = h ? r.value : a.value, k = h ? "arrow" : "arrow-left", C = h ? "arrow-double-right" : "arrow-double-left", S = i("view", { class: je("header-action", { disabled: w }), onClick: w ? void 0 : () => d((h ? Os : Ts)(e.date)) }, [f ? f({ disabled: w }) : i(ie, { class: { [Je]: !w }, name: k }, null)]), O = g && i("view", { class: je("header-action", { disabled: y }), onClick: y ? void 0 : () => d((h ? Vs : Bs)(e.date)) }, [b ? b({ disabled: y }) : i(ie, { class: { [Je]: !y }, name: C }, null)]);
    return h ? [S, O] : [O, S];
  }, p = () => {
    if (e.showSubtitle) {
      const h = t.subtitle ? t.subtitle({ date: e.date, text: e.subtitle }) : e.subtitle, g = e.switchMode !== "none";
      return i("div", { class: je("header-subtitle", { "with-switch": g }), onClick: c }, [g ? [u(), i("div", { class: je("header-subtitle-text") }, [h]), u(!0)] : h]);
    }
  }, v = () => {
    const { firstDayOfWeek: h } = e, g = Kt("weekdays"), f = [...g.slice(h, 7), ...g.slice(0, h)];
    return i("div", { class: je("weekdays") }, [f.map((b) => i("span", { class: je("weekday") }, [b]))]);
  };
  return () => i("div", { class: je("header") }, [s(), p(), v()]);
} }), b2 = z({ name: d2, props: { show: Boolean, type: J("single"), switchMode: J("none"), title: String, color: String, round: W, readonly: Boolean, poppable: W, maxRange: te(null), position: J("bottom"), teleport: [String, Object], showMark: W, showTitle: W, formatter: Function, rowHeight: G, confirmText: String, rangePrompt: String, lazyRender: W, showConfirm: W, defaultDate: [Date, Array], allowSameDay: Boolean, showSubtitle: W, closeOnPopstate: W, showRangePrompt: W, confirmDisabledText: String, closeOnClickOverlay: W, safeAreaInsetTop: Boolean, safeAreaInsetBottom: W, minDate: { type: Date, validator: Xn }, maxDate: { type: Date, validator: Xn }, firstDayOfWeek: { type: G, default: 0, validator: (e) => e >= 0 && e <= 6 } }, emits: ["select", "confirm", "unselect", "monthShow", "overRange", "update:show", "clickSubtitle", "clickDisabledDate", "clickOverlay", "panelChange"], setup(e, { emit: t, slots: o }) {
  const n = E(() => e.switchMode !== "none"), a = E(() => e.minDate || n.value ? e.minDate : wa()), l = E(() => e.maxDate || n.value ? e.maxDate : Ci(wa(), 6)), r = (R, _ = a.value, $ = l.value) => _ && lt(R, _) === -1 ? _ : $ && lt(R, $) === 1 ? $ : R, s = (R = e.defaultDate) => {
    const { type: _, allowSameDay: $ } = e;
    if (R === null) return R;
    const L = wa();
    if (_ === "range") {
      Array.isArray(R) || (R = []), R.length === 1 && lt(R[0], L) === 1 && (R = []);
      const K = a.value, D = l.value;
      return [r(R[0] || L, K, D ? $ ? D : Lr(D) : void 0), r(R[1] || ($ ? L : Fr(L)), K ? $ ? K : Fr(K) : void 0)];
    }
    return _ === "multiple" ? Array.isArray(R) ? R.map((K) => r(K)) : [r(L)] : (R && !Array.isArray(R) || (R = L), r(R));
  };
  let c;
  const d = A(), u = A(s()), p = A((Array.isArray(u.value) ? u.value[0] : u.value) || r(wa())), v = A(), [h, g] = ia(), f = E(() => e.firstDayOfWeek ? +e.firstDayOfWeek % 7 : 0), b = E(() => {
    const R = [];
    if (!a.value || !l.value) return R;
    const _ = new Date(a.value);
    _.setDate(1);
    do
      R.push(new Date(_)), _.setMonth(_.getMonth() + 1);
    while (Eo(_, l.value) !== 1);
    return R;
  }), w = E(() => {
    if (u.value) {
      if (e.type === "range") return !u.value[0] || !u.value[1];
      if (e.type === "multiple") return !u.value.length;
    }
    return !u.value;
  }), y = () => {
    const R = no(d.value), _ = R + c, $ = b.value.map((M, q) => h.value[q].getHeight());
    if (_ > $.reduce((M, q) => M + q, 0) && R > 0) return;
    let L, K = 0;
    const D = [-1, -1];
    for (let M = 0; M < b.value.length; M++) {
      const q = h.value[M];
      K <= _ && K + $[M] >= R && (D[1] = M, L || (L = q, D[0] = M), h.value[M].showed || (h.value[M].showed = !0, t("monthShow", { date: q.date, title: q.getTitle() }))), K += $[M];
    }
    b.value.forEach((M, q) => {
      const X = q >= D[0] - 1 && q <= D[1] + 1;
      h.value[q].setVisible(X);
    }), L && (v.value = L);
  }, k = (R) => {
    n.value ? p.value = R : Ke(() => {
      b.value.some((_, $) => Eo(_, R) === 0 && (d.value && h.value[$].scrollToDate(d.value, R), !0)), y();
    });
  }, C = () => {
    if (!e.poppable || e.show) if (u.value) {
      const R = e.type === "single" ? u.value : u.value[0];
      Xn(R) && k(R);
    } else n.value || Ke(y);
  }, S = () => {
    e.poppable && !e.show || (n.value || Ke(() => {
      c = Math.floor(we(d).height);
    }), C());
  }, O = (R = s()) => {
    u.value = R, C();
  }, B = (R) => {
    p.value = R, t("panelChange", { date: R });
  }, m = () => {
    var R;
    return t("confirm", (R = u.value) != null ? R : Cs(u.value));
  }, x = (R, _) => {
    const $ = (L) => {
      u.value = L, t("select", Cs(L));
    };
    if (_ && e.type === "range" && !((K) => {
      const { maxRange: D, rangePrompt: M, showRangePrompt: q } = e;
      return !(D && function(X) {
        const ee = X[0].getTime();
        return (X[1].getTime() - ee) / 864e5 + 1;
      }(K) > +D && (q && vl(M || Kt("rangePrompt", D)), t("overRange"), 1));
    })(R))
      return void $([R[0], ki(R[0], +e.maxRange - 1)]);
    $(R), _ && !e.showConfirm && m();
  }, T = E(() => h.value.reduce((R, _) => {
    var $, L;
    return R.push(...(L = ($ = _.disabledDays) == null ? void 0 : $.value) != null ? L : []), R;
  }, [])), V = (R) => {
    if (e.readonly || !R.date) return;
    const { date: _ } = R, { type: $ } = e;
    if ($ === "range") {
      if (!u.value) return void x([_]);
      const [L, K] = u.value;
      if (L && !K) {
        const D = lt(_, L);
        if (D === 1) {
          const M = ((q, X, ee) => {
            var oe;
            return (oe = q.find((se) => lt(X, se.date) === -1 && lt(se.date, ee) === -1)) == null ? void 0 : oe.date;
          })(T.value, L, _);
          if (M) {
            const q = Lr(M);
            lt(L, q) === -1 ? x([L, q]) : x([_]);
          } else x([L, _], !0);
        } else D === -1 ? x([_]) : e.allowSameDay && x([_, _], !0);
      } else x([_]);
    } else if ($ === "multiple") {
      if (!u.value) return void x([_]);
      const L = u.value, K = L.findIndex((D) => lt(D, _) === 0);
      if (K !== -1) {
        const [D] = L.splice(K, 1);
        t("unselect", fn(D));
      } else e.maxRange && L.length >= +e.maxRange ? vl(e.rangePrompt || Kt("rangePrompt", e.maxRange)) : x([...L, _]);
    } else x(_, !0);
  }, P = (R) => t("clickOverlay", R), N = (R) => t("update:show", R), j = (R, _) => {
    const $ = _ !== 0 || !e.showSubtitle;
    return i(m2, Q({ ref: n.value ? v : g(_), date: R, currentDate: u.value, showMonthTitle: $, firstDayOfWeek: f.value, lazyRender: !n.value && e.lazyRender, maxDate: l.value, minDate: a.value }, he(e, ["type", "color", "showMark", "formatter", "rowHeight", "showSubtitle", "allowSameDay"]), { onClick: V, onClickDisabledDate: (L) => t("clickDisabledDate", L) }), he(o, ["top-info", "bottom-info", "month-title", "text"]));
  }, F = () => {
    if (o.footer) return o.footer();
    if (e.showConfirm) {
      const R = o["confirm-text"], _ = w.value, $ = _ ? e.confirmDisabledText : e.confirmText;
      return i(Le, { round: !0, block: !0, type: "primary", color: e.color, class: je("confirm"), disabled: _, nativeType: "button", onClick: m }, { default: () => [R ? R({ disabled: _ }) : $ || Kt("confirm")] });
    }
  }, I = () => {
    var R, _;
    return i("div", { class: je() }, [i(g2, { date: (R = v.value) == null ? void 0 : R.date, maxDate: l.value, minDate: a.value, title: e.title, subtitle: (_ = v.value) == null ? void 0 : _.getTitle(), showTitle: e.showTitle, showSubtitle: e.showSubtitle, switchMode: e.switchMode, firstDayOfWeek: f.value, onClickSubtitle: ($) => t("clickSubtitle", $), onPanelChange: B }, he(o, ["title", "subtitle", "prev-month", "prev-year", "next-month", "next-year"])), i("div", { ref: d, class: je("body"), onScroll: n.value ? void 0 : y }, [n.value ? j(p.value, 0) : b.value.map(j)]), i("div", { class: [je("footer"), { "van-safe-area-bottom": e.safeAreaInsetBottom }] }, [F()])]);
  };
  return U(() => e.show, S), U(() => [e.type, e.minDate, e.maxDate, e.switchMode], () => O(s(u.value))), U(() => e.defaultDate, (R) => {
    O(R);
  }), pe({ reset: O, scrollToDate: k, getSelectedDate: () => u.value }), xn(S), () => e.poppable ? i(xt, { show: e.show, class: je("popup"), round: e.round, position: e.position, closeable: e.showTitle || e.showSubtitle, teleport: e.teleport, closeOnPopstate: e.closeOnPopstate, safeAreaInsetTop: e.safeAreaInsetTop, closeOnClickOverlay: e.closeOnClickOverlay, onClickOverlay: P, "onUpdate:show": N }, { default: I }) : I();
} });
const y2 = Z(b2), [w2, Ko] = Y("image");
var x2 = z({ name: w2, props: { src: String, alt: String, fit: String, position: String, round: Boolean, block: Boolean, width: G, height: G, radius: G, lazyLoad: Boolean, iconSize: G, showError: W, errorIcon: J("photo-fail"), iconPrefix: String, showLoading: W, loadingIcon: J("photo"), crossorigin: String, referrerpolicy: String }, emits: ["load", "error"], setup(e, { emit: t, slots: o }) {
  const n = A(!1), a = A(!0), l = A(), { $Lazyload: r } = Xe().proxy, s = E(() => {
    const f = { width: ce(e.width), height: ce(e.height) };
    return fe(e.radius) && (f.overflow = "hidden", f.borderRadius = ce(e.radius)), f;
  });
  U(() => e.src, () => {
    n.value = !1, a.value = !0;
  });
  const c = (f) => {
    a.value && (a.value = !1, t("load", f));
  }, d = () => {
    const f = new Event("load");
    Object.defineProperty(f, "target", { value: l.value, enumerable: !0 }), c(f);
  }, u = (f) => {
    n.value = !0, a.value = !1, t("error", f);
  }, p = (f, b, w) => w ? w() : i(ie, { name: f, size: e.iconSize, class: b, classPrefix: e.iconPrefix }, null), v = () => {
    if (n.value || !e.src) return;
    const f = { alt: e.alt, class: Ko("img"), style: { objectFit: e.fit, objectPosition: e.position }, crossorigin: e.crossorigin, referrerpolicy: e.referrerpolicy };
    return e.lazyLoad ? De(i("img", Q({ ref: l }, f), null), [[P1("lazy"), e.src]]) : i("img", Q({ ref: l, src: e.src, onLoad: c, onError: u }, f), null);
  }, h = ({ el: f }) => {
    const b = () => {
      f === l.value && a.value && d();
    };
    l.value ? b() : ne(b);
  }, g = ({ el: f }) => {
    f !== l.value || n.value || u();
  };
  return r && bt && (r.$on("loaded", h), r.$on("error", g), yt(() => {
    r.$off("loaded", h), r.$off("error", g);
  })), Ce(() => {
    ne(() => {
      var f;
      (f = l.value) != null && f.complete && !e.lazyLoad && d();
    });
  }), () => {
    var f;
    return i("div", { class: Ko({ round: e.round, block: e.block }), style: s.value }, [v(), a.value && e.showLoading ? i("div", { class: Ko("loading") }, [p(e.loadingIcon, Ko("loading-icon"), o.loading)]) : n.value && e.showError ? i("div", { class: Ko("error") }, [p(e.errorIcon, Ko("error-icon"), o.error)]) : void 0, (f = o.default) == null ? void 0 : f.call(o)]);
  };
} });
const $l = Z(x2), [S2, tt] = Y("card");
var k2 = z({ name: S2, props: { tag: String, num: G, desc: String, thumb: String, title: String, price: G, centered: Boolean, lazyLoad: Boolean, currency: J("¥"), thumbLink: String, originPrice: G }, emits: ["clickThumb"], setup(e, { slots: t, emit: o }) {
  const n = () => {
    if (t.tag || e.tag) return i("div", { class: tt("tag") }, [t.tag ? t.tag() : i(Ro, { mark: !0, type: "primary" }, { default: () => [e.tag] })]);
  }, a = () => {
    if (t.thumb || e.thumb) return i("a", { href: e.thumbLink, class: tt("thumb"), onClick: (r) => o("clickThumb", r) }, [t.thumb ? t.thumb() : i($l, { src: e.thumb, fit: "cover", width: "100%", height: "100%", lazyLoad: e.lazyLoad }, null), n()]);
  }, l = () => {
    const r = e.price.toString().split(".");
    return i("div", null, [i("span", { class: tt("price-currency") }, [e.currency]), i("span", { class: tt("price-integer") }, [r[0]]), r.length > 1 && i(be, null, [mt("."), i("span", { class: tt("price-decimal") }, [r[1]])])]);
  };
  return () => {
    var r, s, c;
    const d = t.num || fe(e.num), u = t.price || fe(e.price), p = t["origin-price"] || fe(e.originPrice), v = d || u || p || t.bottom, h = u && i("div", { class: tt("price") }, [t.price ? t.price() : l()]), g = p && i("div", { class: tt("origin-price") }, [t["origin-price"] ? t["origin-price"]() : `${e.currency} ${e.originPrice}`]), f = d && i("div", { class: tt("num") }, [t.num ? t.num() : `x${e.num}`]), b = t.footer && i("div", { class: tt("footer") }, [t.footer()]), w = v && i("div", { class: tt("bottom") }, [(r = t["price-top"]) == null ? void 0 : r.call(t), h, g, f, (s = t.bottom) == null ? void 0 : s.call(t)]);
    return i("div", { class: tt() }, [i("div", { class: tt("header") }, [a(), i("div", { class: tt("content", { centered: e.centered }) }, [i("div", null, [t.title ? t.title() : e.title ? i("div", { class: [tt("title"), "van-multi-ellipsis--l2"] }, [e.title]) : void 0, t.desc ? t.desc() : e.desc ? i("div", { class: [tt("desc"), "van-ellipsis"] }, [e.desc]) : void 0, (c = t.tags) == null ? void 0 : c.call(t)]), w])]), b]);
  };
} });
const C2 = Z(k2), [T2, Ht, O2] = Y("cascader");
var B2 = z({ name: T2, props: { title: String, options: Ve(), closeable: W, swipeable: W, closeIcon: J("cross"), showHeader: W, modelValue: G, fieldNames: Object, placeholder: String, activeColor: String }, emits: ["close", "change", "finish", "clickTab", "update:modelValue"], setup(e, { slots: t, emit: o }) {
  const n = A([]), a = A(0), [l, r] = ia(), { text: s, value: c, children: d } = ae({ text: "text", value: "value", children: "children" }, e.fieldNames), u = (w, y) => {
    for (const k of w) {
      if (k[c] === y) return [k];
      if (k[d]) {
        const C = u(k[d], y);
        if (C) return [k, ...C];
      }
    }
  }, p = () => {
    const { options: w, modelValue: y } = e;
    if (y !== void 0) {
      const k = u(w, y);
      if (k) {
        let C = w;
        return n.value = k.map((S) => {
          const O = { options: C, selected: S }, B = C.find((m) => m[c] === S[c]);
          return B && (C = B[d]), O;
        }), C && n.value.push({ options: C, selected: null }), void ne(() => {
          a.value = n.value.length - 1;
        });
      }
    }
    n.value = [{ options: w, selected: null }];
  }, v = () => o("close"), h = ({ name: w, title: y }) => o("clickTab", w, y), g = (w, y, k) => {
    const { disabled: C } = w, S = !(!y || w[c] !== y[c]), O = w.color || (S ? e.activeColor : void 0), B = t.option ? t.option({ option: w, selected: S }) : i("span", null, [w[s]]);
    return i("li", { ref: S ? r(k) : void 0, role: "menuitemradio", class: [Ht("option", { selected: S, disabled: C }), w.className], style: { color: O }, tabindex: C ? void 0 : S ? 0 : -1, "aria-checked": S, "aria-disabled": C || void 0, onClick: () => ((m, x) => {
      if (m.disabled) return;
      if (n.value[x].selected = m, n.value.length > x + 1 && (n.value = n.value.slice(0, x + 1)), m[d]) {
        const P = { options: m[d], selected: null };
        n.value[x + 1] ? n.value[x + 1] = P : n.value.push(P), ne(() => {
          a.value++;
        });
      }
      const T = n.value.map((P) => P.selected).filter(Boolean);
      o("update:modelValue", m[c]);
      const V = { value: m[c], tabIndex: x, selectedOptions: T };
      o("change", V), m[d] || o("finish", V);
    })(w, k) }, [B, S ? i(ie, { name: "success", class: Ht("selected-icon") }, null) : null]);
  }, f = (w, y, k) => i("ul", { role: "menu", class: Ht("options") }, [w.map((C) => g(C, y, k))]), b = (w, y) => {
    const { options: k, selected: C } = w, S = e.placeholder || O2("select"), O = C ? C[s] : S;
    return i(oa, { title: O, titleClass: Ht("tab", { unselected: !C }) }, { default: () => {
      var B, m;
      return [(B = t["options-top"]) == null ? void 0 : B.call(t, { tabIndex: y }), f(k, C, y), (m = t["options-bottom"]) == null ? void 0 : m.call(t, { tabIndex: y })];
    } });
  };
  return p(), U(a, (w) => {
    const y = l.value[w];
    y && ((k) => {
      const C = k.parentElement;
      C && (C.scrollTop = k.offsetTop - (C.offsetHeight - k.offsetHeight) / 2);
    })(y);
  }), U(() => e.options, p, { deep: !0 }), U(() => e.modelValue, (w) => {
    w !== void 0 && n.value.map((k) => {
      var C;
      return (C = k.selected) == null ? void 0 : C[c];
    }).includes(w) || p();
  }), () => i("div", { class: Ht() }, [e.showHeader ? i("div", { class: Ht("header") }, [i("h2", { class: Ht("title") }, [t.title ? t.title() : e.title]), e.closeable ? i(ie, { name: e.closeIcon, class: [Ht("close-icon"), Je], onClick: v }, null) : null]) : null, i(El, { active: a.value, "onUpdate:active": (w) => a.value = w, shrink: !0, animated: !0, class: Ht("tabs"), color: e.activeColor, swipeable: e.swipeable, onClickTab: h }, { default: () => [n.value.map(b)] })]);
} });
const V2 = Z(B2), [D2, Ds] = Y("cell-group");
var A2 = z({ name: D2, inheritAttrs: !1, props: { title: String, inset: Boolean, border: W }, setup(e, { slots: t, attrs: o }) {
  const n = () => {
    var a;
    return i("div", Q({ class: [Ds({ inset: e.inset }), { [Bl]: e.border && !e.inset }] }, o, dl()), [(a = t.default) == null ? void 0 : a.call(t)]);
  };
  return () => e.title || t.title ? i(be, null, [i("div", { class: Ds("title", { inset: e.inset }) }, [t.title ? t.title() : e.title]), n()]) : n();
} });
const wd = Z(A2), [E2, xa] = Y("circle");
let P2 = 0;
const As = (e) => Math.min(Math.max(+e, 0), 100);
var I2 = z({ name: E2, props: { text: String, size: G, fill: J("none"), rate: te(100), speed: te(0), color: [String, Object], clockwise: W, layerColor: String, currentRate: _e(0), strokeWidth: te(40), strokeLinecap: String, startPosition: J("top") }, emits: ["update:currentRate"], setup(e, { emit: t, slots: o }) {
  const n = "van-circle-" + P2++, a = E(() => +e.strokeWidth + 1e3), l = E(() => function(u, p) {
    const v = u ? 1 : 0;
    return `M ${p / 2} ${p / 2} m 0, -500 a 500, 500 0 1, ${v} 0, 1000 a 500, 500 0 1, ${v} 0, -1000`;
  }(e.clockwise, a.value)), r = E(() => {
    const u = { top: 0, right: 90, bottom: 180, left: 270 }[e.startPosition];
    if (u) return { transform: `rotate(${u}deg)` };
  });
  U(() => e.rate, (u) => {
    let p;
    const v = Date.now(), h = e.currentRate, g = As(u), f = Math.abs(1e3 * (h - g) / +e.speed), b = () => {
      const w = Date.now(), y = Math.min((w - v) / f, 1) * (g - h) + h;
      t("update:currentRate", As(parseFloat(y.toFixed(1)))), (g > h ? y < g : y > g) && (p = Ke(b));
    };
    e.speed ? (p && sl(p), p = Ke(b)) : t("update:currentRate", g);
  }, { immediate: !0 });
  const s = () => {
    const { strokeWidth: u, currentRate: p, strokeLinecap: v } = e, h = 3140 * p / 100, g = oo(e.color) ? `url(#${n})` : e.color, f = { stroke: g, strokeWidth: +u + 1 + "px", strokeLinecap: v, strokeDasharray: `${h}px 3140px` };
    return i("path", { d: l.value, style: f, class: xa("hover"), stroke: g }, null);
  }, c = () => {
    const u = { fill: e.fill, stroke: e.layerColor, strokeWidth: `${e.strokeWidth}px` };
    return i("path", { class: xa("layer"), style: u, d: l.value }, null);
  }, d = () => {
    const { color: u } = e;
    if (!oo(u)) return;
    const p = Object.keys(u).sort((v, h) => parseFloat(v) - parseFloat(h)).map((v, h) => i("stop", { key: h, offset: v, "stop-color": u[v] }, null));
    return i("defs", null, [i("linearGradient", { id: n, x1: "100%", y1: "0%", x2: "0%", y2: "0%" }, [p])]);
  };
  return () => i("div", { class: xa(), style: lo(e.size) }, [i("svg", { viewBox: `0 0 ${a.value} ${a.value}`, style: r.value }, [d(), c(), s()]), o.default ? o.default() : e.text ? i("div", { class: xa("text") }, [e.text]) : void 0]);
} });
const $2 = Z(I2), [xd, j2] = Y("row"), Sd = Symbol(xd);
var z2 = z({ name: xd, props: { tag: J("div"), wrap: W, align: String, gutter: { type: [String, Number, Array], default: 0 }, justify: String }, setup(e, { slots: t }) {
  const { children: o, linkChildren: n } = Qe(Sd), a = E(() => {
    const s = [[]];
    let c = 0;
    return o.forEach((d, u) => {
      c += Number(d.span), c > 24 ? (s.push([u]), c -= 24) : s[s.length - 1].push(u);
    }), s;
  }), l = E(() => {
    let s = 0;
    s = Array.isArray(e.gutter) ? Number(e.gutter[0]) || 0 : Number(e.gutter);
    const c = [];
    return s && a.value.forEach((d) => {
      const u = s * (d.length - 1) / d.length;
      d.forEach((p, v) => {
        if (v === 0) c.push({ right: u });
        else {
          const h = s - c[p - 1].right, g = u - h;
          c.push({ left: h, right: g });
        }
      });
    }), c;
  }), r = E(() => {
    const { gutter: s } = e, c = [];
    if (Array.isArray(s) && s.length > 1) {
      const d = Number(s[1]) || 0;
      if (d <= 0) return c;
      a.value.forEach((u, p) => {
        p !== a.value.length - 1 && u.forEach(() => {
          c.push({ bottom: d });
        });
      });
    }
    return c;
  });
  return n({ spaces: l, verticalSpaces: r }), () => {
    const { tag: s, wrap: c, align: d, justify: u } = e;
    return i(s, { class: j2({ [`align-${d}`]: d, [`justify-${u}`]: u, nowrap: !c }) }, { default: () => {
      var p;
      return [(p = t.default) == null ? void 0 : p.call(t)];
    } });
  };
} });
const [R2, N2] = Y("col");
var M2 = z({ name: R2, props: { tag: J("div"), span: te(0), offset: G }, setup(e, { slots: t }) {
  const { parent: o, index: n } = Ge(Sd), a = E(() => {
    if (!o) return;
    const { spaces: l, verticalSpaces: r } = o;
    let s = {};
    if (l && l.value && l.value[n.value]) {
      const { left: d, right: u } = l.value[n.value];
      s = { paddingLeft: d ? `${d}px` : null, paddingRight: u ? `${u}px` : null };
    }
    const { bottom: c } = r.value[n.value] || {};
    return ae(s, { marginBottom: c ? `${c}px` : null });
  });
  return () => {
    const { tag: l, span: r, offset: s } = e;
    return i(l, { style: a.value, class: N2({ [r]: r, [`offset-${s}`]: s }) }, { default: () => {
      var c;
      return [(c = t.default) == null ? void 0 : c.call(t)];
    } });
  };
} });
const _r = Z(M2);
var L2 = {};
const [kd, F2] = Y("collapse"), Cd = Symbol(kd);
var _2 = z({ name: kd, props: { border: W, accordion: Boolean, modelValue: { type: [String, Number, Array], default: "" } }, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { linkChildren: n, children: a } = Qe(Cd), l = (r) => {
    t("change", r), t("update:modelValue", r);
  };
  return pe({ toggleAll: (r = {}) => {
    if (e.accordion) return;
    typeof r == "boolean" && (r = { expanded: r });
    const { expanded: s, skipDisabled: c } = r, d = a.filter((u) => u.disabled && c ? u.expanded.value : s ?? !u.expanded.value).map((u) => u.itemName.value);
    l(d);
  } }), n({ toggle: (r, s) => {
    const { accordion: c, modelValue: d } = e;
    l(c ? r === d ? "" : r : s ? d.concat(r) : d.filter((u) => u !== r));
  }, isExpanded: (r) => {
    const { accordion: s, modelValue: c } = e;
    return !(L2.NODE_ENV !== "production" && !function(d, u) {
      return u && Array.isArray(d) ? (console.error('[Vant] Collapse: "v-model" should not be Array in accordion mode'), !1) : !(!u && !Array.isArray(d) && (console.error('[Vant] Collapse: "v-model" should be Array in non-accordion mode'), 1));
    }(c, s)) && (s ? c === r : c.includes(r));
  } }), () => {
    var r;
    return i("div", { class: [F2(), { [Bl]: e.border }] }, [(r = o.default) == null ? void 0 : r.call(o)]);
  };
} });
const H2 = Z(_2);
var U2 = {};
const [q2, Sa] = Y("collapse-item"), W2 = ["icon", "title", "value", "label", "right-icon"];
var Y2 = z({ name: q2, props: ae({}, pl, { name: G, isLink: W, disabled: Boolean, readonly: Boolean, lazyRender: W }), setup(e, { slots: t }) {
  const o = A(), n = A(), { parent: a, index: l } = Ge(Cd);
  if (!a) return void (U2.NODE_ENV !== "production" && console.error("[Vant] <CollapseItem> must be a child component of <Collapse>."));
  const r = E(() => {
    var f;
    return (f = e.name) != null ? f : l.value;
  }), s = E(() => a.isExpanded(r.value)), c = A(s.value), d = vi(() => c.value || !e.lazyRender), u = () => {
    s.value ? o.value && (o.value.style.height = "") : c.value = !1;
  };
  U(s, (f, b) => {
    b !== null && (f && (c.value = !0), (f ? ne : Ke)(() => {
      if (!n.value || !o.value) return;
      const { offsetHeight: w } = n.value;
      if (w) {
        const y = `${w}px`;
        o.value.style.height = f ? "0" : y, go(() => {
          o.value && (o.value.style.height = f ? y : "0");
        });
      } else u();
    }));
  });
  const p = (f = !s.value) => {
    a.toggle(r.value, f);
  }, v = () => {
    e.disabled || e.readonly || p();
  }, h = () => {
    const { border: f, disabled: b, readonly: w } = e, y = he(e, Object.keys(pl));
    return w && (y.isLink = !1), (b || w) && (y.clickable = !1), i(dt, Q({ role: "button", class: Sa("title", { disabled: b, expanded: s.value, borderless: !f }), "aria-expanded": String(s.value), onClick: v }, y), he(t, W2));
  }, g = d(() => {
    var f;
    return De(i("div", { ref: o, class: Sa("wrapper"), onTransitionend: u }, [i("div", { ref: n, class: Sa("content") }, [(f = t.default) == null ? void 0 : f.call(t)])]), [[Ie, c.value]]);
  });
  return pe({ toggle: p, expanded: s, itemName: r }), () => i("div", { class: [Sa({ border: l.value && e.border })] }, [h(), g()]);
} });
const X2 = Z(Y2), G2 = Z(lp), [Z2, Es, tr] = Y("contact-card");
var K2 = z({ name: Z2, props: { tel: String, name: String, type: J("add"), addText: String, editable: W }, emits: ["click"], setup(e, { emit: t }) {
  const o = (a) => {
    e.editable && t("click", a);
  }, n = () => e.type === "add" ? e.addText || tr("addContact") : [i("div", null, [`${tr("name")}：${e.name}`]), i("div", null, [`${tr("tel")}：${e.tel}`])];
  return () => i(dt, { center: !0, icon: e.type === "edit" ? "contact" : "add-square", class: Es([e.type]), border: !1, isLink: e.editable, titleClass: Es("title"), onClick: o }, { title: n });
} });
const J2 = Z(K2), [Q2, Jo, uo] = Y("contact-edit"), or = { tel: "", name: "" };
var ef = z({ name: Q2, props: { isEdit: Boolean, isSaving: Boolean, isDeleting: Boolean, showSetDefault: Boolean, setDefaultLabel: String, contactInfo: { type: Object, default: () => ae({}, or) }, telValidator: { type: Function, default: wu } }, emits: ["save", "delete", "changeDefault"], setup(e, { emit: t }) {
  const o = ke(ae({}, or, e.contactInfo)), n = () => {
    e.isSaving || t("save", o);
  }, a = () => t("delete", o), l = () => i(bi, { modelValue: o.isDefault, "onUpdate:modelValue": (s) => o.isDefault = s, onChange: (s) => t("changeDefault", s) }, null), r = () => {
    if (e.showSetDefault) return i(dt, { title: e.setDefaultLabel, class: Jo("switch-cell"), border: !1 }, { "right-icon": l });
  };
  return U(() => e.contactInfo, (s) => ae(o, or, s)), () => i(gi, { class: Jo(), onSubmit: n }, { default: () => [i("div", { class: Jo("fields") }, [i(Qt, { modelValue: o.name, "onUpdate:modelValue": (s) => o.name = s, clearable: !0, label: uo("name"), rules: [{ required: !0, message: uo("nameEmpty") }], maxlength: "30", placeholder: uo("name") }, null), i(Qt, { modelValue: o.tel, "onUpdate:modelValue": (s) => o.tel = s, clearable: !0, type: "tel", label: uo("tel"), rules: [{ validator: e.telValidator, message: uo("telInvalid") }], placeholder: uo("tel") }, null)]), r(), i("div", { class: Jo("buttons") }, [i(Le, { block: !0, round: !0, type: "primary", text: uo("save"), class: Jo("button"), loading: e.isSaving, nativeType: "submit" }, null), e.isEdit && i(Le, { block: !0, round: !0, text: uo("delete"), class: Jo("button"), loading: e.isDeleting, onClick: a }, null)])] });
} });
const tf = Z(ef), [of, Ut, nf] = Y("contact-list");
var af = z({ name: of, props: { list: Array, addText: String, modelValue: Ae, defaultTagText: String }, emits: ["add", "edit", "select", "update:modelValue"], setup(e, { emit: t }) {
  const o = (n, a) => i(dt, { key: n.id, isLink: !0, center: !0, class: Ut("item"), titleClass: Ut("item-title"), onClick: () => {
    t("update:modelValue", n.id), t("select", n, a);
  } }, { icon: () => i(ie, { name: "edit", class: Ut("edit"), onClick: (l) => {
    l.stopPropagation(), t("edit", n, a);
  } }, null), title: () => {
    const l = [`${n.name}，${n.tel}`];
    return n.isDefault && e.defaultTagText && l.push(i(Ro, { type: "primary", round: !0, class: Ut("item-tag") }, { default: () => [e.defaultTagText] })), l;
  }, "right-icon": () => i(Si, { class: Ut("radio"), name: n.id, iconSize: 18 }, null) });
  return () => i("div", { class: Ut() }, [i(yi, { modelValue: e.modelValue, class: Ut("group") }, { default: () => [e.list && e.list.map(o)] }), i("div", { class: [Ut("bottom"), "van-safe-area-bottom"] }, [i(Le, { round: !0, block: !0, type: "primary", class: Ut("add"), text: e.addText || nf("addContact"), onClick: () => t("add") }, null)])]);
} });
const lf = Z(af), [rf, sf] = Y("count-down");
var cf = z({ name: rf, props: { time: te(0), format: J("HH:mm:ss"), autoStart: W, millisecond: Boolean }, emits: ["change", "finish"], setup(e, { emit: t, slots: o }) {
  const { start: n, pause: a, reset: l, current: r } = _1({ time: +e.time, millisecond: e.millisecond, onChange: (d) => t("change", d), onFinish: () => t("finish") }), s = E(() => function(d, u) {
    const { days: p } = u;
    let { hours: v, minutes: h, seconds: g, milliseconds: f } = u;
    if (d.includes("DD") ? d = d.replace("DD", Tt(p)) : v += 24 * p, d.includes("HH") ? d = d.replace("HH", Tt(v)) : h += 60 * v, d.includes("mm") ? d = d.replace("mm", Tt(h)) : g += 60 * h, d.includes("ss") ? d = d.replace("ss", Tt(g)) : f += 1e3 * g, d.includes("S")) {
      const b = Tt(f, 3);
      d = d.includes("SSS") ? d.replace("SSS", b) : d.includes("SS") ? d.replace("SS", b.slice(0, 2)) : d.replace("S", b.charAt(0));
    }
    return d;
  }(e.format, r.value)), c = () => {
    l(+e.time), e.autoStart && n();
  };
  return U(() => e.time, c, { immediate: !0 }), pe({ start: n, pause: a, reset: c }), () => i("div", { role: "timer", class: sf() }, [o.default ? o.default(r.value) : s.value]);
} });
const uf = Z(cf);
function Ps(e) {
  const t = new Date(1e3 * e);
  return `${t.getFullYear()}.${Tt(t.getMonth() + 1)}.${Tt(t.getDate())}`;
}
const Is = (e) => (e / 100).toFixed(e % 100 == 0 ? 0 : e % 10 == 0 ? 1 : 2), [df, $t, nr] = Y("coupon");
var pf = z({ name: df, props: { chosen: Boolean, coupon: We(Object), disabled: Boolean, currency: J("¥") }, setup(e) {
  const t = E(() => {
    const { startAt: a, endAt: l } = e.coupon;
    return `${Ps(a)} - ${Ps(l)}`;
  }), o = E(() => {
    const { coupon: a, currency: l } = e;
    if (a.valueDesc) return [a.valueDesc, i("span", null, [a.unitDesc || ""])];
    if (a.denominations) {
      const s = Is(a.denominations);
      return [i("span", null, [l]), ` ${s}`];
    }
    return a.discount ? nr("discount", ((r = a.discount) / 10).toFixed(r % 10 == 0 ? 0 : 1)) : "";
    var r;
  }), n = E(() => {
    const a = Is(e.coupon.originCondition || 0);
    return a === "0" ? nr("unlimited") : nr("condition", a);
  });
  return () => {
    const { chosen: a, coupon: l, disabled: r } = e, s = r && l.reason || l.description;
    return i("div", { class: $t({ disabled: r }) }, [i("div", { class: $t("content") }, [i("div", { class: $t("head") }, [i("h2", { class: $t("amount") }, [o.value]), i("p", { class: $t("condition") }, [l.condition || n.value])]), i("div", { class: $t("body") }, [i("p", { class: $t("name") }, [l.name]), i("p", { class: $t("valid") }, [t.value]), !r && i(na, { class: $t("corner"), modelValue: a }, null)])]), s && i("p", { class: $t("description") }, [s])]);
  };
} });
const Hr = Z(pf), [vf, $s, Ur] = Y("coupon-cell"), ff = { title: String, border: W, editable: W, coupons: Ve(), currency: J("¥"), chosenCoupon: { type: [Number, Array], default: -1 } };
function mf({ coupons: e, chosenCoupon: t, currency: o }) {
  let n = 0, a = !1;
  return (Array.isArray(t) ? t : [t]).forEach((l) => {
    const r = e[+l];
    r && (a = !0, n += ((s) => {
      const { value: c, denominations: d } = s;
      return fe(c) ? c : fe(d) ? d : 0;
    })(r));
  }), a ? `-${o} ${(n / 100).toFixed(2)}` : e.length === 0 ? Ur("noCoupon") : Ur("count", e.length);
}
var hf = z({ name: vf, props: ff, setup: (e) => () => {
  const t = Array.isArray(e.chosenCoupon) ? e.chosenCoupon.length : e.coupons[+e.chosenCoupon];
  return i(dt, { class: $s(), value: mf(e), title: e.title || Ur("title"), border: e.border, isLink: e.editable, valueClass: $s("value", { selected: t }) }, null);
} });
const gf = Z(hf), [bf, ka] = Y("empty");
var yf = z({ name: bf, props: { image: J("default"), imageSize: [Number, String, Array], description: String }, setup(e, { slots: t }) {
  const o = () => {
    const w = t.description ? t.description() : e.description;
    if (w) return i("p", { class: ka("description") }, [w]);
  }, n = () => {
    if (t.default) return i("div", { class: ka("bottom") }, [t.default()]);
  }, a = Cn(), l = (w) => `${a}-${w}`, r = (w) => `url(#${l(w)})`, s = (w, y, k) => i("stop", { "stop-color": w, offset: `${y}%`, "stop-opacity": k }, null), c = (w, y) => [s(w, 0), s(y, 100)], d = (w) => [i("defs", null, [i("radialGradient", { id: l(w), cx: "50%", cy: "54%", fx: "50%", fy: "54%", r: "297%", gradientTransform: "matrix(-.16 0 0 -.33 .58 .72)", "data-allow-mismatch": "attribute" }, [s("#EBEDF0", 0), s("#F2F3F5", 100, 0.3)])]), i("ellipse", { fill: r(w), opacity: ".8", cx: "80", cy: "140", rx: "46", ry: "8", "data-allow-mismatch": "attribute" }, null)], u = () => [i("defs", null, [i("linearGradient", { id: l("a"), x1: "64%", y1: "100%", x2: "64%", "data-allow-mismatch": "attribute" }, [s("#FFF", 0, 0.5), s("#F2F3F5", 100)])]), i("g", { opacity: ".8", "data-allow-mismatch": "children" }, [i("path", { d: "M36 131V53H16v20H2v58h34z", fill: r("a") }, null), i("path", { d: "M123 15h22v14h9v77h-31V15z", fill: r("a") }, null)])], p = () => [i("defs", null, [i("linearGradient", { id: l("b"), x1: "64%", y1: "97%", x2: "64%", y2: "0%", "data-allow-mismatch": "attribute" }, [s("#F2F3F5", 0, 0.3), s("#F2F3F5", 100)])]), i("g", { opacity: ".8", "data-allow-mismatch": "children" }, [i("path", { d: "M87 6c3 0 7 3 8 6a8 8 0 1 1-1 16H80a7 7 0 0 1-8-6c0-4 3-7 6-7 0-5 4-9 9-9Z", fill: r("b") }, null), i("path", { d: "M19 23c2 0 3 1 4 3 2 0 4 2 4 4a4 4 0 0 1-4 3v1h-7v-1l-1 1c-2 0-3-2-3-4 0-1 1-3 3-3 0-2 2-4 4-4Z", fill: r("b") }, null)])], v = () => i("svg", { viewBox: "0 0 160 160" }, [i("defs", { "data-allow-mismatch": "children" }, [i("linearGradient", { id: l(1), x1: "64%", y1: "100%", x2: "64%" }, [s("#FFF", 0, 0.5), s("#F2F3F5", 100)]), i("linearGradient", { id: l(2), x1: "50%", x2: "50%", y2: "84%" }, [s("#EBEDF0", 0), s("#DCDEE0", 100, 0)]), i("linearGradient", { id: l(3), x1: "100%", x2: "100%", y2: "100%" }, [c("#EAEDF0", "#DCDEE0")]), i("radialGradient", { id: l(4), cx: "50%", cy: "0%", fx: "50%", fy: "0%", r: "100%", gradientTransform: "matrix(0 1 -.54 0 .5 -.5)" }, [s("#EBEDF0", 0), s("#FFF", 100, 0)])]), i("g", { fill: "none" }, [u(), i("path", { fill: r(4), d: "M0 139h160v21H0z", "data-allow-mismatch": "attribute" }, null), i("path", { d: "M80 54a7 7 0 0 1 3 13v27l-2 2h-2a2 2 0 0 1-2-2V67a7 7 0 0 1 3-13z", fill: r(2), "data-allow-mismatch": "attribute" }, null), i("g", { opacity: ".6", "stroke-linecap": "round", "stroke-width": "7", "data-allow-mismatch": "children" }, [i("path", { d: "M64 47a19 19 0 0 0-5 13c0 5 2 10 5 13", stroke: r(3) }, null), i("path", { d: "M53 36a34 34 0 0 0 0 48", stroke: r(3) }, null), i("path", { d: "M95 73a19 19 0 0 0 6-13c0-5-2-9-6-13", stroke: r(3) }, null), i("path", { d: "M106 84a34 34 0 0 0 0-48", stroke: r(3) }, null)]), i("g", { transform: "translate(31 105)" }, [i("rect", { fill: "#EBEDF0", width: "98", height: "34", rx: "2" }, null), i("rect", { fill: "#FFF", x: "9", y: "8", width: "80", height: "18", rx: "1.1" }, null), i("rect", { fill: "#EBEDF0", x: "15", y: "12", width: "18", height: "6", rx: "1.1" }, null)])])]), h = () => i("svg", { viewBox: "0 0 160 160" }, [i("defs", { "data-allow-mismatch": "children" }, [i("linearGradient", { x1: "50%", x2: "50%", y2: "100%", id: l(5) }, [c("#F2F3F5", "#DCDEE0")]), i("linearGradient", { x1: "95%", y1: "48%", x2: "5.5%", y2: "51%", id: l(6) }, [c("#EAEDF1", "#DCDEE0")]), i("linearGradient", { y1: "45%", x2: "100%", y2: "54%", id: l(7) }, [c("#EAEDF1", "#DCDEE0")])]), u(), p(), i("g", { transform: "translate(36 50)", fill: "none" }, [i("g", { transform: "translate(8)" }, [i("rect", { fill: "#EBEDF0", opacity: ".6", x: "38", y: "13", width: "36", height: "53", rx: "2" }, null), i("rect", { fill: r(5), width: "64", height: "66", rx: "2", "data-allow-mismatch": "attribute" }, null), i("rect", { fill: "#FFF", x: "6", y: "6", width: "52", height: "55", rx: "1" }, null), i("g", { transform: "translate(15 17)", fill: r(6), "data-allow-mismatch": "attribute" }, [i("rect", { width: "34", height: "6", rx: "1" }, null), i("path", { d: "M0 14h34v6H0z" }, null), i("rect", { y: "28", width: "34", height: "6", rx: "1" }, null)])]), i("rect", { fill: r(7), y: "61", width: "88", height: "28", rx: "1", "data-allow-mismatch": "attribute" }, null), i("rect", { fill: "#F7F8FA", x: "29", y: "72", width: "30", height: "6", rx: "1" }, null)])]), g = () => i("svg", { viewBox: "0 0 160 160" }, [i("defs", null, [i("linearGradient", { x1: "50%", x2: "50%", y2: "100%", id: l(8), "data-allow-mismatch": "attribute" }, [c("#EAEDF1", "#DCDEE0")])]), u(), p(), d("c"), i("path", { d: "m59 60 21 21 21-21h3l9 9v3L92 93l21 21v3l-9 9h-3l-21-21-21 21h-3l-9-9v-3l21-21-21-21v-3l9-9h3Z", fill: r(8), "data-allow-mismatch": "attribute" }, null)]), f = () => i("svg", { viewBox: "0 0 160 160" }, [i("defs", { "data-allow-mismatch": "children" }, [i("linearGradient", { x1: "50%", y1: "100%", x2: "50%", id: l(9) }, [c("#EEE", "#D8D8D8")]), i("linearGradient", { x1: "100%", y1: "50%", y2: "50%", id: l(10) }, [c("#F2F3F5", "#DCDEE0")]), i("linearGradient", { x1: "50%", x2: "50%", y2: "100%", id: l(11) }, [c("#F2F3F5", "#DCDEE0")]), i("linearGradient", { x1: "50%", x2: "50%", y2: "100%", id: l(12) }, [c("#FFF", "#F7F8FA")])]), u(), p(), d("d"), i("g", { transform: "rotate(-45 113 -4)", fill: "none", "data-allow-mismatch": "children" }, [i("rect", { fill: r(9), x: "24", y: "52.8", width: "5.8", height: "19", rx: "1" }, null), i("rect", { fill: r(10), x: "22.1", y: "67.3", width: "9.9", height: "28", rx: "1" }, null), i("circle", { stroke: r(11), "stroke-width": "8", cx: "27", cy: "27", r: "27" }, null), i("circle", { fill: r(12), cx: "27", cy: "27", r: "16" }, null), i("path", { d: "M37 7c-8 0-15 5-16 12", stroke: r(11), "stroke-width": "3", opacity: ".5", "stroke-linecap": "round", transform: "rotate(45 29 13)" }, null)])]), b = () => {
    var w;
    if (t.image) return t.image();
    const y = { error: g, search: f, network: v, default: h };
    return ((w = y[e.image]) == null ? void 0 : w.call(y)) || i("img", { src: e.image }, null);
  };
  return () => i("div", { class: ka() }, [i("div", { class: ka("image"), style: lo(e.imageSize) }, [b()]), o(), n()]);
} });
const Td = Z(yf), [wf, jt, Qo] = Y("coupon-list");
var xf = z({ name: wf, props: { code: J(""), coupons: Ve(), currency: J("¥"), showCount: W, emptyImage: String, enabledTitle: String, disabledTitle: String, disabledCoupons: Ve(), showExchangeBar: W, showCloseButton: W, closeButtonText: String, inputPlaceholder: String, exchangeMinLength: _e(1), exchangeButtonText: String, displayedCouponIndex: _e(-1), exchangeButtonLoading: Boolean, exchangeButtonDisabled: Boolean, chosenCoupon: { type: [Number, Array], default: -1 } }, emits: ["change", "exchange", "update:code"], setup(e, { emit: t, slots: o }) {
  const [n, a] = ia(), l = A(), r = A(), s = A(0), c = A(0), d = A(e.code), u = E(() => !e.exchangeButtonLoading && (e.exchangeButtonDisabled || !d.value || d.value.length < e.exchangeMinLength)), p = () => {
    const y = we(l).height, k = we(r).height + 44;
    c.value = (y > k ? y : ht.value) - k;
  }, v = () => {
    t("exchange", d.value), e.code || (d.value = "");
  }, h = (y) => {
    ne(() => {
      var k;
      return (k = n.value[y]) == null ? void 0 : k.scrollIntoView();
    });
  }, g = () => i(Td, { image: e.emptyImage }, { default: () => [i("p", { class: jt("empty-tip") }, [Qo("noCoupon")])] }), f = () => {
    if (e.showExchangeBar) return i("div", { ref: r, class: jt("exchange-bar") }, [i(Qt, { modelValue: d.value, "onUpdate:modelValue": (y) => d.value = y, clearable: !0, border: !1, class: jt("field"), placeholder: e.inputPlaceholder || Qo("placeholder"), maxlength: "20" }, null), i(Le, { plain: !0, type: "primary", class: jt("exchange"), text: e.exchangeButtonText || Qo("exchange"), loading: e.exchangeButtonLoading, disabled: u.value, onClick: v }, null)]);
  }, b = () => {
    const { coupons: y, chosenCoupon: k } = e, C = e.showCount ? ` (${y.length})` : "", S = (e.enabledTitle || Qo("enable")) + C;
    return i(oa, { title: S }, { default: () => {
      var O;
      return [i("div", { class: jt("list", { "with-bottom": e.showCloseButton }), style: { height: `${c.value}px` } }, [y.map((B, m) => i(Hr, { key: B.id, ref: a(m), coupon: B, chosen: Array.isArray(k) ? k.includes(m) : m === k, currency: e.currency, onClick: () => t("change", Array.isArray(k) ? ((x = [], T = 0) => x.includes(T) ? x.filter((V) => V !== T) : [...x, T])(k, m) : m) }, null)), !y.length && g(), (O = o["list-footer"]) == null ? void 0 : O.call(o)])];
    } });
  }, w = () => {
    const { disabledCoupons: y } = e, k = e.showCount ? ` (${y.length})` : "", C = (e.disabledTitle || Qo("disabled")) + k;
    return i(oa, { title: C }, { default: () => {
      var S;
      return [i("div", { class: jt("list", { "with-bottom": e.showCloseButton }), style: { height: `${c.value}px` } }, [y.map((O) => i(Hr, { disabled: !0, key: O.id, coupon: O, currency: e.currency }, null)), !y.length && g(), (S = o["disabled-list-footer"]) == null ? void 0 : S.call(o)])];
    } });
  };
  return U(() => e.code, (y) => {
    d.value = y;
  }), U(ht, p), U(d, (y) => t("update:code", y)), U(() => e.displayedCouponIndex, h), Ce(() => {
    p(), h(e.displayedCouponIndex);
  }), () => i("div", { ref: l, class: jt() }, [f(), i(El, { active: s.value, "onUpdate:active": (y) => s.value = y, class: jt("tab") }, { default: () => [b(), w()] }), i("div", { class: jt("bottom") }, [o["list-button"] ? o["list-button"]() : De(i(Le, { round: !0, block: !0, type: "primary", class: jt("close"), text: e.closeButtonText || Qo("close"), onClick: () => t("change", Array.isArray(e.chosenCoupon) ? [] : -1) }, null), [[Ie, e.showCloseButton]])])]);
} });
const Sf = Z(xf);
var kf = {};
const js = (/* @__PURE__ */ new Date()).getFullYear(), [Cf] = Y("date-picker");
var Tf = z({ name: Cf, props: ae({}, hd, { columnsType: { type: Array, default: () => ["year", "month", "day"] }, minDate: { type: Date, default: () => new Date(js - 10, 0, 1), validator: Xn }, maxDate: { type: Date, default: () => new Date(js + 10, 11, 31), validator: Xn } }), emits: ["confirm", "cancel", "change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(e.modelValue), a = A(!1), l = A(), r = E(() => a.value ? e.modelValue : n.value), s = (f) => f === e.minDate.getFullYear(), c = (f) => f === e.maxDate.getFullYear(), d = (f) => {
    const { minDate: b, columnsType: w } = e, y = w.indexOf(f), k = r.value[y];
    if (k) return +k;
    switch (f) {
      case "year":
        return b.getFullYear();
      case "month":
        return b.getMonth() + 1;
      case "day":
        return b.getDate();
    }
  }, u = () => {
    const f = d("year"), b = d("month"), w = s(f) && ((k) => k === e.minDate.getMonth() + 1)(b) ? e.minDate.getDate() : 1, y = c(f) && ((k) => k === e.maxDate.getMonth() + 1)(b) ? e.maxDate.getDate() : bd(f, b);
    return un(w, y, "day", e.formatter, e.filter, r.value);
  }, p = E(() => e.columnsType.map((f) => {
    switch (f) {
      case "year":
        return (() => {
          const b = e.minDate.getFullYear(), w = e.maxDate.getFullYear();
          return un(b, w, "year", e.formatter, e.filter, r.value);
        })();
      case "month":
        return (() => {
          const b = d("year"), w = s(b) ? e.minDate.getMonth() + 1 : 1, y = c(b) ? e.maxDate.getMonth() + 1 : 12;
          return un(w, y, "month", e.formatter, e.filter, r.value);
        })();
      case "day":
        return u();
      default:
        if (kf.NODE_ENV !== "production") throw new Error(`[Vant] DatePicker: unsupported columns type: ${f}`);
        return [];
    }
  }));
  U(n, (f) => {
    Rt(f, e.modelValue) || t("update:modelValue", f);
  }), U(() => e.modelValue, (f, b) => {
    a.value = Rt(b, n.value), f = yd(f, p.value), Rt(f, n.value) || (n.value = f), a.value = !1;
  }, { immediate: !0 });
  const v = (...f) => t("change", ...f), h = (...f) => t("cancel", ...f), g = (...f) => t("confirm", ...f);
  return pe({ confirm: () => {
    var f;
    return (f = l.value) == null ? void 0 : f.confirm();
  }, getSelectedDate: () => n.value }), () => i(Il, Q({ ref: l, modelValue: n.value, "onUpdate:modelValue": (f) => n.value = f, columns: p.value, onChange: v, onCancel: h, onConfirm: g }, he(e, gd)), o);
} });
const Of = Z(Tf), [Bf, St, Ca] = Y("dialog"), Vf = ae({}, kn, { title: String, theme: String, width: G, message: [String, Function], callback: Function, allowHtml: Boolean, className: Ae, transition: J("van-dialog-bounce"), messageAlign: String, closeOnPopstate: W, showCancelButton: Boolean, cancelButtonText: String, cancelButtonColor: String, cancelButtonDisabled: Boolean, confirmButtonText: String, confirmButtonColor: String, confirmButtonDisabled: Boolean, showConfirmButton: W, closeOnClickOverlay: Boolean, keyboardEnabled: W, destroyOnClose: Boolean }), Df = [...pi, "transition", "closeOnPopstate", "destroyOnClose"];
var Af = z({ name: Bf, props: Vf, emits: ["confirm", "cancel", "keydown", "update:show"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = ke({ confirm: !1, cancel: !1 }), l = (f) => t("update:show", f), r = (f) => {
    var b;
    l(!1), (b = e.callback) == null || b.call(e, f);
  }, s = (f) => () => {
    e.show && (t(f), e.beforeClose ? (a[f] = !0, So(e.beforeClose, { args: [f], done() {
      r(f), a[f] = !1;
    }, canceled() {
      a[f] = !1;
    } })) : r(f));
  }, c = s("cancel"), d = s("confirm"), u = I1((f) => {
    var b, w;
    e.keyboardEnabled && f.target === ((w = (b = n.value) == null ? void 0 : b.popupRef) == null ? void 0 : w.value) && ({ Enter: e.showConfirmButton ? d : $r, Escape: e.showCancelButton ? c : $r }[f.key](), t("keydown", f));
  }, ["enter", "esc"]), p = () => {
    const f = o.title ? o.title() : e.title;
    if (f) return i("div", { class: St("header", { isolated: !e.message && !o.default }) }, [f]);
  }, v = (f) => {
    const { message: b, allowHtml: w, messageAlign: y } = e, k = St("message", { "has-title": f, [y]: y }), C = vn(b) ? b() : b;
    return w && typeof C == "string" ? i("div", { class: k, innerHTML: C }, null) : i("div", { class: k }, [C]);
  }, h = () => {
    if (o.default) return i("div", { class: St("content") }, [o.default()]);
    const { title: f, message: b, allowHtml: w } = e;
    if (b) {
      const y = !(!f && !o.title);
      return i("div", { key: w ? 1 : 0, class: St("content", { isolated: !y }) }, [v(y)]);
    }
  }, g = () => o.footer ? o.footer() : e.theme === "round-button" ? i(ju, { class: St("footer") }, { default: () => [e.showCancelButton && i(Nr, { type: "warning", text: e.cancelButtonText || Ca("cancel"), class: St("cancel"), color: e.cancelButtonColor, loading: a.cancel, disabled: e.cancelButtonDisabled, onClick: c }, null), e.showConfirmButton && i(Nr, { type: "danger", text: e.confirmButtonText || Ca("confirm"), class: St("confirm"), color: e.confirmButtonColor, loading: a.confirm, disabled: e.confirmButtonDisabled, onClick: d }, null)] }) : i("div", { class: [Du, St("footer")] }, [e.showCancelButton && i(Le, { size: "large", text: e.cancelButtonText || Ca("cancel"), class: St("cancel"), style: { color: e.cancelButtonColor }, loading: a.cancel, disabled: e.cancelButtonDisabled, onClick: c }, null), e.showConfirmButton && i(Le, { size: "large", text: e.confirmButtonText || Ca("confirm"), class: [St("confirm"), { [Au]: e.showCancelButton }], style: { color: e.confirmButtonColor }, loading: a.confirm, disabled: e.confirmButtonDisabled, onClick: d }, null)]);
  return () => {
    const { width: f, title: b, theme: w, message: y, className: k } = e;
    return i(xt, Q({ ref: n, role: "dialog", class: [St([w]), k], style: { width: ce(f) }, tabindex: 0, "aria-labelledby": b || y, onKeydown: u, "onUpdate:show": l }, he(e, Df)), { default: () => [p(), h(), g()] });
  };
} });
const Ef = Z(Af), [Pf, If] = Y("divider");
var $f = z({ name: Pf, props: { dashed: Boolean, hairline: W, vertical: Boolean, contentPosition: J("center") }, setup: (e, { slots: t }) => () => {
  var o;
  return i("div", { role: "separator", class: If({ dashed: e.dashed, hairline: e.hairline, vertical: e.vertical, [`content-${e.contentPosition}`]: !!t.default && !e.vertical }) }, [!e.vertical && ((o = t.default) == null ? void 0 : o.call(t))]);
} });
const jf = Z($f), [Od, Ta] = Y("dropdown-menu"), zf = { overlay: W, zIndex: G, duration: te(0.2), direction: J("down"), activeColor: String, autoLocate: Boolean, closeOnClickOutside: W, closeOnClickOverlay: W, swipeThreshold: G }, Bd = Symbol(Od);
var Rf = z({ name: Od, props: zf, setup(e, { slots: t }) {
  const o = Cn(), n = A(), a = A(), l = A(0), { children: r, linkChildren: s } = Qe(Bd), c = Sn(n), d = E(() => r.some((f) => f.state.showWrapper)), u = E(() => e.swipeThreshold && r.length > +e.swipeThreshold), p = E(() => {
    if (d.value && fe(e.zIndex)) return { zIndex: +e.zIndex + 1 };
  }), v = () => {
    r.forEach((f) => {
      f.toggle(!1);
    });
  }, h = () => {
    if (a.value) {
      const f = we(a);
      e.direction === "down" ? l.value = f.bottom : l.value = ht.value - f.top;
    }
  }, g = (f, b) => {
    const { showPopup: w } = f.state, { disabled: y, titleClass: k } = f;
    return i("div", { id: `${o}-${b}`, role: "button", tabindex: y ? void 0 : 0, "data-allow-mismatch": "attribute", class: [Ta("item", { disabled: y, grow: u.value }), { [Je]: !y }], onClick: () => {
      var C;
      y || (C = b, r.forEach((S, O) => {
        O === C ? S.toggle() : S.state.showPopup && S.toggle(!1, { immediate: !0 });
      }));
    } }, [i("span", { class: [Ta("title", { down: w === (e.direction === "down"), active: w }), k], style: { color: w ? e.activeColor : "" } }, [i("div", { class: "van-ellipsis" }, [f.renderTitle()])])]);
  };
  return pe({ close: v }), s({ id: o, props: e, offset: l, updateOffset: h }), Ol(n, () => {
    e.closeOnClickOutside && v();
  }), Ne("scroll", () => {
    d.value && h();
  }, { target: c, passive: !0 }), () => {
    var f;
    return i("div", { ref: n, class: Ta() }, [i("div", { ref: a, style: p.value, class: Ta("bar", { opened: d.value, scrollable: u.value }) }, [r.map(g)]), (f = t.default) == null ? void 0 : f.call(t)]);
  };
} }), Nf = {};
const [Mf, Oa] = Y("dropdown-item");
var Lf = z({ name: Mf, inheritAttrs: !1, props: { title: String, options: Ve(), disabled: Boolean, teleport: [String, Object], lazyRender: W, modelValue: Ae, titleClass: Ae }, emits: ["open", "opened", "close", "closed", "change", "update:modelValue"], setup(e, { emit: t, slots: o, attrs: n }) {
  const a = ke({ showPopup: !1, transition: !0, showWrapper: !1 }), l = A(), { parent: r, index: s } = Ge(Bd);
  if (!r) return void (Nf.NODE_ENV !== "production" && console.error("[Vant] <DropdownItem> must be a child component of <DropdownMenu>."));
  const c = (b) => () => t(b), d = c("open"), u = c("close"), p = c("opened"), v = () => {
    a.showWrapper = !1, t("closed");
  }, h = (b) => {
    e.teleport && b.stopPropagation();
  }, g = (b) => {
    const { activeColor: w } = r.props, { disabled: y } = b, k = b.value === e.modelValue;
    return i(dt, { role: "menuitem", key: String(b.value), icon: b.icon, title: b.text, class: Oa("option", { active: k, disabled: y }), style: { color: k ? w : "" }, tabindex: k ? 0 : -1, clickable: !y, onClick: () => {
      y || (a.showPopup = !1, b.value !== e.modelValue && (t("update:modelValue", b.value), t("change", b.value)));
    } }, { value: () => {
      if (k) return i(ie, { class: Oa("icon"), color: y ? void 0 : w, name: "success" }, null);
    } });
  }, f = () => {
    const { offset: b } = r, { autoLocate: w, zIndex: y, overlay: k, duration: C, direction: S, closeOnClickOverlay: O } = r.props, B = ro(y);
    let m = b.value;
    if (w && l.value) {
      const x = function(T) {
        let V = T.parentElement;
        for (; V; ) {
          if (V && V.tagName !== "HTML" && V.tagName !== "BODY" && W1(V)) return V;
          V = V.parentElement;
        }
        return null;
      }(l.value);
      x && (m -= we(x).top);
    }
    return S === "down" ? B.top = `${m}px` : B.bottom = `${m}px`, De(i("div", Q({ ref: l, style: B, class: Oa([S]), onClick: h }, n), [i(xt, { show: a.showPopup, "onUpdate:show": (x) => a.showPopup = x, role: "menu", class: Oa("content"), overlay: k, position: S === "down" ? "top" : "bottom", duration: a.transition ? C : 0, lazyRender: e.lazyRender, overlayStyle: { position: "absolute" }, "aria-labelledby": `${r.id}-${s.value}`, "data-allow-mismatch": "attribute", closeOnClickOverlay: O, onOpen: d, onClose: u, onOpened: p, onClosed: v }, { default: () => {
      var x;
      return [e.options.map(g), (x = o.default) == null ? void 0 : x.call(o)];
    } })]), [[Ie, a.showWrapper]]);
  };
  return pe({ state: a, toggle: (b = !a.showPopup, w = {}) => {
    b !== a.showPopup && (a.showPopup = b, a.transition = !w.immediate, b && (r.updateOffset(), a.showWrapper = !0));
  }, renderTitle: () => {
    if (o.title) return o.title();
    if (e.title) return e.title;
    const b = e.options.find((w) => w.value === e.modelValue);
    return b ? b.text : "";
  } }), () => e.teleport ? i(Lt, { to: e.teleport }, { default: () => [f()] }) : f();
} });
const Ff = Z(Lf), _f = Z(Rf), Hf = { gap: _e(24), icon: String, axis: J("y"), magnetic: String, offset: { type: Object, default: () => ({ x: -1, y: -1 }) }, teleport: { type: [String, Object], default: "body" } }, [Uf, zs] = Y("floating-bubble");
var qf = z({ name: Uf, inheritAttrs: !1, props: Hf, emits: ["click", "update:offset", "offsetChange"], setup(e, { slots: t, emit: o, attrs: n }) {
  const a = A(), l = A({ x: 0, y: 0, width: 0, height: 0 }), r = E(() => ({ top: e.gap, right: Vt.value - l.value.width - e.gap, bottom: ht.value - l.value.height - e.gap, left: e.gap })), s = A(!1);
  let c = !1;
  const d = E(() => {
    const y = {}, k = ce(l.value.x), C = ce(l.value.y);
    return y.transform = `translate3d(${k}, ${C}, 0)`, !s.value && c || (y.transition = "none"), y;
  }), u = () => {
    if (!w.value) return;
    const { width: y, height: k } = we(a.value), { offset: C } = e;
    l.value = { x: C.x > -1 ? C.x : Vt.value - y - e.gap, y: C.y > -1 ? C.y : ht.value - k - e.gap, width: y, height: k };
  }, p = wt();
  let v = 0, h = 0;
  const g = (y) => {
    p.start(y), s.value = !0, v = l.value.x, h = l.value.y;
  };
  Ne("touchmove", (y) => {
    if (y.preventDefault(), p.move(y), e.axis !== "lock" && !p.isTap.value) {
      if (e.axis === "x" || e.axis === "xy") {
        let C = v + p.deltaX.value;
        C < r.value.left && (C = r.value.left), C > r.value.right && (C = r.value.right), l.value.x = C;
      }
      if (e.axis === "y" || e.axis === "xy") {
        let C = h + p.deltaY.value;
        C < r.value.top && (C = r.value.top), C > r.value.bottom && (C = r.value.bottom), l.value.y = C;
      }
      const k = he(l.value, ["x", "y"]);
      o("update:offset", k);
    }
  }, { target: a });
  const f = () => {
    s.value = !1, ne(() => {
      if (e.magnetic === "x") {
        const y = ul([r.value.left, r.value.right], l.value.x);
        l.value.x = y;
      }
      if (e.magnetic === "y") {
        const y = ul([r.value.top, r.value.bottom], l.value.y);
        l.value.y = y;
      }
      if (!p.isTap.value) {
        const y = he(l.value, ["x", "y"]);
        o("update:offset", y), v === y.x && h === y.y || o("offsetChange", y);
      }
    });
  }, b = (y) => {
    p.isTap.value ? o("click", y) : y.stopPropagation();
  };
  Ce(() => {
    u(), ne(() => {
      c = !0;
    });
  }), U([Vt, ht, () => e.gap, () => e.offset], u, { deep: !0 });
  const w = A(!0);
  return st(() => {
    w.value = !0;
  }), ot(() => {
    e.teleport && (w.value = !1);
  }), () => {
    const y = De(i("div", Q({ class: zs(), ref: a, onTouchstartPassive: g, onTouchend: f, onTouchcancel: f, onClickCapture: b, style: d.value }, n), [t.default ? t.default() : i(sp, { name: e.icon, class: zs("icon") }, null)]), [[Ie, w.value]]);
    return e.teleport ? i(Lt, { to: e.teleport }, { default: () => [y] }) : y;
  };
} });
const Wf = Z(qf), Yf = { height: te(0), anchors: Ve(), duration: te(0.3), contentDraggable: W, lockScroll: Boolean, safeAreaInsetBottom: W }, [Xf, Ba] = Y("floating-panel");
var Gf = z({ name: Xf, props: Yf, emits: ["heightChange", "update:height"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(), l = fi(() => +e.height, (f) => t("update:height", f)), r = E(() => {
    var f, b;
    return { min: (f = e.anchors[0]) != null ? f : 100, max: (b = e.anchors[e.anchors.length - 1]) != null ? b : Math.round(0.6 * ht.value) };
  }), s = E(() => e.anchors.length >= 2 ? e.anchors : [r.value.min, r.value.max]), c = A(!1), d = E(() => ({ height: ce(r.value.max), transform: `translateY(calc(100% + ${ce(-l.value)}))`, transition: c.value ? "none" : `transform ${e.duration}s cubic-bezier(0.18, 0.89, 0.32, 1.28)` }));
  let u, p = -1;
  const v = wt(), h = (f) => {
    v.start(f), c.value = !0, u = -l.value, p = -1;
  }, g = () => {
    p = -1, c.value = !1, l.value = ul(s.value, l.value), l.value !== -u && t("heightChange", { height: l.value });
  };
  return U(r, () => {
    l.value = ul(s.value, l.value);
  }, { immediate: !0 }), Lu(n, () => e.lockScroll || c.value), Ne("touchmove", (f) => {
    var b;
    v.move(f);
    const w = f.target;
    if (a.value === w || (b = a.value) != null && b.contains(w)) {
      const { scrollTop: k } = a.value;
      if (p = Math.max(p, k), !e.contentDraggable) return;
      if (-u < r.value.max) Oe(f, !0);
      else if (!(k <= 0 && v.deltaY.value > 0) || p > 0) return;
    }
    const y = v.deltaY.value + u;
    l.value = -((k) => {
      const C = Math.abs(k), { min: S, max: O } = r.value;
      return C > O ? -(O + 0.2 * (C - O)) : C < S ? -(S - 0.2 * (S - C)) : k;
    })(y);
  }, { target: n }), () => {
    var f;
    return i("div", { class: [Ba(), { "van-safe-area-bottom": e.safeAreaInsetBottom }], ref: n, style: d.value, onTouchstartPassive: h, onTouchend: g, onTouchcancel: g }, [o.header ? o.header() : i("div", { class: Ba("header") }, [i("div", { class: Ba("header-bar") }, null)]), i("div", { class: Ba("content"), ref: a }, [(f = o.default) == null ? void 0 : f.call(o)])]);
  };
} });
const Zf = Z(Gf), [Vd, Kf] = Y("grid"), Jf = { square: Boolean, center: W, border: W, gutter: G, reverse: Boolean, iconSize: G, direction: String, clickable: Boolean, columnNum: te(4) }, Dd = Symbol(Vd);
var Qf = z({ name: Vd, props: Jf, setup(e, { slots: t }) {
  const { linkChildren: o } = Qe(Dd);
  return o({ props: e }), () => {
    var n;
    return i("div", { style: { paddingLeft: ce(e.gutter) }, class: [Kf(), { [Du]: e.border && !e.gutter }] }, [(n = t.default) == null ? void 0 : n.call(t)]);
  };
} });
const em = Z(Qf);
var tm = {};
const [om, Va] = Y("grid-item");
var nm = z({ name: om, props: ae({}, ko, { dot: Boolean, text: String, icon: String, badge: G, iconColor: String, iconPrefix: String, badgeProps: Object }), setup(e, { slots: t }) {
  const { parent: o, index: n } = Ge(Dd), a = Mo();
  if (!o) return void (tm.NODE_ENV !== "production" && console.error("[Vant] <GridItem> must be a child component of <Grid>."));
  const l = E(() => {
    const { square: s, gutter: c, columnNum: d } = o.props, u = 100 / +d + "%", p = { flexBasis: u };
    if (s) p.paddingTop = u;
    else if (c) {
      const v = ce(c);
      p.paddingRight = v, n.value >= +d && (p.marginTop = v);
    }
    return p;
  }), r = E(() => {
    const { square: s, gutter: c } = o.props;
    if (s && c) {
      const d = ce(c);
      return { right: d, bottom: d, height: "auto" };
    }
  });
  return () => {
    const { center: s, border: c, square: d, gutter: u, reverse: p, direction: v, clickable: h } = o.props, g = [Va("content", [v, { center: s, square: d, reverse: p, clickable: h, surround: c && u }]), { [io]: c }];
    return i("div", { class: [Va({ square: d })], style: l.value }, [i("div", { role: h ? "button" : void 0, class: g, style: r.value, tabindex: h ? 0 : void 0, onClick: a }, [t.default ? t.default() : [t.icon ? i(Lo, Q({ dot: e.dot, content: e.badge }, e.badgeProps), { default: t.icon }) : e.icon ? i(ie, { dot: e.dot, name: e.icon, size: o.props.iconSize, badge: e.badge, class: Va("icon"), color: e.iconColor, badgeProps: e.badgeProps, classPrefix: e.iconPrefix }, null) : void 0, t.text ? t.text() : e.text ? i("span", { class: Va("text") }, [e.text]) : void 0]])]);
  };
} });
const am = Z(nm), [lm, Rs] = Y("highlight");
var rm = z({ name: lm, props: { autoEscape: W, caseSensitive: Boolean, highlightClass: String, highlightTag: J("span"), keywords: We([String, Array]), sourceString: J(""), tag: J("div"), unhighlightClass: String, unhighlightTag: J("span") }, setup(e) {
  const t = E(() => {
    const { autoEscape: n, caseSensitive: a, keywords: l, sourceString: r } = e, s = a ? "g" : "gi";
    let c = (Array.isArray(l) ? l : [l]).filter((u) => u).reduce((u, p) => {
      n && (p = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const v = new RegExp(p, s);
      let h;
      for (; h = v.exec(r); ) {
        const g = h.index, f = v.lastIndex;
        g >= f ? v.lastIndex++ : u.push({ start: g, end: f, highlight: !0 });
      }
      return u;
    }, []);
    c = c.sort((u, p) => u.start - p.start).reduce((u, p) => {
      const v = u[u.length - 1];
      if (!v || p.start > v.end) {
        const h = v ? v.end : 0, g = p.start;
        h !== g && u.push({ start: h, end: g, highlight: !1 }), u.push(p);
      } else v.end = Math.max(v.end, p.end);
      return u;
    }, []);
    const d = c[c.length - 1];
    return d || c.push({ start: 0, end: r.length, highlight: !1 }), d && d.end < r.length && c.push({ start: d.end, end: r.length, highlight: !1 }), c;
  }), o = () => {
    const { sourceString: n, highlightClass: a, unhighlightClass: l, highlightTag: r, unhighlightTag: s } = e;
    return t.value.map((c) => {
      const { start: d, end: u, highlight: p } = c, v = n.slice(d, u);
      return p ? i(r, { class: [Rs("tag"), a] }, { default: () => [v] }) : i(s, { class: l }, { default: () => [v] });
    });
  };
  return () => {
    const { tag: n } = e;
    return i(n, { class: Rs() }, { default: () => [o()] });
  };
} });
const im = Z(rm), Ns = (e) => Math.sqrt((e[0].clientX - e[1].clientX) ** 2 + (e[0].clientY - e[1].clientY) ** 2), ar = Y("image-preview")[1];
var sm = z({ props: { src: String, show: Boolean, active: Number, minZoom: We(G), maxZoom: We(G), rootWidth: We(Number), rootHeight: We(Number), disableZoom: Boolean, doubleScale: Boolean, closeOnClickImage: Boolean, closeOnClickOverlay: Boolean, vertical: Boolean }, emits: ["scale", "close", "longPress"], setup(e, { emit: t, slots: o }) {
  const n = ke({ scale: 1, moveX: 0, moveY: 0, moving: !1, zooming: !1, initializing: !1, imageRatio: 0 }), a = wt(), l = A(), r = A(), s = A(!1), c = A(!1);
  let d = 0;
  const u = E(() => {
    const { scale: j, moveX: F, moveY: I, moving: R, zooming: _, initializing: $ } = n, L = { transitionDuration: _ || R || $ ? "0s" : ".3s" };
    return (j !== 1 || c.value) && (L.transform = `matrix(${j}, 0, 0, ${j}, ${F}, ${I})`), L;
  }), p = E(() => {
    if (n.imageRatio) {
      const { rootWidth: j, rootHeight: F } = e, I = s.value ? F / n.imageRatio : j;
      return Math.max(0, (n.scale * I - j) / 2);
    }
    return 0;
  }), v = E(() => {
    if (n.imageRatio) {
      const { rootWidth: j, rootHeight: F } = e, I = s.value ? F : j * n.imageRatio;
      return Math.max(0, (n.scale * I - F) / 2);
    }
    return 0;
  }), h = (j, F) => {
    var I;
    if ((j = qe(j, +e.minZoom, +e.maxZoom + 1)) !== n.scale) {
      const R = j / n.scale;
      if (n.scale = j, F) {
        const _ = we((I = l.value) == null ? void 0 : I.$el), $ = { x: 0.5 * _.width, y: 0.5 * _.height }, L = n.moveX - (F.x - _.left - $.x) * (R - 1), K = n.moveY - (F.y - _.top - $.y) * (R - 1);
        n.moveX = qe(L, -p.value, p.value), n.moveY = qe(K, -v.value, v.value);
      } else n.moveX = 0, n.moveY = c.value ? d : 0;
      t("scale", { scale: j, index: e.active });
    }
  }, g = () => {
    h(1);
  };
  let f, b, w, y, k, C, S, O, B = !1;
  const m = (j) => {
    const { touches: F } = j;
    if (f = F.length, f === 2 && e.disableZoom) return;
    const { offsetX: I } = a;
    a.start(j), b = n.moveX, w = n.moveY, O = Date.now(), B = !1, n.moving = f === 1 && (n.scale !== 1 || c.value), n.zooming = f === 2 && !I.value, n.zooming && (y = n.scale, k = Ns(F));
  }, x = (j) => {
    var F;
    const I = (F = r.value) == null ? void 0 : F.$el;
    if (!I) return;
    const R = I.firstElementChild, _ = j.target === I, $ = R == null ? void 0 : R.contains(j.target);
    !e.closeOnClickImage && $ || !e.closeOnClickOverlay && _ || t("close");
  }, T = (j) => {
    if (f > 1) return;
    const F = Date.now() - O;
    a.isTap.value && (F < 250 ? e.doubleScale ? S ? (clearTimeout(S), S = null, (() => {
      const I = n.scale > 1 ? 1 : 2;
      h(I, I === 2 || c.value ? { x: a.startX.value, y: a.startY.value } : void 0);
    })()) : S = setTimeout(() => {
      x(j), S = null;
    }, 250) : x(j) : F > 500 && t("longPress"));
  }, V = (j) => {
    let F = !1;
    if ((n.moving || n.zooming) && (F = !0, n.moving && b === n.moveX && w === n.moveY && (F = !1), !j.touches.length)) {
      n.zooming && (n.moveX = qe(n.moveX, -p.value, p.value), n.moveY = qe(n.moveY, -v.value, v.value), n.zooming = !1), n.moving = !1, b = 0, w = 0, y = 1, n.scale < 1 && g();
      const I = +e.maxZoom;
      n.scale > I && h(I, C);
    }
    Oe(j, F), T(j), a.reset();
  }, P = () => {
    const { rootWidth: j, rootHeight: F } = e, I = F / j, { imageRatio: R } = n;
    s.value = n.imageRatio > I && R < 2.6, c.value = n.imageRatio > I && R >= 2.6, c.value && (d = (R * j - F) / 2, n.moveY = d, n.initializing = !0, Ke(() => {
      n.initializing = !1;
    })), g();
  }, N = (j) => {
    const { naturalWidth: F, naturalHeight: I } = j.target;
    n.imageRatio = I / F, P();
  };
  return U(() => e.active, g), U(() => e.show, (j) => {
    j || g();
  }), U(() => [e.rootWidth, e.rootHeight], P), Ne("touchmove", (j) => {
    const { touches: F } = j;
    if (a.move(j), n.moving) {
      const { deltaX: I, deltaY: R } = a, _ = I.value + b, $ = R.value + w;
      if ((e.vertical ? a.isVertical() && Math.abs($) > v.value : a.isHorizontal() && Math.abs(_) > p.value) && !B) return void (n.moving = !1);
      B = !0, Oe(j, !0), n.moveX = qe(_, -p.value, p.value), n.moveY = qe($, -v.value, v.value);
    }
    if (n.zooming && (Oe(j, !0), F.length === 2)) {
      const I = Ns(F), R = y * I / k;
      C = ((_) => ({ x: (_[0].clientX + _[1].clientX) / 2, y: (_[0].clientY + _[1].clientY) / 2 }))(F), h(R, C);
    }
  }, { target: E(() => {
    var j;
    return (j = r.value) == null ? void 0 : j.$el;
  }) }), pe({ resetScale: g }), () => {
    const j = { loading: () => i(Et, { type: "spinner" }, null) };
    return i(hi, { ref: r, class: ar("swipe-item"), onTouchstartPassive: m, onTouchend: V, onTouchcancel: V }, { default: () => [o.image ? i("div", { class: ar("image-wrap") }, [o.image({ src: e.src, onLoad: N, style: u.value })]) : i($l, { ref: l, src: e.src, fit: "contain", class: ar("image", { vertical: s.value }), style: u.value, onLoad: N }, j)] });
  };
} });
const [cm, en] = Y("image-preview"), um = ["show", "teleport", "transition", "overlayStyle", "closeOnPopstate"];
var Ad = z({ name: cm, props: { show: Boolean, loop: W, images: Ve(), minZoom: te(1 / 3), maxZoom: te(3), overlay: W, vertical: Boolean, closeable: Boolean, showIndex: W, className: Ae, closeIcon: J("clear"), transition: String, beforeClose: Function, doubleScale: W, overlayClass: Ae, overlayStyle: Object, swipeDuration: te(300), startPosition: te(0), showIndicators: Boolean, closeOnPopstate: W, closeOnClickImage: W, closeOnClickOverlay: W, closeIconPosition: J("top-right"), teleport: [String, Object] }, emits: ["scale", "close", "closed", "change", "longPress", "update:show"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(), l = ke({ active: 0, rootWidth: 0, rootHeight: 0, disableZoom: !1 }), r = () => {
    if (n.value) {
      const y = we(n.value.$el);
      l.rootWidth = y.width, l.rootHeight = y.height, n.value.resize();
    }
  }, s = (y) => t("scale", y), c = (y) => t("update:show", y), d = () => {
    So(e.beforeClose, { args: [l.active], done: () => c(!1) });
  }, u = (y) => {
    y !== l.active && (l.active = y, t("change", y));
  }, p = () => {
    if (e.showIndex) return i("div", { class: en("index") }, [o.index ? o.index({ index: l.active }) : `${l.active + 1} / ${e.images.length}`]);
  }, v = () => {
    if (o.cover) return i("div", { class: en("cover") }, [o.cover()]);
  }, h = () => {
    l.disableZoom = !0;
  }, g = () => {
    l.disableZoom = !1;
  }, f = () => {
    if (e.closeable) return i(ie, { role: "button", name: e.closeIcon, class: [en("close-icon", e.closeIconPosition), Je], onClick: d }, null);
  }, b = () => t("closed"), w = (y, k) => {
    var C;
    return (C = n.value) == null ? void 0 : C.swipeTo(y, k);
  };
  return pe({ resetScale: () => {
    var y;
    (y = a.value) == null || y.resetScale();
  }, swipeTo: w }), Ce(r), U([Vt, ht], r), U(() => e.startPosition, (y) => u(+y)), U(() => e.show, (y) => {
    const { images: k, startPosition: C } = e;
    y ? (u(+C), ne(() => {
      r(), w(+C, { immediate: !0 });
    })) : t("close", { index: l.active, url: k[l.active] });
  }), () => i(xt, Q({ class: [en(), e.className], overlayClass: [en("overlay"), e.overlayClass], onClosed: b, "onUpdate:show": c }, he(e, um)), { default: () => [f(), i(mi, { ref: n, lazyRender: !0, loop: e.loop, class: en("swipe"), vertical: e.vertical, duration: e.swipeDuration, initialSwipe: e.startPosition, showIndicators: e.showIndicators, indicatorColor: "white", onChange: u, onDragEnd: g, onDragStart: h }, { default: () => [e.images.map((y, k) => i(sm, { ref: (C) => {
    k === l.active && (a.value = C);
  }, src: y, show: e.show, active: l.active, maxZoom: e.maxZoom, minZoom: e.minZoom, rootWidth: l.rootWidth, rootHeight: l.rootHeight, disableZoom: l.disableZoom, doubleScale: e.doubleScale, closeOnClickImage: e.closeOnClickImage, closeOnClickOverlay: e.closeOnClickOverlay, vertical: e.vertical, onScale: s, onClose: d, onLongPress: () => t("longPress", { index: k }) }, { image: o.image }))] }), p(), v()] });
} });
let Da;
const dm = { loop: !0, images: [], maxZoom: 3, minZoom: 1 / 3, onScale: void 0, onClose: void 0, onChange: void 0, vertical: !1, teleport: "body", className: "", showIndex: !0, closeable: !1, closeIcon: "clear", transition: void 0, beforeClose: void 0, doubleScale: !0, overlayStyle: void 0, overlayClass: void 0, startPosition: 0, swipeDuration: 300, showIndicators: !1, closeOnPopstate: !0, closeOnClickOverlay: !0, closeIconPosition: "top-right" }, pm = (e, t = 0) => {
  if (bt) return Da || ({ instance: Da } = sd({ setup() {
    const { state: o, toggle: n } = id(), a = () => {
      o.images = [];
    };
    return () => i(Ad, Q(o, { onClosed: a, "onUpdate:show": n }), null);
  } })), e = Array.isArray(e) ? { images: e, startPosition: t } : e, Da.open(ae({}, dm, e)), Da;
}, vm = Z(Ad), [Ed, lr] = Y("index-bar"), fm = { sticky: W, zIndex: G, teleport: [String, Object], highlightColor: String, stickyOffsetTop: _e(0), indexList: { type: Array, default: function() {
  return Array(26).fill("").map((o, n) => String.fromCharCode(65 + n));
} } }, Pd = Symbol(Ed);
var mm = z({ name: Ed, props: fm, emits: ["select", "change"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(), l = A(""), r = wt(), s = Sn(n), { children: c, linkChildren: d } = Qe(Pd);
  let u;
  d({ props: e });
  const p = E(() => {
    if (fe(e.zIndex)) return { zIndex: +e.zIndex + 1 };
  }), v = E(() => {
    if (e.highlightColor) return { color: e.highlightColor };
  }), h = (O, B) => {
    for (let m = c.length - 1; m >= 0; m--) {
      const x = m > 0 ? B[m - 1].height : 0;
      if (O + (e.sticky ? x + e.stickyOffsetTop : 0) >= B[m].top) return m;
    }
    return -1;
  }, g = (O) => c.find((B) => String(B.index) === O), f = () => {
    if (zo(n)) return;
    const { sticky: O, indexList: B } = e, m = no(s.value), x = we(s), T = c.map((P) => P.getRect(s.value, x));
    let V = -1;
    if (u) {
      const P = g(u);
      if (P) {
        const N = P.getRect(s.value, x);
        V = e.sticky && e.stickyOffsetTop ? h(N.top - e.stickyOffsetTop, T) : h(N.top, T);
      }
    } else V = h(m, T);
    l.value = B[V], O && c.forEach((P, N) => {
      const { state: j, $el: F } = P;
      if (N === V || N === V - 1) {
        const I = F.getBoundingClientRect();
        j.left = I.left, j.width = I.width;
      } else j.left = null, j.width = null;
      if (N === V) j.active = !0, j.top = Math.max(e.stickyOffsetTop, T[N].top - m) + x.top;
      else if (N === V - 1 && u === "") {
        const I = T[V].top - m;
        j.active = I > 0, j.top = I + x.top - T[N].height;
      } else j.active = !1;
    }), u = "";
  }, b = () => {
    ne(f);
  };
  Ne("scroll", f, { target: s, passive: !0 }), Ce(b), U(() => e.indexList, b), U(l, (O) => {
    O && t("change", O);
  });
  const w = (O) => {
    u = String(O);
    const B = g(u);
    if (B) {
      const m = no(s.value), x = we(s), { offsetHeight: T } = document.documentElement;
      if (B.$el.scrollIntoView(), m === T - x.height) return void f();
      e.sticky && e.stickyOffsetTop && (Io() === T - x.height ? ea(Io()) : ea(Io() - e.stickyOffsetTop)), t("select", B.index);
    }
  }, y = (O) => {
    const { index: B } = O.dataset;
    B && w(B);
  }, k = (O) => {
    y(O.target);
  };
  let C;
  const S = () => i("div", { ref: a, class: lr("sidebar"), style: p.value, onClick: k, onTouchstartPassive: r.start }, [e.indexList.map((O) => {
    const B = O === l.value;
    return i("span", { class: lr("index", { active: B }), style: B ? v.value : void 0, "data-index": O }, [O]);
  })]);
  return pe({ scrollTo: w }), Ne("touchmove", (O) => {
    if (r.move(O), r.isVertical()) {
      Oe(O);
      const { clientX: B, clientY: m } = O.touches[0], x = document.elementFromPoint(B, m);
      if (x) {
        const { index: T } = x.dataset;
        T && C !== T && (C = T, y(x));
      }
    }
  }, { target: a }), () => {
    var O;
    return i("div", { ref: n, class: lr() }, [e.teleport ? i(Lt, { to: e.teleport }, { default: () => [S()] }) : S(), (O = o.default) == null ? void 0 : O.call(o)]);
  };
} }), hm = {};
const [gm, bm] = Y("index-anchor");
var ym = z({ name: gm, props: { index: G }, setup(e, { slots: t }) {
  const o = ke({ top: 0, left: null, rect: { top: 0, height: 0 }, width: null, active: !1 }), n = A(), { parent: a } = Ge(Pd);
  if (!a) return void (hm.NODE_ENV !== "production" && console.error("[Vant] <IndexAnchor> must be a child component of <IndexBar>."));
  const l = () => o.active && a.props.sticky, r = E(() => {
    const { zIndex: s, highlightColor: c } = a.props;
    if (l()) return ae(ro(s), { left: o.left ? `${o.left}px` : void 0, width: o.width ? `${o.width}px` : void 0, transform: o.top ? `translate3d(0, ${o.top}px, 0)` : void 0, color: c });
  });
  return pe({ state: o, getRect: (s, c) => {
    const d = we(n);
    return o.rect.height = d.height, s === window || s === document.body ? o.rect.top = d.top + Io() : o.rect.top = d.top + no(s) - c.top, o.rect;
  } }), () => {
    const s = l();
    return i("div", { ref: n, style: { height: s ? `${o.rect.height}px` : void 0 } }, [i("div", { style: r.value, class: [bm({ sticky: s }), { [ui]: s }] }, [t.default ? t.default() : e.index])]);
  };
} });
const wm = Z(ym), xm = Z(mm), [Sm, tn, km] = Y("list");
var Cm = z({ name: Sm, props: { error: Boolean, offset: te(300), loading: Boolean, disabled: Boolean, finished: Boolean, scroller: Object, errorText: String, direction: J("down"), loadingText: String, finishedText: String, immediateCheck: W }, emits: ["load", "update:error", "update:loading"], setup(e, { emit: t, slots: o }) {
  const n = A(e.loading), a = A(), l = A(), r = Mt(od, null), s = Sn(a), c = E(() => e.scroller || s.value), d = () => {
    ne(() => {
      if (n.value || e.finished || e.disabled || e.error || (r == null ? void 0 : r.value) === !1) return;
      const { direction: g } = e, f = +e.offset, b = we(c);
      if (!b.height || zo(a)) return;
      let w = !1;
      const y = we(l);
      w = g === "up" ? b.top - y.top <= f : y.bottom - b.bottom <= f, w && (n.value = !0, t("update:loading", !0), t("load"));
    });
  }, u = () => {
    if (e.finished) {
      const g = o.finished ? o.finished() : e.finishedText;
      if (g) return i("div", { class: tn("finished-text") }, [g]);
    }
  }, p = () => {
    t("update:error", !1), d();
  }, v = () => {
    if (e.error) {
      const g = o.error ? o.error() : e.errorText;
      if (g) return i("div", { role: "button", class: tn("error-text"), tabindex: 0, onClick: p }, [g]);
    }
  }, h = () => {
    if (n.value && !e.finished && !e.disabled) return i("div", { class: tn("loading") }, [o.loading ? o.loading() : i(Et, { class: tn("loading-icon") }, { default: () => [e.loadingText || km("loading")] })]);
  };
  return U(() => [e.loading, e.finished, e.error], d), r && U(r, (g) => {
    g && d();
  }), $1(() => {
    n.value = e.loading;
  }), Ce(() => {
    e.immediateCheck && d();
  }), pe({ check: d }), Ne("scroll", d, { target: c, passive: !0 }), () => {
    var g;
    const f = (g = o.default) == null ? void 0 : g.call(o), b = i("div", { ref: l, class: tn("placeholder") }, null);
    return i("div", { ref: a, role: "feed", class: tn(), "aria-busy": n.value }, [e.direction === "down" ? f : b, h(), u(), v(), e.direction === "up" ? f : b]);
  };
} });
const Tm = Z(Cm), [Om, qt] = Y("nav-bar");
var Bm = z({ name: Om, props: { title: String, fixed: Boolean, zIndex: G, border: W, leftText: String, rightText: String, leftDisabled: Boolean, rightDisabled: Boolean, leftArrow: Boolean, placeholder: Boolean, safeAreaInsetTop: Boolean, clickable: W }, emits: ["clickLeft", "clickRight"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = Dl(n, qt), l = (c) => {
    e.leftDisabled || t("clickLeft", c);
  }, r = (c) => {
    e.rightDisabled || t("clickRight", c);
  }, s = () => {
    const { title: c, fixed: d, border: u, zIndex: p } = e, v = ro(p), h = e.leftArrow || e.leftText || o.left, g = e.rightText || o.right;
    return i("div", { ref: n, style: v, class: [qt({ fixed: d }), { [ui]: u, "van-safe-area-top": e.safeAreaInsetTop }] }, [i("div", { class: qt("content") }, [h && i("div", { class: [qt("left", { disabled: e.leftDisabled }), e.clickable && !e.leftDisabled ? Je : ""], onClick: l }, [o.left ? o.left() : [e.leftArrow && i(ie, { class: qt("arrow"), name: "arrow-left" }, null), e.leftText && i("span", { class: qt("text") }, [e.leftText])]]), i("div", { class: [qt("title"), "van-ellipsis"] }, [o.title ? o.title() : c]), g && i("div", { class: [qt("right", { disabled: e.rightDisabled }), e.clickable && !e.rightDisabled ? Je : ""], onClick: r }, [o.right ? o.right() : i("span", { class: qt("text") }, [e.rightText])])])]);
  };
  return () => e.fixed && e.placeholder ? a(s) : s();
} });
const Vm = Z(Bm), [Dm, Pn] = Y("notice-bar");
var Am = z({ name: Dm, props: { text: String, mode: String, color: String, delay: te(1), speed: te(60), leftIcon: String, wrapable: Boolean, background: String, scrollable: { type: Boolean, default: null } }, emits: ["close", "replay"], setup(e, { emit: t, slots: o }) {
  let n, a = 0, l = 0;
  const r = A(), s = A(), c = ke({ show: !0, offset: 0, duration: 0 }), d = (g) => {
    e.mode === "closeable" && (c.show = !1, t("close", g));
  }, u = () => {
    if (o["right-icon"]) return o["right-icon"]();
    const g = e.mode === "closeable" ? "cross" : e.mode === "link" ? "arrow" : void 0;
    return g ? i(ie, { name: g, class: Pn("right-icon"), onClick: d }, null) : void 0;
  }, p = () => {
    c.offset = a, c.duration = 0, Ke(() => {
      go(() => {
        c.offset = -l, c.duration = (l + a) / +e.speed, t("replay");
      });
    });
  }, v = () => {
    const g = e.scrollable === !1 && !e.wrapable, f = { transform: c.offset ? `translateX(${c.offset}px)` : "", transitionDuration: `${c.duration}s` };
    return i("div", { ref: r, role: "marquee", class: Pn("wrap") }, [i("div", { ref: s, style: f, class: [Pn("content"), { "van-ellipsis": g }], onTransitionend: p }, [o.default ? o.default() : e.text])]);
  }, h = () => {
    const { delay: g, speed: f, scrollable: b } = e, w = fe(g) ? 1e3 * +g : 0;
    a = 0, l = 0, c.offset = 0, c.duration = 0, clearTimeout(n), n = setTimeout(() => {
      if (!r.value || !s.value || b === !1) return;
      const y = we(r).width, k = we(s).width;
      (b || k > y) && go(() => {
        a = y, l = k, c.offset = -l, c.duration = l / +f;
      });
    }, w);
  };
  return Vl(h), xn(h), Ne("pageshow", h), pe({ reset: h }), U(() => [e.text, e.scrollable], h), () => {
    const { color: g, wrapable: f, background: b } = e;
    return De(i("div", { role: "alert", class: Pn({ wrapable: f }), style: { color: g, background: b } }, [o["left-icon"] ? o["left-icon"]() : e.leftIcon ? i(ie, { class: Pn("left-icon"), name: e.leftIcon }, null) : void 0, v(), u()]), [[Ie, c.show]]);
  };
} });
const Em = Z(Am), [Pm, Im] = Y("notify"), $m = ["lockScroll", "position", "show", "teleport", "zIndex"];
var jm = z({ name: Pm, props: ae({}, kn, { type: J("danger"), color: String, message: G, position: J("top"), className: Ae, background: String, lockScroll: Boolean }), emits: ["update:show"], setup(e, { emit: t, slots: o }) {
  const n = (a) => t("update:show", a);
  return () => i(xt, Q({ class: [Im([e.type]), e.className], style: { color: e.color, background: e.background }, overlay: !1, duration: 0.2, "onUpdate:show": n }, he(e, $m)), { default: () => [o.default ? o.default() : e.message] });
} });
const zm = Z(jm), [Rm, Kn] = Y("key"), Nm = i("svg", { class: Kn("collapse-icon"), viewBox: "0 0 30 24" }, [i("path", { d: "M26 13h-2v2h2v-2zm-8-3h2V8h-2v2zm2-4h2V4h-2v2zm2 4h4V4h-2v4h-2v2zm-7 14 3-3h-6l3 3zM6 13H4v2h2v-2zm16 0H8v2h14v-2zm-12-3h2V8h-2v2zM28 0l1 1 1 1v15l-1 2H1l-1-2V2l1-1 1-1zm0 2H2v15h26V2zM6 4v2H4V4zm10 2h2V4h-2v2zM8 9v1H4V8zm8 0v1h-2V8zm-6-5v2H8V4zm4 0v2h-2V4z", fill: "currentColor" }, null)]), Mm = i("svg", { class: Kn("delete-icon"), viewBox: "0 0 32 22" }, [i("path", { d: "M28 0a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H10.4a2 2 0 0 1-1.4-.6L1 13.1c-.6-.5-.9-1.3-.9-2 0-1 .3-1.7.9-2.2L9 .6a2 2 0 0 1 1.4-.6zm0 2H10.4l-8.2 8.3a1 1 0 0 0-.3.7c0 .3.1.5.3.7l8.2 8.4H28a2 2 0 0 0 2-2V4c0-1.1-.9-2-2-2zm-5 4a1 1 0 0 1 .7.3 1 1 0 0 1 0 1.4L20.4 11l3.3 3.3c.2.2.3.5.3.7 0 .3-.1.5-.3.7a1 1 0 0 1-.7.3 1 1 0 0 1-.7-.3L19 12.4l-3.4 3.3a1 1 0 0 1-.6.3 1 1 0 0 1-.7-.3 1 1 0 0 1-.3-.7c0-.2.1-.5.3-.7l3.3-3.3-3.3-3.3A1 1 0 0 1 14 7c0-.3.1-.5.3-.7A1 1 0 0 1 15 6a1 1 0 0 1 .6.3L19 9.6l3.3-3.3A1 1 0 0 1 23 6z", fill: "currentColor" }, null)]);
var rr = z({ name: Rm, props: { type: String, text: G, color: String, wider: Boolean, large: Boolean, loading: Boolean }, emits: ["press"], setup(e, { emit: t, slots: o }) {
  const n = A(!1), a = wt(), l = (d) => {
    a.start(d), n.value = !0;
  }, r = (d) => {
    a.move(d), a.direction.value && (n.value = !1);
  }, s = (d) => {
    n.value && (o.default || Oe(d), n.value = !1, t("press", e.text, e.type));
  }, c = () => {
    if (e.loading) return i(Et, { class: Kn("loading-icon") }, null);
    const d = o.default ? o.default() : e.text;
    switch (e.type) {
      case "delete":
        return d || Mm;
      case "extra":
        return d || Nm;
      default:
        return d;
    }
  };
  return () => i("div", { class: Kn("wrapper", { wider: e.wider }), onTouchstartPassive: l, onTouchmovePassive: r, onTouchend: s, onTouchcancel: s }, [i("div", { role: "button", tabindex: 0, class: Kn([e.color, { large: e.large, active: n.value, delete: e.type === "delete" }]) }, [c()])]);
} });
const [Lm, po] = Y("number-keyboard");
var Fm = z({ name: Lm, inheritAttrs: !1, props: { show: Boolean, title: String, theme: J("default"), zIndex: G, teleport: [String, Object], maxlength: te(1 / 0), modelValue: J(""), transition: W, blurOnClose: W, showDeleteKey: W, randomKeyOrder: Boolean, closeButtonText: String, deleteButtonText: String, closeButtonLoading: Boolean, hideOnClickOutside: W, safeAreaInsetBottom: W, extraKey: { type: [String, Array], default: "" } }, emits: ["show", "hide", "blur", "input", "close", "delete", "update:modelValue"], setup(e, { emit: t, slots: o, attrs: n }) {
  const a = A(), l = () => {
    const v = Array(9).fill("").map((h, g) => ({ text: g + 1 }));
    return e.randomKeyOrder && function(h) {
      for (let g = h.length - 1; g > 0; g--) {
        const f = Math.floor(Math.random() * (g + 1)), b = h[g];
        h[g] = h[f], h[f] = b;
      }
    }(v), v;
  }, r = E(() => e.theme === "custom" ? (() => {
    const v = l(), { extraKey: h } = e, g = Array.isArray(h) ? h : [h];
    return g.length === 0 ? v.push({ text: 0, wider: !0 }) : g.length === 1 ? v.push({ text: 0, wider: !0 }, { text: g[0], type: "extra" }) : g.length === 2 && v.push({ text: g[0], type: "extra" }, { text: 0 }, { text: g[1], type: "extra" }), v;
  })() : [...l(), { text: e.extraKey, type: "extra" }, { text: 0 }, { text: e.showDeleteKey ? e.deleteButtonText : "", type: e.showDeleteKey ? "delete" : "" }]), s = () => {
    e.show && t("blur");
  }, c = () => {
    t("close"), e.blurOnClose && s();
  }, d = () => t(e.show ? "show" : "hide"), u = (v, h) => {
    if (v === "") return void (h === "extra" && s());
    const g = e.modelValue;
    h === "delete" ? (t("delete"), t("update:modelValue", g.slice(0, g.length - 1))) : h === "close" ? c() : g.length < +e.maxlength && (t("input", v), t("update:modelValue", g + v));
  }, p = () => {
    if (e.theme === "custom") return i("div", { class: po("sidebar") }, [e.showDeleteKey && i(rr, { large: !0, text: e.deleteButtonText, type: "delete", onPress: u }, { default: o.delete }), i(rr, { large: !0, text: e.closeButtonText, type: "close", color: "blue", loading: e.closeButtonLoading, onPress: u }, null)]);
  };
  return U(() => e.show, (v) => {
    e.transition || t(v ? "show" : "hide");
  }), e.hideOnClickOutside && Ol(a, s, { eventName: "touchstart" }), () => {
    const v = (() => {
      const { title: g, theme: f, closeButtonText: b } = e, w = o["title-left"], y = b && f === "default";
      if (g || y || w) return i("div", { class: po("header") }, [w && i("span", { class: po("title-left") }, [w()]), g && i("h2", { class: po("title") }, [g]), y && i("button", { type: "button", class: [po("close"), Je], onClick: c }, [b])]);
    })(), h = i(wn, { name: e.transition ? "van-slide-up" : "" }, { default: () => [De(i("div", Q({ ref: a, style: ro(e.zIndex), class: po({ unfit: !e.safeAreaInsetBottom, "with-title": !!v }), onAnimationend: d, onTouchstartPassive: si }, n), [v, i("div", { class: po("body") }, [i("div", { class: po("keys") }, [r.value.map((g) => {
      const f = {};
      return g.type === "delete" && (f.default = o.delete), g.type === "extra" && (f.default = o["extra-key"]), i(rr, { key: g.text, text: g.text, type: g.type, wider: g.wider, color: g.color, onPress: u }, f);
    })]), p()])]), [[Ie, e.show]])] });
    return e.teleport ? i(Lt, { to: e.teleport }, { default: () => [h] }) : h;
  };
} });
const _m = Z(Fm), [Hm, on, Ms] = Y("pagination"), ir = (e, t, o) => ({ number: e, text: t, active: o });
var Um = z({ name: Hm, props: { mode: J("multi"), prevText: String, nextText: String, pageCount: te(0), modelValue: _e(0), totalItems: te(0), showPageSize: te(5), itemsPerPage: te(10), forceEllipses: Boolean, showPrevButton: W, showNextButton: W }, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = E(() => {
    const { pageCount: c, totalItems: d, itemsPerPage: u } = e, p = +c || Math.ceil(+d / +u);
    return Math.max(1, p);
  }), a = E(() => {
    const c = [], d = n.value, u = +e.showPageSize, { modelValue: p, forceEllipses: v } = e;
    let h = 1, g = d;
    const f = u < d;
    f && (h = Math.max(p - Math.floor(u / 2), 1), g = h + u - 1, g > d && (g = d, h = g - u + 1));
    for (let b = h; b <= g; b++) {
      const w = ir(b, b, b === p);
      c.push(w);
    }
    if (f && u > 0 && v) {
      if (h > 1) {
        const b = ir(h - 1, "...");
        c.unshift(b);
      }
      if (g < d) {
        const b = ir(g + 1, "...");
        c.push(b);
      }
    }
    return c;
  }), l = (c, d) => {
    c = qe(c, 1, n.value), e.modelValue !== c && (t("update:modelValue", c), d && t("change", c));
  };
  ao(() => l(e.modelValue));
  const r = () => {
    const { mode: c, modelValue: d, showPrevButton: u } = e;
    if (!u) return;
    const p = o["prev-text"], v = d === 1;
    return i("li", { class: [on("item", { disabled: v, border: c === "simple", prev: !0 }), Gn] }, [i("button", { type: "button", disabled: v, onClick: () => l(d - 1, !0) }, [p ? p() : e.prevText || Ms("prev")])]);
  }, s = () => {
    const { mode: c, modelValue: d, showNextButton: u } = e;
    if (!u) return;
    const p = o["next-text"], v = d === n.value;
    return i("li", { class: [on("item", { disabled: v, border: c === "simple", next: !0 }), Gn] }, [i("button", { type: "button", disabled: v, onClick: () => l(d + 1, !0) }, [p ? p() : e.nextText || Ms("next")])]);
  };
  return () => i("nav", { role: "navigation", class: on() }, [i("ul", { class: on("items") }, [r(), e.mode === "simple" ? i("li", { class: on("page-desc") }, [o.pageDesc ? o.pageDesc() : `${e.modelValue}/${n.value}`]) : a.value.map((c) => i("li", { class: [on("item", { active: c.active, page: !0 }), Gn] }, [i("button", { type: "button", "aria-current": c.active || void 0, onClick: () => l(c.number, !0) }, [o.page ? o.page(c) : c.text])])), s()])]);
} });
const qm = Z(Um), [Wm, In] = Y("password-input");
var Ym = z({ name: Wm, props: { info: String, mask: W, value: J(""), gutter: G, length: te(6), focused: Boolean, errorInfo: String }, emits: ["focus"], setup(e, { emit: t }) {
  const o = (a) => {
    a.stopPropagation(), t("focus", a);
  }, n = () => {
    const a = [], { mask: l, value: r, gutter: s, focused: c } = e, d = +e.length;
    for (let u = 0; u < d; u++) {
      const p = r[u], v = u !== 0 && !s, h = c && u === r.length;
      let g;
      u !== 0 && s && (g = { marginLeft: ce(s) }), a.push(i("li", { class: [{ [Au]: v }, In("item", { focus: h })], style: g }, [l ? i("i", { style: { visibility: p ? "visible" : "hidden" } }, null) : p, h && i("div", { class: In("cursor") }, null)]));
    }
    return a;
  };
  return () => {
    const a = e.errorInfo || e.info;
    return i("div", { class: In() }, [i("ul", { class: [In("security"), { [Gn]: !e.gutter }], onTouchstartPassive: o }, [n()]), a && i("div", { class: In(e.errorInfo ? "error-info" : "info") }, [a])]);
  };
} });
const Xm = Z(Ym), Gm = Z(sv);
function Pt(e) {
  if (e == null) return window;
  if (e.toString() !== "[object Window]") {
    var t = e.ownerDocument;
    return t && t.defaultView || window;
  }
  return e;
}
function Ti(e) {
  return e instanceof Pt(e).Element || e instanceof Element;
}
function Ot(e) {
  return e instanceof Pt(e).HTMLElement || e instanceof HTMLElement;
}
function Id(e) {
  return typeof ShadowRoot < "u" && (e instanceof Pt(e).ShadowRoot || e instanceof ShadowRoot);
}
var mn = Math.round;
function qr() {
  var e = navigator.userAgentData;
  return e != null && e.brands ? e.brands.map(function(t) {
    return t.brand + "/" + t.version;
  }).join(" ") : navigator.userAgent;
}
function Qa(e, t, o) {
  t === void 0 && (t = !1), o === void 0 && (o = !1);
  var n = e.getBoundingClientRect(), a = 1, l = 1;
  t && Ot(e) && (a = e.offsetWidth > 0 && mn(n.width) / e.offsetWidth || 1, l = e.offsetHeight > 0 && mn(n.height) / e.offsetHeight || 1);
  var r = (Ti(e) ? Pt(e) : window).visualViewport, s = !!/^((?!chrome|android).)*safari/i.test(qr()) && o, c = (n.left + (s && r ? r.offsetLeft : 0)) / a, d = (n.top + (s && r ? r.offsetTop : 0)) / l, u = n.width / a, p = n.height / l;
  return { width: u, height: p, top: d, right: c + u, bottom: d + p, left: c, x: c, y: d };
}
function Ls(e) {
  var t = Pt(e);
  return { scrollLeft: t.pageXOffset, scrollTop: t.pageYOffset };
}
function eo(e) {
  return e ? (e.nodeName || "").toLowerCase() : null;
}
function fl(e) {
  return ((Ti(e) ? e.ownerDocument : e.document) || window.document).documentElement;
}
function Jt(e) {
  return Pt(e).getComputedStyle(e);
}
function Oi(e) {
  var t = Jt(e), o = t.overflow, n = t.overflowX, a = t.overflowY;
  return /auto|scroll|overlay|hidden/.test(o + a + n);
}
function Zm(e, t, o) {
  o === void 0 && (o = !1);
  var n, a, l = Ot(t), r = Ot(t) && function(p) {
    var v = p.getBoundingClientRect(), h = mn(v.width) / p.offsetWidth || 1, g = mn(v.height) / p.offsetHeight || 1;
    return h !== 1 || g !== 1;
  }(t), s = fl(t), c = Qa(e, r, o), d = { scrollLeft: 0, scrollTop: 0 }, u = { x: 0, y: 0 };
  return (l || !l && !o) && ((eo(t) !== "body" || Oi(s)) && (d = (n = t) !== Pt(n) && Ot(n) ? { scrollLeft: (a = n).scrollLeft, scrollTop: a.scrollTop } : Ls(n)), Ot(t) ? ((u = Qa(t, !0)).x += t.clientLeft, u.y += t.clientTop) : s && (u.x = function(p) {
    return Qa(fl(p)).left + Ls(p).scrollLeft;
  }(s))), { x: c.left + d.scrollLeft - u.x, y: c.top + d.scrollTop - u.y, width: c.width, height: c.height };
}
function Km(e) {
  var t = Qa(e), o = e.offsetWidth, n = e.offsetHeight;
  return Math.abs(t.width - o) <= 1 && (o = t.width), Math.abs(t.height - n) <= 1 && (n = t.height), { x: e.offsetLeft, y: e.offsetTop, width: o, height: n };
}
function Bi(e) {
  return eo(e) === "html" ? e : e.assignedSlot || e.parentNode || (Id(e) ? e.host : null) || fl(e);
}
function $d(e) {
  return ["html", "body", "#document"].indexOf(eo(e)) >= 0 ? e.ownerDocument.body : Ot(e) && Oi(e) ? e : $d(Bi(e));
}
function el(e, t) {
  var o;
  t === void 0 && (t = []);
  var n = $d(e), a = n === ((o = e.ownerDocument) == null ? void 0 : o.body), l = Pt(n), r = a ? [l].concat(l.visualViewport || [], Oi(n) ? n : []) : n, s = t.concat(r);
  return a ? s : s.concat(el(Bi(r)));
}
function Jm(e) {
  return ["table", "td", "th"].indexOf(eo(e)) >= 0;
}
function Fs(e) {
  return Ot(e) && Jt(e).position !== "fixed" ? e.offsetParent : null;
}
function jd(e) {
  for (var t = Pt(e), o = Fs(e); o && Jm(o) && Jt(o).position === "static"; ) o = Fs(o);
  return o && (eo(o) === "html" || eo(o) === "body" && Jt(o).position === "static") ? t : o || function(n) {
    var a = /firefox/i.test(qr());
    if (/Trident/i.test(qr()) && Ot(n) && Jt(n).position === "fixed") return null;
    var l = Bi(n);
    for (Id(l) && (l = l.host); Ot(l) && ["html", "body"].indexOf(eo(l)) < 0; ) {
      var r = Jt(l);
      if (r.transform !== "none" || r.perspective !== "none" || r.contain === "paint" || ["transform", "perspective"].indexOf(r.willChange) !== -1 || a && r.willChange === "filter" || a && r.filter && r.filter !== "none") return l;
      l = l.parentNode;
    }
    return null;
  }(e) || t;
}
var dn = "top", ml = "bottom", aa = "right", $o = "left", zd = "auto", Rd = "start", hl = "end", Qm = [].concat([dn, ml, aa, $o], [zd]).reduce(function(e, t) {
  return e.concat([t, t + "-" + Rd, t + "-" + hl]);
}, []), sr = ["beforeRead", "read", "afterRead", "beforeMain", "main", "afterMain", "beforeWrite", "write", "afterWrite"];
function eh(e) {
  var t = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set(), n = [];
  function a(l) {
    o.add(l.name), [].concat(l.requires || [], l.requiresIfExists || []).forEach(function(r) {
      if (!o.has(r)) {
        var s = t.get(r);
        s && a(s);
      }
    }), n.push(l);
  }
  return e.forEach(function(l) {
    t.set(l.name, l);
  }), e.forEach(function(l) {
    o.has(l.name) || a(l);
  }), n;
}
function vo(e) {
  for (var t = arguments.length, o = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++) o[n - 1] = arguments[n];
  return [].concat(o).reduce(function(a, l) {
    return a.replace(/%s/, l);
  }, e);
}
var Oo = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s', _s = ["name", "enabled", "phase", "fn", "effect", "requires", "options"];
function jl(e) {
  return e.split("-")[0];
}
function Nd(e) {
  return e.split("-")[1];
}
var Hs = "Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.", Us = { placement: "bottom", modifiers: [], strategy: "absolute" };
function qs() {
  for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
  return !t.some(function(n) {
    return !(n && typeof n.getBoundingClientRect == "function");
  });
}
function th(e) {
  e === void 0 && (e = {});
  var t = e, o = t.defaultModifiers, n = o === void 0 ? [] : o, a = t.defaultOptions, l = a === void 0 ? Us : a;
  return function(r, s, c) {
    c === void 0 && (c = l);
    var d, u, p = { placement: "bottom", orderedModifiers: [], options: Object.assign({}, Us, l), modifiersData: {}, elements: { reference: r, popper: s }, attributes: {}, styles: {} }, v = [], h = !1, g = { state: p, setOptions: function(b) {
      var w = typeof b == "function" ? b(p.options) : b;
      f(), p.options = Object.assign({}, l, p.options, w), p.scrollParents = { reference: Ti(r) ? el(r) : r.contextElement ? el(r.contextElement) : [], popper: el(s) };
      var y = function(B) {
        var m = eh(B);
        return sr.reduce(function(x, T) {
          return x.concat(m.filter(function(V) {
            return V.phase === T;
          }));
        }, []);
      }(function(B) {
        var m = B.reduce(function(x, T) {
          var V = x[T.name];
          return x[T.name] = V ? Object.assign({}, V, T, { options: Object.assign({}, V.options, T.options), data: Object.assign({}, V.data, T.data) }) : T, x;
        }, {});
        return Object.keys(m).map(function(x) {
          return m[x];
        });
      }([].concat(n, p.options.modifiers)));
      p.orderedModifiers = y.filter(function(B) {
        return B.enabled;
      }), function(B) {
        B.forEach(function(m) {
          [].concat(Object.keys(m), _s).filter(function(x, T, V) {
            return V.indexOf(x) === T;
          }).forEach(function(x) {
            switch (x) {
              case "name":
                typeof m.name != "string" && console.error(vo(Oo, String(m.name), '"name"', '"string"', '"' + String(m.name) + '"'));
                break;
              case "enabled":
                typeof m.enabled != "boolean" && console.error(vo(Oo, m.name, '"enabled"', '"boolean"', '"' + String(m.enabled) + '"'));
                break;
              case "phase":
                sr.indexOf(m.phase) < 0 && console.error(vo(Oo, m.name, '"phase"', "either " + sr.join(", "), '"' + String(m.phase) + '"'));
                break;
              case "fn":
                typeof m.fn != "function" && console.error(vo(Oo, m.name, '"fn"', '"function"', '"' + String(m.fn) + '"'));
                break;
              case "effect":
                m.effect != null && typeof m.effect != "function" && console.error(vo(Oo, m.name, '"effect"', '"function"', '"' + String(m.fn) + '"'));
                break;
              case "requires":
                m.requires == null || Array.isArray(m.requires) || console.error(vo(Oo, m.name, '"requires"', '"array"', '"' + String(m.requires) + '"'));
                break;
              case "requiresIfExists":
                Array.isArray(m.requiresIfExists) || console.error(vo(Oo, m.name, '"requiresIfExists"', '"array"', '"' + String(m.requiresIfExists) + '"'));
                break;
              case "options":
              case "data":
                break;
              default:
                console.error('PopperJS: an invalid property has been provided to the "' + m.name + '" modifier, valid properties are ' + _s.map(function(T) {
                  return '"' + T + '"';
                }).join(", ") + '; but "' + x + '" was provided.');
            }
            m.requires && m.requires.forEach(function(T) {
              B.find(function(V) {
                return V.name === T;
              }) == null && console.error(vo('Popper: modifier "%s" requires "%s", but "%s" modifier is not available', String(m.name), T, T));
            });
          });
        });
      }((k = [].concat(y, p.options.modifiers), C = function(B) {
        return B.name;
      }, S = /* @__PURE__ */ new Set(), k.filter(function(B) {
        var m = C(B);
        if (!S.has(m)) return S.add(m), !0;
      }))), jl(p.options.placement) === zd && (p.orderedModifiers.find(function(B) {
        return B.name === "flip";
      }) || console.error(['Popper: "auto" placements require the "flip" modifier be', "present and enabled to work."].join(" ")));
      var k, C, S, O = Jt(s);
      return [O.marginTop, O.marginRight, O.marginBottom, O.marginLeft].some(function(B) {
        return parseFloat(B);
      }) && console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', "between the popper and its reference element or boundary.", "To replicate margin, use the `offset` modifier, as well as", "the `padding` option in the `preventOverflow` and `flip`", "modifiers."].join(" ")), p.orderedModifiers.forEach(function(B) {
        var m = B.name, x = B.options, T = x === void 0 ? {} : x, V = B.effect;
        if (typeof V == "function") {
          var P = V({ state: p, name: m, instance: g, options: T }), N = function() {
          };
          v.push(P || N);
        }
      }), g.update();
    }, forceUpdate: function() {
      if (!h) {
        var b = p.elements, w = b.reference, y = b.popper;
        if (qs(w, y)) {
          p.rects = { reference: Zm(w, jd(y), p.options.strategy === "fixed"), popper: Km(y) }, p.reset = !1, p.placement = p.options.placement, p.orderedModifiers.forEach(function(T) {
            return p.modifiersData[T.name] = Object.assign({}, T.data);
          });
          for (var k = 0, C = 0; C < p.orderedModifiers.length; C++) {
            if ((k += 1) > 100) {
              console.error("Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.");
              break;
            }
            if (p.reset !== !0) {
              var S = p.orderedModifiers[C], O = S.fn, B = S.options, m = B === void 0 ? {} : B, x = S.name;
              typeof O == "function" && (p = O({ state: p, options: m, name: x, instance: g }) || p);
            } else p.reset = !1, C = -1;
          }
        } else console.error(Hs);
      }
    }, update: (d = function() {
      return new Promise(function(b) {
        g.forceUpdate(), b(p);
      });
    }, function() {
      return u || (u = new Promise(function(b) {
        Promise.resolve().then(function() {
          u = void 0, b(d());
        });
      })), u;
    }), destroy: function() {
      f(), h = !0;
    } };
    if (!qs(r, s)) return console.error(Hs), g;
    function f() {
      v.forEach(function(b) {
        return b();
      }), v = [];
    }
    return g.setOptions(c).then(function(b) {
      !h && c.onFirstUpdate && c.onFirstUpdate(b);
    }), g;
  };
}
var Aa = { passive: !0 }, oh = { name: "eventListeners", enabled: !0, phase: "write", fn: function() {
}, effect: function(e) {
  var t = e.state, o = e.instance, n = e.options, a = n.scroll, l = a === void 0 || a, r = n.resize, s = r === void 0 || r, c = Pt(t.elements.popper), d = [].concat(t.scrollParents.reference, t.scrollParents.popper);
  return l && d.forEach(function(u) {
    u.addEventListener("scroll", o.update, Aa);
  }), s && c.addEventListener("resize", o.update, Aa), function() {
    l && d.forEach(function(u) {
      u.removeEventListener("scroll", o.update, Aa);
    }), s && c.removeEventListener("resize", o.update, Aa);
  };
}, data: {} }, nh = { name: "popperOffsets", enabled: !0, phase: "read", fn: function(e) {
  var t = e.state, o = e.name;
  t.modifiersData[o] = function(n) {
    var a, l = n.reference, r = n.element, s = n.placement, c = s ? jl(s) : null, d = s ? Nd(s) : null, u = l.x + l.width / 2 - r.width / 2, p = l.y + l.height / 2 - r.height / 2;
    switch (c) {
      case dn:
        a = { x: u, y: l.y - r.height };
        break;
      case ml:
        a = { x: u, y: l.y + l.height };
        break;
      case aa:
        a = { x: l.x + l.width, y: p };
        break;
      case $o:
        a = { x: l.x - r.width, y: p };
        break;
      default:
        a = { x: l.x, y: l.y };
    }
    var v = c ? function(g) {
      return ["top", "bottom"].indexOf(g) >= 0 ? "x" : "y";
    }(c) : null;
    if (v != null) {
      var h = v === "y" ? "height" : "width";
      switch (d) {
        case Rd:
          a[v] = a[v] - (l[h] / 2 - r[h] / 2);
          break;
        case hl:
          a[v] = a[v] + (l[h] / 2 - r[h] / 2);
      }
    }
    return a;
  }({ reference: t.rects.reference, element: t.rects.popper, placement: t.placement });
}, data: {} }, ah = { top: "auto", right: "auto", bottom: "auto", left: "auto" };
function Ws(e) {
  var t, o = e.popper, n = e.popperRect, a = e.placement, l = e.variation, r = e.offsets, s = e.position, c = e.gpuAcceleration, d = e.adaptive, u = e.roundOffsets, p = e.isFixed, v = r.x, h = v === void 0 ? 0 : v, g = r.y, f = g === void 0 ? 0 : g, b = typeof u == "function" ? u({ x: h, y: f }) : { x: h, y: f };
  h = b.x, f = b.y;
  var w = r.hasOwnProperty("x"), y = r.hasOwnProperty("y"), k = $o, C = dn, S = window;
  if (d) {
    var O = jd(o), B = "clientHeight", m = "clientWidth";
    O === Pt(o) && Jt(O = fl(o)).position !== "static" && s === "absolute" && (B = "scrollHeight", m = "scrollWidth"), (a === dn || (a === $o || a === aa) && l === hl) && (C = ml, f -= (p && O === S && S.visualViewport ? S.visualViewport.height : O[B]) - n.height, f *= c ? 1 : -1), (a === $o || (a === dn || a === ml) && l === hl) && (k = aa, h -= (p && O === S && S.visualViewport ? S.visualViewport.width : O[m]) - n.width, h *= c ? 1 : -1);
  }
  var x, T = Object.assign({ position: s }, d && ah), V = u === !0 ? function(P) {
    var N = P.x, j = P.y, F = window.devicePixelRatio || 1;
    return { x: mn(N * F) / F || 0, y: mn(j * F) / F || 0 };
  }({ x: h, y: f }) : { x: h, y: f };
  return h = V.x, f = V.y, c ? Object.assign({}, T, ((x = {})[C] = y ? "0" : "", x[k] = w ? "0" : "", x.transform = (S.devicePixelRatio || 1) <= 1 ? "translate(" + h + "px, " + f + "px)" : "translate3d(" + h + "px, " + f + "px, 0)", x)) : Object.assign({}, T, ((t = {})[C] = y ? f + "px" : "", t[k] = w ? h + "px" : "", t.transform = "", t));
}
var lh = { name: "applyStyles", enabled: !0, phase: "write", fn: function(e) {
  var t = e.state;
  Object.keys(t.elements).forEach(function(o) {
    var n = t.styles[o] || {}, a = t.attributes[o] || {}, l = t.elements[o];
    Ot(l) && eo(l) && (Object.assign(l.style, n), Object.keys(a).forEach(function(r) {
      var s = a[r];
      s === !1 ? l.removeAttribute(r) : l.setAttribute(r, s === !0 ? "" : s);
    }));
  });
}, effect: function(e) {
  var t = e.state, o = { popper: { position: t.options.strategy, left: "0", top: "0", margin: "0" }, arrow: { position: "absolute" }, reference: {} };
  return Object.assign(t.elements.popper.style, o.popper), t.styles = o, t.elements.arrow && Object.assign(t.elements.arrow.style, o.arrow), function() {
    Object.keys(t.elements).forEach(function(n) {
      var a = t.elements[n], l = t.attributes[n] || {}, r = Object.keys(t.styles.hasOwnProperty(n) ? t.styles[n] : o[n]).reduce(function(s, c) {
        return s[c] = "", s;
      }, {});
      Ot(a) && eo(a) && (Object.assign(a.style, r), Object.keys(l).forEach(function(s) {
        a.removeAttribute(s);
      }));
    });
  };
}, requires: ["computeStyles"] }, rh = th({ defaultModifiers: [oh, nh, { name: "computeStyles", enabled: !0, phase: "beforeWrite", fn: function(e) {
  var t = e.state, o = e.options, n = o.gpuAcceleration, a = n === void 0 || n, l = o.adaptive, r = l === void 0 || l, s = o.roundOffsets, c = s === void 0 || s, d = Jt(t.elements.popper).transitionProperty || "";
  r && ["transform", "top", "right", "bottom", "left"].some(function(p) {
    return d.indexOf(p) >= 0;
  }) && console.warn(["Popper: Detected CSS transitions on at least one of the following", 'CSS properties: "transform", "top", "right", "bottom", "left".', `

`, 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', "for smooth transitions, or remove these properties from the CSS", "transition declaration on the popper element if only transitioning", "opacity or background-color for example.", `

`, "We recommend using the popper element as a wrapper around an inner", "element that can have any CSS property transitioned for animations."].join(" "));
  var u = { placement: jl(t.placement), variation: Nd(t.placement), popper: t.elements.popper, popperRect: t.rects.popper, gpuAcceleration: a, isFixed: t.options.strategy === "fixed" };
  t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, Ws(Object.assign({}, u, { offsets: t.modifiersData.popperOffsets, position: t.options.strategy, adaptive: r, roundOffsets: c })))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, Ws(Object.assign({}, u, { offsets: t.modifiersData.arrow, position: "absolute", adaptive: !1, roundOffsets: c })))), t.attributes.popper = Object.assign({}, t.attributes.popper, { "data-popper-placement": t.placement });
}, data: {} }, lh] }), ih = { name: "offset", enabled: !0, phase: "main", requires: ["popperOffsets"], fn: function(e) {
  var t = e.state, o = e.options, n = e.name, a = o.offset, l = a === void 0 ? [0, 0] : a, r = Qm.reduce(function(u, p) {
    return u[p] = function(v, h, g) {
      var f = jl(v), b = [$o, dn].indexOf(f) >= 0 ? -1 : 1, w = typeof g == "function" ? g(Object.assign({}, h, { placement: v })) : g, y = w[0], k = w[1];
      return y = y || 0, k = (k || 0) * b, [$o, aa].indexOf(f) >= 0 ? { x: k, y } : { x: y, y: k };
    }(p, t.rects, l), u;
  }, {}), s = r[t.placement], c = s.x, d = s.y;
  t.modifiersData.popperOffsets != null && (t.modifiersData.popperOffsets.x += c, t.modifiersData.popperOffsets.y += d), t.modifiersData[n] = r;
} };
const [sh, Bo] = Y("popover"), ch = ["overlay", "duration", "teleport", "overlayStyle", "overlayClass", "closeOnClickOverlay"];
var uh = z({ name: sh, props: { show: Boolean, theme: J("light"), overlay: Boolean, actions: Ve(), actionsDirection: J("vertical"), trigger: J("click"), duration: G, showArrow: W, placement: J("bottom"), iconPrefix: String, overlayClass: Ae, overlayStyle: Object, closeOnClickAction: W, closeOnClickOverlay: W, closeOnClickOutside: W, offset: { type: Array, default: () => [0, 8] }, teleport: { type: [String, Object], default: "body" } }, emits: ["select", "touchstart", "update:show"], setup(e, { emit: t, slots: o, attrs: n }) {
  let a;
  const l = A(), r = A(), s = A(), c = fi(() => e.show, (f) => t("update:show", f)), d = () => ({ placement: e.placement, modifiers: [{ name: "computeStyles", options: { adaptive: !1, gpuAcceleration: !1 } }, ae({}, ih, { options: { offset: e.offset } })] }), u = () => {
    ne(() => {
      c.value && (a ? a.setOptions(d()) : (a = r.value && s.value ? rh(r.value, s.value.popupRef.value, d()) : null, bt && (window.addEventListener("animationend", u), window.addEventListener("transitionend", u))));
    });
  }, p = (f) => {
    c.value = f;
  }, v = () => {
    e.trigger === "click" && (c.value = !c.value);
  }, h = (f, b) => o.action ? o.action({ action: f, index: b }) : [f.icon && i(ie, { name: f.icon, classPrefix: e.iconPrefix, class: Bo("action-icon") }, null), i("div", { class: [Bo("action-text"), { [ui]: e.actionsDirection === "vertical" }] }, [f.text])], g = (f, b) => {
    const { icon: w, color: y, disabled: k, className: C } = f;
    return i("div", { role: "menuitem", class: [Bo("action", { disabled: k, "with-icon": w }), { [Q1]: e.actionsDirection === "horizontal" }, C], style: { color: y }, tabindex: k ? void 0 : 0, "aria-disabled": k || void 0, onClick: () => ((S, O) => {
      S.disabled || (t("select", S, O), e.closeOnClickAction && (c.value = !1));
    })(f, b) }, [h(f, b)]);
  };
  return Ce(() => {
    u(), ao(() => {
      var f;
      l.value = (f = s.value) == null ? void 0 : f.popupRef.value;
    });
  }), yt(() => {
    a && (bt && (window.removeEventListener("animationend", u), window.removeEventListener("transitionend", u)), a.destroy(), a = null);
  }), U(() => [c.value, e.offset, e.placement], u), Ol([r, l], () => {
    c.value && e.closeOnClickOutside && (!e.overlay || e.closeOnClickOverlay) && (c.value = !1);
  }, { eventName: "touchstart" }), () => {
    var f;
    return i(be, null, [i("span", { ref: r, class: Bo("wrapper"), onClick: v }, [(f = o.reference) == null ? void 0 : f.call(o)]), i(xt, Q({ ref: s, show: c.value, class: Bo([e.theme]), position: "", transition: "van-popover-zoom", lockScroll: !1, "onUpdate:show": p }, n, dl(), he(e, ch)), { default: () => [e.showArrow && i("div", { class: Bo("arrow") }, null), i("div", { role: "menu", class: Bo("content", e.actionsDirection) }, [o.default ? o.default() : e.actions.map(g)])] })]);
  };
} });
const dh = Z(uh), [ph, cr] = Y("progress");
var vh = z({ name: ph, props: { color: String, inactive: Boolean, pivotText: String, textColor: String, showPivot: W, pivotColor: String, trackColor: String, strokeWidth: G, percentage: { type: G, default: 0, validator: (e) => +e >= 0 && +e <= 100 } }, setup(e) {
  const t = E(() => e.inactive ? void 0 : e.color), o = () => {
    const { textColor: n, pivotText: a, pivotColor: l, percentage: r } = e, s = a ?? `${r}%`;
    if (e.showPivot && s) {
      const c = { color: n, left: +r + "%", transform: `translate(-${+r}%,-50%)`, background: l || t.value };
      return i("span", { style: c, class: cr("pivot", { inactive: e.inactive }) }, [s]);
    }
  };
  return () => {
    const { trackColor: n, percentage: a, strokeWidth: l } = e, r = { background: n, height: ce(l) }, s = { width: `${a}%`, background: t.value };
    return i("div", { class: cr(), style: r }, [i("span", { class: cr("portion", { inactive: e.inactive }), style: s }, null), o()]);
  };
} });
const fh = Z(vh), [mh, $n, hh] = Y("pull-refresh"), gh = ["pulling", "loosing", "success"];
var bh = z({ name: mh, props: { disabled: Boolean, modelValue: Boolean, headHeight: te(50), successText: String, pullingText: String, loosingText: String, loadingText: String, pullDistance: G, successDuration: te(500), animationDuration: te(300) }, emits: ["change", "refresh", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  let n;
  const a = A(), l = A(), r = Sn(a), s = ke({ status: "normal", distance: 0, duration: 0 }), c = wt(), d = () => {
    if (e.headHeight !== 50) return { height: `${e.headHeight}px` };
  }, u = () => s.status !== "loading" && s.status !== "success" && !e.disabled, p = (w, y) => {
    const k = +(e.pullDistance || e.headHeight);
    s.distance = w, s.status = y ? "loading" : w === 0 ? "normal" : w < k ? "pulling" : "loosing", t("change", { status: s.status, distance: w });
  }, v = () => {
    const { status: w } = s;
    return w === "normal" ? "" : e[`${w}Text`] || hh(w);
  }, h = () => {
    const { status: w, distance: y } = s;
    if (o[w]) return o[w]({ distance: y });
    const k = [];
    return gh.includes(w) && k.push(i("div", { class: $n("text") }, [v()])), w === "loading" && k.push(i(Et, { class: $n("loading") }, { default: v })), k;
  }, g = (w) => {
    n = no(r.value) === 0, n && (s.duration = 0, c.start(w));
  }, f = (w) => {
    u() && g(w);
  }, b = () => {
    n && c.deltaY.value && u() && (s.duration = +e.animationDuration, s.status === "loosing" ? (p(+e.headHeight, !0), t("update:modelValue", !0), ne(() => t("refresh"))) : p(0));
  };
  return U(() => e.modelValue, (w) => {
    s.duration = +e.animationDuration, w ? p(+e.headHeight, !0) : o.success || e.successText ? (s.status = "success", setTimeout(() => {
      p(0);
    }, +e.successDuration)) : p(0, !1);
  }), Ne("touchmove", (w) => {
    if (u()) {
      n || g(w);
      const { deltaY: y } = c;
      c.move(w), n && y.value >= 0 && c.isVertical() && (Oe(w), p(((k) => {
        const C = +(e.pullDistance || e.headHeight);
        return k > C && (k = k < 2 * C ? C + (k - C) / 2 : 1.5 * C + (k - 2 * C) / 4), Math.round(k);
      })(y.value)));
    }
  }, { target: l }), () => {
    var w;
    const y = { transitionDuration: `${s.duration}ms`, transform: s.distance ? `translate3d(0,${s.distance}px, 0)` : "" };
    return i("div", { ref: a, class: $n() }, [i("div", { ref: l, class: $n("track"), style: y, onTouchstartPassive: f, onTouchend: b, onTouchcancel: b }, [i("div", { class: $n("head"), style: d() }, [h()]), (w = o.default) == null ? void 0 : w.call(o)])]);
  };
} });
const yh = Z(bh), [wh, Ea] = Y("rate");
var xh = z({ name: wh, props: { size: G, icon: J("star"), color: String, count: te(5), gutter: G, clearable: Boolean, readonly: Boolean, disabled: Boolean, voidIcon: J("star-o"), allowHalf: Boolean, voidColor: String, touchable: W, iconPrefix: String, modelValue: _e(0), disabledColor: String }, emits: ["change", "update:modelValue"], setup(e, { emit: t }) {
  const o = wt(), [n, a] = ia(), l = A(), r = E(() => e.readonly || e.disabled), s = E(() => r.value || !e.touchable), c = E(() => Array(+e.count).fill("").map((y, k) => function(C, S, O, B) {
    return C >= S ? { status: "full", value: 1 } : C + 0.5 >= S && O && !B ? { status: "half", value: 0.5 } : C + 1 >= S && O && B ? { status: "half", value: Math.round((C - S + 1) * 1e10) / 1e10 } : { status: "void", value: 0 };
  }(e.modelValue, k + 1, e.allowHalf, e.readonly)));
  let d, u, p = Number.MAX_SAFE_INTEGER, v = Number.MIN_SAFE_INTEGER;
  const h = () => {
    u = we(l);
    const y = n.value.map(we);
    d = [], y.forEach((k, C) => {
      p = Math.min(k.top, p), v = Math.max(k.top, v), e.allowHalf ? d.push({ score: C + 0.5, left: k.left, top: k.top, height: k.height }, { score: C + 1, left: k.left + k.width / 2, top: k.top, height: k.height }) : d.push({ score: C + 1, left: k.left, top: k.top, height: k.height });
    });
  }, g = (y, k) => {
    for (let C = d.length - 1; C > 0; C--) if (k >= u.top && k <= u.bottom) {
      if (y > d[C].left && k >= d[C].top && k <= d[C].top + d[C].height) return d[C].score;
    } else {
      const S = k < u.top ? p : v;
      if (y > d[C].left && d[C].top === S) return d[C].score;
    }
    return e.allowHalf ? 0.5 : 1;
  }, f = (y) => {
    r.value || y === e.modelValue || (t("update:modelValue", y), t("change", y));
  }, b = (y) => {
    s.value || (o.start(y), h());
  }, w = (y, k) => {
    const { icon: C, size: S, color: O, count: B, gutter: m, voidIcon: x, disabled: T, voidColor: V, allowHalf: P, iconPrefix: N, disabledColor: j } = e, F = k + 1, I = y.status === "full", R = y.status === "void", _ = P && y.value > 0 && y.value < 1;
    let $;
    return m && F !== +B && ($ = { paddingRight: ce(m) }), i("div", { key: k, ref: a(k), role: "radio", style: $, class: Ea("item"), tabindex: T ? void 0 : 0, "aria-setsize": B, "aria-posinset": F, "aria-checked": !R, onClick: (L) => {
      h();
      let K = P ? g(L.clientX, L.clientY) : F;
      e.clearable && o.isTap.value && K === e.modelValue && (K = 0), f(K);
    } }, [i(ie, { size: S, name: I ? C : x, class: Ea("icon", { disabled: T, full: I }), color: T ? j : I ? O : V, classPrefix: N }, null), _ && i(ie, { size: S, style: { width: y.value + "em" }, name: R ? x : C, class: Ea("icon", ["half", { disabled: T, full: !R }]), color: T ? j : R ? V : O, classPrefix: N }, null)]);
  };
  return xo(() => e.modelValue), Ne("touchmove", (y) => {
    if (!s.value && (o.move(y), o.isHorizontal() && !o.isTap.value)) {
      const { clientX: k, clientY: C } = y.touches[0];
      Oe(y), f(g(k, C));
    }
  }, { target: l }), () => i("div", { ref: l, role: "radiogroup", class: Ea({ readonly: e.readonly, disabled: e.disabled }), tabindex: e.disabled ? void 0 : 0, "aria-disabled": e.disabled, "aria-readonly": e.readonly, onTouchstartPassive: b }, [c.value.map(w)]);
} });
const Sh = Z(xh), kh = { figureArr: Ve(), delay: Number, duration: _e(2), isStart: Boolean, direction: J("down"), height: _e(40) }, [Ch, ur] = Y("rolling-text-item");
var Th = z({ name: Ch, props: kh, setup(e) {
  const t = E(() => e.direction === "down" ? e.figureArr.slice().reverse() : e.figureArr), o = E(() => `-${e.height * (e.figureArr.length - 1)}px`), n = E(() => ({ lineHeight: ce(e.height) })), a = E(() => ({ height: ce(e.height), "--van-translate": o.value, "--van-duration": e.duration + "s", "--van-delay": e.delay + "s" }));
  return () => i("div", { class: ur([e.direction]), style: a.value }, [i("div", { class: ur("box", { animate: e.isStart }) }, [Array.isArray(t.value) && t.value.map((l) => i("div", { class: ur("item"), style: n.value }, [l]))])]);
} });
const [Oh, Bh] = Y("rolling-text"), Vh = { startNum: _e(0), targetNum: Number, textList: Ve(), duration: _e(2), autoStart: W, direction: J("down"), stopOrder: J("ltr"), height: _e(40) };
var Dh = z({ name: Oh, props: Vh, setup(e) {
  const t = E(() => Array.isArray(e.textList) && e.textList.length), o = E(() => t.value ? e.textList[0].length : `${Math.max(e.startNum, e.targetNum)}`.length), n = (u) => {
    const p = [];
    for (let v = 0; v < e.textList.length; v++) p.push(e.textList[v][u]);
    return p;
  }, a = E(() => t.value ? new Array(o.value).fill("") : Tt(e.targetNum, o.value).split("")), l = E(() => Tt(e.startNum, o.value).split("")), r = (u) => {
    const p = +l.value[u], v = +a.value[u], h = [];
    for (let g = p; g <= 9; g++) h.push(g);
    for (let g = 0; g <= 2; g++) for (let f = 0; f <= 9; f++) h.push(f);
    for (let g = 0; g <= v; g++) h.push(g);
    return h;
  }, s = (u, p) => e.stopOrder === "ltr" ? 0.2 * u : 0.2 * (p - 1 - u), c = A(e.autoStart), d = () => {
    c.value = !0;
  };
  return U(() => e.autoStart, (u) => {
    u && d();
  }), pe({ start: d, reset: () => {
    c.value = !1, e.autoStart && Ke(() => d());
  } }), () => i("div", { class: Bh() }, [a.value.map((u, p) => i(Th, { figureArr: t.value ? n(p) : r(p), duration: e.duration, direction: e.direction, isStart: c.value, height: e.height, delay: s(p, o.value) }, null))]);
} });
const Ah = Z(Dh), Md = Z(z2), [Eh, jn, Ph] = Y("search");
var Ih = z({ name: Eh, props: ae({}, Mr, { label: String, shape: J("square"), leftIcon: J("search"), clearable: W, actionText: String, background: String, showAction: Boolean }), emits: ["blur", "focus", "clear", "search", "cancel", "clickInput", "clickLeftIcon", "clickRightIcon", "update:modelValue"], setup(e, { emit: t, slots: o, attrs: n }) {
  const a = Cn(), l = A(), r = () => {
    o.action || (t("update:modelValue", ""), t("cancel"));
  }, s = (k) => {
    k.keyCode === 13 && (Oe(k), t("search", e.modelValue));
  }, c = () => e.id || `${a}-input`, d = () => {
    if (o.label || e.label) return i("label", { class: jn("label"), for: c(), "data-allow-mismatch": "attribute" }, [o.label ? o.label() : e.label]);
  }, u = () => {
    if (e.showAction) {
      const k = e.actionText || Ph("cancel");
      return i("div", { class: jn("action"), role: "button", tabindex: 0, onClick: r }, [o.action ? o.action() : k]);
    }
  }, p = (k) => t("blur", k), v = (k) => t("focus", k), h = (k) => t("clear", k), g = (k) => t("clickInput", k), f = (k) => t("clickLeftIcon", k), b = (k) => t("clickRightIcon", k), w = Object.keys(Mr), y = () => {
    const k = ae({}, n, he(e, w), { id: c() });
    return i(Qt, Q({ ref: l, type: "search", class: jn("field", { "with-message": k.errorMessage }), border: !1, onBlur: p, onFocus: v, onClear: h, onKeypress: s, onClickInput: g, onClickLeftIcon: f, onClickRightIcon: b, "onUpdate:modelValue": (C) => t("update:modelValue", C) }, k), he(o, ["left-icon", "right-icon"]));
  };
  return pe({ focus: () => {
    var k;
    return (k = l.value) == null ? void 0 : k.focus();
  }, blur: () => {
    var k;
    return (k = l.value) == null ? void 0 : k.blur();
  } }), () => {
    var k;
    return i("div", { class: jn({ "show-action": e.showAction }), style: { background: e.background } }, [(k = o.left) == null ? void 0 : k.call(o), i("div", { class: jn("content", e.shape) }, [d(), y()]), u()]);
  };
} });
const Ld = Z(Ih), $h = [...pi, "round", "closeOnPopstate", "safeAreaInsetBottom"], jh = { qq: "qq", link: "link-o", weibo: "weibo", qrcode: "qr", poster: "photo-o", wechat: "wechat", "weapp-qrcode": "miniprogram-o", "wechat-moments": "wechat-moments" }, [zh, kt, Rh] = Y("share-sheet");
var Nh = z({ name: zh, props: ae({}, kn, { title: String, round: W, options: Ve(), cancelText: String, description: String, closeOnPopstate: W, safeAreaInsetBottom: W }), emits: ["cancel", "select", "update:show"], setup(e, { emit: t, slots: o }) {
  const n = (p) => t("update:show", p), a = () => {
    n(!1), t("cancel");
  }, l = () => {
    const p = o.title ? o.title() : e.title, v = o.description ? o.description() : e.description;
    if (p || v) return i("div", { class: kt("header") }, [p && i("h2", { class: kt("title") }, [p]), v && i("span", { class: kt("description") }, [v])]);
  }, r = (p) => {
    return (v = p) != null && v.includes("/") ? i("img", { src: p, class: kt("image-icon") }, null) : i("div", { class: kt("icon", [p]) }, [i(ie, { name: jh[p] || p }, null)]);
    var v;
  }, s = (p, v) => {
    const { name: h, icon: g, className: f, description: b } = p;
    return i("div", { role: "button", tabindex: 0, class: [kt("option"), f, Je], onClick: () => ((w, y) => t("select", w, y))(p, v) }, [r(g), h && i("span", { class: kt("name") }, [h]), b && i("span", { class: kt("option-description") }, [b])]);
  }, c = (p, v) => i("div", { class: kt("options", { border: v }) }, [p.map(s)]), d = () => {
    const { options: p } = e;
    return Array.isArray(p[0]) ? p.map((v, h) => c(v, h !== 0)) : c(p);
  }, u = () => {
    var p;
    const v = (p = e.cancelText) != null ? p : Rh("cancel");
    if (o.cancel || v) return i("button", { type: "button", class: kt("cancel"), onClick: a }, [o.cancel ? o.cancel() : v]);
  };
  return () => i(xt, Q({ class: kt(), position: "bottom", "onUpdate:show": n }, he(e, $h)), { default: () => [l(), d(), u()] });
} });
const Mh = Z(Nh), [Fd, Lh] = Y("sidebar"), _d = Symbol(Fd);
var Fh = z({ name: Fd, props: { modelValue: te(0) }, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { linkChildren: n } = Qe(_d), a = () => +e.modelValue;
  return n({ getActive: a, setActive: (l) => {
    l !== a() && (t("update:modelValue", l), t("change", l));
  } }), () => {
    var l;
    return i("div", { role: "tablist", class: Lh() }, [(l = o.default) == null ? void 0 : l.call(o)]);
  };
} });
const Hd = Z(Fh);
var _h = {};
const [Hh, Ys] = Y("sidebar-item");
var Uh = z({ name: Hh, props: ae({}, ko, { dot: Boolean, title: String, badge: G, disabled: Boolean, badgeProps: Object }), emits: ["click"], setup(e, { emit: t, slots: o }) {
  const n = Mo(), { parent: a, index: l } = Ge(_d);
  if (!a) return void (_h.NODE_ENV !== "production" && console.error("[Vant] <SidebarItem> must be a child component of <Sidebar>."));
  const r = () => {
    e.disabled || (t("click", l.value), a.setActive(l.value), n());
  };
  return () => {
    const { dot: s, badge: c, title: d, disabled: u } = e, p = l.value === a.getActive();
    return i("div", { role: "tab", class: Ys({ select: p, disabled: u }), tabindex: u ? void 0 : 0, "aria-selected": p, onClick: r }, [i(Lo, Q({ dot: s, class: Ys("text"), content: c }, e.badgeProps), { default: () => [o.title ? o.title() : d] })]);
  };
} });
const Ud = Z(Uh), [qh, dr, Xs] = Y("signature"), Wh = { tips: String, type: J("png"), penColor: J("#000"), lineWidth: _e(3), clearButtonText: String, backgroundColor: J(""), confirmButtonText: String };
var Yh = z({ name: qh, props: Wh, emits: ["submit", "clear", "start", "end", "signing"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(), l = E(() => n.value ? n.value.getContext("2d") : null), r = !bt || (() => {
    var y;
    const k = document.createElement("canvas");
    return !!((y = k.getContext) != null && y.call(k, "2d"));
  })();
  let s, c = 0, d = 0;
  const u = () => {
    if (!l.value) return !1;
    l.value.beginPath(), l.value.lineWidth = e.lineWidth, l.value.strokeStyle = e.penColor, s = we(n), t("start");
  }, p = (y) => {
    if (!l.value) return !1;
    Oe(y);
    const k = y.touches[0], C = k.clientX - ((s == null ? void 0 : s.left) || 0), S = k.clientY - ((s == null ? void 0 : s.top) || 0);
    l.value.lineCap = "round", l.value.lineJoin = "round", l.value.lineTo(C, S), l.value.stroke(), t("signing", y);
  }, v = (y) => {
    Oe(y), t("end");
  }, h = (y) => {
    y && e.backgroundColor && (y.fillStyle = e.backgroundColor, y.fillRect(0, 0, c, d));
  }, g = () => {
    var y, k;
    const C = n.value;
    if (!C) return;
    const S = ((B) => {
      const m = document.createElement("canvas");
      if (m.width = B.width, m.height = B.height, e.backgroundColor) {
        const x = m.getContext("2d");
        h(x);
      }
      return B.toDataURL() === m.toDataURL();
    })(C), O = S ? "" : ((k = (y = { jpg: () => C.toDataURL("image/jpeg", 0.8), jpeg: () => C.toDataURL("image/jpeg", 0.8) })[e.type]) == null ? void 0 : k.call(y)) || C.toDataURL(`image/${e.type}`);
    t("submit", { image: O, canvas: C });
  }, f = () => {
    l.value && (l.value.clearRect(0, 0, c, d), l.value.closePath(), h(l.value)), t("clear");
  }, b = () => {
    var y, k, C;
    if (r && n.value) {
      const S = n.value, O = bt ? window.devicePixelRatio : 1;
      c = S.width = (((y = a.value) == null ? void 0 : y.offsetWidth) || 0) * O, d = S.height = (((k = a.value) == null ? void 0 : k.offsetHeight) || 0) * O, (C = l.value) == null || C.scale(O, O), h(l.value);
    }
  }, w = () => {
    if (l.value) {
      const y = l.value.getImageData(0, 0, c, d);
      b(), l.value.putImageData(y, 0, 0);
    }
  };
  return U(Vt, w), Ce(b), pe({ resize: w, clear: f, submit: g }), () => i("div", { class: dr() }, [i("div", { class: dr("content"), ref: a }, [r ? i("canvas", { ref: n, onTouchstartPassive: u, onTouchmove: p, onTouchend: v }, null) : o.tips ? o.tips() : i("p", null, [e.tips])]), i("div", { class: dr("footer") }, [i(Le, { size: "small", onClick: f }, { default: () => [e.clearButtonText || Xs("clear")] }), i(Le, { type: "primary", size: "small", onClick: g }, { default: () => [e.confirmButtonText || Xs("confirm")] })])]);
} });
const Xh = Z(Yh), [Gh, Zh] = Y("skeleton-title");
var Kh = z({ name: Gh, props: { round: Boolean, titleWidth: G }, setup: (e) => () => i("h3", { class: Zh([{ round: e.round }]), style: { width: ce(e.titleWidth) } }, null) });
const qd = Z(Kh);
var Jh = qd;
const [Qh, eg] = Y("skeleton-avatar");
var tg = z({ name: Qh, props: { avatarSize: G, avatarShape: J("round") }, setup: (e) => () => i("div", { class: eg([e.avatarShape]), style: lo(e.avatarSize) }, null) });
const Wd = Z(tg);
var og = Wd;
const Wr = "100%", ng = { round: Boolean, rowWidth: { type: G, default: Wr } }, [ag, lg] = Y("skeleton-paragraph");
var rg = z({ name: ag, props: ng, setup: (e) => () => i("div", { class: lg([{ round: e.round }]), style: { width: e.rowWidth } }, null) });
const Yd = Z(rg);
var ig = Yd;
const [sg, Gs] = Y("skeleton");
var cg = z({ name: sg, inheritAttrs: !1, props: { row: te(0), round: Boolean, title: Boolean, titleWidth: G, avatar: Boolean, avatarSize: G, avatarShape: J("round"), loading: W, animate: W, rowWidth: { type: [Number, String, Array], default: Wr } }, setup(e, { slots: t, attrs: o }) {
  const n = () => {
    if (e.avatar) return i(og, { avatarShape: e.avatarShape, avatarSize: e.avatarSize }, null);
  }, a = () => {
    if (e.title) return i(Jh, { round: e.round, titleWidth: e.titleWidth }, null);
  }, l = (r) => {
    const { rowWidth: s } = e;
    return s === Wr && r === +e.row - 1 ? "60%" : Array.isArray(s) ? s[r] : s;
  };
  return () => {
    var r;
    return e.loading ? i("div", Q({ class: Gs({ animate: e.animate, round: e.round }) }, o), [t.template ? t.template() : i(be, null, [n(), i("div", { class: Gs("content") }, [a(), Array(+e.row).fill("").map((s, c) => i(ig, { key: c, round: e.round, rowWidth: ce(l(c)) }, null))])])]) : (r = t.default) == null ? void 0 : r.call(t);
  };
} });
const ug = Z(cg), [dg, Zs] = Y("skeleton-image");
var pg = z({ name: dg, props: { imageSize: G, imageShape: J("square") }, setup: (e) => () => i("div", { class: Zs([e.imageShape]), style: lo(e.imageSize) }, [i(ie, { name: "photo", class: Zs("icon") }, null)]) });
const vg = Z(pg), [fg, zn] = Y("slider");
var mg = z({ name: fg, props: { min: te(0), max: te(100), step: te(1), range: Boolean, reverse: Boolean, disabled: Boolean, readonly: Boolean, vertical: Boolean, barHeight: G, buttonSize: G, activeColor: String, inactiveColor: String, modelValue: { type: [Number, Array], default: 0 } }, emits: ["change", "dragEnd", "dragStart", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  let n, a, l;
  const r = A(), s = [A(), A()], c = A(), d = wt(), u = E(() => Number(e.max) - Number(e.min)), p = E(() => {
    const m = e.vertical ? "width" : "height";
    return { background: e.inactiveColor, [m]: ce(e.barHeight) };
  }), v = (m) => e.range && Array.isArray(m), h = () => {
    const { modelValue: m, min: x } = e;
    return v(m) ? 100 * (m[1] - m[0]) / u.value + "%" : 100 * (m - Number(x)) / u.value + "%";
  }, g = E(() => {
    const m = e.vertical ? "height" : "width", x = { [m]: h(), background: e.activeColor };
    return c.value && (x.transition = "none"), x[e.vertical ? e.reverse ? "bottom" : "top" : e.reverse ? "right" : "left"] = (() => {
      const { modelValue: T, min: V } = e;
      return v(T) ? 100 * (T[0] - Number(V)) / u.value + "%" : "0%";
    })(), x;
  }), f = (m) => {
    const x = +e.min, T = +e.max, V = +e.step;
    return m = qe(m, x, T), Ou(x, Math.round((m - x) / V) * V);
  }, b = () => {
    const m = e.modelValue;
    l = v(m) ? m.map(f) : f(m);
  }, w = (m, x) => {
    m = v(m) ? ((T) => {
      var V, P;
      const N = (V = T[0]) != null ? V : Number(e.min), j = (P = T[1]) != null ? P : Number(e.max);
      return N > j ? [j, N] : [N, j];
    })(m).map(f) : f(m), Rt(m, e.modelValue) || t("update:modelValue", m), x && !Rt(m, l) && t("change", m);
  }, y = (m) => {
    if (m.stopPropagation(), e.disabled || e.readonly) return;
    b();
    const { min: x, reverse: T, vertical: V, modelValue: P } = e, N = we(r), j = V ? N.height : N.width, F = Number(x) + (V ? T ? N.bottom - m.clientY : m.clientY - N.top : T ? N.right - m.clientX : m.clientX - N.left) / j * u.value;
    if (v(P)) {
      const [I, R] = P;
      w(F <= (I + R) / 2 ? [F, R] : [I, F], !0);
    } else w(F, !0);
  }, k = (m) => {
    if (e.disabled || e.readonly) return;
    c.value === "start" && t("dragStart", m), Oe(m, !0), d.move(m), c.value = "dragging";
    const x = we(r);
    let T = (e.vertical ? d.deltaY.value : d.deltaX.value) / (e.vertical ? x.height : x.width) * u.value;
    if (e.reverse && (T = -T), v(l)) {
      const V = e.reverse ? 1 - n : n;
      a[V] = l[V] + T;
    } else a = l + T;
    w(a);
  }, C = (m) => {
    e.disabled || e.readonly || (c.value === "dragging" && (w(a, !0), t("dragEnd", m)), c.value = "");
  }, S = (m) => typeof m == "number" ? zn("button-wrapper", ["left", "right"][m]) : zn("button-wrapper", e.reverse ? "left" : "right"), O = (m, x) => {
    const T = c.value === "dragging";
    if (typeof x == "number") {
      const V = o[x === 0 ? "left-button" : "right-button"];
      let P;
      if (T && Array.isArray(a) && (P = a[0] > a[1] ? 1 ^ n : n), V) return V({ value: m, dragging: T, dragIndex: P });
    }
    return o.button ? o.button({ value: m, dragging: T }) : i("div", { class: zn("button"), style: lo(e.buttonSize) }, null);
  }, B = (m) => {
    const x = typeof m == "number" ? e.modelValue[m] : e.modelValue;
    return i("div", { ref: s[m ?? 0], role: "slider", class: S(m), tabindex: e.disabled ? void 0 : 0, "aria-valuemin": e.min, "aria-valuenow": x, "aria-valuemax": e.max, "aria-disabled": e.disabled || void 0, "aria-readonly": e.readonly || void 0, "aria-orientation": e.vertical ? "vertical" : "horizontal", onTouchstartPassive: (T) => {
      typeof m == "number" && (n = m), ((V) => {
        e.disabled || e.readonly || (d.start(V), a = e.modelValue, b(), c.value = "start");
      })(T);
    }, onTouchend: C, onTouchcancel: C, onClick: si }, [O(x, m)]);
  };
  return w(e.modelValue), xo(() => e.modelValue), s.forEach((m) => {
    Ne("touchmove", k, { target: m });
  }), () => i("div", { ref: r, style: p.value, class: zn({ vertical: e.vertical, disabled: e.disabled }), onClick: y }, [i("div", { class: zn("bar"), style: g.value }, [e.range ? [B(0), B(1)] : B()])]);
} });
const hg = Z(mg), [Ks, gg] = Y("space"), bg = { align: String, direction: { type: String, default: "horizontal" }, size: { type: [Number, String, Array], default: 8 }, wrap: Boolean, fill: Boolean };
function Xd(e = []) {
  const t = [];
  return e.forEach((o) => {
    Array.isArray(o) ? t.push(...o) : o.type === be ? t.push(...Xd(o.children)) : t.push(o);
  }), t.filter((o) => {
    var n;
    return !(o && (o.type === li || o.type === be && ((n = o.children) == null ? void 0 : n.length) === 0 || o.type === j1 && o.children.trim() === ""));
  });
}
var yg = z({ name: Ks, props: bg, setup(e, { slots: t }) {
  const o = E(() => {
    var l;
    return (l = e.align) != null ? l : e.direction === "horizontal" ? "center" : "";
  }), n = (l) => typeof l == "number" ? l + "px" : l, a = (l) => {
    const r = {}, s = `${n(Array.isArray(e.size) ? e.size[0] : e.size)}`, c = `${n(Array.isArray(e.size) ? e.size[1] : e.size)}`;
    return l ? e.wrap ? { marginBottom: c } : {} : (e.direction === "horizontal" && (r.marginRight = s), (e.direction === "vertical" || e.wrap) && (r.marginBottom = c), r);
  };
  return () => {
    var l;
    const r = Xd((l = t.default) == null ? void 0 : l.call(t));
    return i("div", { class: [gg({ [e.direction]: e.direction, [`align-${o.value}`]: o.value, wrap: e.wrap, fill: e.fill })] }, [r.map((s, c) => i("div", { key: `item-${c}`, class: `${Ks}-item`, style: a(c === r.length - 1) }, [s]))]);
  };
} });
const wg = Z(yg), [Gd, Js] = Y("steps"), xg = { active: te(0), direction: J("horizontal"), activeIcon: J("checked"), iconPrefix: String, finishIcon: String, activeColor: String, inactiveIcon: String, inactiveColor: String }, Zd = Symbol(Gd);
var Sg = z({ name: Gd, props: xg, emits: ["clickStep"], setup(e, { emit: t, slots: o }) {
  const { linkChildren: n } = Qe(Zd);
  return n({ props: e, onClickStep: (a) => t("clickStep", a) }), () => {
    var a;
    return i("div", { class: Js([e.direction]) }, [i("div", { class: Js("items") }, [(a = o.default) == null ? void 0 : a.call(o)])]);
  };
} }), kg = {};
const [Cg, fo] = Y("step");
var Tg = z({ name: Cg, setup(e, { slots: t }) {
  const { parent: o, index: n } = Ge(Zd);
  if (!o) return void (kg.NODE_ENV !== "production" && console.error("[Vant] <Step> must be a child component of <Steps>."));
  const a = o.props, l = () => {
    const p = +a.active;
    return n.value < p ? "finish" : n.value === p ? "process" : "waiting";
  }, r = () => l() === "process", s = E(() => ({ background: l() === "finish" ? a.activeColor : a.inactiveColor })), c = E(() => r() ? { color: a.activeColor } : l() === "waiting" ? { color: a.inactiveColor } : void 0), d = () => o.onClickStep(n.value), u = () => {
    const { iconPrefix: p, finishIcon: v, activeIcon: h, activeColor: g, inactiveIcon: f } = a;
    return r() ? t["active-icon"] ? t["active-icon"]() : i(ie, { class: fo("icon", "active"), name: h, color: g, classPrefix: p }, null) : l() === "finish" && (v || t["finish-icon"]) ? t["finish-icon"] ? t["finish-icon"]() : i(ie, { class: fo("icon", "finish"), name: v, color: g, classPrefix: p }, null) : t["inactive-icon"] ? t["inactive-icon"]() : f ? i(ie, { class: fo("icon"), name: f, classPrefix: p }, null) : i("i", { class: fo("circle"), style: s.value }, null);
  };
  return () => {
    var p;
    const v = l();
    return i("div", { class: [io, fo([a.direction, { [v]: v }])] }, [i("div", { class: fo("title", { active: r() }), style: c.value, onClick: d }, [(p = t.default) == null ? void 0 : p.call(t)]), i("div", { class: fo("circle-container"), onClick: d }, [u()]), i("div", { class: fo("line"), style: s.value }, null)]);
  };
} });
const Og = Z(Tg), [Bg, Pa] = Y("stepper"), Ia = (e, t) => String(e) === String(t);
var Vg = z({ name: Bg, props: { min: te(1), max: te(1 / 0), name: te(""), step: te(1), theme: String, integer: Boolean, disabled: Boolean, showPlus: W, showMinus: W, showInput: W, longPress: W, autoFixed: W, allowEmpty: Boolean, modelValue: G, inputWidth: G, buttonSize: G, placeholder: String, disablePlus: Boolean, disableMinus: Boolean, disableInput: Boolean, beforeChange: Function, defaultValue: te(1), decimalLength: G }, emits: ["plus", "blur", "minus", "focus", "change", "overlimit", "update:modelValue"], setup(e, { emit: t }) {
  const o = (S, O = !0) => {
    const { min: B, max: m, allowEmpty: x, decimalLength: T } = e;
    return x && S === "" || (S = (S = zr(String(S), !e.integer)) === "" ? 0 : +S, S = Number.isNaN(S) ? +B : S, S = O ? Math.max(Math.min(+m, S), +B) : S, fe(T) && (S = S.toFixed(+T))), S;
  };
  let n;
  const a = A(), l = A((() => {
    var S;
    const O = (S = e.modelValue) != null ? S : e.defaultValue, B = o(O);
    return Ia(B, e.modelValue) || t("update:modelValue", B), B;
  })()), r = E(() => e.disabled || e.disableMinus || +l.value <= +e.min), s = E(() => e.disabled || e.disablePlus || +l.value >= +e.max), c = E(() => ({ width: ce(e.inputWidth), height: ce(e.buttonSize) })), d = E(() => lo(e.buttonSize)), u = (S) => {
    e.beforeChange ? So(e.beforeChange, { args: [S], done() {
      l.value = S;
    } }) : l.value = S;
  }, p = () => {
    if (n === "plus" && s.value || n === "minus" && r.value) return void t("overlimit", n);
    const S = n === "minus" ? -e.step : +e.step, O = o(Ou(+l.value, S));
    u(O), t(n);
  }, v = (S) => {
    const O = S.target, { value: B } = O, { decimalLength: m } = e;
    let x = zr(String(B), !e.integer);
    if (fe(m) && x.includes(".")) {
      const V = x.split(".");
      x = `${V[0]}.${V[1].slice(0, +m)}`;
    }
    e.beforeChange ? O.value = String(l.value) : Ia(B, x) || (O.value = x);
    const T = x === String(+x);
    u(T ? +x : x);
  }, h = (S) => {
    var O;
    e.disableInput ? (O = a.value) == null || O.blur() : t("focus", S);
  }, g = (S) => {
    const O = S.target, B = o(O.value, e.autoFixed);
    O.value = String(B), l.value = B, ne(() => {
      t("blur", S), Cu();
    });
  };
  let f, b;
  const w = () => {
    b = setTimeout(() => {
      p(), w();
    }, 200);
  }, y = (S) => {
    e.longPress && (clearTimeout(b), f && Oe(S));
  }, k = (S) => {
    e.disableInput && Oe(S);
  }, C = (S) => ({ onClick: (O) => {
    Oe(O), n = S, p();
  }, onTouchstartPassive: () => {
    n = S, e.longPress && (f = !1, clearTimeout(b), b = setTimeout(() => {
      f = !0, p(), w();
    }, 500));
  }, onTouchend: y, onTouchcancel: y });
  return U(() => [e.max, e.min, e.integer, e.decimalLength], () => {
    const S = o(l.value);
    Ia(S, l.value) || (l.value = S);
  }), U(() => e.modelValue, (S) => {
    Ia(S, l.value) || (l.value = o(S));
  }), U(l, (S) => {
    t("update:modelValue", S), t("change", S, { name: e.name });
  }), xo(() => e.modelValue), () => i("div", { role: "group", class: Pa([e.theme]) }, [De(i("button", Q({ type: "button", style: d.value, class: [Pa("minus", { disabled: r.value }), { [Je]: !r.value }], "aria-disabled": r.value || void 0 }, C("minus")), null), [[Ie, e.showMinus]]), De(i("input", { ref: a, type: e.integer ? "tel" : "text", role: "spinbutton", class: Pa("input"), value: l.value, style: c.value, disabled: e.disabled, readonly: e.disableInput, inputmode: e.integer ? "numeric" : "decimal", placeholder: e.placeholder, autocomplete: "off", "aria-valuemax": e.max, "aria-valuemin": e.min, "aria-valuenow": l.value, onBlur: g, onInput: v, onFocus: h, onMousedown: k }, null), [[Ie, e.showInput]]), De(i("button", Q({ type: "button", style: d.value, class: [Pa("plus", { disabled: s.value }), { [Je]: !s.value }], "aria-disabled": s.value || void 0 }, C("plus")), null), [[Ie, e.showPlus]])]);
} });
const Dg = Z(Vg), Ag = Z(Sg), [Eg, Ct, Pg] = Y("submit-bar");
var Ig = z({ name: Eg, props: { tip: String, label: String, price: Number, tipIcon: String, loading: Boolean, currency: J("¥"), disabled: Boolean, textAlign: String, buttonText: String, buttonType: J("danger"), buttonColor: String, suffixLabel: String, placeholder: Boolean, decimalLength: te(2), safeAreaInsetBottom: W }, emits: ["submit"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = Dl(n, Ct), l = () => {
    const { price: d, label: u, currency: p, textAlign: v, suffixLabel: h, decimalLength: g } = e;
    if (typeof d == "number") {
      const f = (d / 100).toFixed(+g).split("."), b = g ? `.${f[1]}` : "";
      return i("div", { class: Ct("text"), style: { textAlign: v } }, [i("span", null, [u || Pg("label")]), i("span", { class: Ct("price") }, [p, i("span", { class: Ct("price-integer") }, [f[0]]), b]), h && i("span", { class: Ct("suffix-label") }, [h])]);
    }
  }, r = () => {
    var d;
    const { tip: u, tipIcon: p } = e;
    if (o.tip || u) return i("div", { class: Ct("tip") }, [p && i(ie, { class: Ct("tip-icon"), name: p }, null), u && i("span", { class: Ct("tip-text") }, [u]), (d = o.tip) == null ? void 0 : d.call(o)]);
  }, s = () => t("submit"), c = () => {
    var d, u;
    return i("div", { ref: n, class: [Ct(), { "van-safe-area-bottom": e.safeAreaInsetBottom }] }, [(d = o.top) == null ? void 0 : d.call(o), r(), i("div", { class: Ct("bar") }, [(u = o.default) == null ? void 0 : u.call(o), l(), o.button ? o.button() : i(Le, { round: !0, type: e.buttonType, text: e.buttonText, class: Ct("button", e.buttonType), color: e.buttonColor, loading: e.loading, disabled: e.disabled, onClick: s }, null)])]);
  };
  return () => e.placeholder ? a(c) : c();
} });
const $g = Z(Ig), [jg, pr] = Y("swipe-cell");
var zg = z({ name: jg, props: { name: te(""), disabled: Boolean, leftWidth: G, rightWidth: G, beforeClose: Function, stopPropagation: Boolean }, emits: ["open", "close", "click"], setup(e, { emit: t, slots: o }) {
  let n, a, l, r;
  const s = A(), c = A(), d = A(), u = ke({ offset: 0, dragging: !1 }), p = wt(), v = (O) => O.value ? we(O).width : 0, h = E(() => fe(e.leftWidth) ? +e.leftWidth : v(c)), g = E(() => fe(e.rightWidth) ? +e.rightWidth : v(d)), f = (O) => {
    u.offset = O === "left" ? h.value : -g.value, n || (n = !0, t("open", { name: e.name, position: O }));
  }, b = (O) => {
    u.offset = 0, n && (n = !1, t("close", { name: e.name, position: O }));
  }, w = (O) => {
    e.disabled || (l = u.offset, p.start(O));
  }, y = () => {
    u.dragging && (u.dragging = !1, ((O) => {
      const B = Math.abs(u.offset), m = n ? 0.85 : 0.15, x = O === "left" ? h.value : g.value;
      x && B > x * m ? f(O) : b(O);
    })(u.offset > 0 ? "left" : "right"), setTimeout(() => {
      a = !1;
    }, 0));
  }, k = (O = "outside", B) => {
    r || (t("click", O), n && !a && (r = !0, So(e.beforeClose, { args: [{ event: B, name: e.name, position: O }], done: () => {
      r = !1, b(O);
    }, canceled: () => r = !1, error: () => r = !1 })));
  }, C = (O) => (B) => {
    (a || n) && B.stopPropagation(), a || k(O, B);
  }, S = (O, B) => {
    const m = o[O];
    if (m) return i("div", { ref: B, class: pr(O), onClick: C(O) }, [m()]);
  };
  return pe({ open: f, close: b }), Ol(s, (O) => k("outside", O), { eventName: "touchstart" }), Ne("touchmove", (O) => {
    if (e.disabled) return;
    const { deltaX: B } = p;
    p.move(O), p.isHorizontal() && (a = !0, u.dragging = !0, (!n || B.value * l < 0) && Oe(O, e.stopPropagation), u.offset = qe(B.value + l, -g.value, h.value));
  }, { target: s }), () => {
    var O;
    const B = { transform: `translate3d(${u.offset}px, 0, 0)`, transitionDuration: u.dragging ? "0s" : ".6s" };
    return i("div", { ref: s, class: pr(), onClick: C("cell"), onTouchstartPassive: w, onTouchend: y, onTouchcancel: y }, [i("div", { class: pr("wrapper"), style: B }, [S("left", c), (O = o.default) == null ? void 0 : O.call(o), S("right", d)])]);
  };
} });
const Rg = Z(zg), [Kd, Qs] = Y("tabbar"), Ng = { route: Boolean, fixed: W, border: W, zIndex: G, placeholder: Boolean, activeColor: String, beforeChange: Function, inactiveColor: String, modelValue: te(0), safeAreaInsetBottom: { type: Boolean, default: null } }, Jd = Symbol(Kd);
var Mg = z({ name: Kd, props: Ng, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(), { linkChildren: a } = Qe(Jd), l = Dl(n, Qs), r = () => {
    var c;
    return (c = e.safeAreaInsetBottom) != null ? c : e.fixed;
  }, s = () => {
    var c;
    const { fixed: d, zIndex: u, border: p } = e;
    return i("div", { ref: n, role: "tablist", style: ro(u), class: [Qs({ fixed: d }), { [Bl]: p, "van-safe-area-bottom": r() }] }, [(c = o.default) == null ? void 0 : c.call(o)]);
  };
  return a({ props: e, setActive: (c, d) => {
    So(e.beforeChange, { args: [c], done() {
      t("update:modelValue", c), t("change", c), d();
    } });
  } }), () => e.fixed && e.placeholder ? l(s) : s();
} });
const Lg = Z(Mg);
var Fg = {};
const [_g, vr] = Y("tabbar-item");
var Hg = z({ name: _g, props: ae({}, ko, { dot: Boolean, icon: String, name: G, badge: G, badgeProps: Object, iconPrefix: String }), emits: ["click"], setup(e, { emit: t, slots: o }) {
  const n = Mo(), a = Xe().proxy, { parent: l, index: r } = Ge(Jd);
  if (!l) return void (Fg.NODE_ENV !== "production" && console.error("[Vant] <TabbarItem> must be a child component of <Tabbar>."));
  const s = E(() => {
    var u;
    const { route: p, modelValue: v } = l.props;
    if (p && "$route" in a) {
      const { $route: h } = a, { to: g } = e, f = oo(g) ? g : { path: g };
      return !!h.matched.find((b) => {
        const w = "path" in f && f.path === b.path, y = "name" in f && f.name === b.name;
        return w || y;
      });
    }
    return ((u = e.name) != null ? u : r.value) === v;
  }), c = (u) => {
    var p;
    s.value || l.setActive((p = e.name) != null ? p : r.value, n), t("click", u);
  }, d = () => o.icon ? o.icon({ active: s.value }) : e.icon ? i(ie, { name: e.icon, classPrefix: e.iconPrefix }, null) : void 0;
  return () => {
    var u;
    const { dot: p, badge: v } = e, { activeColor: h, inactiveColor: g } = l.props, f = s.value ? h : g;
    return i("div", { role: "tab", class: vr({ active: s.value }), style: { color: f }, tabindex: 0, "aria-selected": s.value, onClick: c }, [i(Lo, Q({ dot: p, class: vr("icon"), content: v }, e.badgeProps), { default: d }), i("div", { class: vr("text") }, [(u = o.default) == null ? void 0 : u.call(o, { active: s.value })])]);
  };
} });
const Ug = Z(Hg), [qg, ec] = Y("text-ellipsis");
var Wg = z({ name: qg, props: { rows: te(1), dots: J("..."), content: J(""), expandText: J(""), collapseText: J(""), position: J("end") }, emits: ["clickAction"], setup(e, { emit: t, slots: o }) {
  const n = A(e.content), a = A(!1), l = A(!1), r = A(), s = A();
  let c = !1;
  const d = E(() => a.value ? e.collapseText : e.expandText), u = (f) => {
    if (!f) return 0;
    const b = f.match(/^\d*(\.\d*)?/);
    return b ? Number(b[0]) : 0;
  }, p = () => {
    const f = (() => {
      if (!r.value || !r.value.isConnected) return;
      const C = window.getComputedStyle(r.value), S = document.createElement("div");
      return Array.prototype.slice.apply(C).forEach((O) => {
        S.style.setProperty(O, C.getPropertyValue(O));
      }), S.style.position = "fixed", S.style.zIndex = "-9999", S.style.top = "-9999px", S.style.height = "auto", S.style.minHeight = "auto", S.style.maxHeight = "auto", S.innerText = e.content, document.body.appendChild(S), S;
    })();
    if (!f) return void (c = !0);
    const { paddingBottom: b, paddingTop: w, lineHeight: y } = f.style, k = Math.ceil((Number(e.rows) + 0.5) * u(y) + u(w) + u(b));
    k < f.offsetHeight ? (l.value = !0, n.value = ((C, S) => {
      var O, B;
      const { content: m, position: x, dots: T } = e, V = m.length, P = 0 + V >> 1, N = o.action ? (B = (O = s.value) == null ? void 0 : O.outerHTML) != null ? B : "" : e.expandText, j = (F, I) => {
        if (F[1] - F[0] <= 1 && I[1] - I[0] <= 1) return m.slice(0, F[0]) + T + m.slice(I[1], V);
        const R = Math.floor((F[0] + F[1]) / 2), _ = Math.ceil((I[0] + I[1]) / 2);
        return C.innerText = e.content.slice(0, R) + e.dots + e.content.slice(_, V), C.innerHTML += N, C.offsetHeight >= S ? j([F[0], R], [_, I[1]]) : j([R, F[1]], [I[0], _]);
      };
      return e.position === "middle" ? j([0, P], [P, V]) : (() => {
        const F = (I, R) => {
          if (R - I <= 1) return x === "end" ? m.slice(0, I) + T : T + m.slice(R, V);
          const _ = Math.round((I + R) / 2);
          return C.innerText = x === "end" ? m.slice(0, _) + T : T + m.slice(_, V), C.innerHTML += N, C.offsetHeight > S ? x === "end" ? F(I, _) : F(_, R) : x === "end" ? F(_, R) : F(I, _);
        };
        return F(0, V);
      })();
    })(f, k)) : (l.value = !1, n.value = e.content), document.body.removeChild(f);
  }, v = (f = !a.value) => {
    a.value = f;
  }, h = (f) => {
    v(), t("clickAction", f);
  }, g = () => {
    const f = o.action ? o.action({ expanded: a.value }) : d.value;
    return i("span", { ref: s, class: ec("action"), onClick: h }, [f]);
  };
  return Ce(() => {
    p(), o.action && ne(p);
  }), st(() => {
    c && (c = !1, p());
  }), U([Vt, () => [e.content, e.rows, e.position]], p), pe({ toggle: v }), () => i("div", { ref: r, class: ec() }, [a.value ? e.content : n.value, l.value ? g() : null]);
} });
const Yg = Z(Wg);
var Xg = {};
const [Gg] = Y("time-picker"), tc = (e) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(e), Zg = ["hour", "minute", "second"];
var Kg = z({ name: Gg, props: ae({}, hd, { minHour: te(0), maxHour: te(23), minMinute: te(0), maxMinute: te(59), minSecond: te(0), maxSecond: te(59), minTime: { type: String, validator: tc }, maxTime: { type: String, validator: tc }, columnsType: { type: Array, default: () => ["hour", "minute"] } }), emits: ["confirm", "cancel", "change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(e.modelValue), a = A(), l = (u) => {
    const p = u.split(":");
    return Zg.map((v, h) => e.columnsType.includes(v) ? p[h] : "00");
  }, r = E(() => {
    let { minHour: u, maxHour: p, minMinute: v, maxMinute: h, minSecond: g, maxSecond: f } = e;
    if (e.minTime || e.maxTime) {
      const b = { hour: 0, minute: 0, second: 0 };
      e.columnsType.forEach((k, C) => {
        var S;
        b[k] = (S = n.value[C]) != null ? S : 0;
      });
      const { hour: w, minute: y } = b;
      if (e.minTime) {
        const [k, C, S] = l(e.minTime);
        u = k, v = +w <= +u ? C : "00", g = +w <= +u && +y <= +v ? S : "00";
      }
      if (e.maxTime) {
        const [k, C, S] = l(e.maxTime);
        p = k, h = +w >= +p ? C : "59", f = +w >= +p && +y >= +h ? S : "59";
      }
    }
    return e.columnsType.map((b) => {
      const { filter: w, formatter: y } = e;
      switch (b) {
        case "hour":
          return un(+u, +p, b, y, w, n.value);
        case "minute":
          return un(+v, +h, b, y, w, n.value);
        case "second":
          return un(+g, +f, b, y, w, n.value);
        default:
          if (Xg.NODE_ENV !== "production") throw new Error(`[Vant] DatePicker: unsupported columns type: ${b}`);
          return [];
      }
    });
  });
  U(n, (u) => {
    Rt(u, e.modelValue) || t("update:modelValue", u);
  }), U(() => e.modelValue, (u) => {
    u = yd(u, r.value), Rt(u, n.value) || (n.value = u);
  }, { immediate: !0 });
  const s = (...u) => t("change", ...u), c = (...u) => t("cancel", ...u), d = (...u) => t("confirm", ...u);
  return pe({ confirm: () => {
    var u;
    return (u = a.value) == null ? void 0 : u.confirm();
  }, getSelectedTime: () => n.value }), () => i(Il, Q({ ref: a, modelValue: n.value, "onUpdate:modelValue": (u) => n.value = u, columns: r.value, onChange: s, onCancel: c, onConfirm: d }, he(e, gd)), o);
} });
const Jg = Z(Kg), [Qg, nn] = Y("tree-select");
var e3 = z({ name: Qg, props: { max: te(1 / 0), items: Ve(), height: te(300), selectedIcon: J("success"), mainActiveIndex: te(0), activeId: { type: [Number, String, Array], default: 0 } }, emits: ["clickNav", "clickItem", "update:activeId", "update:mainActiveIndex"], setup(e, { emit: t, slots: o }) {
  const n = (d) => Array.isArray(e.activeId) ? e.activeId.includes(d) : e.activeId === d, a = (d) => i("div", { key: d.id, class: ["van-ellipsis", nn("item", { active: n(d.id), disabled: d.disabled })], onClick: () => {
    if (d.disabled) return;
    let u;
    if (Array.isArray(e.activeId)) {
      u = e.activeId.slice();
      const p = u.indexOf(d.id);
      p !== -1 ? u.splice(p, 1) : u.length < +e.max && u.push(d.id);
    } else u = d.id;
    t("update:activeId", u), t("clickItem", d);
  } }, [d.text, n(d.id) && i(ie, { name: e.selectedIcon, class: nn("selected") }, null)]), l = (d) => {
    t("update:mainActiveIndex", d);
  }, r = (d) => t("clickNav", d), s = () => {
    const d = e.items.map((u) => i(Ud, { dot: u.dot, badge: u.badge, class: [nn("nav-item"), u.className], disabled: u.disabled, onClick: r }, { title: () => o["nav-text"] ? o["nav-text"](u) : u.text }));
    return i(Hd, { class: nn("nav"), modelValue: e.mainActiveIndex, onChange: l }, { default: () => [d] });
  }, c = () => {
    if (o.content) return o.content();
    const d = e.items[+e.mainActiveIndex] || {};
    return d.children ? d.children.map(a) : void 0;
  };
  return () => i("div", { class: nn(), style: { height: ce(e.height) } }, [s(), i("div", { class: nn("content") }, [c()])]);
} });
const t3 = Z(e3), [o3, Ue, n3] = Y("uploader");
function oc(e, t) {
  return new Promise((o) => {
    if (t === "file") return void o();
    const n = new FileReader();
    n.onload = (a) => {
      o(a.target.result);
    }, t === "dataUrl" ? n.readAsDataURL(e) : t === "text" && n.readAsText(e);
  });
}
function nc(e, t) {
  return il(e).some((o) => !!o.file && (vn(t) ? t(o.file) : o.file.size > +t));
}
const a3 = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg|avif)/i;
function Qd(e) {
  return !!e.isImage || (e.file && e.file.type ? e.file.type.indexOf("image") === 0 : e.url ? (t = e.url, a3.test(t)) : typeof e.content == "string" && e.content.indexOf("data:image") === 0);
  var t;
}
var l3 = z({ props: { name: G, item: We(Object), index: Number, imageFit: String, lazyLoad: Boolean, deletable: Boolean, reupload: Boolean, previewSize: [Number, String, Array], beforeDelete: Function }, emits: ["delete", "preview", "reupload"], setup(e, { emit: t, slots: o }) {
  const n = () => {
    const { status: u, message: p } = e.item;
    if (u === "uploading" || u === "failed") {
      const v = u === "failed" ? i(ie, { name: "close", class: Ue("mask-icon") }, null) : i(Et, { class: Ue("loading") }, null), h = fe(p) && p !== "";
      return i("div", { class: Ue("mask") }, [v, h && i("div", { class: Ue("mask-message") }, [p])]);
    }
  }, a = (u) => {
    const { name: p, item: v, index: h, beforeDelete: g } = e;
    u.stopPropagation(), So(g, { args: [v, { name: p, index: h }], done: () => t("delete") });
  }, l = () => t("preview"), r = () => t("reupload"), s = () => {
    if (e.deletable && e.item.status !== "uploading") {
      const u = o["preview-delete"];
      return i("div", { role: "button", class: Ue("preview-delete", { shadow: !u }), tabindex: 0, "aria-label": n3("delete"), onClick: a }, [u ? u() : i(ie, { name: "cross", class: Ue("preview-delete-icon") }, null)]);
    }
  }, c = () => {
    if (o["preview-cover"]) {
      const { index: u, item: p } = e;
      return i("div", { class: Ue("preview-cover") }, [o["preview-cover"](ae({ index: u }, p))]);
    }
  }, d = () => {
    const { item: u, lazyLoad: p, imageFit: v, previewSize: h, reupload: g } = e;
    return Qd(u) ? i($l, { fit: v, src: u.objectUrl || u.content || u.url, class: Ue("preview-image"), width: Array.isArray(h) ? h[0] : h, height: Array.isArray(h) ? h[1] : h, lazyLoad: p, onClick: g ? r : l }, { default: c }) : i("div", { class: Ue("file"), style: lo(e.previewSize) }, [i(ie, { class: Ue("file-icon"), name: "description" }, null), i("div", { class: [Ue("file-name"), "van-ellipsis"] }, [u.file ? u.file.name : u.url]), c()]);
  };
  return () => i("div", { class: Ue("preview") }, [d(), n(), s()]);
} }), r3 = z({ name: o3, props: { name: te(""), accept: J("image/*"), capture: String, multiple: Boolean, disabled: Boolean, readonly: Boolean, lazyLoad: Boolean, maxCount: te(1 / 0), imageFit: J("cover"), resultType: J("dataUrl"), uploadIcon: J("photograph"), uploadText: String, deletable: W, reupload: Boolean, afterRead: Function, showUpload: W, modelValue: Ve(), beforeRead: Function, beforeDelete: Function, previewSize: [Number, String, Array], previewImage: W, previewOptions: Object, previewFullImage: W, maxSize: { type: [Number, String, Function], default: 1 / 0 } }, emits: ["delete", "oversize", "clickUpload", "closePreview", "clickPreview", "clickReupload", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = [], l = A(-1), r = A(!1), s = (S = e.modelValue.length) => ({ name: e.name, index: S }), c = () => {
    n.value && (n.value.value = "");
  }, d = (S) => {
    if (c(), nc(S, e.maxSize)) {
      if (!Array.isArray(S)) return void t("oversize", S, s());
      {
        const O = function(B, m) {
          const x = [], T = [];
          return B.forEach((V) => {
            nc(V, m) ? T.push(V) : x.push(V);
          }), { valid: x, invalid: T };
        }(S, e.maxSize);
        if (S = O.valid, t("oversize", O.invalid, s()), !S.length) return;
      }
    }
    if (S = ke(S), l.value > -1) {
      const O = [...e.modelValue];
      O.splice(l.value, 1, S), t("update:modelValue", O), l.value = -1;
    } else t("update:modelValue", [...e.modelValue, ...il(S)]);
    e.afterRead && e.afterRead(S, s());
  }, u = (S) => {
    const { maxCount: O, modelValue: B, resultType: m } = e;
    if (Array.isArray(S)) {
      const x = +O - B.length;
      S.length > x && (S = S.slice(0, x)), Promise.all(S.map((T) => oc(T, m))).then((T) => {
        const V = S.map((P, N) => {
          const j = { file: P, status: "", message: "", objectUrl: URL.createObjectURL(P) };
          return T[N] && (j.content = T[N]), j;
        });
        d(V);
      });
    } else oc(S, m).then((x) => {
      const T = { file: S, status: "", message: "", objectUrl: URL.createObjectURL(S) };
      x && (T.content = x), d(T);
    });
  }, p = (S) => {
    const { files: O } = S.target;
    if (e.disabled || !O || !O.length) return;
    const B = O.length === 1 ? O[0] : [].slice.call(O);
    if (e.beforeRead) {
      const m = e.beforeRead(B, s());
      if (!m) return void c();
      if (ri(m)) return void m.then((x) => {
        u(x || B);
      }).catch(c);
    }
    u(B);
  };
  let v;
  const h = () => t("closePreview"), g = (S) => {
    r.value = !0, l.value = S, ne(() => C());
  }, f = () => {
    r.value || (l.value = -1), r.value = !1;
  }, b = (S, O) => {
    const B = ["imageFit", "deletable", "reupload", "previewSize", "beforeDelete"], m = ae(he(e, B), he(S, B, !0));
    return i(l3, Q({ item: S, index: O, onClick: () => t(e.reupload ? "clickReupload" : "clickPreview", S, s(O)), onDelete: () => ((x, T) => {
      const V = e.modelValue.slice(0);
      V.splice(T, 1), t("update:modelValue", V), t("delete", x, s(T));
    })(S, O), onPreview: () => ((x) => {
      if (e.previewFullImage) {
        const T = e.modelValue.filter(Qd), V = T.map((P) => (P.objectUrl && !P.url && P.status !== "failed" && (P.url = P.objectUrl, a.push(P.url)), P.url)).filter(Boolean);
        v = pm(ae({ images: V, startPosition: T.indexOf(x), onClose: h }, e.previewOptions));
      }
    })(S), onReupload: () => g(O) }, he(e, ["name", "lazyLoad"]), m), he(o, ["preview-cover", "preview-delete"]));
  }, w = () => {
    if (e.previewImage) return e.modelValue.map(b);
  }, y = (S) => t("clickUpload", S), k = () => {
    const S = e.modelValue.length < +e.maxCount, O = e.readonly ? null : i("input", { ref: n, type: "file", class: Ue("input"), accept: e.accept, capture: e.capture, multiple: e.multiple && l.value === -1, disabled: e.disabled, onChange: p, onClick: f }, null);
    return o.default ? De(i("div", { class: Ue("input-wrapper"), onClick: y }, [o.default(), O]), [[Ie, S]]) : De(i("div", { class: Ue("upload", { readonly: e.readonly }), style: lo(e.previewSize), onClick: y }, [i(ie, { name: e.uploadIcon, class: Ue("upload-icon") }, null), e.uploadText && i("span", { class: Ue("upload-text") }, [e.uploadText]), O]), [[Ie, e.showUpload && S]]);
  }, C = () => {
    n.value && !e.disabled && n.value.click();
  };
  return yt(() => {
    a.forEach((S) => URL.revokeObjectURL(S));
  }), pe({ chooseFile: C, reuploadFile: g, closeImagePreview: () => {
    v && v.close();
  } }), xo(() => e.modelValue), () => i("div", { class: Ue() }, [i("div", { class: Ue("wrapper", { disabled: e.disabled }) }, [w(), k()])]);
} });
const i3 = Z(r3), [s3, ac] = Y("watermark");
var c3 = z({ name: s3, props: { gapX: _e(0), gapY: _e(0), image: String, width: _e(100), height: _e(100), rotate: te(-22), zIndex: G, content: String, opacity: G, fullPage: W, textColor: J("#dcdee0") }, setup(e, { slots: t }) {
  const o = A(), n = A(""), a = A(""), l = () => {
    const r = { transformOrigin: "center", transform: `rotate(${e.rotate}deg)` }, s = e.width + e.gapX, c = e.height + e.gapY;
    return i("svg", { viewBox: `0 0 ${s} ${c}`, width: s, height: c, xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink", style: { padding: `0 ${e.gapX}px ${e.gapY}px 0`, opacity: e.opacity } }, [e.image && !t.content ? i("image", { href: a.value, "xlink:href": a.value, x: "0", y: "0", width: e.width, height: e.height, style: r }, null) : i("foreignObject", { x: "0", y: "0", width: e.width, height: e.height }, [i("div", { xmlns: "http://www.w3.org/1999/xhtml", style: r }, [t.content ? t.content() : i("span", { style: { color: e.textColor } }, [e.content])])])]);
  };
  return ao(() => {
    e.image && ((r) => {
      const s = document.createElement("canvas"), c = new Image();
      c.crossOrigin = "anonymous", c.referrerPolicy = "no-referrer", c.onload = () => {
        s.width = c.naturalWidth, s.height = c.naturalHeight;
        const d = s.getContext("2d");
        d == null || d.drawImage(c, 0, 0), a.value = s.toDataURL();
      }, c.src = r;
    })(e.image);
  }), U(() => [a.value, e.content, e.textColor, e.height, e.width, e.rotate, e.gapX, e.gapY], () => {
    ne(() => {
      o.value && (n.value && URL.revokeObjectURL(n.value), n.value = ((r) => {
        const s = new Blob([r], { type: "image/svg+xml" });
        return URL.createObjectURL(s);
      })(o.value.innerHTML));
    });
  }, { immediate: !0 }), yn(() => {
    n.value && URL.revokeObjectURL(n.value);
  }), () => {
    const r = ae({ backgroundImage: `url(${n.value})` }, ro(e.zIndex));
    return i("div", { class: ac({ full: e.fullPage }), style: r }, [i("div", { class: ac("wrapper"), ref: o }, [l()])]);
  };
} });
const u3 = Z(c3);
var d3 = { install: function(e) {
  [ju, Nr, wp, Ep, jv, o2, ld, r2, Lo, u2, Le, y2, C2, V2, dt, wd, na, wi, $2, _r, H2, X2, G2, J2, tf, lf, uf, Hr, gf, Sf, Of, Ef, jf, Ff, _f, Td, Qt, Wf, Zf, gi, em, am, im, ie, $l, vm, wm, xm, Tm, Et, Vu, Vm, Em, zm, _m, Fu, qm, Xm, Il, Gm, dh, xt, fh, yh, Si, yi, Sh, Ah, Md, Ld, Mh, Hd, Ud, Xh, ug, Wd, vg, Yd, qd, hg, wg, Og, Dg, Ag, Ku, $g, mi, Rg, hi, bi, oa, Lg, Ug, El, Ro, Yg, Jg, Vv, t3, i3, u3].forEach((t) => {
    t.install ? e.use(t) : t.name && e.component(t.name, t);
  });
}, version: "4.9.18" };
function e0(e, t) {
  t === void 0 && (t = {}), t.insertAt;
}
e0();
var sa = {}, t0 = typeof global == "object" && global && global.Object === Object && global, p3 = typeof self == "object" && self && self.Object === Object && self, Co = t0 || p3 || Function("return this")(), hn = Co.Symbol, o0 = Object.prototype, v3 = o0.hasOwnProperty, f3 = o0.toString, Rn = hn ? hn.toStringTag : void 0, m3 = Object.prototype.toString, lc = hn ? hn.toStringTag : void 0;
function Fo(e) {
  return e == null ? e === void 0 ? "[object Undefined]" : "[object Null]" : lc && lc in Object(e) ? function(t) {
    var o = v3.call(t, Rn), n = t[Rn];
    try {
      t[Rn] = void 0;
      var a = !0;
    } catch {
    }
    var l = f3.call(t);
    return a && (o ? t[Rn] = n : delete t[Rn]), l;
  }(e) : function(t) {
    return m3.call(t);
  }(e);
}
function ca(e) {
  return e != null && typeof e == "object";
}
function Vi(e) {
  return typeof e == "symbol" || ca(e) && Fo(e) == "[object Symbol]";
}
var Me = Array.isArray, rc = hn ? hn.prototype : void 0, ic = rc ? rc.toString : void 0;
function n0(e) {
  if (typeof e == "string") return e;
  if (Me(e)) return function(o, n) {
    for (var a = -1, l = o == null ? 0 : o.length, r = Array(l); ++a < l; ) r[a] = n(o[a], a, o);
    return r;
  }(e, n0) + "";
  if (Vi(e)) return ic ? ic.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function a0(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
function h3(e) {
  return e;
}
function zl(e) {
  if (!a0(e)) return !1;
  var t = Fo(e);
  return t == "[object Function]" || t == "[object GeneratorFunction]" || t == "[object AsyncFunction]" || t == "[object Proxy]";
}
var sc, fr = Co["__core-js_shared__"], cc = (sc = /[^.]+$/.exec(fr && fr.keys && fr.keys.IE_PROTO || "")) ? "Symbol(src)_1." + sc : "", g3 = Function.prototype.toString;
function _o(e) {
  if (e != null) {
    try {
      return g3.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var b3 = /^\[object .+?Constructor\]$/, y3 = Function.prototype, w3 = Object.prototype, x3 = y3.toString, S3 = w3.hasOwnProperty, k3 = RegExp("^" + x3.call(S3).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function C3(e) {
  return !(!a0(e) || function(t) {
    return !!cc && cc in t;
  }(e)) && (zl(e) ? k3 : b3).test(_o(e));
}
function Tn(e, t) {
  var o = function(n, a) {
    return n == null ? void 0 : n[a];
  }(e, t);
  return C3(o) ? o : void 0;
}
var Yr = Tn(Co, "WeakMap");
function T3(e, t) {
  for (var o = -1, n = e == null ? 0 : e.length; ++o < n && t(e[o], o, e) !== !1; ) ;
  return e;
}
var O3 = /^(?:0|[1-9]\d*)$/;
function l0(e, t) {
  var o = typeof e;
  return !!(t = t ?? 9007199254740991) && (o == "number" || o != "symbol" && O3.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
function B3(e, t) {
  return e === t || e != e && t != t;
}
function Di(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= 9007199254740991;
}
function Ai(e) {
  return e != null && Di(e.length) && !zl(e);
}
var V3 = Object.prototype;
function r0(e) {
  var t = e && e.constructor;
  return e === (typeof t == "function" && t.prototype || V3);
}
function uc(e) {
  return ca(e) && Fo(e) == "[object Arguments]";
}
var i0 = Object.prototype, D3 = i0.hasOwnProperty, A3 = i0.propertyIsEnumerable, Ei = uc(/* @__PURE__ */ function() {
  return arguments;
}()) ? uc : function(e) {
  return ca(e) && D3.call(e, "callee") && !A3.call(e, "callee");
}, s0 = typeof exports == "object" && exports && !exports.nodeType && exports, dc = s0 && typeof module == "object" && module && !module.nodeType && module, pc = dc && dc.exports === s0 ? Co.Buffer : void 0, c0 = (pc ? pc.isBuffer : void 0) || function() {
  return !1;
}, Be = {};
Be["[object Float32Array]"] = Be["[object Float64Array]"] = Be["[object Int8Array]"] = Be["[object Int16Array]"] = Be["[object Int32Array]"] = Be["[object Uint8Array]"] = Be["[object Uint8ClampedArray]"] = Be["[object Uint16Array]"] = Be["[object Uint32Array]"] = !0, Be["[object Arguments]"] = Be["[object Array]"] = Be["[object ArrayBuffer]"] = Be["[object Boolean]"] = Be["[object DataView]"] = Be["[object Date]"] = Be["[object Error]"] = Be["[object Function]"] = Be["[object Map]"] = Be["[object Number]"] = Be["[object Object]"] = Be["[object RegExp]"] = Be["[object Set]"] = Be["[object String]"] = Be["[object WeakMap]"] = !1;
var u0 = typeof exports == "object" && exports && !exports.nodeType && exports, Jn = u0 && typeof module == "object" && module && !module.nodeType && module, mr = Jn && Jn.exports === u0 && t0.process, vc = function() {
  try {
    return Jn && Jn.require && Jn.require("util").types || mr && mr.binding && mr.binding("util");
  } catch {
  }
}(), fc = vc && vc.isTypedArray, d0 = fc ? /* @__PURE__ */ function(e) {
  return function(t) {
    return e(t);
  };
}(fc) : function(e) {
  return ca(e) && Di(e.length) && !!Be[Fo(e)];
}, E3 = Object.prototype.hasOwnProperty;
function P3(e, t) {
  var o = Me(e), n = !o && Ei(e), a = !o && !n && c0(e), l = !o && !n && !a && d0(e), r = o || n || a || l, s = r ? function(u, p) {
    for (var v = -1, h = Array(u); ++v < u; ) h[v] = p(v);
    return h;
  }(e.length, String) : [], c = s.length;
  for (var d in e) E3.call(e, d) && (!r || !(d == "length" || a && (d == "offset" || d == "parent") || l && (d == "buffer" || d == "byteLength" || d == "byteOffset") || l0(d, c))) && s.push(d);
  return s;
}
var I3 = /* @__PURE__ */ function(e, t) {
  return function(o) {
    return e(t(o));
  };
}(Object.keys, Object), $3 = Object.prototype.hasOwnProperty;
function p0(e) {
  if (!r0(e)) return I3(e);
  var t = [];
  for (var o in Object(e)) $3.call(e, o) && o != "constructor" && t.push(o);
  return t;
}
function j3(e) {
  return Ai(e) ? P3(e) : p0(e);
}
var z3 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, R3 = /^\w*$/, Nn = Tn(Object, "create"), N3 = Object.prototype.hasOwnProperty, M3 = Object.prototype.hasOwnProperty;
function Do(e) {
  var t = -1, o = e == null ? 0 : e.length;
  for (this.clear(); ++t < o; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
function $a(e, t) {
  for (var o = e.length; o--; ) if (B3(e[o][0], t)) return o;
  return -1;
}
Do.prototype.clear = function() {
  this.__data__ = Nn ? Nn(null) : {}, this.size = 0;
}, Do.prototype.delete = function(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}, Do.prototype.get = function(e) {
  var t = this.__data__;
  if (Nn) {
    var o = t[e];
    return o === "__lodash_hash_undefined__" ? void 0 : o;
  }
  return N3.call(t, e) ? t[e] : void 0;
}, Do.prototype.has = function(e) {
  var t = this.__data__;
  return Nn ? t[e] !== void 0 : M3.call(t, e);
}, Do.prototype.set = function(e, t) {
  var o = this.__data__;
  return this.size += this.has(e) ? 0 : 1, o[e] = Nn && t === void 0 ? "__lodash_hash_undefined__" : t, this;
};
var L3 = Array.prototype.splice;
function rn(e) {
  var t = -1, o = e == null ? 0 : e.length;
  for (this.clear(); ++t < o; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
rn.prototype.clear = function() {
  this.__data__ = [], this.size = 0;
}, rn.prototype.delete = function(e) {
  var t = this.__data__, o = $a(t, e);
  return !(o < 0) && (o == t.length - 1 ? t.pop() : L3.call(t, o, 1), --this.size, !0);
}, rn.prototype.get = function(e) {
  var t = this.__data__, o = $a(t, e);
  return o < 0 ? void 0 : t[o][1];
}, rn.prototype.has = function(e) {
  return $a(this.__data__, e) > -1;
}, rn.prototype.set = function(e, t) {
  var o = this.__data__, n = $a(o, e);
  return n < 0 ? (++this.size, o.push([e, t])) : o[n][1] = t, this;
};
var gl = Tn(Co, "Map");
function ja(e, t) {
  var o = e.__data__;
  return function(n) {
    var a = typeof n;
    return a == "string" || a == "number" || a == "symbol" || a == "boolean" ? n !== "__proto__" : n === null;
  }(t) ? o[typeof t == "string" ? "string" : "hash"] : o.map;
}
function Ao(e) {
  var t = -1, o = e == null ? 0 : e.length;
  for (this.clear(); ++t < o; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
Ao.prototype.clear = function() {
  this.size = 0, this.__data__ = { hash: new Do(), map: new (gl || rn)(), string: new Do() };
}, Ao.prototype.delete = function(e) {
  var t = ja(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}, Ao.prototype.get = function(e) {
  return ja(this, e).get(e);
}, Ao.prototype.has = function(e) {
  return ja(this, e).has(e);
}, Ao.prototype.set = function(e, t) {
  var o = ja(this, e), n = o.size;
  return o.set(e, t), this.size += o.size == n ? 0 : 1, this;
};
function Pi(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function") throw new TypeError("Expected a function");
  var o = function() {
    var n = arguments, a = t ? t.apply(this, n) : n[0], l = o.cache;
    if (l.has(a)) return l.get(a);
    var r = e.apply(this, n);
    return o.cache = l.set(a, r) || l, r;
  };
  return o.cache = new (Pi.Cache || Ao)(), o;
}
Pi.Cache = Ao;
var F3 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, _3 = /\\(\\)?/g, H3 = function(e) {
  var t = Pi(e, function(n) {
    return o.size === 500 && o.clear(), n;
  }), o = t.cache;
  return t;
}(function(e) {
  var t = [];
  return e.charCodeAt(0) === 46 && t.push(""), e.replace(F3, function(o, n, a, l) {
    t.push(a ? l.replace(_3, "$1") : n || o);
  }), t;
});
function U3(e, t) {
  return Me(e) ? e : function(o, n) {
    if (Me(o)) return !1;
    var a = typeof o;
    return !(a != "number" && a != "symbol" && a != "boolean" && o != null && !Vi(o)) || R3.test(o) || !z3.test(o) || n != null && o in Object(n);
  }(e, t) ? [e] : H3(function(o) {
    return o == null ? "" : n0(o);
  }(e));
}
function q3(e) {
  if (typeof e == "string" || Vi(e)) return e;
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
var Xr = Tn(Co, "DataView"), Gr = Tn(Co, "Promise"), Zr = Tn(Co, "Set"), mc = "[object Map]", hc = "[object Promise]", gc = "[object Set]", bc = "[object WeakMap]", yc = "[object DataView]", W3 = _o(Xr), Y3 = _o(gl), X3 = _o(Gr), G3 = _o(Zr), Z3 = _o(Yr), Vo = Fo;
(Xr && Vo(new Xr(new ArrayBuffer(1))) != yc || gl && Vo(new gl()) != mc || Gr && Vo(Gr.resolve()) != hc || Zr && Vo(new Zr()) != gc || Yr && Vo(new Yr()) != bc) && (Vo = function(e) {
  var t = Fo(e), o = t == "[object Object]" ? e.constructor : void 0, n = o ? _o(o) : "";
  if (n) switch (n) {
    case W3:
      return yc;
    case Y3:
      return mc;
    case X3:
      return hc;
    case G3:
      return gc;
    case Z3:
      return bc;
  }
  return t;
});
var K3 = function(e, t, o) {
  for (var n = -1, a = Object(e), l = o(e), r = l.length; r--; ) {
    var s = l[++n];
    if (t(a[s], s, a) === !1) break;
  }
  return e;
}, J3 = /* @__PURE__ */ function(e) {
  return function(t, o) {
    if (t == null) return t;
    if (!Ai(t)) return e(t, o);
    for (var n = t.length, a = -1, l = Object(t); ++a < n && o(l[a], a, l) !== !1; ) ;
    return t;
  };
}(function(e, t) {
  return e && K3(e, t, j3);
});
function Q3(e, t) {
  return (Me(e) ? T3 : J3)(e, /* @__PURE__ */ function(o) {
    return typeof o == "function" ? o : h3;
  }(t));
}
var e4 = Object.prototype.hasOwnProperty;
function t4(e, t) {
  return e != null && e4.call(e, t);
}
function re(e, t) {
  return e != null && function(o, n, a) {
    for (var l = -1, r = (n = U3(n, o)).length, s = !1; ++l < r; ) {
      var c = q3(n[l]);
      if (!(s = o != null && a(o, c))) break;
      o = o[c];
    }
    return s || ++l != r ? s : !!(r = o == null ? 0 : o.length) && Di(r) && l0(c, r) && (Me(o) || Ei(o));
  }(e, t, t4);
}
var o4 = Object.prototype.hasOwnProperty;
function n4() {
}
const Pe = Object.assign, Rl = typeof window < "u", Nl = (e) => e !== null && typeof e == "object", ze = (e) => e != null, bl = (e) => typeof e == "function", v0 = (e) => Nl(e) && bl(e.then) && bl(e.catch), wc = (e) => Object.prototype.toString.call(e) === "[object Date]" && !Number.isNaN(e.getTime()), f0 = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e);
function xc(e, t) {
  const o = t.split(".");
  let n = e;
  return o.forEach((a) => {
    var l;
    n = Nl(n) && (l = n[a]) != null ? l : "";
  }), n;
}
function gt(e, t, o) {
  return t.reduce((n, a) => (n[a] = e[a], n), {});
}
const Nt = (e, t) => JSON.stringify(e) === JSON.stringify(t), Sc = (e) => Array.isArray(e) ? e : [e], ut = null, ue = [Number, String], me = { type: Boolean, default: !0 }, bo = (e) => ({ type: e, required: !0 }), yo = () => ({ type: Array, default: () => [] }), xe = (e) => ({ type: ue, default: e }), Re = (e) => ({ type: String, default: e });
var On = typeof window < "u";
function yl(e) {
  return On ? requestAnimationFrame(e) : -1;
}
function kc(e) {
  On && cancelAnimationFrame(e);
}
function Hn(e) {
  yl(() => yl(e));
}
var Cc = (e, t) => ({ top: 0, left: 0, right: e, bottom: t, width: e, height: t }), Bt = (e) => {
  const t = Se(e);
  if (/* @__PURE__ */ ((o) => o === window)(t)) {
    const o = t.innerWidth, n = t.innerHeight;
    return Cc(o, n);
  }
  return t != null && t.getBoundingClientRect ? t.getBoundingClientRect() : Cc(0, 0);
};
function Ho(e) {
  const t = Mt(e, null);
  if (t) {
    const o = Xe(), { link: n, unlink: a, internalChildren: l } = t;
    return n(o), yn(() => a(o)), { parent: t, index: E(() => l.indexOf(o)) };
  }
  return { parent: null, index: A(-1) };
}
var za, hr, Tc = (e, t) => {
  const o = e.indexOf(t);
  return o === -1 ? e.findIndex((n) => t.key !== void 0 && t.key !== null && n.type === t.type && n.key === t.key) : o;
};
function a4(e, t, o) {
  const n = function(l) {
    const r = [], s = (c) => {
      Array.isArray(c) && c.forEach((d) => {
        var u;
        Tl(d) && (r.push(d), (u = d.component) != null && u.subTree && (r.push(d.component.subTree), s(d.component.subTree.children)), d.children && s(d.children));
      });
    };
    return s(l), r;
  }(e.subTree.children);
  o.sort((l, r) => Tc(n, l.vnode) - Tc(n, r.vnode));
  const a = o.map((l) => l.proxy);
  t.sort((l, r) => a.indexOf(l) - a.indexOf(r));
}
function Uo(e) {
  const t = ke([]), o = ke([]), n = Xe();
  return { children: t, linkChildren: (a) => {
    At(e, Object.assign({ link: (l) => {
      l.proxy && (o.push(l), t.push(l.proxy), a4(n, t, o));
    }, unlink: (l) => {
      const r = o.indexOf(l);
      t.splice(r, 1), o.splice(r, 1);
    }, children: t, internalChildren: o }, a));
  } };
}
function Ml(e) {
  let t;
  Ce(() => {
    e(), ne(() => {
      t = !0;
    });
  }), st(() => {
    t && e();
  });
}
function Ft(e, t, o = {}) {
  if (!On) return;
  const { target: n = window, passive: a = !1, capture: l = !1 } = o;
  let r, s = !1;
  const c = (p) => {
    if (s) return;
    const v = Se(p);
    v && !r && (v.addEventListener(e, t, { capture: l, passive: a }), r = !0);
  }, d = (p) => {
    if (s) return;
    const v = Se(p);
    v && r && (v.removeEventListener(e, t, l), r = !1);
  };
  let u;
  return yn(() => d(n)), ot(() => d(n)), Ml(() => c(n)), gu(n) && (u = U(n, (p, v) => {
    d(v), c(p);
  })), () => {
    u == null || u(), d(n), s = !0;
  };
}
var Ra, l4 = /scroll|auto|overlay/i, m0 = On ? window : void 0;
function r4(e) {
  return e.tagName !== "HTML" && e.tagName !== "BODY" && e.nodeType === 1;
}
function h0(e, t = m0) {
  let o = e;
  for (; o && o !== t && r4(o); ) {
    const { overflowY: n } = window.getComputedStyle(o);
    if (l4.test(n)) return o;
    o = o.parentNode;
  }
  return t;
}
function g0(e, t = m0) {
  const o = A();
  return Ce(() => {
    e.value && (o.value = h0(e.value, t));
  }), o;
}
var b0 = Symbol("van-field");
function qo(e) {
  const t = Mt(b0, null);
  t && !t.customValue.value && (t.customValue.value = e, U(e, () => {
    t.resetValidation(), t.validateWithTrigger("onChange");
  }));
}
function Ii(e) {
  const t = "scrollTop" in e ? e.scrollTop : e.pageYOffset;
  return Math.max(t, 0);
}
function Kr(e, t) {
  "scrollTop" in e ? e.scrollTop = t : e.scrollTo(e.scrollX, t);
}
function $i() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
function ji(e) {
  Kr(window, e), Kr(document.body, e);
}
function Oc(e, t) {
  if (e === window) return 0;
  const o = t ? Ii(t) : $i();
  return Bt(e).top + o;
}
const i4 = !!Rl && /ios|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
function y0() {
  i4 && ji($i());
}
const w0 = (e) => e.stopPropagation();
function rt(e, t) {
  (typeof e.cancelable != "boolean" || e.cancelable) && e.preventDefault(), t && w0(e);
}
function la(e) {
  const t = Se(e);
  if (!t) return !1;
  const o = window.getComputedStyle(t), n = o.display === "none", a = t.offsetParent === null && o.position !== "fixed";
  return n || a;
}
const { width: Ll, height: zi } = function() {
  if (!za && (za = A(0), hr = A(0), On)) {
    const e = () => {
      za.value = window.innerWidth, hr.value = window.innerHeight;
    };
    e(), window.addEventListener("resize", e, { passive: !0 }), window.addEventListener("orientationchange", e, { passive: !0 });
  }
  return { width: za, height: hr };
}();
function Ee(e) {
  if (ze(e)) return f0(e) ? `${e}px` : String(e);
}
function Ri(e) {
  if (ze(e)) {
    if (Array.isArray(e)) return { width: Ee(e[0]), height: Ee(e[1]) };
    const t = Ee(e);
    return { width: t, height: t };
  }
}
function x0(e) {
  const t = {};
  return e !== void 0 && (t.zIndex = +e), t;
}
let gr;
function s4(e) {
  return +(e = e.replace(/rem/g, "")) * function() {
    if (!gr) {
      const t = document.documentElement, o = t.style.fontSize || window.getComputedStyle(t).fontSize;
      gr = parseFloat(o);
    }
    return gr;
  }();
}
function Ni(e) {
  if (typeof e == "number") return e;
  if (Rl) {
    if (e.includes("rem")) return s4(e);
    if (e.includes("vw")) return function(t) {
      return +(t = t.replace(/vw/g, "")) * Ll.value / 100;
    }(e);
    if (e.includes("vh")) return function(t) {
      return +(t = t.replace(/vh/g, "")) * zi.value / 100;
    }(e);
  }
  return parseFloat(e);
}
const c4 = /-(\w)/g, S0 = (e) => e.replace(c4, (t, o) => o.toUpperCase());
function k0(e, t = 2) {
  let o = e + "";
  for (; o.length < t; ) o = "0" + o;
  return o;
}
const to = (e, t, o) => Math.min(Math.max(e, t), o);
function Bc(e, t, o) {
  const n = e.indexOf(t);
  return n === -1 ? e : t === "-" && n !== 0 ? e.slice(0, n) : e.slice(0, n + 1) + e.slice(n).replace(o, "");
}
function Jr(e, t = !0, o = !0) {
  e = t ? Bc(e, ".", /\./g) : e.split(".")[0];
  const n = t ? /[^-0-9.]/g : /[^-0-9]/g;
  return (e = o ? Bc(e, "-", /-/g) : e.replace(/-/, "")).replace(n, "");
}
function C0(e, t) {
  return Math.round(1e10 * (e + t)) / 1e10;
}
const { hasOwnProperty: u4 } = Object.prototype;
function T0(e, t) {
  return Object.keys(t).forEach((o) => {
    (function(n, a, l) {
      const r = a[l];
      ze(r) && (u4.call(n, l) && Nl(r) ? n[l] = T0(Object(n[l]), r) : n[l] = r);
    })(e, t, o);
  }), e;
}
const Vc = A("zh-CN"), Dc = ke({ "zh-CN": { name: "姓名", tel: "电话", save: "保存", clear: "清空", cancel: "取消", confirm: "确认", delete: "删除", loading: "加载中...", noCoupon: "暂无优惠券", nameEmpty: "请填写姓名", addContact: "添加联系人", telInvalid: "请填写正确的电话", vanCalendar: { end: "结束", start: "开始", title: "日期选择", weekdays: ["日", "一", "二", "三", "四", "五", "六"], monthTitle: (e, t) => `${e}年${t}月`, rangePrompt: (e) => `最多选择 ${e} 天` }, vanCascader: { select: "请选择" }, vanPagination: { prev: "上一页", next: "下一页" }, vanPullRefresh: { pulling: "下拉即可刷新...", loosing: "释放即可刷新..." }, vanSubmitBar: { label: "合计:" }, vanCoupon: { unlimited: "无门槛", discount: (e) => `${e}折`, condition: (e) => `满${e}元可用` }, vanCouponCell: { title: "优惠券", count: (e) => `${e}张可用` }, vanCouponList: { exchange: "兑换", close: "不使用", enable: "可用", disabled: "不可用", placeholder: "输入优惠码" }, vanAddressEdit: { area: "地区", areaEmpty: "请选择地区", addressEmpty: "请填写详细地址", addressDetail: "详细地址", defaultAddress: "设为默认收货地址" }, vanAddressList: { add: "新增地址" } } }), d4 = { messages: () => Dc[Vc.value], use(e, t) {
  Vc.value = e, this.add({ [e]: t });
}, add(e = {}) {
  T0(Dc, e);
} };
var p4 = d4;
function v4(e) {
  const t = S0(e) + ".";
  return (o, ...n) => {
    const a = p4.messages(), l = xc(a, t + o) || xc(a, o);
    return bl(l) ? l(...n) : l;
  };
}
function Qr(e, t) {
  return t ? typeof t == "string" ? ` ${e}--${t}` : Array.isArray(t) ? t.reduce((o, n) => o + Qr(e, n), "") : Object.keys(t).reduce((o, n) => o + (t[n] ? Qr(e, n) : ""), "") : "";
}
function f4(e) {
  return (t, o) => (t && typeof t != "string" && (o = t, t = ""), `${t = t ? `${e}__${t}` : e}${Qr(t, o)}`);
}
function ge(e) {
  const t = `van-${e}`;
  return [t, f4(t), v4(t)];
}
const O0 = "van-hairline", B0 = `${O0}--top-bottom`, m4 = `${O0}-unset--top-bottom`, gn = "van-haptics-feedback", V0 = Symbol("van-form");
function Mi(e, { args: t = [], done: o, canceled: n, error: a }) {
  if (e) {
    const l = e.apply(null, t);
    v0(l) ? l.then((r) => {
      r ? o() : n && n();
    }).catch(a || n4) : l ? o() : n && n();
  } else o();
}
function Te(e) {
  return e.install = (t) => {
    const { name: o } = e;
    o && (t.component(o, e), t.component(S0(`-${o}`), e));
  }, e;
}
const D0 = Symbol();
function A0(e) {
  const t = Mt(D0, null);
  t && U(t, (o) => {
    o && e();
  });
}
function nt(e) {
  const t = Xe();
  t && Pe(t.proxy, e);
}
const E0 = { to: [String, Object], url: String, replace: Boolean };
function P0({ to: e, url: t, replace: o, $router: n }) {
  e && n ? n[o ? "replace" : "push"](e) : t && (o ? location.replace(t) : location.href = t);
}
const [h4, Ac] = ge("badge");
var g4 = z({ name: h4, props: { dot: Boolean, max: ue, tag: Re("div"), color: String, offset: Array, content: ue, showZero: me, position: Re("top-right") }, setup(e, { slots: t }) {
  const o = () => {
    if (t.content) return !0;
    const { content: s, showZero: c } = e;
    return ze(s) && s !== "" && (c || s !== 0 && s !== "0");
  }, n = () => {
    const { dot: s, max: c, content: d } = e;
    if (!s && o()) return t.content ? t.content() : ze(c) && f0(d) && +d > +c ? `${c}+` : d;
  }, a = (s) => s.startsWith("-") ? s.replace("-", "") : `-${s}`, l = E(() => {
    const s = { background: e.color };
    if (e.offset) {
      const [c, d] = e.offset, { position: u } = e, [p, v] = u.split("-");
      t.default ? (s[p] = typeof d == "number" ? Ee(p === "top" ? d : -d) : p === "top" ? Ee(d) : a(d), s[v] = typeof c == "number" ? Ee(v === "left" ? c : -c) : v === "left" ? Ee(c) : a(c)) : (s.marginTop = Ee(d), s.marginLeft = Ee(c));
    }
    return s;
  }), r = () => {
    if (o() || e.dot) return i("div", { class: Ac([e.position, { dot: e.dot, fixed: !!t.default }]), style: l.value }, [n()]);
  };
  return () => {
    if (t.default) {
      const { tag: s } = e;
      return i(s, { class: Ac("wrapper") }, { default: () => [t.default(), r()] });
    }
    return r();
  };
} });
const I0 = Te(g4);
let $0 = 2e3;
const [j0, b4] = ge("config-provider"), z0 = Symbol(j0);
function Na(e = {}, t = {}) {
  Object.keys(e).forEach((o) => {
    e[o] !== t[o] && document.documentElement.style.setProperty(o, e[o]);
  }), Object.keys(t).forEach((o) => {
    e[o] || document.documentElement.style.removeProperty(o);
  });
}
z({ name: j0, props: { tag: Re("div"), theme: Re("light"), zIndex: Number, themeVars: Object, themeVarsDark: Object, themeVarsLight: Object, themeVarsScope: Re("local"), iconPrefix: String }, setup(e, { slots: t }) {
  const o = E(() => function(n) {
    const a = {};
    return Object.keys(n).forEach((l) => {
      const r = function(s) {
        return s.replace(/([a-zA-Z])(\d)/g, "$1-$2");
      }(((s) => s.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, ""))(l));
      a[`--van-${r}`] = n[l];
    }), a;
  }(Pe({}, e.themeVars, e.theme === "dark" ? e.themeVarsDark : e.themeVarsLight)));
  if (Rl) {
    const n = () => {
      document.documentElement.classList.add(`van-theme-${e.theme}`);
    }, a = (l = e.theme) => {
      document.documentElement.classList.remove(`van-theme-${l}`);
    };
    U(() => e.theme, (l, r) => {
      r && a(r), n();
    }, { immediate: !0 }), st(n), ot(a), yt(a), U(o, (l, r) => {
      e.themeVarsScope === "global" && Na(l, r);
    }), U(() => e.themeVarsScope, (l, r) => {
      r === "global" && Na({}, o.value), l === "global" && Na(o.value, {});
    }), e.themeVarsScope === "global" && Na(o.value, {});
  }
  return At(z0, e), ao(() => {
    e.zIndex !== void 0 && ((n) => {
      $0 = n;
    })(e.zIndex);
  }), () => i(e.tag, { class: b4(), style: e.themeVarsScope === "local" ? o.value : void 0 }, { default: () => {
    var n;
    return [(n = t.default) == null ? void 0 : n.call(t)];
  } });
} });
const [y4, Ec] = ge("icon");
var w4 = z({ name: y4, props: { dot: Boolean, tag: Re("i"), name: String, size: ue, badge: ue, color: String, badgeProps: Object, classPrefix: String }, setup(e, { slots: t }) {
  const o = Mt(z0, null), n = E(() => e.classPrefix || (o == null ? void 0 : o.iconPrefix) || Ec());
  return () => {
    const { tag: a, dot: l, name: r, size: s, badge: c, color: d } = e, u = ((p) => p == null ? void 0 : p.includes("/"))(r);
    return i(I0, Q({ dot: l, tag: a, class: [n.value, u ? "" : `${n.value}-${r}`], style: { color: d, fontSize: Ee(s) }, content: c }, e.badgeProps), { default: () => {
      var p;
      return [(p = t.default) == null ? void 0 : p.call(t), u && i("img", { class: Ec("image"), src: r }, null)];
    } });
  };
} });
const Dt = Te(w4), [x4, Qn] = ge("loading"), S4 = Array(12).fill(null).map((e, t) => i("i", { class: Qn("line", String(t + 1)) }, null)), k4 = i("svg", { class: Qn("circular"), viewBox: "25 25 50 50" }, [i("circle", { cx: "50", cy: "50", r: "20", fill: "none" }, null)]);
var C4 = z({ name: x4, props: { size: ue, type: Re("circular"), color: String, vertical: Boolean, textSize: ue, textColor: String }, setup(e, { slots: t }) {
  const o = E(() => Pe({ color: e.color }, Ri(e.size))), n = () => {
    const l = e.type === "spinner" ? S4 : k4;
    return i("span", { class: Qn("spinner", e.type), style: o.value }, [t.icon ? t.icon() : l]);
  }, a = () => {
    var l;
    if (t.default) return i("span", { class: Qn("text"), style: { fontSize: Ee(e.textSize), color: (l = e.textColor) != null ? l : e.color } }, [t.default()]);
  };
  return () => {
    const { type: l, vertical: r } = e;
    return i("div", { class: Qn([l, { vertical: r }]), "aria-live": "polite", "aria-busy": !0 }, [n(), a()]);
  };
} });
const R0 = Te(C4), T4 = { show: Boolean, zIndex: ue, overlay: me, duration: ue, teleport: [String, Object], lockScroll: me, lazyRender: me, beforeClose: Function, overlayStyle: Object, overlayClass: ut, transitionAppear: Boolean, closeOnClickOverlay: me };
function ua() {
  const e = A(0), t = A(0), o = A(0), n = A(0), a = A(0), l = A(0), r = A(""), s = A(!0), c = () => {
    o.value = 0, n.value = 0, a.value = 0, l.value = 0, r.value = "", s.value = !0;
  };
  return { move: (d) => {
    const u = d.touches[0];
    o.value = (u.clientX < 0 ? 0 : u.clientX) - e.value, n.value = u.clientY - t.value, a.value = Math.abs(o.value), l.value = Math.abs(n.value), (!r.value || a.value < 10 && l.value < 10) && (r.value = function(p, v) {
      return p > v ? "horizontal" : v > p ? "vertical" : "";
    }(a.value, l.value)), s.value && (a.value > 5 || l.value > 5) && (s.value = !1);
  }, start: (d) => {
    c(), e.value = d.touches[0].clientX, t.value = d.touches[0].clientY;
  }, reset: c, startX: e, startY: t, deltaX: o, deltaY: n, offsetX: a, offsetY: l, direction: r, isVertical: () => r.value === "vertical", isHorizontal: () => r.value === "horizontal", isTap: s };
}
let Mn = 0;
const Pc = "van-overflow-hidden";
function N0(e) {
  const t = A(!1);
  return U(e, (o) => {
    o && (t.value = o);
  }, { immediate: !0 }), (o) => () => t.value ? o() : null;
}
const ei = () => {
  var e;
  const { scopeId: t } = ((e = Xe()) == null ? void 0 : e.vnode) || {};
  return t ? { [t]: "" } : null;
}, [O4, B4] = ge("overlay");
var V4 = z({ name: O4, props: { show: Boolean, zIndex: ue, duration: ue, className: ut, lockScroll: me, lazyRender: me, customStyle: Object, teleport: [String, Object] }, setup(e, { slots: t }) {
  const o = A(), n = N0(() => e.show || !e.lazyRender)(() => {
    var a;
    const l = Pe(x0(e.zIndex), e.customStyle);
    return ze(e.duration) && (l.animationDuration = `${e.duration}s`), De(i("div", { ref: o, style: l, class: [B4(), e.className] }, [(a = t.default) == null ? void 0 : a.call(t)]), [[Ie, e.show]]);
  });
  return Ft("touchmove", (a) => {
    e.lockScroll && rt(a, !0);
  }, { target: o }), () => {
    const a = i(wn, { name: "van-fade", appear: !0 }, { default: n });
    return e.teleport ? i(Lt, { to: e.teleport }, { default: () => [a] }) : a;
  };
} });
const D4 = Te(V4), A4 = Pe({}, T4, { round: Boolean, position: Re("center"), closeIcon: Re("cross"), closeable: Boolean, transition: String, iconPrefix: String, closeOnPopstate: Boolean, closeIconPosition: Re("top-right"), destroyOnClose: Boolean, safeAreaInsetTop: Boolean, safeAreaInsetBottom: Boolean }), [E4, Ic] = ge("popup");
var P4 = z({ name: E4, inheritAttrs: !1, props: A4, emits: ["open", "close", "opened", "closed", "keydown", "update:show", "clickOverlay", "clickCloseIcon"], setup(e, { emit: t, attrs: o, slots: n }) {
  let a, l;
  const r = A(), s = A(), c = N0(() => e.show || !e.lazyRender), d = E(() => {
    const O = { zIndex: r.value };
    return ze(e.duration) && (O[e.position === "center" ? "animationDuration" : "transitionDuration"] = `${e.duration}s`), O;
  }), u = () => {
    a || (a = !0, r.value = e.zIndex !== void 0 ? +e.zIndex : ++$0, t("open"));
  }, p = () => {
    a && Mi(e.beforeClose, { done() {
      a = !1, t("close"), t("update:show", !1);
    } });
  }, v = (O) => {
    t("clickOverlay", O), e.closeOnClickOverlay && p();
  }, h = () => {
    if (e.overlay) return i(D4, Q({ show: e.show, class: e.overlayClass, zIndex: r.value, duration: e.duration, customStyle: e.overlayStyle, role: e.closeOnClickOverlay ? "button" : void 0, tabindex: e.closeOnClickOverlay ? 0 : void 0 }, ei(), { onClick: v }), { default: n["overlay-content"] });
  }, g = (O) => {
    t("clickCloseIcon", O), p();
  }, f = () => {
    if (e.closeable) return i(Dt, { role: "button", tabindex: 0, name: e.closeIcon, class: [Ic("close-icon", e.closeIconPosition), gn], classPrefix: e.iconPrefix, onClick: g }, null);
  };
  let b;
  const w = () => {
    b && clearTimeout(b), b = setTimeout(() => {
      t("opened");
    });
  }, y = () => t("closed"), k = (O) => t("keydown", O), C = c(() => {
    var O;
    const { destroyOnClose: B, round: m, position: x, safeAreaInsetTop: T, safeAreaInsetBottom: V, show: P } = e;
    if (P || !B) return De(i("div", Q({ ref: s, style: d.value, role: "dialog", tabindex: 0, class: [Ic({ round: m, [x]: x }), { "van-safe-area-top": T, "van-safe-area-bottom": V }], onKeydown: k }, o, ei()), [(O = n.default) == null ? void 0 : O.call(n), f()]), [[Ie, P]]);
  }), S = () => {
    const { position: O, transition: B, transitionAppear: m } = e;
    return i(wn, { name: B || (O === "center" ? "van-fade" : `van-popup-slide-${O}`), appear: m, onAfterEnter: w, onAfterLeave: y }, { default: C });
  };
  return U(() => e.show, (O) => {
    O && !a && (u(), o.tabindex === 0 && ne(() => {
      var B;
      (B = s.value) == null || B.focus();
    })), !O && a && (a = !1, t("close"));
  }), nt({ popupRef: s }), function(O, B) {
    const m = ua(), x = (N) => {
      m.move(N);
      const j = m.deltaY.value > 0 ? "10" : "01", F = h0(N.target, O.value), { scrollHeight: I, offsetHeight: R, scrollTop: _ } = F;
      let $ = "11";
      _ === 0 ? $ = R >= I ? "00" : "01" : _ + R >= I && ($ = "10"), $ !== "11" && m.isVertical() && !(parseInt($, 2) & parseInt(j, 2)) && rt(N, !0);
    }, T = () => {
      document.addEventListener("touchstart", m.start), document.addEventListener("touchmove", x, { passive: !1 }), Mn || document.body.classList.add(Pc), Mn++;
    }, V = () => {
      Mn && (document.removeEventListener("touchstart", m.start), document.removeEventListener("touchmove", x), Mn--, Mn || document.body.classList.remove(Pc));
    }, P = () => B() && V();
    Ml(() => B() && T()), ot(P), yt(P), U(B, (N) => {
      N ? T() : V();
    });
  }(s, () => e.show && e.lockScroll), Ft("popstate", () => {
    e.closeOnPopstate && (p(), l = !1);
  }), Ce(() => {
    e.show && u();
  }), st(() => {
    l && (t("update:show", !0), l = !1);
  }), ot(() => {
    e.show && e.teleport && (p(), l = !0);
  }), At(D0, () => e.show), () => e.teleport ? i(Lt, { to: e.teleport }, { default: () => [h(), S()] }) : i(be, null, [h(), S()]);
} });
const I4 = Te(P4), [$4, Zt, $c] = ge("picker"), jc = (e) => e.find((t) => !t.disabled) || e[0];
function tl(e, t) {
  for (let o = t = to(t, 0, e.length); o < e.length; o++) if (!e[o].disabled) return o;
  for (let o = t - 1; o >= 0; o--) if (!e[o].disabled) return o;
  return 0;
}
const zc = (e, t, o) => t !== void 0 && !!e.find((n) => n[o.value] === t);
function br(e, t, o) {
  const n = e.findIndex((a) => a[o.value] === t);
  return e[tl(e, n)];
}
const [M0, yr] = ge("picker-column"), L0 = Symbol(M0);
var j4 = z({ name: M0, props: { value: ue, fields: bo(Object), options: yo(), readonly: Boolean, allowHtml: Boolean, optionHeight: bo(Number), swipeDuration: bo(ue), visibleOptionNum: bo(ue) }, emits: ["change", "clickOption", "scrollInto"], setup(e, { emit: t, slots: o }) {
  let n, a, l, r, s;
  const c = A(), d = A(), u = A(0), p = A(0), v = ua(), h = () => e.options.length, g = () => e.optionHeight * (+e.visibleOptionNum - 1) / 2, f = (B) => {
    let m = tl(e.options, B);
    const x = -m * e.optionHeight, T = () => {
      m > h() - 1 && (m = tl(e.options, B));
      const V = e.options[m][e.fields.value];
      V !== e.value && t("change", V);
    };
    n && x !== u.value ? s = T : T(), u.value = x;
  }, b = () => e.readonly || !e.options.length, w = (B) => to(Math.round(-B / e.optionHeight), 0, h() - 1), y = E(() => w(u.value)), k = () => {
    n = !1, p.value = 0, s && (s(), s = null);
  }, C = (B) => {
    if (!b()) {
      if (v.start(B), n) {
        const m = function(x) {
          const { transform: T } = window.getComputedStyle(x), V = T.slice(7, T.length - 1).split(", ")[5];
          return Number(V);
        }(d.value);
        u.value = Math.min(0, m - g());
      }
      p.value = 0, a = u.value, l = Date.now(), r = a, s = null;
    }
  }, S = () => {
    if (b()) return;
    const B = u.value - r, m = Date.now() - l;
    if (m < 300 && Math.abs(B) > 15) return void ((T, V) => {
      const P = Math.abs(T / V);
      T = u.value + P / 3e-3 * (T < 0 ? -1 : 1);
      const N = w(T);
      p.value = +e.swipeDuration, f(N);
    })(B, m);
    const x = w(u.value);
    p.value = 200, f(x), setTimeout(() => {
      n = !1;
    }, 0);
  }, O = () => {
    const B = { height: `${e.optionHeight}px` };
    return e.options.map((m, x) => {
      const T = m[e.fields.text], { disabled: V } = m, P = m[e.fields.value], N = { role: "button", style: B, tabindex: V ? -1 : 0, class: [yr("item", { disabled: V, selected: P === e.value }), m.className], onClick: () => ((F) => {
        n || b() || (s = null, p.value = 200, f(F), t("clickOption", e.options[F]));
      })(x) }, j = { class: "van-ellipsis", [e.allowHtml ? "innerHTML" : "textContent"]: T };
      return i("li", N, [o.option ? o.option(m, x) : i("div", j, null)]);
    });
  };
  return Ho(L0), nt({ stopMomentum: k }), ao(() => {
    const B = n ? Math.floor(-u.value / e.optionHeight) : e.options.findIndex((T) => T[e.fields.value] === e.value), m = tl(e.options, B), x = -m * e.optionHeight;
    n && m < B && k(), u.value = x;
  }), Ft("touchmove", (B) => {
    if (b()) return;
    v.move(B), v.isVertical() && (n = !0, rt(B, !0));
    const m = to(a + v.deltaY.value, -h() * e.optionHeight, e.optionHeight), x = w(m);
    x !== y.value && t("scrollInto", e.options[x]), u.value = m;
    const T = Date.now();
    T - l > 300 && (l = T, r = m);
  }, { target: c }), () => i("div", { ref: c, class: yr(), onTouchstartPassive: C, onTouchend: S, onTouchcancel: S }, [i("ul", { ref: d, style: { transform: `translate3d(0, ${u.value + g()}px, 0)`, transitionDuration: `${p.value}ms`, transitionProperty: p.value ? "all" : "none" }, class: yr("wrapper"), onTransitionend: k }, [O()])]);
} });
const [z4] = ge("picker-toolbar"), Fl = { title: String, cancelButtonText: String, confirmButtonText: String }, F0 = ["cancel", "confirm", "title", "toolbar"], R4 = Object.keys(Fl);
var _0 = z({ name: z4, props: Fl, emits: ["confirm", "cancel"], setup(e, { emit: t, slots: o }) {
  const n = () => t("cancel"), a = () => t("confirm"), l = () => {
    var s;
    const c = (s = e.cancelButtonText) != null ? s : $c("cancel");
    if (o.cancel || c) return i("button", { type: "button", class: [Zt("cancel"), gn], onClick: n }, [o.cancel ? o.cancel() : c]);
  }, r = () => {
    var s;
    const c = (s = e.confirmButtonText) != null ? s : $c("confirm");
    if (o.confirm || c) return i("button", { type: "button", class: [Zt("confirm"), gn], onClick: a }, [o.confirm ? o.confirm() : c]);
  };
  return () => i("div", { class: Zt("toolbar") }, [o.toolbar ? o.toolbar() : [l(), o.title ? o.title() : e.title ? i("div", { class: [Zt("title"), "van-ellipsis"] }, [e.title]) : void 0, r()]]);
} });
const H0 = Array.isArray, ra = (e) => typeof e == "string", U0 = (e) => e !== null && typeof e == "object", N4 = /\B([A-Z])/g, M4 = /* @__PURE__ */ ((e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (o) => t[o] || (t[o] = e(o));
})((e) => e.replace(N4, "-$1").toLowerCase());
function q0(e) {
  if (H0(e)) {
    const t = {};
    for (let o = 0; o < e.length; o++) {
      const n = e[o], a = ra(n) ? H4(n) : q0(n);
      if (a) for (const l in a) t[l] = a[l];
    }
    return t;
  }
  if (ra(e) || U0(e)) return e;
}
const L4 = /;(?![^(]*\))/g, F4 = /:([^]+)/, _4 = /\/\*[^]*?\*\//g;
function H4(e) {
  const t = {};
  return e.replace(_4, "").split(L4).forEach((o) => {
    if (o) {
      const n = o.split(F4);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function W0(e) {
  let t = "";
  if (ra(e)) t = e;
  else if (H0(e)) for (let o = 0; o < e.length; o++) {
    const n = W0(e[o]);
    n && (t += n + " ");
  }
  else if (U0(e)) for (const o in e) e[o] && (t += o + " ");
  return t.trim();
}
let U4 = 0;
function Li() {
  const e = Xe(), { name: t = "unknown" } = (e == null ? void 0 : e.type) || {};
  return sa.NODE_ENV === "test" ? t : `${t}-${++U4}`;
}
function Fi() {
  const e = A([]), t = [];
  return bu(() => {
    e.value = [];
  }), [e, (o) => (t[o] || (t[o] = (n) => {
    e.value[o] = n;
  }), t[o])];
}
function Y0(e, t) {
  if (!Rl || !window.IntersectionObserver) return;
  const o = new IntersectionObserver((a) => {
    t(a[0].intersectionRatio > 0);
  }, { root: document.body }), n = () => {
    e.value && o.unobserve(e.value);
  };
  ot(n), yt(n), Ml(() => {
    e.value && o.observe(e.value);
  });
}
const [q4, W4] = ge("sticky");
var Y4 = z({ name: q4, props: { zIndex: ue, position: Re("top"), container: Object, offsetTop: xe(0), offsetBottom: xe(0) }, emits: ["scroll", "change"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = g0(n), l = ke({ fixed: !1, width: 0, height: 0, transform: 0 }), r = A(!1), s = E(() => Ni(e.position === "top" ? e.offsetTop : e.offsetBottom)), c = E(() => {
    if (r.value) return;
    const { fixed: p, height: v, width: h } = l;
    return p ? { width: `${h}px`, height: `${v}px` } : void 0;
  }), d = E(() => {
    if (!l.fixed || r.value) return;
    const p = Pe(x0(e.zIndex), { width: `${l.width}px`, height: `${l.height}px`, [e.position]: `${s.value}px` });
    return l.transform && (p.transform = `translate3d(0, ${l.transform}px, 0)`), p;
  }), u = () => {
    if (!n.value || la(n)) return;
    const { container: p, position: v } = e, h = Bt(n), g = Ii(window);
    if (l.width = h.width, l.height = h.height, v === "top") if (p) {
      const f = Bt(p), b = f.bottom - s.value - l.height;
      l.fixed = s.value > h.top && f.bottom > 0, l.transform = b < 0 ? b : 0;
    } else l.fixed = s.value > h.top;
    else {
      const { clientHeight: f } = document.documentElement;
      if (p) {
        const b = Bt(p), w = f - b.top - s.value - l.height;
        l.fixed = f - s.value < h.bottom && f > b.top, l.transform = w < 0 ? -w : 0;
      } else l.fixed = f - s.value < h.bottom;
    }
    ((f) => {
      t("scroll", { scrollTop: f, isFixed: l.fixed });
    })(g);
  };
  return U(() => l.fixed, (p) => t("change", p)), Ft("scroll", u, { target: a, passive: !0 }), Y0(n, u), U([Ll, zi], () => {
    !n.value || la(n) || !l.fixed || (r.value = !0, ne(() => {
      const p = Bt(n);
      l.width = p.width, l.height = p.height, r.value = !1;
    }));
  }), () => {
    var p;
    return i("div", { ref: n, style: c.value }, [i("div", { class: W4({ fixed: l.fixed && !r.value }), style: d.value }, [(p = o.default) == null ? void 0 : p.call(o)])]);
  };
} });
const X4 = Te(Y4), [X0, Ma] = ge("swipe"), G4 = { loop: me, width: ue, height: ue, vertical: Boolean, autoplay: xe(0), duration: xe(500), touchable: me, lazyRender: Boolean, initialSwipe: xe(0), indicatorColor: String, showIndicators: me, stopPropagation: me }, G0 = Symbol(X0);
var Z4 = z({ name: X0, props: G4, emits: ["change", "dragStart", "dragEnd"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(), l = ke({ rect: null, width: 0, height: 0, offset: 0, active: 0, swiping: !1 });
  let r = !1;
  const s = ua(), { children: c, linkChildren: d } = Uo(G0), u = E(() => c.length), p = E(() => l[e.vertical ? "height" : "width"]), v = E(() => e.vertical ? s.deltaY.value : s.deltaX.value), h = E(() => l.rect ? (e.vertical ? l.rect.height : l.rect.width) - p.value * u.value : 0), g = E(() => p.value ? Math.ceil(Math.abs(h.value) / p.value) : u.value), f = E(() => u.value * p.value), b = E(() => (l.active + u.value) % u.value), w = E(() => {
    const I = e.vertical ? "vertical" : "horizontal";
    return s.direction.value === I;
  }), y = E(() => {
    const I = { transitionDuration: `${l.swiping ? 0 : e.duration}ms`, transform: `translate${e.vertical ? "Y" : "X"}(${+l.offset.toFixed(2)}px)` };
    if (p.value) {
      const R = e.vertical ? "height" : "width", _ = e.vertical ? "width" : "height";
      I[R] = `${f.value}px`, I[_] = e[_] ? `${e[_]}px` : "";
    }
    return I;
  }), k = (I, R = 0) => {
    let _ = I * p.value;
    e.loop || (_ = Math.min(_, -h.value));
    let $ = R - _;
    return e.loop || ($ = to($, h.value, 0)), $;
  }, C = ({ pace: I = 0, offset: R = 0, emitChange: _ }) => {
    if (u.value <= 1) return;
    const { active: $ } = l, L = ((D) => {
      const { active: M } = l;
      return D ? e.loop ? to(M + D, -1, u.value) : to(M + D, 0, g.value) : M;
    })(I), K = k(L, R);
    if (e.loop) {
      if (c[0] && K !== h.value) {
        const D = K < h.value;
        c[0].setOffset(D ? f.value : 0);
      }
      if (c[u.value - 1] && K !== 0) {
        const D = K > 0;
        c[u.value - 1].setOffset(D ? -f.value : 0);
      }
    }
    l.active = L, l.offset = K, _ && L !== $ && t("change", b.value);
  }, S = () => {
    l.swiping = !0, l.active <= -1 ? C({ pace: u.value }) : l.active >= u.value && C({ pace: -u.value });
  }, O = () => {
    S(), s.reset(), Hn(() => {
      l.swiping = !1, C({ pace: 1, emitChange: !0 });
    });
  };
  let B;
  const m = () => clearTimeout(B), x = () => {
    m(), +e.autoplay > 0 && u.value > 1 && (B = setTimeout(() => {
      O(), x();
    }, +e.autoplay));
  }, T = (I = +e.initialSwipe) => {
    if (!n.value) return;
    const R = () => {
      var _, $;
      if (!la(n)) {
        const L = { width: n.value.offsetWidth, height: n.value.offsetHeight };
        l.rect = L, l.width = +((_ = e.width) != null ? _ : L.width), l.height = +(($ = e.height) != null ? $ : L.height);
      }
      u.value && (I = Math.min(u.value - 1, I)) === -1 && (I = u.value - 1), l.active = I, l.swiping = !0, l.offset = k(I), c.forEach((L) => {
        L.setOffset(0);
      }), x();
    };
    la(n) ? ne().then(R) : R();
  }, V = () => T(l.active);
  let P;
  const N = (I) => {
    !e.touchable || I.touches.length > 1 || (s.start(I), r = !1, P = Date.now(), m(), S());
  }, j = () => {
    if (!e.touchable || !l.swiping) return;
    const I = Date.now() - P, R = v.value / I;
    if ((Math.abs(R) > 0.25 || Math.abs(v.value) > p.value / 2) && w.value) {
      const _ = e.vertical ? s.offsetY.value : s.offsetX.value;
      let $ = 0;
      $ = e.loop ? _ > 0 ? v.value > 0 ? -1 : 1 : 0 : -Math[v.value > 0 ? "ceil" : "floor"](v.value / p.value), C({ pace: $, emitChange: !0 });
    } else v.value && C({ pace: 0 });
    r = !1, l.swiping = !1, t("dragEnd", { index: b.value }), x();
  }, F = (I, R) => {
    const _ = R === b.value, $ = _ ? { backgroundColor: e.indicatorColor } : void 0;
    return i("i", { style: $, class: Ma("indicator", { active: _ }) }, null);
  };
  return nt({ prev: () => {
    S(), s.reset(), Hn(() => {
      l.swiping = !1, C({ pace: -1, emitChange: !0 });
    });
  }, next: O, state: l, resize: V, swipeTo: (I, R = {}) => {
    S(), s.reset(), Hn(() => {
      let _;
      _ = e.loop && I === u.value ? l.active === 0 ? 0 : I : I % u.value, R.immediate ? Hn(() => {
        l.swiping = !1;
      }) : l.swiping = !1, C({ pace: _ - l.active, emitChange: !0 });
    });
  } }), d({ size: p, props: e, count: u, activeIndicator: b }), U(() => e.initialSwipe, (I) => T(+I)), U(u, () => T(l.active)), U(() => e.autoplay, x), U([Ll, zi, () => e.width, () => e.height], V), U(function() {
    if (!Ra && (Ra = A("visible"), On)) {
      const I = () => {
        Ra.value = document.hidden ? "hidden" : "visible";
      };
      I(), window.addEventListener("visibilitychange", I);
    }
    return Ra;
  }(), (I) => {
    I === "visible" ? x() : m();
  }), Ce(T), st(() => T(l.active)), A0(() => T(l.active)), ot(m), yt(m), Ft("touchmove", (I) => {
    e.touchable && l.swiping && (s.move(I), w.value && (!e.loop && (l.active === 0 && v.value > 0 || l.active === u.value - 1 && v.value < 0) || (rt(I, e.stopPropagation), C({ offset: v.value }), r || (t("dragStart", { index: b.value }), r = !0))));
  }, { target: a }), () => {
    var I;
    return i("div", { ref: n, class: Ma() }, [i("div", { ref: a, style: y.value, class: Ma("track", { vertical: e.vertical }), onTouchstartPassive: N, onTouchend: j, onTouchcancel: j }, [(I = o.default) == null ? void 0 : I.call(o)]), o.indicator ? o.indicator({ active: b.value, total: u.value }) : e.showIndicators && u.value > 1 ? i("div", { class: Ma("indicators", { vertical: e.vertical }) }, [Array(u.value).fill("").map(F)]) : void 0]);
  };
} });
const K4 = Te(Z4), [J4, Rc] = ge("tabs");
var Q4 = z({ name: J4, props: { count: bo(Number), inited: Boolean, animated: Boolean, duration: bo(ue), swipeable: Boolean, lazyRender: Boolean, currentIndex: bo(Number) }, emits: ["change"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = (s) => t("change", s), l = () => {
    var s;
    const c = (s = o.default) == null ? void 0 : s.call(o);
    return e.animated || e.swipeable ? i(K4, { ref: n, loop: !1, class: Rc("track"), duration: 1e3 * +e.duration, touchable: e.swipeable, lazyRender: e.lazyRender, showIndicators: !1, onChange: a }, { default: () => [c] }) : c;
  }, r = (s) => {
    const c = n.value;
    c && c.state.active !== s && c.swipeTo(s, { immediate: !e.inited });
  };
  return U(() => e.currentIndex, r), Ce(() => {
    r(e.currentIndex);
  }), nt({ swipeRef: n }), () => i("div", { class: Rc("content", { animated: e.animated || e.swipeable }) }, [l()]);
} });
const [Z0, La] = ge("tabs"), eb = { type: Re("line"), color: String, border: Boolean, sticky: Boolean, shrink: Boolean, active: xe(0), duration: xe(0.3), animated: Boolean, ellipsis: me, swipeable: Boolean, scrollspy: Boolean, offsetTop: xe(0), background: String, lazyRender: me, showHeader: me, lineWidth: ue, lineHeight: ue, beforeChange: Function, swipeThreshold: xe(5), titleActiveColor: String, titleInactiveColor: String }, K0 = Symbol(Z0);
var tb = z({ name: Z0, props: eb, emits: ["change", "scroll", "rendered", "clickTab", "update:active"], setup(e, { emit: t, slots: o }) {
  let n, a, l, r, s;
  const c = A(), d = A(), u = A(), p = A(), v = Li(), h = g0(c), [g, f] = Fi(), { children: b, linkChildren: w } = Uo(K0), y = ke({ inited: !1, position: "", lineStyle: {}, currentIndex: -1 }), k = E(() => b.length > +e.swipeThreshold || !e.ellipsis || e.shrink), C = E(() => ({ borderColor: e.color, background: e.background })), S = ($, L) => {
    var K;
    return (K = $.name) != null ? K : L;
  }, O = E(() => {
    const $ = b[y.currentIndex];
    if ($) return S($, y.currentIndex);
  }), B = E(() => Ni(e.offsetTop)), m = E(() => e.sticky ? B.value + n : 0), x = ($) => {
    const L = d.value, K = g.value;
    if (!(k.value && L && K && K[y.currentIndex])) return;
    const D = K[y.currentIndex].$el, M = D.offsetLeft - (L.offsetWidth - D.offsetWidth) / 2;
    r && r(), r = function(q, X, ee) {
      let oe, se = 0;
      const le = q.scrollLeft, ve = ee === 0 ? 1 : Math.round(1e3 * ee / 16);
      let ye = le;
      return function Ye() {
        ye += (X - le) / ve, q.scrollLeft = ye, ++se < ve && (oe = yl(Ye));
      }(), function() {
        kc(oe);
      };
    }(L, M, $ ? 0 : +e.duration);
  }, T = () => {
    const $ = y.inited;
    ne(() => {
      const L = g.value;
      if (!L || !L[y.currentIndex] || e.type !== "line" || la(c.value)) return;
      const K = L[y.currentIndex].$el, { lineWidth: D, lineHeight: M } = e, q = K.offsetLeft + K.offsetWidth / 2, X = { width: Ee(D), backgroundColor: e.color, transform: `translateX(${q}px) translateX(-50%)` };
      if ($ && (X.transitionDuration = `${e.duration}s`), ze(M)) {
        const ee = Ee(M);
        X.height = ee, X.borderRadius = ee;
      }
      y.lineStyle = X;
    });
  }, V = ($, L) => {
    const K = ((X) => {
      const ee = X < y.currentIndex ? -1 : 1;
      for (; X >= 0 && X < b.length; ) {
        if (!b[X].disabled) return X;
        X += ee;
      }
    })($);
    if (!ze(K)) return;
    const D = b[K], M = S(D, K), q = y.currentIndex !== null;
    y.currentIndex !== K && (y.currentIndex = K, L || x(), T()), M !== e.active && (t("update:active", M), q && t("change", M, D.title)), l && !e.scrollspy && ji(Math.ceil(Oc(c.value) - B.value));
  }, P = ($, L) => {
    const K = b.find((M, q) => S(M, q) === $), D = K ? b.indexOf(K) : 0;
    V(D, L);
  }, N = ($ = !1) => {
    if (e.scrollspy) {
      const L = b[y.currentIndex].$el;
      if (L && h.value) {
        const K = Oc(L, h.value) - m.value;
        a = !0, s && s(), s = function(D, M, q, X) {
          let ee, oe = Ii(D);
          const se = oe < M, le = q === 0 ? 1 : Math.round(1e3 * q / 16), ve = (M - oe) / le;
          return function ye() {
            oe += ve, (se && oe > M || !se && oe < M) && (oe = M), Kr(D, oe), ee = yl(se && oe < M || !se && oe > M ? ye : X);
          }(), function() {
            kc(ee);
          };
        }(h.value, K, $ ? 0 : +e.duration, () => {
          a = !1;
        });
      }
    }
  }, j = ($, L, K) => {
    const { title: D, disabled: M } = b[L], q = S(b[L], L);
    M || (Mi(e.beforeChange, { args: [q], done: () => {
      V(L), N();
    } }), P0($)), t("clickTab", { name: q, title: D, event: K, disabled: M });
  }, F = ($) => {
    l = $.isFixed, t("scroll", $);
  }, I = () => {
    if (e.type === "line" && b.length) return i("div", { class: La("line"), style: y.lineStyle }, null);
  }, R = () => {
    var $, L, K;
    const { type: D, border: M, sticky: q } = e, X = [i("div", { ref: q ? void 0 : u, class: [La("wrap"), { [B0]: D === "line" && M }] }, [i("div", { ref: d, role: "tablist", class: La("nav", [D, { shrink: e.shrink, complete: k.value }]), style: C.value, "aria-orientation": "horizontal" }, [($ = o["nav-left"]) == null ? void 0 : $.call(o), b.map((ee) => ee.renderTitle(j)), I(), (L = o["nav-right"]) == null ? void 0 : L.call(o)])]), (K = o["nav-bottom"]) == null ? void 0 : K.call(o)];
    return q ? i("div", { ref: u }, [X]) : X;
  }, _ = () => {
    T(), ne(() => {
      var $, L;
      x(!0), (L = ($ = p.value) == null ? void 0 : $.swipeRef.value) == null || L.resize();
    });
  };
  return U(() => [e.color, e.duration, e.lineWidth, e.lineHeight], T), U(Ll, _), U(() => e.active, ($) => {
    $ !== O.value && P($);
  }), U(() => b.length, () => {
    y.inited && (P(e.active), T(), ne(() => {
      x(!0);
    }));
  }), nt({ resize: _, scrollTo: ($) => {
    ne(() => {
      P($), N(!0);
    });
  } }), st(T), A0(T), Ml(() => {
    P(e.active, !0), ne(() => {
      y.inited = !0, u.value && (n = Bt(u.value).height), x(!0);
    });
  }), Y0(c, T), Ft("scroll", () => {
    if (e.scrollspy && !a) {
      const $ = (() => {
        for (let L = 0; L < b.length; L++) {
          const { top: K } = Bt(b[L].$el);
          if (K > m.value) return L === 0 ? 0 : L - 1;
        }
        return b.length - 1;
      })();
      V($);
    }
  }, { target: h, passive: !0 }), w({ id: v, props: e, setLine: T, scrollable: k, onRendered: ($, L) => t("rendered", $, L), currentName: O, setTitleRefs: f, scrollIntoView: x }), () => i("div", { ref: c, class: La([e.type]) }, [e.showHeader ? e.sticky ? i(X4, { container: c.value, offsetTop: B.value, onScroll: F }, { default: () => [R()] }) : R() : null, i(Q4, { ref: p, count: b.length, inited: y.inited, animated: e.animated, duration: e.duration, swipeable: e.swipeable, lazyRender: e.lazyRender, currentIndex: y.currentIndex, onChange: V }, { default: () => {
    var $;
    return [($ = o.default) == null ? void 0 : $.call(o)];
  } })]);
} });
const ob = Symbol(), [nb, Nc] = ge("tab"), ab = z({ name: nb, props: { id: String, dot: Boolean, type: String, color: String, title: String, badge: ue, shrink: Boolean, isActive: Boolean, disabled: Boolean, controls: String, scrollable: Boolean, activeColor: String, inactiveColor: String, showZeroBadge: me }, setup(e, { slots: t }) {
  const o = E(() => {
    const a = {}, { type: l, color: r, disabled: s, isActive: c, activeColor: d, inactiveColor: u } = e;
    r && l === "card" && (a.borderColor = r, s || (c ? a.backgroundColor = r : a.color = r));
    const p = c ? d : u;
    return p && (a.color = p), a;
  }), n = () => {
    const a = i("span", { class: Nc("text", { ellipsis: !e.scrollable }) }, [t.title ? t.title() : e.title]);
    return e.dot || ze(e.badge) && e.badge !== "" ? i(I0, { dot: e.dot, content: e.badge, showZero: e.showZeroBadge }, { default: () => [a] }) : a;
  };
  return () => i("div", { id: e.id, role: "tab", class: [Nc([e.type, { grow: e.scrollable && !e.shrink, shrink: e.shrink, active: e.isActive, disabled: e.disabled }])], style: o.value, tabindex: e.disabled ? void 0 : e.isActive ? 0 : -1, "aria-selected": e.isActive, "aria-disabled": e.disabled || void 0, "aria-controls": e.controls, "data-allow-mismatch": "attribute" }, [n()]);
} }), [lb, rb] = ge("swipe-item");
var ib = z({ name: lb, setup(e, { slots: t }) {
  let o;
  const n = ke({ offset: 0, inited: !1, mounted: !1 }), { parent: a, index: l } = Ho(G0);
  if (!a) return void (sa.NODE_ENV !== "production" && console.error("[Vant] <SwipeItem> must be a child component of <Swipe>."));
  const r = E(() => {
    const c = {}, { vertical: d } = a.props;
    return a.size.value && (c[d ? "height" : "width"] = `${a.size.value}px`), n.offset && (c.transform = `translate${d ? "Y" : "X"}(${n.offset}px)`), c;
  }), s = E(() => {
    const { loop: c, lazyRender: d } = a.props;
    if (!d || o) return !0;
    if (!n.mounted) return !1;
    const u = a.activeIndicator.value, p = a.count.value - 1, v = u === 0 && c ? p : u - 1, h = u === p && c ? 0 : u + 1;
    return o = l.value === u || l.value === v || l.value === h, o;
  });
  return Ce(() => {
    ne(() => {
      n.mounted = !0;
    });
  }), nt({ setOffset: (c) => {
    n.offset = c;
  } }), () => {
    var c;
    return i("div", { class: rb(), style: r.value }, [s.value ? (c = t.default) == null ? void 0 : c.call(t) : null]);
  };
} });
const sb = Te(ib), [cb, wr] = ge("tab");
var ub = z({ name: cb, props: Pe({}, E0, { dot: Boolean, name: ue, badge: ue, title: String, disabled: Boolean, titleClass: ut, titleStyle: [String, Object], showZeroBadge: me }), setup(e, { slots: t }) {
  const o = Li(), n = A(!1), a = Xe(), { parent: l, index: r } = Ho(K0);
  if (!l) return void (sa.NODE_ENV !== "production" && console.error("[Vant] <Tab> must be a child component of <Tabs>."));
  const s = () => {
    var v;
    return (v = e.name) != null ? v : r.value;
  }, c = E(() => {
    const v = s() === l.currentName.value;
    return v && !n.value && (n.value = !0, l.props.lazyRender && ne(() => {
      l.onRendered(s(), e.title);
    })), v;
  }), d = A(""), u = A("");
  ao(() => {
    const { titleClass: v, titleStyle: h } = e;
    d.value = v ? W0(v) : "", u.value = h && typeof h != "string" ? function(g) {
      if (!g) return "";
      if (ra(g)) return g;
      let f = "";
      for (const b in g) {
        const w = g[b];
        (ra(w) || typeof w == "number") && (f += `${b.startsWith("--") ? b : M4(b)}:${w};`);
      }
      return f;
    }(q0(h)) : h;
  });
  const p = A(!c.value);
  return U(c, (v) => {
    v ? p.value = !1 : Hn(() => {
      p.value = !0;
    });
  }), U(() => e.title, () => {
    l.setLine(), l.scrollIntoView();
  }), At(ob, c), nt({ id: o, renderTitle: (v) => i(ab, Q({ key: o, id: `${l.id}-${r.value}`, ref: l.setTitleRefs(r.value), style: u.value, class: d.value, isActive: c.value, controls: o, scrollable: l.scrollable.value, activeColor: l.props.titleActiveColor, inactiveColor: l.props.titleInactiveColor, onClick: (h) => v(a.proxy, r.value, h) }, gt(l.props, ["type", "color", "shrink"]), gt(e, ["dot", "badge", "title", "disabled", "showZeroBadge"])), { title: t.title }) }), () => {
    var v;
    const h = `${l.id}-${r.value}`, { animated: g, swipeable: f, scrollspy: b, lazyRender: w } = l.props;
    if (!t.default && !g) return;
    const y = b || c.value;
    if (g || f) return i(sb, { id: o, role: "tabpanel", class: wr("panel-wrapper", { inactive: p.value }), tabindex: c.value ? 0 : -1, "aria-hidden": !c.value, "aria-labelledby": h, "data-allow-mismatch": "attribute" }, { default: () => {
      var C;
      return [i("div", { class: wr("panel") }, [(C = t.default) == null ? void 0 : C.call(t)])];
    } });
    const k = n.value || b || !w ? (v = t.default) == null ? void 0 : v.call(t) : null;
    return De(i("div", { id: o, role: "tabpanel", class: wr("panel"), tabindex: y ? 0 : -1, "aria-labelledby": h, "data-allow-mismatch": "attribute" }, [k]), [[Ie, y]]);
  };
} });
const J0 = Te(ub), Q0 = Te(tb), [e1, xr] = ge("picker-group"), t1 = Symbol(e1);
var db = z({ name: e1, props: Pe({ tabs: yo(), activeTab: xe(0), nextStepText: String, showToolbar: me }, Fl), emits: ["confirm", "cancel", "update:activeTab"], setup(e, { emit: t, slots: o }) {
  const n = ((d, u) => {
    const p = A(d());
    return U(d, (v) => {
      v !== p.value && (p.value = v);
    }), U(p, (v) => {
      v !== d() && u(v);
    }), p;
  })(() => e.activeTab, (d) => t("update:activeTab", d)), { children: a, linkChildren: l } = Uo(t1);
  l();
  const r = () => +n.value < e.tabs.length - 1 && e.nextStepText, s = () => {
    r() ? n.value = +n.value + 1 : t("confirm", a.map((d) => d.confirm()));
  }, c = () => t("cancel");
  return () => {
    var d, u;
    let p = (u = (d = o.default) == null ? void 0 : d.call(o)) == null ? void 0 : u.filter((h) => h.type !== li).map((h) => h.type === be ? h.children : h);
    p && (p = ((h) => h.reduce((g, f) => g.concat(f), []))(p));
    const v = r() ? e.nextStepText : e.confirmButtonText;
    return i("div", { class: xr() }, [e.showToolbar ? i(_0, { title: e.title, cancelButtonText: e.cancelButtonText, confirmButtonText: v, onConfirm: s, onCancel: c }, gt(o, F0)) : null, i(Q0, { active: n.value, "onUpdate:active": (h) => n.value = h, class: xr("tabs"), shrink: !0, animated: !0, lazyRender: !1 }, { default: () => [e.tabs.map((h, g) => i(J0, { title: h, titleClass: xr("tab-title") }, { default: () => [p == null ? void 0 : p[g]] }))] })]);
  };
} });
const _l = Pe({ loading: Boolean, readonly: Boolean, allowHtml: Boolean, optionHeight: xe(44), showToolbar: me, swipeDuration: xe(1e3), visibleOptionNum: xe(6) }, Fl);
var pb = z({ name: $4, props: Pe({}, _l, { columns: yo(), modelValue: yo(), toolbarPosition: Re("top"), columnsFieldNames: Object }), emits: ["confirm", "cancel", "change", "scrollInto", "clickOption", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = A(e.modelValue.slice(0)), { parent: l } = Ho(t1), { children: r, linkChildren: s } = Uo(L0);
  s();
  const c = E(() => function(m) {
    return Pe({ text: "text", value: "value", children: "children" }, m);
  }(e.columnsFieldNames)), d = E(() => Ni(e.optionHeight)), u = E(() => function(m, x) {
    const T = m[0];
    if (T) {
      if (Array.isArray(T)) return "multiple";
      if (x.children in T) return "cascade";
    }
    return "default";
  }(e.columns, c.value)), p = E(() => {
    const { columns: m } = e;
    switch (u.value) {
      case "multiple":
        return m;
      case "cascade":
        return function(x, T, V) {
          const P = [];
          let N = { [T.children]: x }, j = 0;
          for (; N && N[T.children]; ) {
            const F = N[T.children], I = V.value[j];
            N = ze(I) ? br(F, I, T) : void 0, !N && F.length && (N = br(F, jc(F)[T.value], T)), j++, P.push(F);
          }
          return P;
        }(m, c.value, a);
      default:
        return [m];
    }
  }), v = E(() => p.value.some((m) => m.length)), h = E(() => p.value.map((m, x) => br(m, a.value[x], c.value))), g = E(() => p.value.map((m, x) => m.findIndex((T) => T[c.value.value] === a.value[x]))), f = (m, x) => {
    if (a.value[m] !== x) {
      const T = a.value.slice(0);
      T[m] = x, a.value = T;
    }
  }, b = () => ({ selectedValues: a.value.slice(0), selectedOptions: h.value, selectedIndexes: g.value }), w = () => {
    r.forEach((x) => x.stopMomentum());
    const m = b();
    return ne(() => {
      t("confirm", m);
    }), m;
  }, y = () => t("cancel", b()), k = () => p.value.map((m, x) => i(j4, { value: a.value[x], fields: c.value, options: m, readonly: e.readonly, allowHtml: e.allowHtml, optionHeight: d.value, swipeDuration: e.swipeDuration, visibleOptionNum: e.visibleOptionNum, onChange: (T) => ((V, P) => {
    f(P, V), u.value === "cascade" && a.value.forEach((N, j) => {
      const F = p.value[j];
      zc(F, N, c.value) || f(j, F.length ? F[0][c.value.value] : void 0);
    }), ne(() => {
      t("change", Pe({ columnIndex: P }, b()));
    });
  })(T, x), onClickOption: (T) => ((V, P) => {
    const N = { columnIndex: P, currentOption: V };
    t("clickOption", Pe(b(), N)), t("scrollInto", N);
  })(T, x), onScrollInto: (T) => {
    t("scrollInto", { currentOption: T, columnIndex: x });
  } }, { option: o.option })), C = (m) => {
    if (v.value) {
      const x = { height: `${d.value}px` }, T = { backgroundSize: `100% ${(m - d.value) / 2}px` };
      return [i("div", { class: Zt("mask"), style: T }, null), i("div", { class: [m4, Zt("frame")], style: x }, null)];
    }
  }, S = () => {
    const m = d.value * +e.visibleOptionNum, x = { height: `${m}px` };
    return e.loading || v.value || !o.empty ? i("div", { ref: n, class: Zt("columns"), style: x }, [k(), C(m)]) : o.empty();
  }, O = () => {
    if (e.showToolbar && !l) return i(_0, Q(gt(e, R4), { onConfirm: w, onCancel: y }), gt(o, F0));
  };
  let B;
  return U(p, (m) => {
    m.forEach((x, T) => {
      x.length && !zc(x, a.value[T], c.value) && f(T, jc(x)[c.value.value]);
    });
  }, { immediate: !0 }), U(() => e.modelValue, (m) => {
    !Nt(m, a.value) && !Nt(m, B) && (a.value = m.slice(0), B = m.slice(0));
  }, { deep: !0 }), U(a, (m) => {
    Nt(m, e.modelValue) || (B = m.slice(0), t("update:modelValue", B));
  }, { immediate: !0 }), Ft("touchmove", rt, { target: n }), nt({ confirm: w, getSelectedOptions: () => h.value }), () => {
    var m, x;
    return i("div", { class: Zt() }, [e.toolbarPosition === "top" ? O() : null, e.loading ? i(R0, { class: Zt("loading") }, null) : null, (m = o["columns-top"]) == null ? void 0 : m.call(o), S(), (x = o["columns-bottom"]) == null ? void 0 : x.call(o), e.toolbarPosition === "bottom" ? O() : null]);
  };
} });
const ol = "000000", vb = ["title", "cancel", "confirm", "toolbar", "columns-top", "columns-bottom"], Mc = ["title", "loading", "readonly", "optionHeight", "swipeDuration", "visibleOptionNum", "cancelButtonText", "confirmButtonText"], mo = (e = "", t = ol, o = void 0) => ({ text: e, value: t, children: o });
function fb({ areaList: e, columnsNum: t, columnsPlaceholder: o }) {
  const { city_list: n = {}, county_list: a = {}, province_list: l = {} } = e, r = +t > 1, s = +t > 2, c = /* @__PURE__ */ new Map();
  Object.keys(l).forEach((p) => {
    c.set(p.slice(0, 2), mo(l[p], p, (() => {
      if (r) return o.length > 1 ? [mo(o[1], ol, s ? [] : void 0)] : [];
    })()));
  });
  const d = /* @__PURE__ */ new Map();
  if (r) {
    const p = () => {
      if (s) return o.length > 2 ? [mo(o[2])] : [];
    };
    Object.keys(n).forEach((v) => {
      const h = mo(n[v], v, p());
      d.set(v.slice(0, 4), h);
      const g = c.get(v.slice(0, 2));
      g && g.children.push(h);
    });
  }
  s && Object.keys(a).forEach((p) => {
    const v = d.get(p.slice(0, 4));
    v && v.children.push(mo(a[p], p));
  });
  const u = Array.from(c.values());
  if (o.length) {
    const p = s ? [mo(o[2])] : void 0, v = r ? [mo(o[1], ol, p)] : void 0;
    u.unshift(mo(o[0], ol, v));
  }
  return u;
}
const da = Te(pb), [mb, hb] = ge("area");
var gb = z({ name: mb, props: Pe({}, gt(_l, Mc), { modelValue: String, columnsNum: xe(3), columnsPlaceholder: yo(), areaList: { type: Object, default: () => ({}) } }), emits: ["change", "confirm", "cancel", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A([]), a = A(), l = E(() => fb(e)), r = (...d) => t("change", ...d), s = (...d) => t("cancel", ...d), c = (...d) => t("confirm", ...d);
  return U(n, (d) => {
    const u = d.length ? d[d.length - 1] : "";
    u && u !== e.modelValue && t("update:modelValue", u);
  }, { deep: !0 }), U(() => e.modelValue, (d) => {
    d ? d !== (n.value.length ? n.value[n.value.length - 1] : "") && (n.value = [`${d.slice(0, 2)}0000`, `${d.slice(0, 4)}00`, d].slice(0, +e.columnsNum)) : n.value = [];
  }, { immediate: !0 }), nt({ confirm: () => {
    var d;
    return (d = a.value) == null ? void 0 : d.confirm();
  }, getSelectedOptions: () => {
    var d;
    return ((d = a.value) == null ? void 0 : d.getSelectedOptions()) || [];
  } }), () => i(da, Q({ ref: a, modelValue: n.value, "onUpdate:modelValue": (d) => n.value = d, class: hb(), columns: l.value, onChange: r, onCancel: s, onConfirm: c }, gt(e, Mc)), gt(o, vb));
} });
const bb = Te(gb), [yb, an] = ge("cell"), o1 = { tag: Re("div"), icon: String, size: String, title: ue, value: ue, label: ue, center: Boolean, isLink: Boolean, border: me, iconPrefix: String, valueClass: ut, labelClass: ut, titleClass: ut, titleStyle: null, arrowDirection: String, required: { type: [Boolean, String], default: null }, clickable: { type: Boolean, default: null } };
var wb = z({ name: yb, props: Pe({}, o1, E0), setup(e, { slots: t }) {
  const o = function() {
    const s = Xe().proxy;
    return () => P0(s);
  }(), n = () => {
    if (t.label || ze(e.label)) return i("div", { class: [an("label"), e.labelClass] }, [t.label ? t.label() : e.label]);
  }, a = () => {
    var s;
    if (t.title || ze(e.title)) {
      const c = (s = t.title) == null ? void 0 : s.call(t);
      return Array.isArray(c) && c.length === 0 ? void 0 : i("div", { class: [an("title"), e.titleClass], style: e.titleStyle }, [c || i("span", null, [e.title]), n()]);
    }
  }, l = () => {
    const s = t.value || t.default;
    if (s || ze(e.value)) return i("div", { class: [an("value"), e.valueClass] }, [s ? s() : i("span", null, [e.value])]);
  }, r = () => {
    if (t["right-icon"]) return t["right-icon"]();
    if (e.isLink) {
      const s = e.arrowDirection && e.arrowDirection !== "right" ? `arrow-${e.arrowDirection}` : "arrow";
      return i(Dt, { name: s, class: an("right-icon") }, null);
    }
  };
  return () => {
    var s;
    const { tag: c, size: d, center: u, border: p, isLink: v, required: h } = e, g = (s = e.clickable) != null ? s : v, f = { center: u, required: !!h, clickable: g, borderless: !p };
    return d && (f[d] = !!d), i(c, { class: an(f), role: g ? "button" : void 0, tabindex: g ? 0 : void 0, onClick: o }, { default: () => {
      var b;
      return [t.icon ? t.icon() : e.icon ? i(Dt, { name: e.icon, class: an("left-icon"), classPrefix: e.iconPrefix }, null) : void 0, a(), l(), r(), (b = t.extra) == null ? void 0 : b.call(t)];
    } });
  };
} });
const xb = Te(wb), [Sb, kb] = ge("form"), n1 = { colon: Boolean, disabled: Boolean, readonly: Boolean, required: [Boolean, String], showError: Boolean, labelWidth: ue, labelAlign: String, inputAlign: String, scrollToError: Boolean, scrollToErrorPosition: String, validateFirst: Boolean, submitOnEnter: me, showErrorMessage: me, errorMessageAlign: String, validateTrigger: { type: [String, Array], default: "onBlur" } };
var Cb = z({ name: Sb, props: n1, emits: ["submit", "failed"], setup(e, { emit: t, slots: o }) {
  const { children: n, linkChildren: a } = Uo(V0), l = (p) => p ? n.filter((v) => p.includes(v.name)) : n, r = (p) => typeof p == "string" ? ((v) => {
    const h = n.find((g) => g.name === v);
    return h ? new Promise((g, f) => {
      h.validate().then((b) => {
        b ? f(b) : g();
      });
    }) : Promise.reject();
  })(p) : e.validateFirst ? ((v) => new Promise((h, g) => {
    const f = [];
    l(v).reduce((b, w) => b.then(() => {
      if (!f.length) return w.validate().then((y) => {
        y && f.push(y);
      });
    }), Promise.resolve()).then(() => {
      f.length ? g(f) : h();
    });
  }))(p) : ((v) => new Promise((h, g) => {
    const f = l(v);
    Promise.all(f.map((b) => b.validate())).then((b) => {
      (b = b.filter(Boolean)).length ? g(b) : h();
    });
  }))(p), s = (p, v) => {
    n.some((h) => h.name === p && (h.$el.scrollIntoView(v), !0));
  }, c = () => n.reduce((p, v) => (v.name !== void 0 && (p[v.name] = v.formValue.value), p), {}), d = () => {
    const p = c();
    r().then(() => t("submit", p)).catch((v) => {
      t("failed", { values: p, errors: v });
      const { scrollToError: h, scrollToErrorPosition: g } = e;
      h && v[0].name && s(v[0].name, g ? { block: g } : void 0);
    });
  }, u = (p) => {
    rt(p), d();
  };
  return a({ props: e }), nt({ submit: d, validate: r, getValues: c, scrollToField: s, resetValidation: (p) => {
    typeof p == "string" && (p = [p]), l(p).forEach((v) => {
      v.resetValidation();
    });
  }, getValidationStatus: () => n.reduce((p, v) => (p[v.name] = v.getValidationStatus(), p), {}) }), () => {
    var p;
    return i("form", { class: kb(), onSubmit: u }, [(p = o.default) == null ? void 0 : p.call(o)]);
  };
} });
const Tb = Te(Cb);
function Lc(e) {
  return Array.isArray(e) ? !e.length : e !== 0 && !e;
}
function Fc(e, t) {
  const { message: o } = t;
  return bl(o) ? o(e, t) : o || "";
}
function Ob({ target: e }) {
  e.composing = !0;
}
function _c({ target: e }) {
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
function Wt(e) {
  return [...e].length;
}
function Sr(e, t) {
  return [...e].slice(0, t).join("");
}
const [Bb, ft] = ge("field"), Vb = { id: String, name: String, leftIcon: String, rightIcon: String, autofocus: Boolean, clearable: Boolean, maxlength: ue, max: Number, min: Number, formatter: Function, clearIcon: Re("clear"), modelValue: xe(""), inputAlign: String, placeholder: String, autocomplete: String, autocapitalize: String, autocorrect: String, errorMessage: String, enterkeyhint: String, clearTrigger: Re("focus"), formatTrigger: Re("onChange"), spellcheck: { type: Boolean, default: null }, error: { type: Boolean, default: null }, disabled: { type: Boolean, default: null }, readonly: { type: Boolean, default: null }, inputmode: String };
var Db = z({ name: Bb, props: Pe({}, o1, Vb, { rows: ue, type: Re("text"), rules: Array, autosize: [Boolean, Object], labelWidth: ue, labelClass: ut, labelAlign: String, showWordLimit: Boolean, errorMessageAlign: String, colon: { type: Boolean, default: null } }), emits: ["blur", "focus", "clear", "keypress", "clickInput", "endValidate", "startValidate", "clickLeftIcon", "clickRightIcon", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = Li(), a = ke({ status: "unvalidated", focused: !1, validateMessage: "" }), l = A(), r = A(), s = A(), { parent: c } = Ho(V0), d = () => {
    var D;
    return String((D = e.modelValue) != null ? D : "");
  }, u = (D) => ze(e[D]) ? e[D] : c && ze(c.props[D]) ? c.props[D] : void 0, p = E(() => {
    const D = u("readonly");
    if (e.clearable && !D) {
      const M = d() !== "", q = e.clearTrigger === "always" || e.clearTrigger === "focus" && a.focused;
      return M && q;
    }
    return !1;
  }), v = E(() => s.value && o.input ? s.value() : e.modelValue), h = E(() => {
    var D;
    const M = u("required");
    return M === "auto" ? (D = e.rules) == null ? void 0 : D.some((q) => q.required) : M;
  }), g = (D) => D.reduce((M, q) => M.then(() => {
    if (a.status === "failed") return;
    let { value: X } = v;
    return q.formatter && (X = q.formatter(X, q)), function(ee, oe) {
      if (Lc(ee)) {
        if (oe.required) return !1;
        if (oe.validateEmpty === !1) return !0;
      }
      return !(oe.pattern && !oe.pattern.test(String(ee)));
    }(X, q) ? q.validator ? Lc(X) && q.validateEmpty === !1 ? void 0 : function(ee, oe) {
      return new Promise((se) => {
        const le = oe.validator(ee, oe);
        v0(le) ? le.then(se) : se(le);
      });
    }(X, q).then((ee) => {
      ee && typeof ee == "string" ? (a.status = "failed", a.validateMessage = ee) : ee === !1 && (a.status = "failed", a.validateMessage = Fc(X, q));
    }) : void 0 : (a.status = "failed", void (a.validateMessage = Fc(X, q)));
  }), Promise.resolve()), f = () => {
    a.status = "unvalidated", a.validateMessage = "";
  }, b = () => t("endValidate", { status: a.status, message: a.validateMessage }), w = (D = e.rules) => new Promise((M) => {
    f(), D ? (t("startValidate"), g(D).then(() => {
      a.status === "failed" ? (M({ name: e.name, message: a.validateMessage }), b()) : (a.status = "passed", M(), b());
    })) : M();
  }), y = (D) => {
    if (c && e.rules) {
      const { validateTrigger: M } = c.props, q = Sc(M).includes(D), X = e.rules.filter((ee) => ee.trigger ? Sc(ee.trigger).includes(D) : q);
      X.length && w(X);
    }
  }, k = (D, M = "onChange") => {
    var q, X;
    const ee = D;
    D = ((le) => {
      var ve;
      const { maxlength: ye } = e;
      if (ze(ye) && Wt(le) > +ye) {
        const Ye = d();
        if (Ye && Wt(Ye) === +ye) return Ye;
        const Bn = (ve = l.value) == null ? void 0 : ve.selectionEnd;
        if (a.focused && Bn) {
          const To = [...le], Vn = To.length - +ye;
          return To.splice(Bn - Vn, Vn), To.join("");
        }
        return Sr(le, +ye);
      }
      return le;
    })(D);
    const oe = Wt(ee) - Wt(D);
    if (e.type === "number" || e.type === "digit") {
      const le = e.type === "number";
      D = Jr(D, le, le), M === "onBlur" && D !== "" && (e.min !== void 0 || e.max !== void 0) && (D = to(+D, (q = e.min) != null ? q : -1 / 0, (X = e.max) != null ? X : 1 / 0).toString());
    }
    let se = 0;
    if (e.formatter && M === e.formatTrigger) {
      const { formatter: le, maxlength: ve } = e;
      if (D = le(D), ze(ve) && Wt(D) > +ve && (D = Sr(D, +ve)), l.value && a.focused) {
        const { selectionEnd: ye } = l.value, Ye = Sr(ee, ye);
        se = Wt(le(Ye)) - Wt(Ye);
      }
    }
    if (l.value && l.value.value !== D) if (a.focused) {
      let { selectionStart: le, selectionEnd: ve } = l.value;
      if (l.value.value = D, ze(le) && ze(ve)) {
        const ye = Wt(D);
        oe ? (le -= oe, ve -= oe) : se && (le += se, ve += se), l.value.setSelectionRange(Math.min(le, ye), Math.min(ve, ye));
      }
    } else l.value.value = D;
    D !== e.modelValue && t("update:modelValue", D);
  }, C = (D) => {
    D.target.composing || k(D.target.value);
  }, S = () => {
    var D;
    return (D = l.value) == null ? void 0 : D.blur();
  }, O = () => {
    var D;
    return (D = l.value) == null ? void 0 : D.focus();
  }, B = () => {
    const D = l.value;
    e.type === "textarea" && e.autosize && D && function(M, q) {
      const X = $i();
      M.style.height = "auto";
      let ee = M.scrollHeight;
      if (Nl(q)) {
        const { maxHeight: oe, minHeight: se } = q;
        oe !== void 0 && (ee = Math.min(ee, oe)), se !== void 0 && (ee = Math.max(ee, se));
      }
      ee && (M.style.height = `${ee}px`, ji(X));
    }(D, e.autosize);
  }, m = (D) => {
    a.focused = !0, t("focus", D), ne(B), u("readonly") && S();
  }, x = (D) => {
    a.focused = !1, k(d(), "onBlur"), t("blur", D), !u("readonly") && (y("onBlur"), ne(B), y0());
  }, T = (D) => t("clickInput", D), V = (D) => t("clickLeftIcon", D), P = (D) => t("clickRightIcon", D), N = E(() => typeof e.error == "boolean" ? e.error : !(!c || !c.props.showError || a.status !== "failed") || void 0), j = E(() => {
    const D = u("labelWidth"), M = u("labelAlign");
    if (D && M !== "top") return { width: Ee(D) };
  }), F = (D) => {
    D.keyCode === 13 && (!(c && c.props.submitOnEnter) && e.type !== "textarea" && rt(D), e.type === "search" && S()), t("keypress", D);
  }, I = () => e.id || `${n}-input`, R = () => {
    const D = ft("control", [u("inputAlign"), { error: N.value, custom: !!o.input, "min-height": e.type === "textarea" && !e.autosize }]);
    if (o.input) return i("div", { class: D, onClick: T }, [o.input()]);
    const M = { id: I(), ref: l, name: e.name, rows: e.rows !== void 0 ? +e.rows : void 0, class: D, disabled: u("disabled"), readonly: u("readonly"), autofocus: e.autofocus, placeholder: e.placeholder, autocomplete: e.autocomplete, autocapitalize: e.autocapitalize, autocorrect: e.autocorrect, enterkeyhint: e.enterkeyhint, spellcheck: e.spellcheck, "aria-labelledby": e.label ? `${n}-label` : void 0, "data-allow-mismatch": "attribute", onBlur: x, onFocus: m, onInput: C, onClick: T, onChange: _c, onKeypress: F, onCompositionend: _c, onCompositionstart: Ob };
    return e.type === "textarea" ? i("textarea", Q(M, { inputmode: e.inputmode }), null) : i("input", Q(function(q, X) {
      return q === "number" && (q = "text", X ?? (X = "decimal")), q === "digit" && (q = "tel", X ?? (X = "numeric")), { type: q, inputmode: X };
    }(e.type, e.inputmode), M), null);
  }, _ = () => {
    const D = o["right-icon"];
    if (e.rightIcon || D) return i("div", { class: ft("right-icon"), onClick: P }, [D ? D() : i(Dt, { name: e.rightIcon, classPrefix: e.iconPrefix }, null)]);
  }, $ = () => {
    if (e.showWordLimit && e.maxlength) {
      const D = Wt(d());
      return i("div", { class: ft("word-limit") }, [i("span", { class: ft("word-num") }, [D]), mt("/"), e.maxlength]);
    }
  }, L = () => {
    if (c && c.props.showErrorMessage === !1) return;
    const D = e.errorMessage || a.validateMessage;
    if (D) {
      const M = o["error-message"], q = u("errorMessageAlign");
      return i("div", { class: ft("error-message", q) }, [M ? M({ message: D }) : D]);
    }
  }, K = () => [i("div", { class: ft("body") }, [R(), p.value && i(Dt, { ref: r, name: e.clearIcon, class: ft("clear") }, null), _(), o.button && i("div", { class: ft("button") }, [o.button()])]), $(), L()];
  return nt({ blur: S, focus: O, validate: w, formValue: v, resetValidation: f, getValidationStatus: () => a.status }), At(b0, { customValue: s, resetValidation: f, validateWithTrigger: y }), U(() => e.modelValue, () => {
    k(d()), f(), y("onChange"), ne(B);
  }), Ce(() => {
    k(d(), e.formatTrigger), ne(B);
  }), Ft("touchstart", (D) => {
    rt(D), t("update:modelValue", ""), t("clear", D);
  }, { target: E(() => {
    var D;
    return (D = r.value) == null ? void 0 : D.$el;
  }) }), () => {
    const D = u("disabled"), M = u("labelAlign"), q = (() => {
      const X = o["left-icon"];
      if (e.leftIcon || X) return i("div", { class: ft("left-icon"), onClick: V }, [X ? X() : i(Dt, { name: e.leftIcon, classPrefix: e.iconPrefix }, null)]);
    })();
    return i(xb, { size: e.size, class: ft({ error: N.value, disabled: D, [`label-${M}`]: M }), center: e.center, border: e.border, isLink: e.isLink, clickable: e.clickable, titleStyle: j.value, valueClass: ft("value"), titleClass: [ft("label", [M, { required: h.value }]), e.labelClass], arrowDirection: e.arrowDirection }, { icon: q && M !== "top" ? () => q : null, title: () => {
      const X = (() => {
        const ee = u("labelWidth"), oe = u("labelAlign"), se = u("colon") ? ":" : "";
        return o.label ? [o.label(), se] : e.label ? i("label", { id: `${n}-label`, for: o.input ? void 0 : I(), "data-allow-mismatch": "attribute", onClick: (le) => {
          rt(le), O();
        }, style: oe === "top" && ee ? { width: Ee(ee) } : void 0 }, [e.label + se]) : void 0;
      })();
      return M === "top" ? [q, X].filter(Boolean) : X || [];
    }, value: K, extra: o.extra });
  };
} });
const He = Te(Db), [Ab, kr] = ge("switch");
var Eb = z({ name: Ab, props: { size: ue, loading: Boolean, disabled: Boolean, modelValue: ut, activeColor: String, inactiveColor: String, activeValue: { type: ut, default: !0 }, inactiveValue: { type: ut, default: !1 } }, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = () => e.modelValue === e.activeValue, a = () => {
    if (!e.disabled && !e.loading) {
      const r = n() ? e.inactiveValue : e.activeValue;
      t("update:modelValue", r), t("change", r);
    }
  }, l = () => {
    if (e.loading) {
      const r = n() ? e.activeColor : e.inactiveColor;
      return i(R0, { class: kr("loading"), color: r }, null);
    }
    if (o.node) return o.node();
  };
  return qo(() => e.modelValue), () => {
    var r;
    const { size: s, loading: c, disabled: d, activeColor: u, inactiveColor: p } = e, v = n(), h = { fontSize: Ee(s), backgroundColor: v ? u : p };
    return i("div", { role: "switch", class: kr({ on: v, loading: c, disabled: d }), style: h, tabindex: d ? void 0 : 0, "aria-checked": v, onClick: a }, [i("div", { class: kr("node") }, [l()]), (r = o.background) == null ? void 0 : r.call(o)]);
  };
} });
const Pb = Te(Eb), [a1, Ib] = ge("radio-group"), $b = { shape: String, disabled: Boolean, iconSize: ue, direction: String, modelValue: ut, checkedColor: String }, l1 = Symbol(a1);
var jb = z({ name: a1, props: $b, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { linkChildren: n } = Uo(l1);
  return U(() => e.modelValue, (a) => t("change", a)), n({ props: e, updateValue: (a) => t("update:modelValue", a) }), qo(() => e.modelValue), () => {
    var a;
    return i("div", { class: Ib([e.direction]), role: "radiogroup" }, [(a = o.default) == null ? void 0 : a.call(o)]);
  };
} });
const zb = Te(jb), [r1, Rb] = ge("checkbox-group"), Nb = { max: ue, shape: Re("round"), disabled: Boolean, iconSize: ue, direction: String, modelValue: yo(), checkedColor: String }, i1 = Symbol(r1);
var Mb = z({ name: r1, props: Nb, emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { children: n, linkChildren: a } = Uo(i1), l = (r) => t("update:modelValue", r);
  return U(() => e.modelValue, (r) => t("change", r)), nt({ toggleAll: (r = {}) => {
    typeof r == "boolean" && (r = { checked: r });
    const { checked: s, skipDisabled: c } = r, d = n.filter((u) => !!u.props.bindGroup && (u.props.disabled && c ? u.checked.value : s ?? !u.checked.value)).map((u) => u.name);
    l(d);
  } }), qo(() => e.modelValue), a({ props: e, updateValue: l }), () => {
    var r;
    return i("div", { class: Rb([e.direction]) }, [(r = o.default) == null ? void 0 : r.call(o)]);
  };
} });
const Lb = Te(Mb), _i = { name: ut, disabled: Boolean, iconSize: ue, modelValue: ut, checkedColor: String, labelPosition: String, labelDisabled: Boolean };
var s1 = z({ props: Pe({}, _i, { bem: bo(Function), role: String, shape: String, parent: Object, checked: Boolean, bindGroup: me, indeterminate: { type: Boolean, default: null } }), emits: ["click", "toggle"], setup(e, { emit: t, slots: o }) {
  const n = A(), a = (v) => {
    if (e.parent && e.bindGroup) return e.parent.props[v];
  }, l = E(() => {
    if (e.parent && e.bindGroup) {
      const v = a("disabled") || e.disabled;
      if (e.role === "checkbox") {
        const h = a("modelValue").length, g = a("max");
        return v || g && h >= +g && !e.checked;
      }
      return v;
    }
    return e.disabled;
  }), r = E(() => a("direction")), s = E(() => {
    const v = e.checkedColor || a("checkedColor");
    if (v && e.checked && !l.value) return { borderColor: v, backgroundColor: v };
  }), c = E(() => e.shape || a("shape") || "round"), d = (v) => {
    const { target: h } = v, g = n.value, f = g === h || (g == null ? void 0 : g.contains(h));
    !l.value && (f || !e.labelDisabled) && t("toggle"), t("click", v);
  }, u = () => {
    var v, h;
    const { bem: g, checked: f, indeterminate: b } = e, w = e.iconSize || a("iconSize");
    return i("div", { ref: n, class: g("icon", [c.value, { disabled: l.value, checked: f, indeterminate: b }]), style: c.value !== "dot" ? { fontSize: Ee(w) } : { width: Ee(w), height: Ee(w), borderColor: (v = s.value) == null ? void 0 : v.borderColor } }, [o.icon ? o.icon({ checked: f, disabled: l.value }) : c.value !== "dot" ? i(Dt, { name: b ? "minus" : "success", style: s.value }, null) : i("div", { class: g("icon--dot__icon"), style: { backgroundColor: (h = s.value) == null ? void 0 : h.backgroundColor } }, null)]);
  }, p = () => {
    const { checked: v } = e;
    if (o.default) return i("span", { class: e.bem("label", [e.labelPosition, { disabled: l.value }]) }, [o.default({ checked: v, disabled: l.value })]);
  };
  return () => {
    const v = e.labelPosition === "left" ? [p(), u()] : [u(), p()];
    return i("div", { role: e.role, class: e.bem([{ disabled: l.value, "label-disabled": e.labelDisabled }, r.value]), tabindex: l.value ? void 0 : 0, "aria-checked": e.checked, onClick: d }, [v]);
  };
} });
const Fb = Pe({}, _i, { shape: String }), [_b, Hb] = ge("radio");
var Ub = z({ name: _b, props: Fb, emits: ["update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { parent: n } = Ho(l1), a = () => {
    n ? n.updateValue(e.name) : t("update:modelValue", e.name);
  };
  return () => i(s1, Q({ bem: Hb, role: "radio", parent: n, checked: (n ? n.props.modelValue : e.modelValue) === e.name, onToggle: a }, e), gt(o, ["default", "icon"]));
} });
const qb = Te(Ub), [Wb, Yb] = ge("checkbox");
var Xb = z({ name: Wb, props: Pe({}, _i, { shape: String, bindGroup: me, indeterminate: { type: Boolean, default: null } }), emits: ["change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const { parent: n } = Ho(i1), a = E(() => n && e.bindGroup ? n.props.modelValue.indexOf(e.name) !== -1 : !!e.modelValue), l = (r = !a.value) => {
    n && e.bindGroup ? ((s) => {
      const { name: c } = e, { max: d, modelValue: u } = n.props, p = u.slice();
      if (s) !(d && p.length >= +d) && !p.includes(c) && (p.push(c), e.bindGroup && n.updateValue(p));
      else {
        const v = p.indexOf(c);
        v !== -1 && (p.splice(v, 1), e.bindGroup && n.updateValue(p));
      }
    })(r) : t("update:modelValue", r), e.indeterminate !== null && t("change", r);
  };
  return U(() => e.modelValue, (r) => {
    e.indeterminate === null && t("change", r);
  }), nt({ toggle: l, props: e, checked: a }), qo(() => e.modelValue), () => i(s1, Q({ bem: Yb, role: "checkbox", parent: n, checked: a.value, onToggle: l }, e), gt(o, ["default", "icon"]));
} });
const Gb = Te(Xb), c1 = Pe({}, _l, { modelValue: yo(), filter: Function, formatter: { type: Function, default: (e, t) => t } }), u1 = Object.keys(_l), pn = (e, t, o, n, a, l) => {
  const r = function(s, c) {
    if (s < 0) return [];
    const d = Array(s);
    let u = -1;
    for (; ++u < s; ) d[u] = c(u);
    return d;
  }(t - e + 1, (s) => {
    const c = k0(e + s);
    return n(o, { text: c, value: c });
  });
  return a ? a(o, r, l) : r;
}, d1 = (e, t) => e.map((o, n) => {
  const a = t[n];
  if (a.length) {
    const l = +a[0].value, r = +a[a.length - 1].value;
    return k0(to(+o, l, r));
  }
  return o;
}), [Zb, Yt, Kb] = ge("cascader");
var Jb = z({ name: Zb, props: { title: String, options: yo(), closeable: me, swipeable: me, closeIcon: Re("cross"), showHeader: me, modelValue: ue, fieldNames: Object, placeholder: String, activeColor: String }, emits: ["close", "change", "finish", "clickTab", "update:modelValue"], setup(e, { slots: t, emit: o }) {
  const n = A([]), a = A(0), [l, r] = Fi(), { text: s, value: c, children: d } = Pe({ text: "text", value: "value", children: "children" }, e.fieldNames), u = (w, y) => {
    for (const k of w) {
      if (k[c] === y) return [k];
      if (k[d]) {
        const C = u(k[d], y);
        if (C) return [k, ...C];
      }
    }
  }, p = () => {
    const { options: w, modelValue: y } = e;
    if (y !== void 0) {
      const k = u(w, y);
      if (k) {
        let C = w;
        return n.value = k.map((S) => {
          const O = { options: C, selected: S }, B = C.find((m) => m[c] === S[c]);
          return B && (C = B[d]), O;
        }), C && n.value.push({ options: C, selected: null }), void ne(() => {
          a.value = n.value.length - 1;
        });
      }
    }
    n.value = [{ options: w, selected: null }];
  }, v = () => o("close"), h = ({ name: w, title: y }) => o("clickTab", w, y), g = (w, y, k) => {
    const { disabled: C } = w, S = !(!y || w[c] !== y[c]), O = w.color || (S ? e.activeColor : void 0), B = t.option ? t.option({ option: w, selected: S }) : i("span", null, [w[s]]);
    return i("li", { ref: S ? r(k) : void 0, role: "menuitemradio", class: [Yt("option", { selected: S, disabled: C }), w.className], style: { color: O }, tabindex: C ? void 0 : S ? 0 : -1, "aria-checked": S, "aria-disabled": C || void 0, onClick: () => ((m, x) => {
      if (m.disabled) return;
      if (n.value[x].selected = m, n.value.length > x + 1 && (n.value = n.value.slice(0, x + 1)), m[d]) {
        const P = { options: m[d], selected: null };
        n.value[x + 1] ? n.value[x + 1] = P : n.value.push(P), ne(() => {
          a.value++;
        });
      }
      const T = n.value.map((P) => P.selected).filter(Boolean);
      o("update:modelValue", m[c]);
      const V = { value: m[c], tabIndex: x, selectedOptions: T };
      o("change", V), m[d] || o("finish", V);
    })(w, k) }, [B, S ? i(Dt, { name: "success", class: Yt("selected-icon") }, null) : null]);
  }, f = (w, y, k) => i("ul", { role: "menu", class: Yt("options") }, [w.map((C) => g(C, y, k))]), b = (w, y) => {
    const { options: k, selected: C } = w, S = e.placeholder || Kb("select"), O = C ? C[s] : S;
    return i(J0, { title: O, titleClass: Yt("tab", { unselected: !C }) }, { default: () => {
      var B, m;
      return [(B = t["options-top"]) == null ? void 0 : B.call(t, { tabIndex: y }), f(k, C, y), (m = t["options-bottom"]) == null ? void 0 : m.call(t, { tabIndex: y })];
    } });
  };
  return p(), U(a, (w) => {
    const y = l.value[w];
    y && ((k) => {
      const C = k.parentElement;
      C && (C.scrollTop = k.offsetTop - (C.offsetHeight - k.offsetHeight) / 2);
    })(y);
  }), U(() => e.options, p, { deep: !0 }), U(() => e.modelValue, (w) => {
    w !== void 0 && n.value.map((y) => {
      var k;
      return (k = y.selected) == null ? void 0 : k[c];
    }).includes(w) || p();
  }), () => i("div", { class: Yt() }, [e.showHeader ? i("div", { class: Yt("header") }, [i("h2", { class: Yt("title") }, [t.title ? t.title() : e.title]), e.closeable ? i(Dt, { name: e.closeIcon, class: [Yt("close-icon"), gn], onClick: v }, null) : null]) : null, i(Q0, { active: a.value, "onUpdate:active": (w) => a.value = w, shrink: !0, animated: !0, class: Yt("tabs"), color: e.activeColor, swipeable: e.swipeable, onClickTab: h }, { default: () => [n.value.map(b)] })]);
} });
const Qb = Te(Jb), [ey, Hc] = ge("cell-group");
var ty = z({ name: ey, inheritAttrs: !1, props: { title: String, inset: Boolean, border: me }, setup(e, { slots: t, attrs: o }) {
  const n = () => {
    var a;
    return i("div", Q({ class: [Hc({ inset: e.inset }), { [B0]: e.border && !e.inset }] }, o, ei()), [(a = t.default) == null ? void 0 : a.call(t)]);
  };
  return () => e.title || t.title ? i(be, null, [i("div", { class: Hc("title", { inset: e.inset }) }, [t.title ? t.title() : e.title]), n()]) : n();
} });
const oy = Te(ty), Uc = (/* @__PURE__ */ new Date()).getFullYear(), [ny] = ge("date-picker");
var ay = z({ name: ny, props: Pe({}, c1, { columnsType: { type: Array, default: () => ["year", "month", "day"] }, minDate: { type: Date, default: () => new Date(Uc - 10, 0, 1), validator: wc }, maxDate: { type: Date, default: () => new Date(Uc + 10, 11, 31), validator: wc } }), emits: ["confirm", "cancel", "change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(e.modelValue), a = A(!1), l = A(), r = E(() => a.value ? e.modelValue : n.value), s = (f) => f === e.minDate.getFullYear(), c = (f) => f === e.maxDate.getFullYear(), d = (f) => {
    const { minDate: b, columnsType: w } = e, y = w.indexOf(f), k = r.value[y];
    if (k) return +k;
    switch (f) {
      case "year":
        return b.getFullYear();
      case "month":
        return b.getMonth() + 1;
      case "day":
        return b.getDate();
    }
  }, u = () => {
    const f = d("year"), b = d("month"), w = s(f) && ((k) => k === e.minDate.getMonth() + 1)(b) ? e.minDate.getDate() : 1, y = c(f) && ((k) => k === e.maxDate.getMonth() + 1)(b) ? e.maxDate.getDate() : ((k, C) => 32 - new Date(k, C - 1, 32).getDate())(f, b);
    return pn(w, y, "day", e.formatter, e.filter, r.value);
  }, p = E(() => e.columnsType.map((f) => {
    switch (f) {
      case "year":
        return (() => {
          const b = e.minDate.getFullYear(), w = e.maxDate.getFullYear();
          return pn(b, w, "year", e.formatter, e.filter, r.value);
        })();
      case "month":
        return (() => {
          const b = d("year"), w = s(b) ? e.minDate.getMonth() + 1 : 1, y = c(b) ? e.maxDate.getMonth() + 1 : 12;
          return pn(w, y, "month", e.formatter, e.filter, r.value);
        })();
      case "day":
        return u();
      default:
        if (sa.NODE_ENV !== "production") throw new Error(`[Vant] DatePicker: unsupported columns type: ${f}`);
        return [];
    }
  }));
  U(n, (f) => {
    Nt(f, e.modelValue) || t("update:modelValue", f);
  }), U(() => e.modelValue, (f, b) => {
    a.value = Nt(b, n.value), f = d1(f, p.value), Nt(f, n.value) || (n.value = f), a.value = !1;
  }, { immediate: !0 });
  const v = (...f) => t("change", ...f), h = (...f) => t("cancel", ...f), g = (...f) => t("confirm", ...f);
  return nt({ confirm: () => {
    var f;
    return (f = l.value) == null ? void 0 : f.confirm();
  }, getSelectedDate: () => n.value }), () => i(da, Q({ ref: l, modelValue: n.value, "onUpdate:modelValue": (f) => n.value = f, columns: p.value, onChange: v, onCancel: h, onConfirm: g }, gt(e, u1)), o);
} });
const Fa = Te(ay), _a = Te(db), [ly, Ha] = ge("rate"), ry = { size: ue, icon: Re("star"), color: String, count: xe(5), gutter: ue, clearable: Boolean, readonly: Boolean, disabled: Boolean, voidIcon: Re("star-o"), allowHalf: Boolean, voidColor: String, touchable: me, iconPrefix: String, modelValue: /* @__PURE__ */ ((e) => ({ type: Number, default: e }))(0), disabledColor: String };
var iy = z({ name: ly, props: ry, emits: ["change", "update:modelValue"], setup(e, { emit: t }) {
  const o = ua(), [n, a] = Fi(), l = A(), r = E(() => e.readonly || e.disabled), s = E(() => r.value || !e.touchable), c = E(() => Array(+e.count).fill("").map((y, k) => function(C, S, O, B) {
    return C >= S ? { status: "full", value: 1 } : C + 0.5 >= S && O && !B ? { status: "half", value: 0.5 } : C + 1 >= S && O && B ? { status: "half", value: Math.round(1e10 * (C - S + 1)) / 1e10 } : { status: "void", value: 0 };
  }(e.modelValue, k + 1, e.allowHalf, e.readonly)));
  let d, u, p = Number.MAX_SAFE_INTEGER, v = Number.MIN_SAFE_INTEGER;
  const h = () => {
    u = Bt(l);
    const y = n.value.map(Bt);
    d = [], y.forEach((k, C) => {
      p = Math.min(k.top, p), v = Math.max(k.top, v), e.allowHalf ? d.push({ score: C + 0.5, left: k.left, top: k.top, height: k.height }, { score: C + 1, left: k.left + k.width / 2, top: k.top, height: k.height }) : d.push({ score: C + 1, left: k.left, top: k.top, height: k.height });
    });
  }, g = (y, k) => {
    for (let C = d.length - 1; C > 0; C--) if (k >= u.top && k <= u.bottom) {
      if (y > d[C].left && k >= d[C].top && k <= d[C].top + d[C].height) return d[C].score;
    } else {
      const S = k < u.top ? p : v;
      if (y > d[C].left && d[C].top === S) return d[C].score;
    }
    return e.allowHalf ? 0.5 : 1;
  }, f = (y) => {
    r.value || y === e.modelValue || (t("update:modelValue", y), t("change", y));
  }, b = (y) => {
    s.value || (o.start(y), h());
  }, w = (y, k) => {
    const { icon: C, size: S, color: O, count: B, gutter: m, voidIcon: x, disabled: T, voidColor: V, allowHalf: P, iconPrefix: N, disabledColor: j } = e, F = k + 1, I = y.status === "full", R = y.status === "void", _ = P && y.value > 0 && y.value < 1;
    let $;
    return m && F !== +B && ($ = { paddingRight: Ee(m) }), i("div", { key: k, ref: a(k), role: "radio", style: $, class: Ha("item"), tabindex: T ? void 0 : 0, "aria-setsize": B, "aria-posinset": F, "aria-checked": !R, onClick: (L) => {
      h();
      let K = P ? g(L.clientX, L.clientY) : F;
      e.clearable && o.isTap.value && K === e.modelValue && (K = 0), f(K);
    } }, [i(Dt, { size: S, name: I ? C : x, class: Ha("icon", { disabled: T, full: I }), color: T ? j : I ? O : V, classPrefix: N }, null), _ && i(Dt, { size: S, style: { width: y.value + "em" }, name: R ? x : C, class: Ha("icon", ["half", { disabled: T, full: !R }]), color: T ? j : R ? V : O, classPrefix: N }, null)]);
  };
  return qo(() => e.modelValue), Ft("touchmove", (y) => {
    if (!s.value && (o.move(y), o.isHorizontal() && !o.isTap.value)) {
      const { clientX: k, clientY: C } = y.touches[0];
      rt(y), f(g(k, C));
    }
  }, { target: l }), () => i("div", { ref: l, role: "radiogroup", class: Ha({ readonly: e.readonly, disabled: e.disabled }), tabindex: e.disabled ? void 0 : 0, "aria-disabled": e.disabled, "aria-readonly": e.readonly, onTouchstartPassive: b }, [c.value.map(w)]);
} });
const sy = Te(iy), [cy, Ua] = ge("slider");
var uy = z({ name: cy, props: { min: xe(0), max: xe(100), step: xe(1), range: Boolean, reverse: Boolean, disabled: Boolean, readonly: Boolean, vertical: Boolean, barHeight: ue, buttonSize: ue, activeColor: String, inactiveColor: String, modelValue: { type: [Number, Array], default: 0 } }, emits: ["change", "dragEnd", "dragStart", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  let n, a, l;
  const r = A(), s = [A(), A()], c = A(), d = ua(), u = E(() => Number(e.max) - Number(e.min)), p = E(() => {
    const m = e.vertical ? "width" : "height";
    return { background: e.inactiveColor, [m]: Ee(e.barHeight) };
  }), v = (m) => e.range && Array.isArray(m), h = () => {
    const { modelValue: m, min: x } = e;
    return v(m) ? 100 * (m[1] - m[0]) / u.value + "%" : 100 * (m - Number(x)) / u.value + "%";
  }, g = E(() => {
    const m = { [e.vertical ? "height" : "width"]: h(), background: e.activeColor };
    return c.value && (m.transition = "none"), m[e.vertical ? e.reverse ? "bottom" : "top" : e.reverse ? "right" : "left"] = (() => {
      const { modelValue: x, min: T } = e;
      return v(x) ? 100 * (x[0] - Number(T)) / u.value + "%" : "0%";
    })(), m;
  }), f = (m) => {
    const x = +e.min, T = +e.max, V = +e.step;
    return m = to(m, x, T), C0(x, Math.round((m - x) / V) * V);
  }, b = () => {
    const m = e.modelValue;
    l = v(m) ? m.map(f) : f(m);
  }, w = (m, x) => {
    m = v(m) ? ((T) => {
      var V, P;
      const N = (V = T[0]) != null ? V : Number(e.min), j = (P = T[1]) != null ? P : Number(e.max);
      return N > j ? [j, N] : [N, j];
    })(m).map(f) : f(m), Nt(m, e.modelValue) || t("update:modelValue", m), x && !Nt(m, l) && t("change", m);
  }, y = (m) => {
    if (m.stopPropagation(), e.disabled || e.readonly) return;
    b();
    const { min: x, reverse: T, vertical: V, modelValue: P } = e, N = Bt(r), j = V ? N.height : N.width, F = Number(x) + (V ? T ? N.bottom - m.clientY : m.clientY - N.top : T ? N.right - m.clientX : m.clientX - N.left) / j * u.value;
    if (v(P)) {
      const [I, R] = P;
      w(F <= (I + R) / 2 ? [F, R] : [I, F], !0);
    } else w(F, !0);
  }, k = (m) => {
    if (e.disabled || e.readonly) return;
    c.value === "start" && t("dragStart", m), rt(m, !0), d.move(m), c.value = "dragging";
    const x = Bt(r);
    let T = (e.vertical ? d.deltaY.value : d.deltaX.value) / (e.vertical ? x.height : x.width) * u.value;
    if (e.reverse && (T = -T), v(l)) {
      const V = e.reverse ? 1 - n : n;
      a[V] = l[V] + T;
    } else a = l + T;
    w(a);
  }, C = (m) => {
    e.disabled || e.readonly || (c.value === "dragging" && (w(a, !0), t("dragEnd", m)), c.value = "");
  }, S = (m) => Ua("button-wrapper", typeof m == "number" ? ["left", "right"][m] : e.reverse ? "left" : "right"), O = (m, x) => {
    const T = c.value === "dragging";
    if (typeof x == "number") {
      const V = o[x === 0 ? "left-button" : "right-button"];
      let P;
      if (T && Array.isArray(a) && (P = a[0] > a[1] ? 1 ^ n : n), V) return V({ value: m, dragging: T, dragIndex: P });
    }
    return o.button ? o.button({ value: m, dragging: T }) : i("div", { class: Ua("button"), style: Ri(e.buttonSize) }, null);
  }, B = (m) => {
    const x = typeof m == "number" ? e.modelValue[m] : e.modelValue;
    return i("div", { ref: s[m ?? 0], role: "slider", class: S(m), tabindex: e.disabled ? void 0 : 0, "aria-valuemin": e.min, "aria-valuenow": x, "aria-valuemax": e.max, "aria-disabled": e.disabled || void 0, "aria-readonly": e.readonly || void 0, "aria-orientation": e.vertical ? "vertical" : "horizontal", onTouchstartPassive: (T) => {
      typeof m == "number" && (n = m), ((V) => {
        e.disabled || e.readonly || (d.start(V), a = e.modelValue, b(), c.value = "start");
      })(T);
    }, onTouchend: C, onTouchcancel: C, onClick: w0 }, [O(x, m)]);
  };
  return w(e.modelValue), qo(() => e.modelValue), s.forEach((m) => {
    Ft("touchmove", k, { target: m });
  }), () => i("div", { ref: r, style: p.value, class: Ua({ vertical: e.vertical, disabled: e.disabled }), onClick: y }, [i("div", { class: Ua("bar"), style: g.value }, [e.range ? [B(0), B(1)] : B()])]);
} });
const dy = Te(uy), [py, qa] = ge("stepper"), Wa = (e, t) => String(e) === String(t);
var vy = z({ name: py, props: { min: xe(1), max: xe(1 / 0), name: xe(""), step: xe(1), theme: String, integer: Boolean, disabled: Boolean, showPlus: me, showMinus: me, showInput: me, longPress: me, autoFixed: me, allowEmpty: Boolean, modelValue: ue, inputWidth: ue, buttonSize: ue, placeholder: String, disablePlus: Boolean, disableMinus: Boolean, disableInput: Boolean, beforeChange: Function, defaultValue: xe(1), decimalLength: ue }, emits: ["plus", "blur", "minus", "focus", "change", "overlimit", "update:modelValue"], setup(e, { emit: t }) {
  const o = (S, O = !0) => {
    const { min: B, max: m, allowEmpty: x, decimalLength: T } = e;
    return x && S === "" || (S = (S = Jr(String(S), !e.integer)) === "" ? 0 : +S, S = Number.isNaN(S) ? +B : S, S = O ? Math.max(Math.min(+m, S), +B) : S, ze(T) && (S = S.toFixed(+T))), S;
  };
  let n;
  const a = A(), l = A((() => {
    var S;
    const O = (S = e.modelValue) != null ? S : e.defaultValue, B = o(O);
    return Wa(B, e.modelValue) || t("update:modelValue", B), B;
  })()), r = E(() => e.disabled || e.disableMinus || +l.value <= +e.min), s = E(() => e.disabled || e.disablePlus || +l.value >= +e.max), c = E(() => ({ width: Ee(e.inputWidth), height: Ee(e.buttonSize) })), d = E(() => Ri(e.buttonSize)), u = (S) => {
    e.beforeChange ? Mi(e.beforeChange, { args: [S], done() {
      l.value = S;
    } }) : l.value = S;
  }, p = () => {
    if (n === "plus" && s.value || n === "minus" && r.value) return void t("overlimit", n);
    const S = n === "minus" ? -e.step : +e.step, O = o(C0(+l.value, S));
    u(O), t(n);
  }, v = (S) => {
    const O = S.target, { value: B } = O, { decimalLength: m } = e;
    let x = Jr(String(B), !e.integer);
    if (ze(m) && x.includes(".")) {
      const V = x.split(".");
      x = `${V[0]}.${V[1].slice(0, +m)}`;
    }
    e.beforeChange ? O.value = String(l.value) : Wa(B, x) || (O.value = x);
    const T = x === String(+x);
    u(T ? +x : x);
  }, h = (S) => {
    var O;
    e.disableInput ? (O = a.value) == null || O.blur() : t("focus", S);
  }, g = (S) => {
    const O = S.target, B = o(O.value, e.autoFixed);
    O.value = String(B), l.value = B, ne(() => {
      t("blur", S), y0();
    });
  };
  let f, b;
  const w = () => {
    b = setTimeout(() => {
      p(), w();
    }, 200);
  }, y = (S) => {
    e.longPress && (clearTimeout(b), f && rt(S));
  }, k = (S) => {
    e.disableInput && rt(S);
  }, C = (S) => ({ onClick: (O) => {
    rt(O), n = S, p();
  }, onTouchstartPassive: () => {
    n = S, e.longPress && (f = !1, clearTimeout(b), b = setTimeout(() => {
      f = !0, p(), w();
    }, 500));
  }, onTouchend: y, onTouchcancel: y });
  return U(() => [e.max, e.min, e.integer, e.decimalLength], () => {
    const S = o(l.value);
    Wa(S, l.value) || (l.value = S);
  }), U(() => e.modelValue, (S) => {
    Wa(S, l.value) || (l.value = o(S));
  }), U(l, (S) => {
    t("update:modelValue", S), t("change", S, { name: e.name });
  }), qo(() => e.modelValue), () => i("div", { role: "group", class: qa([e.theme]) }, [De(i("button", Q({ type: "button", style: d.value, class: [qa("minus", { disabled: r.value }), { [gn]: !r.value }], "aria-disabled": r.value || void 0 }, C("minus")), null), [[Ie, e.showMinus]]), De(i("input", { ref: a, type: e.integer ? "tel" : "text", role: "spinbutton", class: qa("input"), value: l.value, style: c.value, disabled: e.disabled, readonly: e.disableInput, inputmode: e.integer ? "numeric" : "decimal", placeholder: e.placeholder, autocomplete: "off", "aria-valuemax": e.max, "aria-valuemin": e.min, "aria-valuenow": l.value, onBlur: g, onInput: v, onFocus: h, onMousedown: k }, null), [[Ie, e.showInput]]), De(i("button", Q({ type: "button", style: d.value, class: [qa("plus", { disabled: s.value }), { [gn]: !s.value }], "aria-disabled": s.value || void 0 }, C("plus")), null), [[Ie, e.showPlus]])]);
} });
const fy = Te(vy), [my] = ge("time-picker"), qc = (e) => /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(e), hy = ["hour", "minute", "second"];
var gy = z({ name: my, props: Pe({}, c1, { minHour: xe(0), maxHour: xe(23), minMinute: xe(0), maxMinute: xe(59), minSecond: xe(0), maxSecond: xe(59), minTime: { type: String, validator: qc }, maxTime: { type: String, validator: qc }, columnsType: { type: Array, default: () => ["hour", "minute"] } }), emits: ["confirm", "cancel", "change", "update:modelValue"], setup(e, { emit: t, slots: o }) {
  const n = A(e.modelValue), a = A(), l = (u) => {
    const p = u.split(":");
    return hy.map((v, h) => e.columnsType.includes(v) ? p[h] : "00");
  }, r = E(() => {
    let { minHour: u, maxHour: p, minMinute: v, maxMinute: h, minSecond: g, maxSecond: f } = e;
    if (e.minTime || e.maxTime) {
      const b = { hour: 0, minute: 0, second: 0 };
      e.columnsType.forEach((k, C) => {
        var S;
        b[k] = (S = n.value[C]) != null ? S : 0;
      });
      const { hour: w, minute: y } = b;
      if (e.minTime) {
        const [k, C, S] = l(e.minTime);
        u = k, v = +w <= +u ? C : "00", g = +w <= +u && +y <= +v ? S : "00";
      }
      if (e.maxTime) {
        const [k, C, S] = l(e.maxTime);
        p = k, h = +w >= +p ? C : "59", f = +w >= +p && +y >= +h ? S : "59";
      }
    }
    return e.columnsType.map((b) => {
      const { filter: w, formatter: y } = e;
      switch (b) {
        case "hour":
          return pn(+u, +p, b, y, w, n.value);
        case "minute":
          return pn(+v, +h, b, y, w, n.value);
        case "second":
          return pn(+g, +f, b, y, w, n.value);
        default:
          if (sa.NODE_ENV !== "production") throw new Error(`[Vant] DatePicker: unsupported columns type: ${b}`);
          return [];
      }
    });
  });
  U(n, (u) => {
    Nt(u, e.modelValue) || t("update:modelValue", u);
  }), U(() => e.modelValue, (u) => {
    u = d1(u, r.value), Nt(u, n.value) || (n.value = u);
  }, { immediate: !0 });
  const s = (...u) => t("change", ...u), c = (...u) => t("cancel", ...u), d = (...u) => t("confirm", ...u);
  return nt({ confirm: () => {
    var u;
    return (u = a.value) == null ? void 0 : u.confirm();
  }, getSelectedTime: () => n.value }), () => i(da, Q({ ref: a, modelValue: n.value, "onUpdate:modelValue": (u) => n.value = u, columns: r.value, onChange: s, onCancel: c, onConfirm: d }, gt(e, u1)), o);
} });
const Ya = Te(gy);
var Wc = { province_list: { 11e4: "北京市", 12e4: "天津市", 13e4: "河北省", 14e4: "山西省", 15e4: "内蒙古自治区", 21e4: "辽宁省", 22e4: "吉林省", 23e4: "黑龙江省", 31e4: "上海市", 32e4: "江苏省", 33e4: "浙江省", 34e4: "安徽省", 35e4: "福建省", 36e4: "江西省", 37e4: "山东省", 41e4: "河南省", 42e4: "湖北省", 43e4: "湖南省", 44e4: "广东省", 45e4: "广西壮族自治区", 46e4: "海南省", 5e5: "重庆市", 51e4: "四川省", 52e4: "贵州省", 53e4: "云南省", 54e4: "西藏自治区", 61e4: "陕西省", 62e4: "甘肃省", 63e4: "青海省", 64e4: "宁夏回族自治区", 65e4: "新疆维吾尔自治区", 71e4: "台湾省", 81e4: "香港特别行政区", 82e4: "澳门特别行政区" }, city_list: { 110100: "北京市", 120100: "天津市", 130100: "石家庄市", 130200: "唐山市", 130300: "秦皇岛市", 130400: "邯郸市", 130500: "邢台市", 130600: "保定市", 130700: "张家口市", 130800: "承德市", 130900: "沧州市", 131e3: "廊坊市", 131100: "衡水市", 140100: "太原市", 140200: "大同市", 140300: "阳泉市", 140400: "长治市", 140500: "晋城市", 140600: "朔州市", 140700: "晋中市", 140800: "运城市", 140900: "忻州市", 141e3: "临汾市", 141100: "吕梁市", 150100: "呼和浩特市", 150200: "包头市", 150300: "乌海市", 150400: "赤峰市", 150500: "通辽市", 150600: "鄂尔多斯市", 150700: "呼伦贝尔市", 150800: "巴彦淖尔市", 150900: "乌兰察布市", 152200: "兴安盟", 152500: "锡林郭勒盟", 152900: "阿拉善盟", 210100: "沈阳市", 210200: "大连市", 210300: "鞍山市", 210400: "抚顺市", 210500: "本溪市", 210600: "丹东市", 210700: "锦州市", 210800: "营口市", 210900: "阜新市", 211e3: "辽阳市", 211100: "盘锦市", 211200: "铁岭市", 211300: "朝阳市", 211400: "葫芦岛市", 220100: "长春市", 220200: "吉林市", 220300: "四平市", 220400: "辽源市", 220500: "通化市", 220600: "白山市", 220700: "松原市", 220800: "白城市", 222400: "延边朝鲜族自治州", 230100: "哈尔滨市", 230200: "齐齐哈尔市", 230300: "鸡西市", 230400: "鹤岗市", 230500: "双鸭山市", 230600: "大庆市", 230700: "伊春市", 230800: "佳木斯市", 230900: "七台河市", 231e3: "牡丹江市", 231100: "黑河市", 231200: "绥化市", 232700: "大兴安岭地区", 310100: "上海市", 320100: "南京市", 320200: "无锡市", 320300: "徐州市", 320400: "常州市", 320500: "苏州市", 320600: "南通市", 320700: "连云港市", 320800: "淮安市", 320900: "盐城市", 321e3: "扬州市", 321100: "镇江市", 321200: "泰州市", 321300: "宿迁市", 330100: "杭州市", 330200: "宁波市", 330300: "温州市", 330400: "嘉兴市", 330500: "湖州市", 330600: "绍兴市", 330700: "金华市", 330800: "衢州市", 330900: "舟山市", 331e3: "台州市", 331100: "丽水市", 340100: "合肥市", 340200: "芜湖市", 340300: "蚌埠市", 340400: "淮南市", 340500: "马鞍山市", 340600: "淮北市", 340700: "铜陵市", 340800: "安庆市", 341e3: "黄山市", 341100: "滁州市", 341200: "阜阳市", 341300: "宿州市", 341500: "六安市", 341600: "亳州市", 341700: "池州市", 341800: "宣城市", 350100: "福州市", 350200: "厦门市", 350300: "莆田市", 350400: "三明市", 350500: "泉州市", 350600: "漳州市", 350700: "南平市", 350800: "龙岩市", 350900: "宁德市", 360100: "南昌市", 360200: "景德镇市", 360300: "萍乡市", 360400: "九江市", 360500: "新余市", 360600: "鹰潭市", 360700: "赣州市", 360800: "吉安市", 360900: "宜春市", 361e3: "抚州市", 361100: "上饶市", 370100: "济南市", 370200: "青岛市", 370300: "淄博市", 370400: "枣庄市", 370500: "东营市", 370600: "烟台市", 370700: "潍坊市", 370800: "济宁市", 370900: "泰安市", 371e3: "威海市", 371100: "日照市", 371300: "临沂市", 371400: "德州市", 371500: "聊城市", 371600: "滨州市", 371700: "菏泽市", 410100: "郑州市", 410200: "开封市", 410300: "洛阳市", 410400: "平顶山市", 410500: "安阳市", 410600: "鹤壁市", 410700: "新乡市", 410800: "焦作市", 410900: "濮阳市", 411e3: "许昌市", 411100: "漯河市", 411200: "三门峡市", 411300: "南阳市", 411400: "商丘市", 411500: "信阳市", 411600: "周口市", 411700: "驻马店市", 419e3: "省直辖县", 420100: "武汉市", 420200: "黄石市", 420300: "十堰市", 420500: "宜昌市", 420600: "襄阳市", 420700: "鄂州市", 420800: "荆门市", 420900: "孝感市", 421e3: "荆州市", 421100: "黄冈市", 421200: "咸宁市", 421300: "随州市", 422800: "恩施土家族苗族自治州", 429e3: "省直辖县", 430100: "长沙市", 430200: "株洲市", 430300: "湘潭市", 430400: "衡阳市", 430500: "邵阳市", 430600: "岳阳市", 430700: "常德市", 430800: "张家界市", 430900: "益阳市", 431e3: "郴州市", 431100: "永州市", 431200: "怀化市", 431300: "娄底市", 433100: "湘西土家族苗族自治州", 440100: "广州市", 440200: "韶关市", 440300: "深圳市", 440400: "珠海市", 440500: "汕头市", 440600: "佛山市", 440700: "江门市", 440800: "湛江市", 440900: "茂名市", 441200: "肇庆市", 441300: "惠州市", 441400: "梅州市", 441500: "汕尾市", 441600: "河源市", 441700: "阳江市", 441800: "清远市", 441900: "东莞市", 442e3: "中山市", 445100: "潮州市", 445200: "揭阳市", 445300: "云浮市", 450100: "南宁市", 450200: "柳州市", 450300: "桂林市", 450400: "梧州市", 450500: "北海市", 450600: "防城港市", 450700: "钦州市", 450800: "贵港市", 450900: "玉林市", 451e3: "百色市", 451100: "贺州市", 451200: "河池市", 451300: "来宾市", 451400: "崇左市", 460100: "海口市", 460200: "三亚市", 460300: "三沙市", 460400: "儋州市", 469e3: "省直辖县", 500100: "重庆市", 500200: "县", 510100: "成都市", 510300: "自贡市", 510400: "攀枝花市", 510500: "泸州市", 510600: "德阳市", 510700: "绵阳市", 510800: "广元市", 510900: "遂宁市", 511e3: "内江市", 511100: "乐山市", 511300: "南充市", 511400: "眉山市", 511500: "宜宾市", 511600: "广安市", 511700: "达州市", 511800: "雅安市", 511900: "巴中市", 512e3: "资阳市", 513200: "阿坝藏族羌族自治州", 513300: "甘孜藏族自治州", 513400: "凉山彝族自治州", 520100: "贵阳市", 520200: "六盘水市", 520300: "遵义市", 520400: "安顺市", 520500: "毕节市", 520600: "铜仁市", 522300: "黔西南布依族苗族自治州", 522600: "黔东南苗族侗族自治州", 522700: "黔南布依族苗族自治州", 530100: "昆明市", 530300: "曲靖市", 530400: "玉溪市", 530500: "保山市", 530600: "昭通市", 530700: "丽江市", 530800: "普洱市", 530900: "临沧市", 532300: "楚雄彝族自治州", 532500: "红河哈尼族彝族自治州", 532600: "文山壮族苗族自治州", 532800: "西双版纳傣族自治州", 532900: "大理白族自治州", 533100: "德宏傣族景颇族自治州", 533300: "怒江傈僳族自治州", 533400: "迪庆藏族自治州", 540100: "拉萨市", 540200: "日喀则市", 540300: "昌都市", 540400: "林芝市", 540500: "山南市", 540600: "那曲市", 542500: "阿里地区", 610100: "西安市", 610200: "铜川市", 610300: "宝鸡市", 610400: "咸阳市", 610500: "渭南市", 610600: "延安市", 610700: "汉中市", 610800: "榆林市", 610900: "安康市", 611e3: "商洛市", 620100: "兰州市", 620200: "嘉峪关市", 620300: "金昌市", 620400: "白银市", 620500: "天水市", 620600: "武威市", 620700: "张掖市", 620800: "平凉市", 620900: "酒泉市", 621e3: "庆阳市", 621100: "定西市", 621200: "陇南市", 622900: "临夏回族自治州", 623e3: "甘南藏族自治州", 630100: "西宁市", 630200: "海东市", 632200: "海北藏族自治州", 632300: "黄南藏族自治州", 632500: "海南藏族自治州", 632600: "果洛藏族自治州", 632700: "玉树藏族自治州", 632800: "海西蒙古族藏族自治州", 640100: "银川市", 640200: "石嘴山市", 640300: "吴忠市", 640400: "固原市", 640500: "中卫市", 650100: "乌鲁木齐市", 650200: "克拉玛依市", 650400: "吐鲁番市", 650500: "哈密市", 652300: "昌吉回族自治州", 652700: "博尔塔拉蒙古自治州", 652800: "巴音郭楞蒙古自治州", 652900: "阿克苏地区", 653e3: "克孜勒苏柯尔克孜自治州", 653100: "喀什地区", 653200: "和田地区", 654e3: "伊犁哈萨克自治州", 654200: "塔城地区", 654300: "阿勒泰地区", 659e3: "自治区直辖县级行政区划", 710100: "台北市", 710200: "高雄市", 710300: "台南市", 710400: "台中市", 710500: "金门县", 710600: "南投县", 710700: "基隆市", 710800: "新竹市", 710900: "嘉义市", 711100: "新北市", 711200: "宜兰县", 711300: "新竹县", 711400: "桃园市", 711500: "苗栗县", 711700: "彰化县", 711900: "嘉义县", 712100: "云林县", 712400: "屏东县", 712500: "台东县", 712600: "花莲县", 712700: "澎湖县", 712800: "连江县", 810100: "香港岛", 810200: "九龙", 810300: "新界", 820100: "澳门半岛", 820200: "离岛" }, county_list: { 110101: "东城区", 110102: "西城区", 110105: "朝阳区", 110106: "丰台区", 110107: "石景山区", 110108: "海淀区", 110109: "门头沟区", 110111: "房山区", 110112: "通州区", 110113: "顺义区", 110114: "昌平区", 110115: "大兴区", 110116: "怀柔区", 110117: "平谷区", 110118: "密云区", 110119: "延庆区", 120101: "和平区", 120102: "河东区", 120103: "河西区", 120104: "南开区", 120105: "河北区", 120106: "红桥区", 120110: "东丽区", 120111: "西青区", 120112: "津南区", 120113: "北辰区", 120114: "武清区", 120115: "宝坻区", 120116: "滨海新区", 120117: "宁河区", 120118: "静海区", 120119: "蓟州区", 130102: "长安区", 130104: "桥西区", 130105: "新华区", 130107: "井陉矿区", 130108: "裕华区", 130109: "藁城区", 130110: "鹿泉区", 130111: "栾城区", 130121: "井陉县", 130123: "正定县", 130125: "行唐县", 130126: "灵寿县", 130127: "高邑县", 130128: "深泽县", 130129: "赞皇县", 130130: "无极县", 130131: "平山县", 130132: "元氏县", 130133: "赵县", 130171: "石家庄高新技术产业开发区", 130172: "石家庄循环化工园区", 130181: "辛集市", 130183: "晋州市", 130184: "新乐市", 130202: "路南区", 130203: "路北区", 130204: "古冶区", 130205: "开平区", 130207: "丰南区", 130208: "丰润区", 130209: "曹妃甸区", 130224: "滦南县", 130225: "乐亭县", 130227: "迁西县", 130229: "玉田县", 130273: "唐山高新技术产业开发区", 130274: "河北唐山海港经济开发区", 130281: "遵化市", 130283: "迁安市", 130284: "滦州市", 130302: "海港区", 130303: "山海关区", 130304: "北戴河区", 130306: "抚宁区", 130321: "青龙满族自治县", 130322: "昌黎县", 130324: "卢龙县", 130371: "秦皇岛市经济技术开发区", 130372: "北戴河新区", 130390: "经济技术开发区", 130402: "邯山区", 130403: "丛台区", 130404: "复兴区", 130406: "峰峰矿区", 130407: "肥乡区", 130408: "永年区", 130423: "临漳县", 130424: "成安县", 130425: "大名县", 130426: "涉县", 130427: "磁县", 130430: "邱县", 130431: "鸡泽县", 130432: "广平县", 130433: "馆陶县", 130434: "魏县", 130435: "曲周县", 130471: "邯郸经济技术开发区", 130473: "邯郸冀南新区", 130481: "武安市", 130502: "襄都区", 130503: "信都区", 130505: "任泽区", 130506: "南和区", 130522: "临城县", 130523: "内丘县", 130524: "柏乡县", 130525: "隆尧县", 130528: "宁晋县", 130529: "巨鹿县", 130530: "新河县", 130531: "广宗县", 130532: "平乡县", 130533: "威县", 130534: "清河县", 130535: "临西县", 130571: "河北邢台经济开发区", 130581: "南宫市", 130582: "沙河市", 130602: "竞秀区", 130606: "莲池区", 130607: "满城区", 130608: "清苑区", 130609: "徐水区", 130623: "涞水县", 130624: "阜平县", 130626: "定兴县", 130627: "唐县", 130628: "高阳县", 130629: "容城县", 130630: "涞源县", 130631: "望都县", 130632: "安新县", 130633: "易县", 130634: "曲阳县", 130635: "蠡县", 130636: "顺平县", 130637: "博野县", 130638: "雄县", 130671: "保定高新技术产业开发区", 130672: "保定白沟新城", 130681: "涿州市", 130682: "定州市", 130683: "安国市", 130684: "高碑店市", 130702: "桥东区", 130703: "桥西区", 130705: "宣化区", 130706: "下花园区", 130708: "万全区", 130709: "崇礼区", 130722: "张北县", 130723: "康保县", 130724: "沽源县", 130725: "尚义县", 130726: "蔚县", 130727: "阳原县", 130728: "怀安县", 130730: "怀来县", 130731: "涿鹿县", 130732: "赤城县", 130772: "张家口市察北管理区", 130802: "双桥区", 130803: "双滦区", 130804: "鹰手营子矿区", 130821: "承德县", 130822: "兴隆县", 130824: "滦平县", 130825: "隆化县", 130826: "丰宁满族自治县", 130827: "宽城满族自治县", 130828: "围场满族蒙古族自治县", 130871: "承德高新技术产业开发区", 130881: "平泉市", 130902: "新华区", 130903: "运河区", 130921: "沧县", 130922: "青县", 130923: "东光县", 130924: "海兴县", 130925: "盐山县", 130926: "肃宁县", 130927: "南皮县", 130928: "吴桥县", 130929: "献县", 130930: "孟村回族自治县", 130971: "河北沧州经济开发区", 130972: "沧州高新技术产业开发区", 130973: "沧州渤海新区", 130981: "泊头市", 130982: "任丘市", 130983: "黄骅市", 130984: "河间市", 131002: "安次区", 131003: "广阳区", 131022: "固安县", 131023: "永清县", 131024: "香河县", 131025: "大城县", 131026: "文安县", 131028: "大厂回族自治县", 131071: "廊坊经济技术开发区", 131081: "霸州市", 131082: "三河市", 131090: "开发区", 131102: "桃城区", 131103: "冀州区", 131121: "枣强县", 131122: "武邑县", 131123: "武强县", 131124: "饶阳县", 131125: "安平县", 131126: "故城县", 131127: "景县", 131128: "阜城县", 131171: "河北衡水经济开发区", 131172: "衡水滨湖新区", 131182: "深州市", 140105: "小店区", 140106: "迎泽区", 140107: "杏花岭区", 140108: "尖草坪区", 140109: "万柏林区", 140110: "晋源区", 140121: "清徐县", 140122: "阳曲县", 140123: "娄烦县", 140181: "古交市", 140212: "新荣区", 140213: "平城区", 140214: "云冈区", 140215: "云州区", 140221: "阳高县", 140222: "天镇县", 140223: "广灵县", 140224: "灵丘县", 140225: "浑源县", 140226: "左云县", 140271: "山西大同经济开发区", 140302: "城区", 140303: "矿区", 140311: "郊区", 140321: "平定县", 140322: "盂县", 140403: "潞州区", 140404: "上党区", 140405: "屯留区", 140406: "潞城区", 140423: "襄垣县", 140425: "平顺县", 140426: "黎城县", 140427: "壶关县", 140428: "长子县", 140429: "武乡县", 140430: "沁县", 140431: "沁源县", 140471: "山西长治高新技术产业园区", 140502: "城区", 140521: "沁水县", 140522: "阳城县", 140524: "陵川县", 140525: "泽州县", 140581: "高平市", 140602: "朔城区", 140603: "平鲁区", 140621: "山阴县", 140622: "应县", 140623: "右玉县", 140671: "山西朔州经济开发区", 140681: "怀仁市", 140702: "榆次区", 140703: "太谷区", 140721: "榆社县", 140722: "左权县", 140723: "和顺县", 140724: "昔阳县", 140725: "寿阳县", 140727: "祁县", 140728: "平遥县", 140729: "灵石县", 140781: "介休市", 140802: "盐湖区", 140821: "临猗县", 140822: "万荣县", 140823: "闻喜县", 140824: "稷山县", 140825: "新绛县", 140826: "绛县", 140827: "垣曲县", 140828: "夏县", 140829: "平陆县", 140830: "芮城县", 140881: "永济市", 140882: "河津市", 140902: "忻府区", 140921: "定襄县", 140922: "五台县", 140923: "代县", 140924: "繁峙县", 140925: "宁武县", 140926: "静乐县", 140927: "神池县", 140928: "五寨县", 140929: "岢岚县", 140930: "河曲县", 140931: "保德县", 140932: "偏关县", 140971: "五台山风景名胜区", 140981: "原平市", 141002: "尧都区", 141021: "曲沃县", 141022: "翼城县", 141023: "襄汾县", 141024: "洪洞县", 141025: "古县", 141026: "安泽县", 141027: "浮山县", 141028: "吉县", 141029: "乡宁县", 141030: "大宁县", 141031: "隰县", 141032: "永和县", 141033: "蒲县", 141034: "汾西县", 141081: "侯马市", 141082: "霍州市", 141102: "离石区", 141121: "文水县", 141122: "交城县", 141123: "兴县", 141124: "临县", 141125: "柳林县", 141126: "石楼县", 141127: "岚县", 141128: "方山县", 141129: "中阳县", 141130: "交口县", 141181: "孝义市", 141182: "汾阳市", 150102: "新城区", 150103: "回民区", 150104: "玉泉区", 150105: "赛罕区", 150121: "土默特左旗", 150122: "托克托县", 150123: "和林格尔县", 150124: "清水河县", 150125: "武川县", 150172: "呼和浩特经济技术开发区", 150202: "东河区", 150203: "昆都仑区", 150204: "青山区", 150205: "石拐区", 150206: "白云鄂博矿区", 150207: "九原区", 150221: "土默特右旗", 150222: "固阳县", 150223: "达尔罕茂明安联合旗", 150271: "包头稀土高新技术产业开发区", 150302: "海勃湾区", 150303: "海南区", 150304: "乌达区", 150402: "红山区", 150403: "元宝山区", 150404: "松山区", 150421: "阿鲁科尔沁旗", 150422: "巴林左旗", 150423: "巴林右旗", 150424: "林西县", 150425: "克什克腾旗", 150426: "翁牛特旗", 150428: "喀喇沁旗", 150429: "宁城县", 150430: "敖汉旗", 150502: "科尔沁区", 150521: "科尔沁左翼中旗", 150522: "科尔沁左翼后旗", 150523: "开鲁县", 150524: "库伦旗", 150525: "奈曼旗", 150526: "扎鲁特旗", 150571: "通辽经济技术开发区", 150581: "霍林郭勒市", 150602: "东胜区", 150603: "康巴什区", 150621: "达拉特旗", 150622: "准格尔旗", 150623: "鄂托克前旗", 150624: "鄂托克旗", 150625: "杭锦旗", 150626: "乌审旗", 150627: "伊金霍洛旗", 150702: "海拉尔区", 150703: "扎赉诺尔区", 150721: "阿荣旗", 150722: "莫力达瓦达斡尔族自治旗", 150723: "鄂伦春自治旗", 150724: "鄂温克族自治旗", 150725: "陈巴尔虎旗", 150726: "新巴尔虎左旗", 150727: "新巴尔虎右旗", 150781: "满洲里市", 150782: "牙克石市", 150783: "扎兰屯市", 150784: "额尔古纳市", 150785: "根河市", 150802: "临河区", 150821: "五原县", 150822: "磴口县", 150823: "乌拉特前旗", 150824: "乌拉特中旗", 150825: "乌拉特后旗", 150826: "杭锦后旗", 150902: "集宁区", 150921: "卓资县", 150922: "化德县", 150923: "商都县", 150924: "兴和县", 150925: "凉城县", 150926: "察哈尔右翼前旗", 150927: "察哈尔右翼中旗", 150928: "察哈尔右翼后旗", 150929: "四子王旗", 150981: "丰镇市", 152201: "乌兰浩特市", 152202: "阿尔山市", 152221: "科尔沁右翼前旗", 152222: "科尔沁右翼中旗", 152223: "扎赉特旗", 152224: "突泉县", 152501: "二连浩特市", 152502: "锡林浩特市", 152522: "阿巴嘎旗", 152523: "苏尼特左旗", 152524: "苏尼特右旗", 152525: "东乌珠穆沁旗", 152526: "西乌珠穆沁旗", 152527: "太仆寺旗", 152528: "镶黄旗", 152529: "正镶白旗", 152530: "正蓝旗", 152531: "多伦县", 152571: "乌拉盖管委会", 152921: "阿拉善左旗", 152922: "阿拉善右旗", 152923: "额济纳旗", 152971: "内蒙古阿拉善经济开发区", 210102: "和平区", 210103: "沈河区", 210104: "大东区", 210105: "皇姑区", 210106: "铁西区", 210111: "苏家屯区", 210112: "浑南区", 210113: "沈北新区", 210114: "于洪区", 210115: "辽中区", 210123: "康平县", 210124: "法库县", 210181: "新民市", 210190: "经济技术开发区", 210202: "中山区", 210203: "西岗区", 210204: "沙河口区", 210211: "甘井子区", 210212: "旅顺口区", 210213: "金州区", 210214: "普兰店区", 210224: "长海县", 210281: "瓦房店市", 210283: "庄河市", 210302: "铁东区", 210303: "铁西区", 210304: "立山区", 210311: "千山区", 210321: "台安县", 210323: "岫岩满族自治县", 210381: "海城市", 210390: "高新区", 210402: "新抚区", 210403: "东洲区", 210404: "望花区", 210411: "顺城区", 210421: "抚顺县", 210422: "新宾满族自治县", 210423: "清原满族自治县", 210502: "平山区", 210503: "溪湖区", 210504: "明山区", 210505: "南芬区", 210521: "本溪满族自治县", 210522: "桓仁满族自治县", 210602: "元宝区", 210603: "振兴区", 210604: "振安区", 210624: "宽甸满族自治县", 210681: "东港市", 210682: "凤城市", 210702: "古塔区", 210703: "凌河区", 210711: "太和区", 210726: "黑山县", 210727: "义县", 210781: "凌海市", 210782: "北镇市", 210793: "经济技术开发区", 210802: "站前区", 210803: "西市区", 210804: "鲅鱼圈区", 210811: "老边区", 210881: "盖州市", 210882: "大石桥市", 210902: "海州区", 210903: "新邱区", 210904: "太平区", 210905: "清河门区", 210911: "细河区", 210921: "阜新蒙古族自治县", 210922: "彰武县", 211002: "白塔区", 211003: "文圣区", 211004: "宏伟区", 211005: "弓长岭区", 211011: "太子河区", 211021: "辽阳县", 211081: "灯塔市", 211102: "双台子区", 211103: "兴隆台区", 211104: "大洼区", 211122: "盘山县", 211202: "银州区", 211204: "清河区", 211221: "铁岭县", 211223: "西丰县", 211224: "昌图县", 211281: "调兵山市", 211282: "开原市", 211302: "双塔区", 211303: "龙城区", 211321: "朝阳县", 211322: "建平县", 211324: "喀喇沁左翼蒙古族自治县", 211381: "北票市", 211382: "凌源市", 211402: "连山区", 211403: "龙港区", 211404: "南票区", 211421: "绥中县", 211422: "建昌县", 211481: "兴城市", 220102: "南关区", 220103: "宽城区", 220104: "朝阳区", 220105: "二道区", 220106: "绿园区", 220112: "双阳区", 220113: "九台区", 220122: "农安县", 220171: "长春经济技术开发区", 220172: "长春净月高新技术产业开发区", 220173: "长春高新技术产业开发区", 220174: "长春汽车经济技术开发区", 220182: "榆树市", 220183: "德惠市", 220184: "公主岭市", 220192: "经济技术开发区", 220202: "昌邑区", 220203: "龙潭区", 220204: "船营区", 220211: "丰满区", 220221: "永吉县", 220271: "吉林经济开发区", 220272: "吉林高新技术产业开发区", 220281: "蛟河市", 220282: "桦甸市", 220283: "舒兰市", 220284: "磐石市", 220302: "铁西区", 220303: "铁东区", 220322: "梨树县", 220323: "伊通满族自治县", 220382: "双辽市", 220402: "龙山区", 220403: "西安区", 220421: "东丰县", 220422: "东辽县", 220502: "东昌区", 220503: "二道江区", 220521: "通化县", 220523: "辉南县", 220524: "柳河县", 220581: "梅河口市", 220582: "集安市", 220602: "浑江区", 220605: "江源区", 220621: "抚松县", 220622: "靖宇县", 220623: "长白朝鲜族自治县", 220681: "临江市", 220702: "宁江区", 220721: "前郭尔罗斯蒙古族自治县", 220722: "长岭县", 220723: "乾安县", 220771: "吉林松原经济开发区", 220781: "扶余市", 220802: "洮北区", 220821: "镇赉县", 220822: "通榆县", 220871: "吉林白城经济开发区", 220881: "洮南市", 220882: "大安市", 222401: "延吉市", 222402: "图们市", 222403: "敦化市", 222404: "珲春市", 222405: "龙井市", 222406: "和龙市", 222424: "汪清县", 222426: "安图县", 230102: "道里区", 230103: "南岗区", 230104: "道外区", 230108: "平房区", 230109: "松北区", 230110: "香坊区", 230111: "呼兰区", 230112: "阿城区", 230113: "双城区", 230123: "依兰县", 230124: "方正县", 230125: "宾县", 230126: "巴彦县", 230127: "木兰县", 230128: "通河县", 230129: "延寿县", 230183: "尚志市", 230184: "五常市", 230202: "龙沙区", 230203: "建华区", 230204: "铁锋区", 230205: "昂昂溪区", 230206: "富拉尔基区", 230207: "碾子山区", 230208: "梅里斯达斡尔族区", 230221: "龙江县", 230223: "依安县", 230224: "泰来县", 230225: "甘南县", 230227: "富裕县", 230229: "克山县", 230230: "克东县", 230231: "拜泉县", 230281: "讷河市", 230302: "鸡冠区", 230303: "恒山区", 230304: "滴道区", 230305: "梨树区", 230306: "城子河区", 230307: "麻山区", 230321: "鸡东县", 230381: "虎林市", 230382: "密山市", 230402: "向阳区", 230403: "工农区", 230404: "南山区", 230405: "兴安区", 230406: "东山区", 230407: "兴山区", 230421: "萝北县", 230422: "绥滨县", 230502: "尖山区", 230503: "岭东区", 230505: "四方台区", 230506: "宝山区", 230521: "集贤县", 230522: "友谊县", 230523: "宝清县", 230524: "饶河县", 230602: "萨尔图区", 230603: "龙凤区", 230604: "让胡路区", 230605: "红岗区", 230606: "大同区", 230621: "肇州县", 230622: "肇源县", 230623: "林甸县", 230624: "杜尔伯特蒙古族自治县", 230671: "大庆高新技术产业开发区", 230717: "伊美区", 230718: "乌翠区", 230719: "友好区", 230722: "嘉荫县", 230723: "汤旺县", 230724: "丰林县", 230725: "大箐山县", 230726: "南岔县", 230751: "金林区", 230781: "铁力市", 230803: "向阳区", 230804: "前进区", 230805: "东风区", 230811: "郊区", 230822: "桦南县", 230826: "桦川县", 230828: "汤原县", 230881: "同江市", 230882: "富锦市", 230883: "抚远市", 230902: "新兴区", 230903: "桃山区", 230904: "茄子河区", 230921: "勃利县", 231002: "东安区", 231003: "阳明区", 231004: "爱民区", 231005: "西安区", 231025: "林口县", 231081: "绥芬河市", 231083: "海林市", 231084: "宁安市", 231085: "穆棱市", 231086: "东宁市", 231102: "爱辉区", 231123: "逊克县", 231124: "孙吴县", 231181: "北安市", 231182: "五大连池市", 231183: "嫩江市", 231202: "北林区", 231221: "望奎县", 231222: "兰西县", 231223: "青冈县", 231224: "庆安县", 231225: "明水县", 231226: "绥棱县", 231281: "安达市", 231282: "肇东市", 231283: "海伦市", 232701: "漠河市", 232721: "呼玛县", 232722: "塔河县", 232761: "加格达奇区", 232762: "松岭区", 232763: "新林区", 232764: "呼中区", 310101: "黄浦区", 310104: "徐汇区", 310105: "长宁区", 310106: "静安区", 310107: "普陀区", 310109: "虹口区", 310110: "杨浦区", 310112: "闵行区", 310113: "宝山区", 310114: "嘉定区", 310115: "浦东新区", 310116: "金山区", 310117: "松江区", 310118: "青浦区", 310120: "奉贤区", 310151: "崇明区", 320102: "玄武区", 320104: "秦淮区", 320105: "建邺区", 320106: "鼓楼区", 320111: "浦口区", 320112: "江北新区", 320113: "栖霞区", 320114: "雨花台区", 320115: "江宁区", 320116: "六合区", 320117: "溧水区", 320118: "高淳区", 320205: "锡山区", 320206: "惠山区", 320211: "滨湖区", 320213: "梁溪区", 320214: "新吴区", 320281: "江阴市", 320282: "宜兴市", 320302: "鼓楼区", 320303: "云龙区", 320305: "贾汪区", 320311: "泉山区", 320312: "铜山区", 320321: "丰县", 320322: "沛县", 320324: "睢宁县", 320371: "徐州经济技术开发区", 320381: "新沂市", 320382: "邳州市", 320391: "工业园区", 320402: "天宁区", 320404: "钟楼区", 320411: "新北区", 320412: "武进区", 320413: "金坛区", 320481: "溧阳市", 320505: "虎丘区", 320506: "吴中区", 320507: "相城区", 320508: "姑苏区", 320509: "吴江区", 320571: "苏州工业园区", 320581: "常熟市", 320582: "张家港市", 320583: "昆山市", 320585: "太仓市", 320590: "工业园区", 320591: "高新区", 320611: "港闸区", 320612: "通州区", 320613: "崇川区", 320614: "海门区", 320623: "如东县", 320681: "启东市", 320682: "如皋市", 320685: "海安市", 320691: "高新区", 320703: "连云区", 320706: "海州区", 320707: "赣榆区", 320722: "东海县", 320723: "灌云县", 320724: "灌南县", 320771: "连云港经济技术开发区", 320803: "淮安区", 320804: "淮阴区", 320812: "清江浦区", 320813: "洪泽区", 320826: "涟水县", 320830: "盱眙县", 320831: "金湖县", 320871: "淮安经济技术开发区", 320890: "经济开发区", 320902: "亭湖区", 320903: "盐都区", 320904: "大丰区", 320921: "响水县", 320922: "滨海县", 320923: "阜宁县", 320924: "射阳县", 320925: "建湖县", 320971: "盐城经济技术开发区", 320981: "东台市", 321002: "广陵区", 321003: "邗江区", 321012: "江都区", 321023: "宝应县", 321071: "扬州经济技术开发区", 321081: "仪征市", 321084: "高邮市", 321090: "经济开发区", 321102: "京口区", 321111: "润州区", 321112: "丹徒区", 321150: "镇江新区", 321181: "丹阳市", 321182: "扬中市", 321183: "句容市", 321202: "海陵区", 321203: "高港区", 321204: "姜堰区", 321271: "泰州医药高新技术产业开发区", 321281: "兴化市", 321282: "靖江市", 321283: "泰兴市", 321302: "宿城区", 321311: "宿豫区", 321322: "沭阳县", 321323: "泗阳县", 321324: "泗洪县", 321371: "宿迁经济技术开发区", 330102: "上城区", 330105: "拱墅区", 330106: "西湖区", 330108: "滨江区", 330109: "萧山区", 330110: "余杭区", 330111: "富阳区", 330112: "临安区", 330113: "临平区", 330114: "钱塘区", 330122: "桐庐县", 330127: "淳安县", 330182: "建德市", 330203: "海曙区", 330205: "江北区", 330206: "北仑区", 330211: "镇海区", 330212: "鄞州区", 330213: "奉化区", 330225: "象山县", 330226: "宁海县", 330281: "余姚市", 330282: "慈溪市", 330302: "鹿城区", 330303: "龙湾区", 330304: "瓯海区", 330305: "洞头区", 330324: "永嘉县", 330326: "平阳县", 330327: "苍南县", 330328: "文成县", 330329: "泰顺县", 330381: "瑞安市", 330382: "乐清市", 330383: "龙港市", 330402: "南湖区", 330411: "秀洲区", 330421: "嘉善县", 330424: "海盐县", 330481: "海宁市", 330482: "平湖市", 330483: "桐乡市", 330502: "吴兴区", 330503: "南浔区", 330521: "德清县", 330522: "长兴县", 330523: "安吉县", 330602: "越城区", 330603: "柯桥区", 330604: "上虞区", 330624: "新昌县", 330681: "诸暨市", 330683: "嵊州市", 330702: "婺城区", 330703: "金东区", 330723: "武义县", 330726: "浦江县", 330727: "磐安县", 330781: "兰溪市", 330782: "义乌市", 330783: "东阳市", 330784: "永康市", 330802: "柯城区", 330803: "衢江区", 330822: "常山县", 330824: "开化县", 330825: "龙游县", 330881: "江山市", 330902: "定海区", 330903: "普陀区", 330921: "岱山县", 330922: "嵊泗县", 331002: "椒江区", 331003: "黄岩区", 331004: "路桥区", 331022: "三门县", 331023: "天台县", 331024: "仙居县", 331081: "温岭市", 331082: "临海市", 331083: "玉环市", 331102: "莲都区", 331121: "青田县", 331122: "缙云县", 331123: "遂昌县", 331124: "松阳县", 331125: "云和县", 331126: "庆元县", 331127: "景宁畲族自治县", 331181: "龙泉市", 340102: "瑶海区", 340103: "庐阳区", 340104: "蜀山区", 340111: "包河区", 340121: "长丰县", 340122: "肥东县", 340123: "肥西县", 340124: "庐江县", 340171: "合肥高新技术产业开发区", 340172: "合肥经济技术开发区", 340173: "合肥新站高新技术产业开发区", 340181: "巢湖市", 340190: "高新技术开发区", 340191: "经济技术开发区", 340202: "镜湖区", 340207: "鸠江区", 340209: "弋江区", 340210: "湾沚区", 340212: "繁昌区", 340223: "南陵县", 340281: "无为市", 340302: "龙子湖区", 340303: "蚌山区", 340304: "禹会区", 340311: "淮上区", 340321: "怀远县", 340322: "五河县", 340323: "固镇县", 340371: "蚌埠市高新技术开发区", 340372: "蚌埠市经济开发区", 340402: "大通区", 340403: "田家庵区", 340404: "谢家集区", 340405: "八公山区", 340406: "潘集区", 340421: "凤台县", 340422: "寿县", 340503: "花山区", 340504: "雨山区", 340506: "博望区", 340521: "当涂县", 340522: "含山县", 340523: "和县", 340602: "杜集区", 340603: "相山区", 340604: "烈山区", 340621: "濉溪县", 340705: "铜官区", 340706: "义安区", 340711: "郊区", 340722: "枞阳县", 340802: "迎江区", 340803: "大观区", 340811: "宜秀区", 340822: "怀宁县", 340825: "太湖县", 340826: "宿松县", 340827: "望江县", 340828: "岳西县", 340881: "桐城市", 340882: "潜山市", 341002: "屯溪区", 341003: "黄山区", 341004: "徽州区", 341021: "歙县", 341022: "休宁县", 341023: "黟县", 341024: "祁门县", 341102: "琅琊区", 341103: "南谯区", 341122: "来安县", 341124: "全椒县", 341125: "定远县", 341126: "凤阳县", 341181: "天长市", 341182: "明光市", 341202: "颍州区", 341203: "颍东区", 341204: "颍泉区", 341221: "临泉县", 341222: "太和县", 341225: "阜南县", 341226: "颍上县", 341271: "阜阳合肥现代产业园区", 341282: "界首市", 341302: "埇桥区", 341321: "砀山县", 341322: "萧县", 341323: "灵璧县", 341324: "泗县", 341371: "宿州马鞍山现代产业园区", 341372: "宿州经济技术开发区", 341390: "经济开发区", 341502: "金安区", 341503: "裕安区", 341504: "叶集区", 341522: "霍邱县", 341523: "舒城县", 341524: "金寨县", 341525: "霍山县", 341602: "谯城区", 341621: "涡阳县", 341622: "蒙城县", 341623: "利辛县", 341702: "贵池区", 341721: "东至县", 341722: "石台县", 341723: "青阳县", 341802: "宣州区", 341821: "郎溪县", 341823: "泾县", 341824: "绩溪县", 341825: "旌德县", 341871: "宣城市经济开发区", 341881: "宁国市", 341882: "广德市", 350102: "鼓楼区", 350103: "台江区", 350104: "仓山区", 350105: "马尾区", 350111: "晋安区", 350112: "长乐区", 350121: "闽侯县", 350122: "连江县", 350123: "罗源县", 350124: "闽清县", 350125: "永泰县", 350128: "平潭县", 350181: "福清市", 350203: "思明区", 350205: "海沧区", 350206: "湖里区", 350211: "集美区", 350212: "同安区", 350213: "翔安区", 350302: "城厢区", 350303: "涵江区", 350304: "荔城区", 350305: "秀屿区", 350322: "仙游县", 350402: "梅列区", 350404: "三元区", 350405: "沙县区", 350421: "明溪县", 350423: "清流县", 350424: "宁化县", 350425: "大田县", 350426: "尤溪县", 350428: "将乐县", 350429: "泰宁县", 350430: "建宁县", 350481: "永安市", 350502: "鲤城区", 350503: "丰泽区", 350504: "洛江区", 350505: "泉港区", 350521: "惠安县", 350524: "安溪县", 350525: "永春县", 350526: "德化县", 350527: "金门县", 350581: "石狮市", 350582: "晋江市", 350583: "南安市", 350602: "芗城区", 350603: "龙文区", 350604: "龙海区", 350605: "长泰区", 350622: "云霄县", 350623: "漳浦县", 350624: "诏安县", 350626: "东山县", 350627: "南靖县", 350628: "平和县", 350629: "华安县", 350702: "延平区", 350703: "建阳区", 350721: "顺昌县", 350722: "浦城县", 350723: "光泽县", 350724: "松溪县", 350725: "政和县", 350781: "邵武市", 350782: "武夷山市", 350783: "建瓯市", 350802: "新罗区", 350803: "永定区", 350821: "长汀县", 350823: "上杭县", 350824: "武平县", 350825: "连城县", 350881: "漳平市", 350902: "蕉城区", 350921: "霞浦县", 350922: "古田县", 350923: "屏南县", 350924: "寿宁县", 350925: "周宁县", 350926: "柘荣县", 350981: "福安市", 350982: "福鼎市", 360102: "东湖区", 360103: "西湖区", 360104: "青云谱区", 360111: "青山湖区", 360112: "新建区", 360113: "红谷滩区", 360121: "南昌县", 360123: "安义县", 360124: "进贤县", 360190: "经济技术开发区", 360192: "高新区", 360202: "昌江区", 360203: "珠山区", 360222: "浮梁县", 360281: "乐平市", 360302: "安源区", 360313: "湘东区", 360321: "莲花县", 360322: "上栗县", 360323: "芦溪县", 360402: "濂溪区", 360403: "浔阳区", 360404: "柴桑区", 360423: "武宁县", 360424: "修水县", 360425: "永修县", 360426: "德安县", 360428: "都昌县", 360429: "湖口县", 360430: "彭泽县", 360481: "瑞昌市", 360482: "共青城市", 360483: "庐山市", 360490: "经济技术开发区", 360502: "渝水区", 360521: "分宜县", 360602: "月湖区", 360603: "余江区", 360681: "贵溪市", 360702: "章贡区", 360703: "南康区", 360704: "赣县区", 360722: "信丰县", 360723: "大余县", 360724: "上犹县", 360725: "崇义县", 360726: "安远县", 360728: "定南县", 360729: "全南县", 360730: "宁都县", 360731: "于都县", 360732: "兴国县", 360733: "会昌县", 360734: "寻乌县", 360735: "石城县", 360781: "瑞金市", 360783: "龙南市", 360802: "吉州区", 360803: "青原区", 360821: "吉安县", 360822: "吉水县", 360823: "峡江县", 360824: "新干县", 360825: "永丰县", 360826: "泰和县", 360827: "遂川县", 360828: "万安县", 360829: "安福县", 360830: "永新县", 360881: "井冈山市", 360902: "袁州区", 360921: "奉新县", 360922: "万载县", 360923: "上高县", 360924: "宜丰县", 360925: "靖安县", 360926: "铜鼓县", 360981: "丰城市", 360982: "樟树市", 360983: "高安市", 361002: "临川区", 361003: "东乡区", 361021: "南城县", 361022: "黎川县", 361023: "南丰县", 361024: "崇仁县", 361025: "乐安县", 361026: "宜黄县", 361027: "金溪县", 361028: "资溪县", 361030: "广昌县", 361102: "信州区", 361103: "广丰区", 361104: "广信区", 361123: "玉山县", 361124: "铅山县", 361125: "横峰县", 361126: "弋阳县", 361127: "余干县", 361128: "鄱阳县", 361129: "万年县", 361130: "婺源县", 361181: "德兴市", 370102: "历下区", 370103: "市中区", 370104: "槐荫区", 370105: "天桥区", 370112: "历城区", 370113: "长清区", 370114: "章丘区", 370115: "济阳区", 370116: "莱芜区", 370117: "钢城区", 370124: "平阴县", 370126: "商河县", 370171: "济南高新技术产业开发区", 370190: "高新区", 370202: "市南区", 370203: "市北区", 370211: "黄岛区", 370212: "崂山区", 370213: "李沧区", 370214: "城阳区", 370215: "即墨区", 370271: "青岛高新技术产业开发区", 370281: "胶州市", 370283: "平度市", 370285: "莱西市", 370290: "开发区", 370302: "淄川区", 370303: "张店区", 370304: "博山区", 370305: "临淄区", 370306: "周村区", 370321: "桓台县", 370322: "高青县", 370323: "沂源县", 370402: "市中区", 370403: "薛城区", 370404: "峄城区", 370405: "台儿庄区", 370406: "山亭区", 370481: "滕州市", 370502: "东营区", 370503: "河口区", 370505: "垦利区", 370522: "利津县", 370523: "广饶县", 370571: "东营经济技术开发区", 370572: "东营港经济开发区", 370602: "芝罘区", 370611: "福山区", 370612: "牟平区", 370613: "莱山区", 370614: "蓬莱区", 370634: "长岛县", 370671: "烟台高新技术产业开发区", 370672: "烟台经济技术开发区", 370681: "龙口市", 370682: "莱阳市", 370683: "莱州市", 370685: "招远市", 370686: "栖霞市", 370687: "海阳市", 370690: "开发区", 370702: "潍城区", 370703: "寒亭区", 370704: "坊子区", 370705: "奎文区", 370724: "临朐县", 370725: "昌乐县", 370772: "潍坊滨海经济技术开发区", 370781: "青州市", 370782: "诸城市", 370783: "寿光市", 370784: "安丘市", 370785: "高密市", 370786: "昌邑市", 370790: "开发区", 370791: "高新区", 370811: "任城区", 370812: "兖州区", 370826: "微山县", 370827: "鱼台县", 370828: "金乡县", 370829: "嘉祥县", 370830: "汶上县", 370831: "泗水县", 370832: "梁山县", 370871: "济宁高新技术产业开发区", 370881: "曲阜市", 370883: "邹城市", 370890: "高新区", 370902: "泰山区", 370911: "岱岳区", 370921: "宁阳县", 370923: "东平县", 370982: "新泰市", 370983: "肥城市", 371002: "环翠区", 371003: "文登区", 371071: "威海火炬高技术产业开发区", 371072: "威海经济技术开发区", 371082: "荣成市", 371083: "乳山市", 371091: "经济技术开发区", 371102: "东港区", 371103: "岚山区", 371121: "五莲县", 371122: "莒县", 371171: "日照经济技术开发区", 371302: "兰山区", 371311: "罗庄区", 371312: "河东区", 371321: "沂南县", 371322: "郯城县", 371323: "沂水县", 371324: "兰陵县", 371325: "费县", 371326: "平邑县", 371327: "莒南县", 371328: "蒙阴县", 371329: "临沭县", 371371: "临沂高新技术产业开发区", 371402: "德城区", 371403: "陵城区", 371422: "宁津县", 371423: "庆云县", 371424: "临邑县", 371425: "齐河县", 371426: "平原县", 371427: "夏津县", 371428: "武城县", 371472: "德州运河经济开发区", 371481: "乐陵市", 371482: "禹城市", 371502: "东昌府区", 371503: "茌平区", 371521: "阳谷县", 371522: "莘县", 371524: "东阿县", 371525: "冠县", 371526: "高唐县", 371581: "临清市", 371602: "滨城区", 371603: "沾化区", 371621: "惠民县", 371622: "阳信县", 371623: "无棣县", 371625: "博兴县", 371681: "邹平市", 371702: "牡丹区", 371703: "定陶区", 371721: "曹县", 371722: "单县", 371723: "成武县", 371724: "巨野县", 371725: "郓城县", 371726: "鄄城县", 371728: "东明县", 371771: "菏泽经济技术开发区", 371772: "菏泽高新技术开发区", 410102: "中原区", 410103: "二七区", 410104: "管城回族区", 410105: "金水区", 410106: "上街区", 410108: "惠济区", 410122: "中牟县", 410171: "郑州经济技术开发区", 410172: "郑州高新技术产业开发区", 410173: "郑州航空港经济综合实验区", 410181: "巩义市", 410182: "荥阳市", 410183: "新密市", 410184: "新郑市", 410185: "登封市", 410190: "高新技术开发区", 410191: "经济技术开发区", 410202: "龙亭区", 410203: "顺河回族区", 410204: "鼓楼区", 410205: "禹王台区", 410212: "祥符区", 410221: "杞县", 410222: "通许县", 410223: "尉氏县", 410225: "兰考县", 410302: "老城区", 410303: "西工区", 410304: "瀍河回族区", 410305: "涧西区", 410307: "偃师区", 410308: "孟津区", 410311: "洛龙区", 410323: "新安县", 410324: "栾川县", 410325: "嵩县", 410326: "汝阳县", 410327: "宜阳县", 410328: "洛宁县", 410329: "伊川县", 410402: "新华区", 410403: "卫东区", 410404: "石龙区", 410411: "湛河区", 410421: "宝丰县", 410422: "叶县", 410423: "鲁山县", 410425: "郏县", 410471: "平顶山高新技术产业开发区", 410481: "舞钢市", 410482: "汝州市", 410502: "文峰区", 410503: "北关区", 410505: "殷都区", 410506: "龙安区", 410522: "安阳县", 410523: "汤阴县", 410526: "滑县", 410527: "内黄县", 410581: "林州市", 410590: "开发区", 410602: "鹤山区", 410603: "山城区", 410611: "淇滨区", 410621: "浚县", 410622: "淇县", 410702: "红旗区", 410703: "卫滨区", 410704: "凤泉区", 410711: "牧野区", 410721: "新乡县", 410724: "获嘉县", 410725: "原阳县", 410726: "延津县", 410727: "封丘县", 410771: "新乡高新技术产业开发区", 410772: "新乡经济技术开发区", 410781: "卫辉市", 410782: "辉县市", 410783: "长垣市", 410802: "解放区", 410803: "中站区", 410804: "马村区", 410811: "山阳区", 410821: "修武县", 410822: "博爱县", 410823: "武陟县", 410825: "温县", 410871: "焦作城乡一体化示范区", 410882: "沁阳市", 410883: "孟州市", 410902: "华龙区", 410922: "清丰县", 410923: "南乐县", 410926: "范县", 410927: "台前县", 410928: "濮阳县", 410971: "河南濮阳工业园区", 411002: "魏都区", 411003: "建安区", 411024: "鄢陵县", 411025: "襄城县", 411071: "许昌经济技术开发区", 411081: "禹州市", 411082: "长葛市", 411102: "源汇区", 411103: "郾城区", 411104: "召陵区", 411121: "舞阳县", 411122: "临颍县", 411171: "漯河经济技术开发区", 411202: "湖滨区", 411203: "陕州区", 411221: "渑池县", 411224: "卢氏县", 411271: "河南三门峡经济开发区", 411281: "义马市", 411282: "灵宝市", 411302: "宛城区", 411303: "卧龙区", 411321: "南召县", 411322: "方城县", 411323: "西峡县", 411324: "镇平县", 411325: "内乡县", 411326: "淅川县", 411327: "社旗县", 411328: "唐河县", 411329: "新野县", 411330: "桐柏县", 411372: "南阳市城乡一体化示范区", 411381: "邓州市", 411402: "梁园区", 411403: "睢阳区", 411421: "民权县", 411422: "睢县", 411423: "宁陵县", 411424: "柘城县", 411425: "虞城县", 411426: "夏邑县", 411481: "永城市", 411502: "浉河区", 411503: "平桥区", 411521: "罗山县", 411522: "光山县", 411523: "新县", 411524: "商城县", 411525: "固始县", 411526: "潢川县", 411527: "淮滨县", 411528: "息县", 411602: "川汇区", 411603: "淮阳区", 411621: "扶沟县", 411622: "西华县", 411623: "商水县", 411624: "沈丘县", 411625: "郸城县", 411627: "太康县", 411628: "鹿邑县", 411671: "河南周口经济开发区", 411681: "项城市", 411690: "经济开发区", 411702: "驿城区", 411721: "西平县", 411722: "上蔡县", 411723: "平舆县", 411724: "正阳县", 411725: "确山县", 411726: "泌阳县", 411727: "汝南县", 411728: "遂平县", 411729: "新蔡县", 419001: "济源市", 420102: "江岸区", 420103: "江汉区", 420104: "硚口区", 420105: "汉阳区", 420106: "武昌区", 420107: "青山区", 420111: "洪山区", 420112: "东西湖区", 420113: "汉南区", 420114: "蔡甸区", 420115: "江夏区", 420116: "黄陂区", 420117: "新洲区", 420202: "黄石港区", 420203: "西塞山区", 420204: "下陆区", 420205: "铁山区", 420222: "阳新县", 420281: "大冶市", 420302: "茅箭区", 420303: "张湾区", 420304: "郧阳区", 420322: "郧西县", 420323: "竹山县", 420324: "竹溪县", 420325: "房县", 420381: "丹江口市", 420502: "西陵区", 420503: "伍家岗区", 420504: "点军区", 420505: "猇亭区", 420506: "夷陵区", 420525: "远安县", 420526: "兴山县", 420527: "秭归县", 420528: "长阳土家族自治县", 420529: "五峰土家族自治县", 420581: "宜都市", 420582: "当阳市", 420583: "枝江市", 420590: "经济开发区", 420602: "襄城区", 420606: "樊城区", 420607: "襄州区", 420624: "南漳县", 420625: "谷城县", 420626: "保康县", 420682: "老河口市", 420683: "枣阳市", 420684: "宜城市", 420702: "梁子湖区", 420703: "华容区", 420704: "鄂城区", 420802: "东宝区", 420804: "掇刀区", 420822: "沙洋县", 420881: "钟祥市", 420882: "京山市", 420902: "孝南区", 420921: "孝昌县", 420922: "大悟县", 420923: "云梦县", 420981: "应城市", 420982: "安陆市", 420984: "汉川市", 421002: "沙市区", 421003: "荆州区", 421022: "公安县", 421024: "江陵县", 421081: "石首市", 421083: "洪湖市", 421087: "松滋市", 421088: "监利市", 421102: "黄州区", 421121: "团风县", 421122: "红安县", 421123: "罗田县", 421124: "英山县", 421125: "浠水县", 421126: "蕲春县", 421127: "黄梅县", 421171: "龙感湖管理区", 421181: "麻城市", 421182: "武穴市", 421202: "咸安区", 421221: "嘉鱼县", 421222: "通城县", 421223: "崇阳县", 421224: "通山县", 421281: "赤壁市", 421303: "曾都区", 421321: "随县", 421381: "广水市", 422801: "恩施市", 422802: "利川市", 422822: "建始县", 422823: "巴东县", 422825: "宣恩县", 422826: "咸丰县", 422827: "来凤县", 422828: "鹤峰县", 429004: "仙桃市", 429005: "潜江市", 429006: "天门市", 429021: "神农架林区", 430102: "芙蓉区", 430103: "天心区", 430104: "岳麓区", 430105: "开福区", 430111: "雨花区", 430112: "望城区", 430121: "长沙县", 430181: "浏阳市", 430182: "宁乡市", 430202: "荷塘区", 430203: "芦淞区", 430204: "石峰区", 430211: "天元区", 430212: "渌口区", 430223: "攸县", 430224: "茶陵县", 430225: "炎陵县", 430271: "云龙示范区", 430281: "醴陵市", 430302: "雨湖区", 430304: "岳塘区", 430321: "湘潭县", 430373: "湘潭九华示范区", 430381: "湘乡市", 430382: "韶山市", 430405: "珠晖区", 430406: "雁峰区", 430407: "石鼓区", 430408: "蒸湘区", 430412: "南岳区", 430421: "衡阳县", 430422: "衡南县", 430423: "衡山县", 430424: "衡东县", 430426: "祁东县", 430481: "耒阳市", 430482: "常宁市", 430502: "双清区", 430503: "大祥区", 430511: "北塔区", 430522: "新邵县", 430523: "邵阳县", 430524: "隆回县", 430525: "洞口县", 430527: "绥宁县", 430528: "新宁县", 430529: "城步苗族自治县", 430581: "武冈市", 430582: "邵东市", 430602: "岳阳楼区", 430603: "云溪区", 430611: "君山区", 430621: "岳阳县", 430623: "华容县", 430624: "湘阴县", 430626: "平江县", 430681: "汨罗市", 430682: "临湘市", 430702: "武陵区", 430703: "鼎城区", 430721: "安乡县", 430722: "汉寿县", 430723: "澧县", 430724: "临澧县", 430725: "桃源县", 430726: "石门县", 430781: "津市市", 430802: "永定区", 430811: "武陵源区", 430821: "慈利县", 430822: "桑植县", 430902: "资阳区", 430903: "赫山区", 430921: "南县", 430922: "桃江县", 430923: "安化县", 430971: "益阳市大通湖管理区", 430981: "沅江市", 431002: "北湖区", 431003: "苏仙区", 431021: "桂阳县", 431022: "宜章县", 431023: "永兴县", 431024: "嘉禾县", 431025: "临武县", 431026: "汝城县", 431027: "桂东县", 431028: "安仁县", 431081: "资兴市", 431102: "零陵区", 431103: "冷水滩区", 431122: "东安县", 431123: "双牌县", 431124: "道县", 431125: "江永县", 431126: "宁远县", 431127: "蓝山县", 431128: "新田县", 431129: "江华瑶族自治县", 431181: "祁阳市", 431202: "鹤城区", 431221: "中方县", 431222: "沅陵县", 431223: "辰溪县", 431224: "溆浦县", 431225: "会同县", 431226: "麻阳苗族自治县", 431227: "新晃侗族自治县", 431228: "芷江侗族自治县", 431229: "靖州苗族侗族自治县", 431230: "通道侗族自治县", 431271: "怀化市洪江管理区", 431281: "洪江市", 431302: "娄星区", 431321: "双峰县", 431322: "新化县", 431381: "冷水江市", 431382: "涟源市", 433101: "吉首市", 433122: "泸溪县", 433123: "凤凰县", 433124: "花垣县", 433125: "保靖县", 433126: "古丈县", 433127: "永顺县", 433130: "龙山县", 440103: "荔湾区", 440104: "越秀区", 440105: "海珠区", 440106: "天河区", 440111: "白云区", 440112: "黄埔区", 440113: "番禺区", 440114: "花都区", 440115: "南沙区", 440117: "从化区", 440118: "增城区", 440203: "武江区", 440204: "浈江区", 440205: "曲江区", 440222: "始兴县", 440224: "仁化县", 440229: "翁源县", 440232: "乳源瑶族自治县", 440233: "新丰县", 440281: "乐昌市", 440282: "南雄市", 440303: "罗湖区", 440304: "福田区", 440305: "南山区", 440306: "宝安区", 440307: "龙岗区", 440308: "盐田区", 440309: "龙华区", 440310: "坪山区", 440311: "光明区", 440402: "香洲区", 440403: "斗门区", 440404: "金湾区", 440507: "龙湖区", 440511: "金平区", 440512: "濠江区", 440513: "潮阳区", 440514: "潮南区", 440515: "澄海区", 440523: "南澳县", 440604: "禅城区", 440605: "南海区", 440606: "顺德区", 440607: "三水区", 440608: "高明区", 440703: "蓬江区", 440704: "江海区", 440705: "新会区", 440781: "台山市", 440783: "开平市", 440784: "鹤山市", 440785: "恩平市", 440802: "赤坎区", 440803: "霞山区", 440804: "坡头区", 440811: "麻章区", 440823: "遂溪县", 440825: "徐闻县", 440881: "廉江市", 440882: "雷州市", 440883: "吴川市", 440890: "经济技术开发区", 440902: "茂南区", 440904: "电白区", 440981: "高州市", 440982: "化州市", 440983: "信宜市", 441202: "端州区", 441203: "鼎湖区", 441204: "高要区", 441223: "广宁县", 441224: "怀集县", 441225: "封开县", 441226: "德庆县", 441284: "四会市", 441302: "惠城区", 441303: "惠阳区", 441322: "博罗县", 441323: "惠东县", 441324: "龙门县", 441402: "梅江区", 441403: "梅县区", 441422: "大埔县", 441423: "丰顺县", 441424: "五华县", 441426: "平远县", 441427: "蕉岭县", 441481: "兴宁市", 441502: "城区", 441521: "海丰县", 441523: "陆河县", 441581: "陆丰市", 441602: "源城区", 441621: "紫金县", 441622: "龙川县", 441623: "连平县", 441624: "和平县", 441625: "东源县", 441702: "江城区", 441704: "阳东区", 441721: "阳西县", 441781: "阳春市", 441802: "清城区", 441803: "清新区", 441821: "佛冈县", 441823: "阳山县", 441825: "连山壮族瑶族自治县", 441826: "连南瑶族自治县", 441881: "英德市", 441882: "连州市", 441901: "中堂镇", 441903: "南城街道", 441904: "长安镇", 441905: "东坑镇", 441906: "樟木头镇", 441907: "莞城街道", 441908: "石龙镇", 441909: "桥头镇", 441910: "万江街道", 441911: "麻涌镇", 441912: "虎门镇", 441913: "谢岗镇", 441914: "石碣镇", 441915: "茶山镇", 441916: "东城街道", 441917: "洪梅镇", 441918: "道滘镇", 441919: "高埗镇", 441920: "企石镇", 441921: "凤岗镇", 441922: "大岭山镇", 441923: "松山湖", 441924: "清溪镇", 441925: "望牛墩镇", 441926: "厚街镇", 441927: "常平镇", 441928: "寮步镇", 441929: "石排镇", 441930: "横沥镇", 441931: "塘厦镇", 441932: "黄江镇", 441933: "大朗镇", 441934: "东莞港", 441935: "东莞生态园", 441990: "沙田镇", 442001: "南头镇", 442002: "神湾镇", 442003: "东凤镇", 442004: "五桂山街道", 442005: "黄圃镇", 442006: "小榄镇", 442007: "石岐街道", 442008: "横栏镇", 442009: "三角镇", 442010: "三乡镇", 442011: "港口镇", 442012: "沙溪镇", 442013: "板芙镇", 442015: "东升镇", 442016: "阜沙镇", 442017: "民众镇", 442018: "东区街道", 442019: "火炬开发区街道办事处", 442020: "西区街道", 442021: "南区街道", 442022: "古镇镇", 442023: "坦洲镇", 442024: "大涌镇", 442025: "南朗镇", 445102: "湘桥区", 445103: "潮安区", 445122: "饶平县", 445202: "榕城区", 445203: "揭东区", 445222: "揭西县", 445224: "惠来县", 445281: "普宁市", 445302: "云城区", 445303: "云安区", 445321: "新兴县", 445322: "郁南县", 445381: "罗定市", 450102: "兴宁区", 450103: "青秀区", 450105: "江南区", 450107: "西乡塘区", 450108: "良庆区", 450109: "邕宁区", 450110: "武鸣区", 450123: "隆安县", 450124: "马山县", 450125: "上林县", 450126: "宾阳县", 450181: "横州市", 450202: "城中区", 450203: "鱼峰区", 450204: "柳南区", 450205: "柳北区", 450206: "柳江区", 450222: "柳城县", 450223: "鹿寨县", 450224: "融安县", 450225: "融水苗族自治县", 450226: "三江侗族自治县", 450302: "秀峰区", 450303: "叠彩区", 450304: "象山区", 450305: "七星区", 450311: "雁山区", 450312: "临桂区", 450321: "阳朔县", 450323: "灵川县", 450324: "全州县", 450325: "兴安县", 450326: "永福县", 450327: "灌阳县", 450328: "龙胜各族自治县", 450329: "资源县", 450330: "平乐县", 450332: "恭城瑶族自治县", 450381: "荔浦市", 450403: "万秀区", 450405: "长洲区", 450406: "龙圩区", 450421: "苍梧县", 450422: "藤县", 450423: "蒙山县", 450481: "岑溪市", 450502: "海城区", 450503: "银海区", 450512: "铁山港区", 450521: "合浦县", 450602: "港口区", 450603: "防城区", 450621: "上思县", 450681: "东兴市", 450702: "钦南区", 450703: "钦北区", 450721: "灵山县", 450722: "浦北县", 450802: "港北区", 450803: "港南区", 450804: "覃塘区", 450821: "平南县", 450881: "桂平市", 450902: "玉州区", 450903: "福绵区", 450921: "容县", 450922: "陆川县", 450923: "博白县", 450924: "兴业县", 450981: "北流市", 451002: "右江区", 451003: "田阳区", 451022: "田东县", 451024: "德保县", 451026: "那坡县", 451027: "凌云县", 451028: "乐业县", 451029: "田林县", 451030: "西林县", 451031: "隆林各族自治县", 451081: "靖西市", 451082: "平果市", 451102: "八步区", 451103: "平桂区", 451121: "昭平县", 451122: "钟山县", 451123: "富川瑶族自治县", 451202: "金城江区", 451203: "宜州区", 451221: "南丹县", 451222: "天峨县", 451223: "凤山县", 451224: "东兰县", 451225: "罗城仫佬族自治县", 451226: "环江毛南族自治县", 451227: "巴马瑶族自治县", 451228: "都安瑶族自治县", 451229: "大化瑶族自治县", 451302: "兴宾区", 451321: "忻城县", 451322: "象州县", 451323: "武宣县", 451324: "金秀瑶族自治县", 451381: "合山市", 451402: "江州区", 451421: "扶绥县", 451422: "宁明县", 451423: "龙州县", 451424: "大新县", 451425: "天等县", 451481: "凭祥市", 460105: "秀英区", 460106: "龙华区", 460107: "琼山区", 460108: "美兰区", 460202: "海棠区", 460203: "吉阳区", 460204: "天涯区", 460205: "崖州区", 460321: "西沙区", 460322: "南沙区", 460401: "那大镇", 460402: "和庆镇", 460403: "南丰镇", 460404: "大成镇", 460405: "雅星镇", 460406: "兰洋镇", 460407: "光村镇", 460408: "木棠镇", 460409: "海头镇", 460410: "峨蔓镇", 460411: "王五镇", 460412: "白马井镇", 460413: "中和镇", 460414: "排浦镇", 460415: "东成镇", 460416: "新州镇", 460417: "洋浦经济开发区", 460418: "华南热作学院", 469001: "五指山市", 469002: "琼海市", 469005: "文昌市", 469006: "万宁市", 469007: "东方市", 469021: "定安县", 469022: "屯昌县", 469023: "澄迈县", 469024: "临高县", 469025: "白沙黎族自治县", 469026: "昌江黎族自治县", 469027: "乐东黎族自治县", 469028: "陵水黎族自治县", 469029: "保亭黎族苗族自治县", 469030: "琼中黎族苗族自治县", 500101: "万州区", 500102: "涪陵区", 500103: "渝中区", 500104: "大渡口区", 500105: "江北区", 500106: "沙坪坝区", 500107: "九龙坡区", 500108: "南岸区", 500109: "北碚区", 500110: "綦江区", 500111: "大足区", 500112: "渝北区", 500113: "巴南区", 500114: "黔江区", 500115: "长寿区", 500116: "江津区", 500117: "合川区", 500118: "永川区", 500119: "南川区", 500120: "璧山区", 500151: "铜梁区", 500152: "潼南区", 500153: "荣昌区", 500154: "开州区", 500155: "梁平区", 500156: "武隆区", 500229: "城口县", 500230: "丰都县", 500231: "垫江县", 500233: "忠县", 500235: "云阳县", 500236: "奉节县", 500237: "巫山县", 500238: "巫溪县", 500240: "石柱土家族自治县", 500241: "秀山土家族苗族自治县", 500242: "酉阳土家族苗族自治县", 500243: "彭水苗族土家族自治县", 510104: "锦江区", 510105: "青羊区", 510106: "金牛区", 510107: "武侯区", 510108: "成华区", 510112: "龙泉驿区", 510113: "青白江区", 510114: "新都区", 510115: "温江区", 510116: "双流区", 510117: "郫都区", 510118: "新津区", 510121: "金堂县", 510129: "大邑县", 510131: "蒲江县", 510181: "都江堰市", 510182: "彭州市", 510183: "邛崃市", 510184: "崇州市", 510185: "简阳市", 510191: "高新区", 510302: "自流井区", 510303: "贡井区", 510304: "大安区", 510311: "沿滩区", 510321: "荣县", 510322: "富顺县", 510402: "东区", 510403: "西区", 510411: "仁和区", 510421: "米易县", 510422: "盐边县", 510502: "江阳区", 510503: "纳溪区", 510504: "龙马潭区", 510521: "泸县", 510522: "合江县", 510524: "叙永县", 510525: "古蔺县", 510603: "旌阳区", 510604: "罗江区", 510623: "中江县", 510681: "广汉市", 510682: "什邡市", 510683: "绵竹市", 510703: "涪城区", 510704: "游仙区", 510705: "安州区", 510722: "三台县", 510723: "盐亭县", 510725: "梓潼县", 510726: "北川羌族自治县", 510727: "平武县", 510781: "江油市", 510791: "高新区", 510802: "利州区", 510811: "昭化区", 510812: "朝天区", 510821: "旺苍县", 510822: "青川县", 510823: "剑阁县", 510824: "苍溪县", 510903: "船山区", 510904: "安居区", 510921: "蓬溪县", 510923: "大英县", 510981: "射洪市", 511002: "市中区", 511011: "东兴区", 511024: "威远县", 511025: "资中县", 511083: "隆昌市", 511102: "市中区", 511111: "沙湾区", 511112: "五通桥区", 511113: "金口河区", 511123: "犍为县", 511124: "井研县", 511126: "夹江县", 511129: "沐川县", 511132: "峨边彝族自治县", 511133: "马边彝族自治县", 511181: "峨眉山市", 511302: "顺庆区", 511303: "高坪区", 511304: "嘉陵区", 511321: "南部县", 511322: "营山县", 511323: "蓬安县", 511324: "仪陇县", 511325: "西充县", 511381: "阆中市", 511402: "东坡区", 511403: "彭山区", 511421: "仁寿县", 511423: "洪雅县", 511424: "丹棱县", 511425: "青神县", 511502: "翠屏区", 511503: "南溪区", 511504: "叙州区", 511523: "江安县", 511524: "长宁县", 511525: "高县", 511526: "珙县", 511527: "筠连县", 511528: "兴文县", 511529: "屏山县", 511602: "广安区", 511603: "前锋区", 511621: "岳池县", 511622: "武胜县", 511623: "邻水县", 511681: "华蓥市", 511702: "通川区", 511703: "达川区", 511722: "宣汉县", 511723: "开江县", 511724: "大竹县", 511725: "渠县", 511781: "万源市", 511802: "雨城区", 511803: "名山区", 511822: "荥经县", 511823: "汉源县", 511824: "石棉县", 511825: "天全县", 511826: "芦山县", 511827: "宝兴县", 511902: "巴州区", 511903: "恩阳区", 511921: "通江县", 511922: "南江县", 511923: "平昌县", 511971: "巴中经济开发区", 512002: "雁江区", 512021: "安岳县", 512022: "乐至县", 513201: "马尔康市", 513221: "汶川县", 513222: "理县", 513223: "茂县", 513224: "松潘县", 513225: "九寨沟县", 513226: "金川县", 513227: "小金县", 513228: "黑水县", 513230: "壤塘县", 513231: "阿坝县", 513232: "若尔盖县", 513233: "红原县", 513301: "康定市", 513322: "泸定县", 513323: "丹巴县", 513324: "九龙县", 513325: "雅江县", 513326: "道孚县", 513327: "炉霍县", 513328: "甘孜县", 513329: "新龙县", 513330: "德格县", 513331: "白玉县", 513332: "石渠县", 513333: "色达县", 513334: "理塘县", 513335: "巴塘县", 513336: "乡城县", 513337: "稻城县", 513338: "得荣县", 513401: "西昌市", 513402: "会理市", 513422: "木里藏族自治县", 513423: "盐源县", 513424: "德昌县", 513426: "会东县", 513427: "宁南县", 513428: "普格县", 513429: "布拖县", 513430: "金阳县", 513431: "昭觉县", 513432: "喜德县", 513433: "冕宁县", 513434: "越西县", 513435: "甘洛县", 513436: "美姑县", 513437: "雷波县", 520102: "南明区", 520103: "云岩区", 520111: "花溪区", 520112: "乌当区", 520113: "白云区", 520115: "观山湖区", 520121: "开阳县", 520122: "息烽县", 520123: "修文县", 520181: "清镇市", 520201: "钟山区", 520203: "六枝特区", 520204: "水城区", 520281: "盘州市", 520302: "红花岗区", 520303: "汇川区", 520304: "播州区", 520322: "桐梓县", 520323: "绥阳县", 520324: "正安县", 520325: "道真仡佬族苗族自治县", 520326: "务川仡佬族苗族自治县", 520327: "凤冈县", 520328: "湄潭县", 520329: "余庆县", 520330: "习水县", 520381: "赤水市", 520382: "仁怀市", 520402: "西秀区", 520403: "平坝区", 520422: "普定县", 520423: "镇宁布依族苗族自治县", 520424: "关岭布依族苗族自治县", 520425: "紫云苗族布依族自治县", 520502: "七星关区", 520521: "大方县", 520523: "金沙县", 520524: "织金县", 520525: "纳雍县", 520526: "威宁彝族回族苗族自治县", 520527: "赫章县", 520581: "黔西市", 520602: "碧江区", 520603: "万山区", 520621: "江口县", 520622: "玉屏侗族自治县", 520623: "石阡县", 520624: "思南县", 520625: "印江土家族苗族自治县", 520626: "德江县", 520627: "沿河土家族自治县", 520628: "松桃苗族自治县", 522301: "兴义市", 522302: "兴仁市", 522323: "普安县", 522324: "晴隆县", 522325: "贞丰县", 522326: "望谟县", 522327: "册亨县", 522328: "安龙县", 522601: "凯里市", 522622: "黄平县", 522623: "施秉县", 522624: "三穗县", 522625: "镇远县", 522626: "岑巩县", 522627: "天柱县", 522628: "锦屏县", 522629: "剑河县", 522630: "台江县", 522631: "黎平县", 522632: "榕江县", 522633: "从江县", 522634: "雷山县", 522635: "麻江县", 522636: "丹寨县", 522701: "都匀市", 522702: "福泉市", 522722: "荔波县", 522723: "贵定县", 522725: "瓮安县", 522726: "独山县", 522727: "平塘县", 522728: "罗甸县", 522729: "长顺县", 522730: "龙里县", 522731: "惠水县", 522732: "三都水族自治县", 530102: "五华区", 530103: "盘龙区", 530111: "官渡区", 530112: "西山区", 530113: "东川区", 530114: "呈贡区", 530115: "晋宁区", 530124: "富民县", 530125: "宜良县", 530126: "石林彝族自治县", 530127: "嵩明县", 530128: "禄劝彝族苗族自治县", 530129: "寻甸回族彝族自治县", 530181: "安宁市", 530302: "麒麟区", 530303: "沾益区", 530304: "马龙区", 530322: "陆良县", 530323: "师宗县", 530324: "罗平县", 530325: "富源县", 530326: "会泽县", 530381: "宣威市", 530402: "红塔区", 530403: "江川区", 530423: "通海县", 530424: "华宁县", 530425: "易门县", 530426: "峨山彝族自治县", 530427: "新平彝族傣族自治县", 530428: "元江哈尼族彝族傣族自治县", 530481: "澄江市", 530502: "隆阳区", 530521: "施甸县", 530523: "龙陵县", 530524: "昌宁县", 530581: "腾冲市", 530602: "昭阳区", 530621: "鲁甸县", 530622: "巧家县", 530623: "盐津县", 530624: "大关县", 530625: "永善县", 530626: "绥江县", 530627: "镇雄县", 530628: "彝良县", 530629: "威信县", 530681: "水富市", 530702: "古城区", 530721: "玉龙纳西族自治县", 530722: "永胜县", 530723: "华坪县", 530724: "宁蒗彝族自治县", 530802: "思茅区", 530821: "宁洱哈尼族彝族自治县", 530822: "墨江哈尼族自治县", 530823: "景东彝族自治县", 530824: "景谷傣族彝族自治县", 530825: "镇沅彝族哈尼族拉祜族自治县", 530826: "江城哈尼族彝族自治县", 530827: "孟连傣族拉祜族佤族自治县", 530828: "澜沧拉祜族自治县", 530829: "西盟佤族自治县", 530902: "临翔区", 530921: "凤庆县", 530922: "云县", 530923: "永德县", 530924: "镇康县", 530925: "双江拉祜族佤族布朗族傣族自治县", 530926: "耿马傣族佤族自治县", 530927: "沧源佤族自治县", 532301: "楚雄市", 532302: "禄丰市", 532322: "双柏县", 532323: "牟定县", 532324: "南华县", 532325: "姚安县", 532326: "大姚县", 532327: "永仁县", 532328: "元谋县", 532329: "武定县", 532501: "个旧市", 532502: "开远市", 532503: "蒙自市", 532504: "弥勒市", 532523: "屏边苗族自治县", 532524: "建水县", 532525: "石屏县", 532527: "泸西县", 532528: "元阳县", 532529: "红河县", 532530: "金平苗族瑶族傣族自治县", 532531: "绿春县", 532532: "河口瑶族自治县", 532601: "文山市", 532622: "砚山县", 532623: "西畴县", 532624: "麻栗坡县", 532625: "马关县", 532626: "丘北县", 532627: "广南县", 532628: "富宁县", 532801: "景洪市", 532822: "勐海县", 532823: "勐腊县", 532901: "大理市", 532922: "漾濞彝族自治县", 532923: "祥云县", 532924: "宾川县", 532925: "弥渡县", 532926: "南涧彝族自治县", 532927: "巍山彝族回族自治县", 532928: "永平县", 532929: "云龙县", 532930: "洱源县", 532931: "剑川县", 532932: "鹤庆县", 533102: "瑞丽市", 533103: "芒市", 533122: "梁河县", 533123: "盈江县", 533124: "陇川县", 533301: "泸水市", 533323: "福贡县", 533324: "贡山独龙族怒族自治县", 533325: "兰坪白族普米族自治县", 533401: "香格里拉市", 533422: "德钦县", 533423: "维西傈僳族自治县", 540102: "城关区", 540103: "堆龙德庆区", 540104: "达孜区", 540121: "林周县", 540122: "当雄县", 540123: "尼木县", 540124: "曲水县", 540127: "墨竹工卡县", 540202: "桑珠孜区", 540221: "南木林县", 540222: "江孜县", 540223: "定日县", 540224: "萨迦县", 540225: "拉孜县", 540226: "昂仁县", 540227: "谢通门县", 540228: "白朗县", 540229: "仁布县", 540230: "康马县", 540231: "定结县", 540232: "仲巴县", 540233: "亚东县", 540234: "吉隆县", 540235: "聂拉木县", 540236: "萨嘎县", 540237: "岗巴县", 540302: "卡若区", 540321: "江达县", 540322: "贡觉县", 540323: "类乌齐县", 540324: "丁青县", 540325: "察雅县", 540326: "八宿县", 540327: "左贡县", 540328: "芒康县", 540329: "洛隆县", 540330: "边坝县", 540402: "巴宜区", 540421: "工布江达县", 540423: "墨脱县", 540424: "波密县", 540425: "察隅县", 540426: "朗县", 540481: "米林市", 540502: "乃东区", 540521: "扎囊县", 540522: "贡嘎县", 540523: "桑日县", 540524: "琼结县", 540525: "曲松县", 540526: "措美县", 540527: "洛扎县", 540528: "加查县", 540529: "隆子县", 540531: "浪卡子县", 540581: "错那市", 540602: "色尼区", 540621: "嘉黎县", 540622: "比如县", 540623: "聂荣县", 540624: "安多县", 540625: "申扎县", 540626: "索县", 540627: "班戈县", 540628: "巴青县", 540629: "尼玛县", 540630: "双湖县", 542521: "普兰县", 542522: "札达县", 542523: "噶尔县", 542524: "日土县", 542525: "革吉县", 542526: "改则县", 542527: "措勤县", 610102: "新城区", 610103: "碑林区", 610104: "莲湖区", 610111: "灞桥区", 610112: "未央区", 610113: "雁塔区", 610114: "阎良区", 610115: "临潼区", 610116: "长安区", 610117: "高陵区", 610118: "鄠邑区", 610122: "蓝田县", 610124: "周至县", 610202: "王益区", 610203: "印台区", 610204: "耀州区", 610222: "宜君县", 610302: "渭滨区", 610303: "金台区", 610304: "陈仓区", 610305: "凤翔区", 610323: "岐山县", 610324: "扶风县", 610326: "眉县", 610327: "陇县", 610328: "千阳县", 610329: "麟游县", 610330: "凤县", 610331: "太白县", 610402: "秦都区", 610403: "杨陵区", 610404: "渭城区", 610422: "三原县", 610423: "泾阳县", 610424: "乾县", 610425: "礼泉县", 610426: "永寿县", 610428: "长武县", 610429: "旬邑县", 610430: "淳化县", 610431: "武功县", 610481: "兴平市", 610482: "彬州市", 610502: "临渭区", 610503: "华州区", 610522: "潼关县", 610523: "大荔县", 610524: "合阳县", 610525: "澄城县", 610526: "蒲城县", 610527: "白水县", 610528: "富平县", 610581: "韩城市", 610582: "华阴市", 610602: "宝塔区", 610603: "安塞区", 610621: "延长县", 610622: "延川县", 610625: "志丹县", 610626: "吴起县", 610627: "甘泉县", 610628: "富县", 610629: "洛川县", 610630: "宜川县", 610631: "黄龙县", 610632: "黄陵县", 610681: "子长市", 610702: "汉台区", 610703: "南郑区", 610722: "城固县", 610723: "洋县", 610724: "西乡县", 610725: "勉县", 610726: "宁强县", 610727: "略阳县", 610728: "镇巴县", 610729: "留坝县", 610730: "佛坪县", 610802: "榆阳区", 610803: "横山区", 610822: "府谷县", 610824: "靖边县", 610825: "定边县", 610826: "绥德县", 610827: "米脂县", 610828: "佳县", 610829: "吴堡县", 610830: "清涧县", 610831: "子洲县", 610881: "神木市", 610902: "汉滨区", 610921: "汉阴县", 610922: "石泉县", 610923: "宁陕县", 610924: "紫阳县", 610925: "岚皋县", 610926: "平利县", 610927: "镇坪县", 610929: "白河县", 610981: "旬阳市", 611002: "商州区", 611021: "洛南县", 611022: "丹凤县", 611023: "商南县", 611024: "山阳县", 611025: "镇安县", 611026: "柞水县", 620102: "城关区", 620103: "七里河区", 620104: "西固区", 620105: "安宁区", 620111: "红古区", 620121: "永登县", 620122: "皋兰县", 620123: "榆中县", 620171: "兰州新区", 620201: "市辖区", 620290: "雄关区", 620291: "长城区", 620292: "镜铁区", 620293: "新城镇", 620294: "峪泉镇", 620295: "文殊镇", 620302: "金川区", 620321: "永昌县", 620402: "白银区", 620403: "平川区", 620421: "靖远县", 620422: "会宁县", 620423: "景泰县", 620502: "秦州区", 620503: "麦积区", 620521: "清水县", 620522: "秦安县", 620523: "甘谷县", 620524: "武山县", 620525: "张家川回族自治县", 620602: "凉州区", 620621: "民勤县", 620622: "古浪县", 620623: "天祝藏族自治县", 620702: "甘州区", 620721: "肃南裕固族自治县", 620722: "民乐县", 620723: "临泽县", 620724: "高台县", 620725: "山丹县", 620802: "崆峒区", 620821: "泾川县", 620822: "灵台县", 620823: "崇信县", 620825: "庄浪县", 620826: "静宁县", 620881: "华亭市", 620902: "肃州区", 620921: "金塔县", 620922: "瓜州县", 620923: "肃北蒙古族自治县", 620924: "阿克塞哈萨克族自治县", 620981: "玉门市", 620982: "敦煌市", 621002: "西峰区", 621021: "庆城县", 621022: "环县", 621023: "华池县", 621024: "合水县", 621025: "正宁县", 621026: "宁县", 621027: "镇原县", 621102: "安定区", 621121: "通渭县", 621122: "陇西县", 621123: "渭源县", 621124: "临洮县", 621125: "漳县", 621126: "岷县", 621202: "武都区", 621221: "成县", 621222: "文县", 621223: "宕昌县", 621224: "康县", 621225: "西和县", 621226: "礼县", 621227: "徽县", 621228: "两当县", 622901: "临夏市", 622921: "临夏县", 622922: "康乐县", 622923: "永靖县", 622924: "广河县", 622925: "和政县", 622926: "东乡族自治县", 622927: "积石山保安族东乡族撒拉族自治县", 623001: "合作市", 623021: "临潭县", 623022: "卓尼县", 623023: "舟曲县", 623024: "迭部县", 623025: "玛曲县", 623026: "碌曲县", 623027: "夏河县", 630102: "城东区", 630103: "城中区", 630104: "城西区", 630105: "城北区", 630106: "湟中区", 630121: "大通回族土族自治县", 630123: "湟源县", 630202: "乐都区", 630203: "平安区", 630222: "民和回族土族自治县", 630223: "互助土族自治县", 630224: "化隆回族自治县", 630225: "循化撒拉族自治县", 632221: "门源回族自治县", 632222: "祁连县", 632223: "海晏县", 632224: "刚察县", 632301: "同仁市", 632322: "尖扎县", 632323: "泽库县", 632324: "河南蒙古族自治县", 632521: "共和县", 632522: "同德县", 632523: "贵德县", 632524: "兴海县", 632525: "贵南县", 632621: "玛沁县", 632622: "班玛县", 632623: "甘德县", 632624: "达日县", 632625: "久治县", 632626: "玛多县", 632701: "玉树市", 632722: "杂多县", 632723: "称多县", 632724: "治多县", 632725: "囊谦县", 632726: "曲麻莱县", 632801: "格尔木市", 632802: "德令哈市", 632803: "茫崖市", 632821: "乌兰县", 632822: "都兰县", 632823: "天峻县", 632857: "大柴旦行政委员会", 640104: "兴庆区", 640105: "西夏区", 640106: "金凤区", 640121: "永宁县", 640122: "贺兰县", 640181: "灵武市", 640202: "大武口区", 640205: "惠农区", 640221: "平罗县", 640302: "利通区", 640303: "红寺堡区", 640323: "盐池县", 640324: "同心县", 640381: "青铜峡市", 640402: "原州区", 640422: "西吉县", 640423: "隆德县", 640424: "泾源县", 640425: "彭阳县", 640502: "沙坡头区", 640521: "中宁县", 640522: "海原县", 650102: "天山区", 650103: "沙依巴克区", 650104: "新市区", 650105: "水磨沟区", 650106: "头屯河区", 650107: "达坂城区", 650109: "米东区", 650121: "乌鲁木齐县", 650202: "独山子区", 650203: "克拉玛依区", 650204: "白碱滩区", 650205: "乌尔禾区", 650402: "高昌区", 650421: "鄯善县", 650422: "托克逊县", 650502: "伊州区", 650521: "巴里坤哈萨克自治县", 650522: "伊吾县", 652301: "昌吉市", 652302: "阜康市", 652323: "呼图壁县", 652324: "玛纳斯县", 652325: "奇台县", 652327: "吉木萨尔县", 652328: "木垒哈萨克自治县", 652701: "博乐市", 652702: "阿拉山口市", 652722: "精河县", 652723: "温泉县", 652801: "库尔勒市", 652822: "轮台县", 652823: "尉犁县", 652824: "若羌县", 652825: "且末县", 652826: "焉耆回族自治县", 652827: "和静县", 652828: "和硕县", 652829: "博湖县", 652901: "阿克苏市", 652902: "库车市", 652922: "温宿县", 652924: "沙雅县", 652925: "新和县", 652926: "拜城县", 652927: "乌什县", 652928: "阿瓦提县", 652929: "柯坪县", 653001: "阿图什市", 653022: "阿克陶县", 653023: "阿合奇县", 653024: "乌恰县", 653101: "喀什市", 653121: "疏附县", 653122: "疏勒县", 653123: "英吉沙县", 653124: "泽普县", 653125: "莎车县", 653126: "叶城县", 653127: "麦盖提县", 653128: "岳普湖县", 653129: "伽师县", 653130: "巴楚县", 653131: "塔什库尔干塔吉克自治县", 653201: "和田市", 653221: "和田县", 653222: "墨玉县", 653223: "皮山县", 653224: "洛浦县", 653225: "策勒县", 653226: "于田县", 653227: "民丰县", 654002: "伊宁市", 654003: "奎屯市", 654004: "霍尔果斯市", 654021: "伊宁县", 654022: "察布查尔锡伯自治县", 654023: "霍城县", 654024: "巩留县", 654025: "新源县", 654026: "昭苏县", 654027: "特克斯县", 654028: "尼勒克县", 654201: "塔城市", 654202: "乌苏市", 654203: "沙湾市", 654221: "额敏县", 654224: "托里县", 654225: "裕民县", 654226: "和布克赛尔蒙古自治县", 654301: "阿勒泰市", 654321: "布尔津县", 654322: "富蕴县", 654323: "福海县", 654324: "哈巴河县", 654325: "青河县", 654326: "吉木乃县", 659001: "石河子市", 659002: "阿拉尔市", 659003: "图木舒克市", 659004: "五家渠市", 659005: "北屯市", 659006: "铁门关市", 659007: "双河市", 659008: "可克达拉市", 659009: "昆玉市", 659010: "胡杨河市", 659011: "新星市", 659012: "白杨市", 710101: "中正区", 710102: "大同区", 710103: "中山区", 710104: "松山区", 710105: "大安区", 710106: "万华区", 710107: "信义区", 710108: "士林区", 710109: "北投区", 710110: "内湖区", 710111: "南港区", 710112: "文山区", 710199: "其它区", 710201: "新兴区", 710202: "前金区", 710203: "芩雅区", 710204: "盐埕区", 710205: "鼓山区", 710206: "旗津区", 710207: "前镇区", 710208: "三民区", 710209: "左营区", 710210: "楠梓区", 710211: "小港区", 710241: "苓雅区", 710242: "仁武区", 710243: "大社区", 710244: "冈山区", 710245: "路竹区", 710246: "阿莲区", 710247: "田寮区", 710248: "燕巢区", 710249: "桥头区", 710250: "梓官区", 710251: "弥陀区", 710252: "永安区", 710253: "湖内区", 710254: "凤山区", 710255: "大寮区", 710256: "林园区", 710257: "鸟松区", 710258: "大树区", 710259: "旗山区", 710260: "美浓区", 710261: "六龟区", 710262: "内门区", 710263: "杉林区", 710264: "甲仙区", 710265: "桃源区", 710266: "那玛夏区", 710267: "茂林区", 710268: "茄萣区", 710299: "其它区", 710301: "中西区", 710302: "东区", 710303: "南区", 710304: "北区", 710305: "安平区", 710306: "安南区", 710339: "永康区", 710340: "归仁区", 710341: "新化区", 710342: "左镇区", 710343: "玉井区", 710344: "楠西区", 710345: "南化区", 710346: "仁德区", 710347: "关庙区", 710348: "龙崎区", 710349: "官田区", 710350: "麻豆区", 710351: "佳里区", 710352: "西港区", 710353: "七股区", 710354: "将军区", 710355: "学甲区", 710356: "北门区", 710357: "新营区", 710358: "后壁区", 710359: "白河区", 710360: "东山区", 710361: "六甲区", 710362: "下营区", 710363: "柳营区", 710364: "盐水区", 710365: "善化区", 710366: "大内区", 710367: "山上区", 710368: "新市区", 710369: "安定区", 710399: "其它区", 710401: "中区", 710402: "东区", 710403: "南区", 710404: "西区", 710405: "北区", 710406: "北屯区", 710407: "西屯区", 710408: "南屯区", 710431: "太平区", 710432: "大里区", 710433: "雾峰区", 710434: "乌日区", 710435: "丰原区", 710436: "后里区", 710437: "石冈区", 710438: "东势区", 710439: "和平区", 710440: "新社区", 710441: "潭子区", 710442: "大雅区", 710443: "神冈区", 710444: "大肚区", 710445: "沙鹿区", 710446: "龙井区", 710447: "梧栖区", 710448: "清水区", 710449: "大甲区", 710450: "外埔区", 710451: "大安区", 710499: "其它区", 710507: "金沙镇", 710508: "金湖镇", 710509: "金宁乡", 710510: "金城镇", 710511: "烈屿乡", 710512: "乌坵乡", 710614: "南投市", 710615: "中寮乡", 710616: "草屯镇", 710617: "国姓乡", 710618: "埔里镇", 710619: "仁爱乡", 710620: "名间乡", 710621: "集集镇", 710622: "水里乡", 710623: "鱼池乡", 710624: "信义乡", 710625: "竹山镇", 710626: "鹿谷乡", 710701: "仁爱区", 710702: "信义区", 710703: "中正区", 710704: "中山区", 710705: "安乐区", 710706: "暖暖区", 710707: "七堵区", 710799: "其它区", 710801: "东区", 710802: "北区", 710803: "香山区", 710899: "其它区", 710901: "东区", 710902: "西区", 710999: "其它区", 711130: "万里区", 711132: "板桥区", 711133: "汐止区", 711134: "深坑区", 711135: "石碇区", 711136: "瑞芳区", 711137: "平溪区", 711138: "双溪区", 711139: "贡寮区", 711140: "新店区", 711141: "坪林区", 711142: "乌来区", 711143: "永和区", 711144: "中和区", 711145: "土城区", 711146: "三峡区", 711147: "树林区", 711148: "莺歌区", 711149: "三重区", 711150: "新庄区", 711151: "泰山区", 711152: "林口区", 711153: "芦洲区", 711154: "五股区", 711155: "八里区", 711156: "淡水区", 711157: "三芝区", 711158: "石门区", 711287: "宜兰市", 711288: "头城镇", 711289: "礁溪乡", 711290: "壮围乡", 711291: "员山乡", 711292: "罗东镇", 711293: "三星乡", 711294: "大同乡", 711295: "五结乡", 711296: "冬山乡", 711297: "苏澳镇", 711298: "南澳乡", 711299: "钓鱼台", 711387: "竹北市", 711388: "湖口乡", 711389: "新丰乡", 711390: "新埔镇", 711391: "关西镇", 711392: "芎林乡", 711393: "宝山乡", 711394: "竹东镇", 711395: "五峰乡", 711396: "横山乡", 711397: "尖石乡", 711398: "北埔乡", 711399: "峨眉乡", 711414: "中坜区", 711415: "平镇区", 711417: "杨梅区", 711418: "新屋区", 711419: "观音区", 711420: "桃园区", 711421: "龟山区", 711422: "八德区", 711423: "大溪区", 711425: "大园区", 711426: "芦竹区", 711487: "中坜市", 711488: "平镇市", 711489: "龙潭乡", 711490: "杨梅市", 711491: "新屋乡", 711492: "观音乡", 711493: "桃园市", 711494: "龟山乡", 711495: "八德市", 711496: "大溪镇", 711497: "复兴乡", 711498: "大园乡", 711499: "芦竹乡", 711520: "头份市", 711582: "竹南镇", 711583: "头份镇", 711584: "三湾乡", 711585: "南庄乡", 711586: "狮潭乡", 711587: "后龙镇", 711588: "通霄镇", 711589: "苑里镇", 711590: "苗栗市", 711591: "造桥乡", 711592: "头屋乡", 711593: "公馆乡", 711594: "大湖乡", 711595: "泰安乡", 711596: "铜锣乡", 711597: "三义乡", 711598: "西湖乡", 711599: "卓兰镇", 711736: "员林市", 711774: "彰化市", 711775: "芬园乡", 711776: "花坛乡", 711777: "秀水乡", 711778: "鹿港镇", 711779: "福兴乡", 711780: "线西乡", 711781: "和美镇", 711782: "伸港乡", 711783: "员林镇", 711784: "社头乡", 711785: "永靖乡", 711786: "埔心乡", 711787: "溪湖镇", 711788: "大村乡", 711789: "埔盐乡", 711790: "田中镇", 711791: "北斗镇", 711792: "田尾乡", 711793: "埤头乡", 711794: "溪州乡", 711795: "竹塘乡", 711796: "二林镇", 711797: "大城乡", 711798: "芳苑乡", 711799: "二水乡", 711982: "番路乡", 711983: "梅山乡", 711984: "竹崎乡", 711985: "阿里山乡", 711986: "中埔乡", 711987: "大埔乡", 711988: "水上乡", 711989: "鹿草乡", 711990: "太保市", 711991: "朴子市", 711992: "东石乡", 711993: "六脚乡", 711994: "新港乡", 711995: "民雄乡", 711996: "大林镇", 711997: "溪口乡", 711998: "义竹乡", 711999: "布袋镇", 712180: "斗南镇", 712181: "大埤乡", 712182: "虎尾镇", 712183: "土库镇", 712184: "褒忠乡", 712185: "东势乡", 712186: "台西乡", 712187: "仑背乡", 712188: "麦寮乡", 712189: "斗六市", 712190: "林内乡", 712191: "古坑乡", 712192: "莿桐乡", 712193: "西螺镇", 712194: "二仑乡", 712195: "北港镇", 712196: "水林乡", 712197: "口湖乡", 712198: "四湖乡", 712199: "元长乡", 712451: "崁顶乡", 712467: "屏东市", 712468: "三地门乡", 712469: "雾台乡", 712470: "玛家乡", 712471: "九如乡", 712472: "里港乡", 712473: "高树乡", 712474: "盐埔乡", 712475: "长治乡", 712476: "麟洛乡", 712477: "竹田乡", 712478: "内埔乡", 712479: "万丹乡", 712480: "潮州镇", 712481: "泰武乡", 712482: "来义乡", 712483: "万峦乡", 712484: "莰顶乡", 712485: "新埤乡", 712486: "南州乡", 712487: "林边乡", 712488: "东港镇", 712489: "琉球乡", 712490: "佳冬乡", 712491: "新园乡", 712492: "枋寮乡", 712493: "枋山乡", 712494: "春日乡", 712495: "狮子乡", 712496: "车城乡", 712497: "牡丹乡", 712498: "恒春镇", 712499: "满州乡", 712584: "台东市", 712585: "绿岛乡", 712586: "兰屿乡", 712587: "延平乡", 712588: "卑南乡", 712589: "鹿野乡", 712590: "关山镇", 712591: "海端乡", 712592: "池上乡", 712593: "东河乡", 712594: "成功镇", 712595: "长滨乡", 712596: "金峰乡", 712597: "大武乡", 712598: "达仁乡", 712599: "太麻里乡", 712686: "花莲市", 712687: "新城乡", 712688: "太鲁阁", 712689: "秀林乡", 712690: "吉安乡", 712691: "寿丰乡", 712692: "凤林镇", 712693: "光复乡", 712694: "丰滨乡", 712695: "瑞穗乡", 712696: "万荣乡", 712697: "玉里镇", 712698: "卓溪乡", 712699: "富里乡", 712794: "马公市", 712795: "西屿乡", 712796: "望安乡", 712797: "七美乡", 712798: "白沙乡", 712799: "湖西乡", 712896: "南竿乡", 712897: "北竿乡", 712898: "东引乡", 712899: "莒光乡", 810101: "中西区", 810102: "湾仔区", 810103: "东区", 810104: "南区", 810201: "九龙城区", 810202: "油尖旺区", 810203: "深水埗区", 810204: "黄大仙区", 810205: "观塘区", 810301: "北区", 810302: "大埔区", 810303: "沙田区", 810304: "西贡区", 810305: "元朗区", 810306: "屯门区", 810307: "荃湾区", 810308: "葵青区", 810309: "离岛区", 820102: "花地玛堂区", 820103: "花王堂区", 820104: "望德堂区", 820105: "大堂区", 820106: "风顺堂区", 820202: "嘉模堂区", 820203: "路氹填海区", 820204: "圣方济各堂区" } }, Cr = (e, t, o) => ({ text: e, value: t, children: o });
const p1 = (e) => {
  const t = e;
  return t.install = (o) => {
    const n = e.name;
    o.component(n, t);
  }, t;
};
function ti(e, t) {
  return t ? typeof t == "string" ? ` ${e}--${t}` : Array.isArray(t) ? t.reduce((o, n) => o + ti(e, n), "") : Object.keys(t).reduce((o, n) => o + (t[n] ? ti(e, n) : ""), "") : "";
}
function by(e) {
  return (t, o) => (t && typeof t != "string" && (o = t, t = ""), `${t = t ? `${e}__${t}` : e}${ti(t, o)}`);
}
const v1 = (e) => {
  const t = `x-${e}`;
  return [t, by(t)];
}, yy = { type: Boolean, default: !0 }, wy = [Number, String], Tr = (e) => ({ type: wy, default: e }), xy = Object.assign({}, { modelValue: { type: Array, default: () => [] }, filter: Function, formatter: { type: Function, default: (e, t) => t }, loading: Boolean, readonly: Boolean, allowHtml: Boolean, title: String, cancelButtonText: String, confirmButtonText: String, optionHeight: Tr(44), showToolbar: yy, swipeDuration: Tr(1e3), visibleOptionNum: Tr(6) }), ln = (e, t, o, n, a, l) => {
  const r = function(s, c) {
    if (s < 0) return [];
    const d = Array(s);
    let u = -1;
    for (; ++u < s; ) d[u] = c(u);
    return d;
  }(t - e + 1, (s) => {
    const c = function(d, u = 2) {
      let p = d + "";
      for (; p.length < u; ) p = "0" + p;
      return p;
    }(e + s);
    return n(o, { text: c, value: c });
  });
  return a ? a(o, r, l) : r;
}, Ln = (e) => e < 10 ? `0${e}` : `${e}`, [Sy] = v1("datetime-picker"), ky = Object.assign({}, xy, { minYear: { type: Number, validator: (e) => e > 1970, default: (/* @__PURE__ */ new Date()).getFullYear() - 10 }, maxYear: { type: Number, default: (/* @__PURE__ */ new Date()).getFullYear() }, columnsType: { type: Array, default: () => ["hour", "minute"] } }), Cy = z({ name: Sy, props: ky, emits: ["confirm", "cancel", "change", "update:modelValue"], setup(e, { emit: t, slots: o, expose: n }) {
  const a = /* @__PURE__ */ new Date(), l = [String(a.getFullYear()), Ln(a.getMonth() + 1), Ln(a.getDate()), Ln(a.getHours()), Ln(a.getMinutes()), Ln(a.getSeconds())], r = E({ get: () => function(g) {
    if (g == null) return !0;
    if (Ai(g) && (Me(g) || typeof g == "string" || typeof g.splice == "function" || c0(g) || d0(g) || Ei(g))) return !g.length;
    var f = Vo(g);
    if (f == "[object Map]" || f == "[object Set]") return !g.size;
    if (r0(g)) return !p0(g).length;
    for (var b in g) if (o4.call(g, b)) return !1;
    return !0;
  }(e.modelValue) ? l : e.modelValue, set(g) {
    t("update:modelValue", g);
  } }), s = A(), c = () => {
    const g = e.minYear, f = e.maxYear;
    return ln(g, f, "year", e.formatter, e.filter, r.value);
  }, d = () => {
    const g = r.value[0], f = r.value[1], b = ((w, y) => 32 - new Date(w, y - 1, 32).getDate())(g ? +g : e.minYear, f ? +f : 1);
    return ln(1, b, "day", e.formatter, e.filter, r.value);
  }, u = E(() => {
    const g = [c(), ln(1, 12, "month", e.formatter, e.filter, r.value), d()], f = e.columnsType.map((b) => {
      switch (b) {
        case "hour":
          return (() => {
            const { filter: w, formatter: y } = e;
            return ln(0, 23, "hour", y, w, r.value);
          })();
        case "minute":
          return (() => {
            const { filter: w, formatter: y } = e;
            return ln(0, 59, "minute", y, w, r.value);
          })();
        case "second":
          return (() => {
            const { filter: w, formatter: y } = e;
            return ln(0, 59, "second", y, w, r.value);
          })();
        default:
          return [];
      }
    });
    return g.concat(f);
  }), p = (...g) => t("change", ...g), v = (...g) => t("cancel", ...g), h = (...g) => t("confirm", ...g);
  return n({ confirm: () => {
    var g;
    return (g = s.value) == null ? void 0 : g.confirm();
  }, getSelectedDate: () => r.value }), () => i(da, Q({ ref: s, modelValue: r.value, "onUpdate:modelValue": (g) => r.value = g, columns: u.value }, e, { onConfirm: h, onCancel: v, onChange: p }), o);
} }), nl = p1(Cy), Ty = ["input", "picker", "cascader", "area", "radio", "checkbox", "date-picker", "time-picker", "datetime-picker", "date-range-picker", "time-range-picker", "datetime-range-picker", "switch", "rate", "slider", "stepper", "text", "html", "slot", "input-slot"], f1 = ["picker", "cascader", "area", "date-picker", "time-picker", "datetime-picker", "date-range-picker", "time-range-picker", "datetime-range-picker"], Xa = { change: ["rate", "switch", "stepper", "slider", "radio", "checkbox"], blur: ["input", "stepper"], focus: ["input", "stepper"], click: ["input", "switch"] }, Oy = (e, t, o) => {
  const n = ["picker", "area", "cascader", "date-picker", "time-picker", "datetime-picker", "date-range-picker", "time-range-picker", "datetime-range-picker"].includes(e), a = ["input"].includes(e);
  return n ? o || `请选择${t}` : a ? o || `请输入${t}` : o || void 0;
}, By = (e, t = [], o) => {
  let n = [];
  const a = { required: !0, message: `${o}不能为空`, trigger: ["onBlur", "onChange", "onSubmit"] };
  if (t && Me(t)) {
    const l = t.find((r) => re(r, "required"));
    e && !l && n.push(a), n = n.concat(t);
  }
  return n;
}, Vy = (e) => f1.includes(e) ? "arrow" : "", Dy = z({ props: { formValue: { type: Object }, type: { type: String, required: !0 }, label: { type: String, default: "" }, name: { type: String, required: !0 }, options: { type: Array, default: () => [] }, required: { type: Boolean, default: !1 }, readonly: { type: Boolean, default: !1 }, itemAttrs: { type: Object, default: () => ({}) }, popup: { type: Object, default: () => ({}) }, orgAttrs: { type: Object, default: () => ({}) }, config: { type: Object, default: () => ({}) } }, setup(e, {}) {
  const { type: t, formValue: o, label: n, name: a, required: l, readonly: r, options: s, itemAttrs: c, orgAttrs: d, config: u, popup: p } = e, { formSlots: v, rules: h, onEvents: g } = Mt("x-form"), f = A(!1), b = () => {
    let m = {};
    return Xa.change.includes(t) && (m.onChange = (...x) => g("change", a, ...x)), Xa.blur.includes(t) && (m.onBlur = (x) => g("blur", a, x)), Xa.focus.includes(t) && (m.onFocus = (x) => g("focus", a, x)), Xa.click.includes(t) && (m.onClick = (x) => g("click", a, x)), m;
  }, w = () => {
    let m = {};
    const x = (V) => c && re(c, "slots") && re(c.slots, V), T = (V, P) => {
      if (zl(c.slots[V])) return c.slots[V](P);
      throw new Error(`slots.${V} is not a function`);
    };
    return (n || re(v, `${a}.label`) || x("label")) && (m.label = () => re(v, `${a}.label`) ? so(v, `${a}.label`) : x("label") ? T("label") : n), (re(v, `${a}.left-icon`) || x("left-icon")) && (m["left-icon"] = () => re(v, `${a}.left-icon`) ? so(v, `${a}.left-icon`) : T("left-icon")), (re(v, `${a}.right-icon`) || x("right-icon")) && (m["right-icon"] = () => re(v, `${a}.right-icon`) ? so(v, `${a}.right-icon`) : T("right-icon")), (re(v, `${a}.error-message`) || x("error-message")) && (m["error-message"] = ({ message: V }) => re(v, `${a}.error-message`) ? so(v, `${a}.error-message`, { message: V }) : T("error-message", { message: V })), (re(v, `${a}.button`) || x("button")) && (m.button = () => re(v, `${a}.button`) ? so(v, `${a}.button`) : T("button")), (re(v, `${a}.extra`) || x("extra")) && (m.extra = () => re(v, `${a}.extra`) ? so(v, `${a}.extra`) : T("extra")), m;
  }, y = () => re(d, "slots") ? d.slots : {}, k = (m = {}) => {
    const x = [...re(c, "rules") && Me(c.rules) ? c.rules : [], ...re(u, "rules") ? u.rules : [], ...re(h, a) ? h[a] : []], T = { placeholder: Oy(t, n, c == null ? void 0 : c.placeholder), required: l, rules: By(l, x, n), label: n, name: a };
    return re(u, "hiddenLabel") && function(V) {
      return V === !0 || V === !1 || ca(V) && Fo(V) == "[object Boolean]";
    }(u.hiddenLabel) && u.hiddenLabel && (T.class = "xform-hidden-label"), Object.assign(T, c), f1.includes(t) && Object.assign(T, { "right-icon": Vy(t), readonly: !0, onClickRightIcon: () => {
      r || (f.value = !0);
    } }), Object.assign(T, m);
  }, C = () => {
    S(), g("cancel", a);
  }, S = () => f.value = !1, O = { input: () => i(He, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), k()), w()), picker: () => i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (m) => o[`${a}Text`] = m }, k()), w()), B(i(da, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m, title: `请选择${n}`, columns: s }, b(), d, { onConfirm: (...m) => {
    const [{ selectedOptions: x }] = m;
    o[`${a}Text`] = x.map((T) => T.text).join("/"), S(), g("confirm", a, ...m);
  }, onChange: (...m) => g("change", a, ...m), onCancel: C }), y()))]), area: () => i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (m) => o[`${a}Text`] = m }, k()), w()), B(i(bb, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m, title: `请选择${n}`, areaList: Wc }, b(), d, { onConfirm: (...m) => {
    const [{ selectedOptions: x }] = m;
    o[`${a}Text`] = x.map((T) => T.text).join("/"), S(), g("confirm", a, ...m);
  }, onChange: (...m) => g("change", a, ...m), onCancel: C }), y()))]), cascader: () => {
    const m = function() {
      const { city_list: x, county_list: T, province_list: V } = Wc, P = /* @__PURE__ */ new Map();
      Object.keys(V).forEach((j) => {
        P.set(j.slice(0, 2), Cr(V[j], j, []));
      });
      const N = /* @__PURE__ */ new Map();
      return Object.keys(x).forEach((j) => {
        const F = Cr(x[j], j, []);
        N.set(j.slice(0, 4), F);
        const I = P.get(j.slice(0, 2));
        I && I.children.push(F);
      }), Object.keys(T).forEach((j) => {
        const F = N.get(j.slice(0, 4));
        F && F.children.push(Cr(T[j], j));
      }), Array.from(P.values());
    }();
    return i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (x) => o[`${a}Text`] = x }, k()), w()), B(i(Qb, Q({ modelValue: o[a], "onUpdate:modelValue": (x) => o[a] = x, title: `请选择${n}`, options: d && re(d, "useVantAreaData") ? m : s }, b(), d, { onFinish: (...x) => {
      const [{ selectedOptions: T }] = x;
      o[`${a}Text`] = T.map((V) => V.text).join("/"), S(), g("finish", a, ...x);
    }, onChange: (...x) => g("change", a, ...x), onClickTab: (...x) => g("click-tab", a, ...x), onClose: C }), y()))]);
  }, "date-picker": () => {
    const m = (/* @__PURE__ */ new Date()).getFullYear();
    return i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (x) => o[`${a}Text`] = x }, k()), w()), B(i(Fa, Q({ modelValue: o[a], "onUpdate:modelValue": (x) => o[a] = x, title: `请选择${n}` }, b(), d, { minDate: re(d, "minDate") ? d.minDate : new Date(m - 20, 1, 1), maxDate: re(d, "maxDate") ? d.maxDate : new Date(m + 10, 12, 31), onConfirm: (...x) => {
      o[`${a}Text`] = o[a].join("-"), S(), g("confirm", a, ...x);
    }, onChange: (...x) => g("change", a, ...x), onCancel: C }), y()))]);
  }, "time-picker": () => i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (m) => o[`${a}Text`] = m }, k()), w()), B(i(Ya, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m, title: `请选择${n}` }, b(), d, { onConfirm: (...m) => {
    o[`${a}Text`] = o[a].join(":"), S(), g("confirm", a, ...m);
  }, onChange: (...m) => g("change", a, ...m), onCancel: C }), y()))]), "datetime-picker": () => {
    const m = (/* @__PURE__ */ new Date()).getFullYear(), x = d, T = (V) => {
      let P = [{}, {}];
      if (re(V, "groupProps") && Me(V.groupProps)) {
        const [N, j] = V.groupProps;
        N && (P[0] = { ...N, minDate: N.minDate || new Date(m - 20, 1, 1), maxDate: N.maxDate || new Date(m + 10, 12, 31) }), j && (P[1] = j);
      }
      return P;
    };
    return i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (V) => o[`${a}Text`] = V }, k()), w()), B((() => {
      switch (re(d, "showType") && ["group", "single"].includes(d.showType) ? d.showType : "group") {
        case "group":
          const V = A({ date: Me(o[a]) && o[a].length > 0 ? o[a][0] : [], time: Me(o[a]) && o[a].length > 1 ? o[a][1] : [] });
          return i(_a, Q({ title: `请选择${n}` }, b(), x, { tabs: re(x, "tabs") ? x.tabs : ["选择日期", "选择时间"], onConfirm: (...P) => {
            o[a] = [V.value.date, V.value.time], o[`${a}Text`] = `${V.value.date.join("-")} ${V.value.time.join(":")}`, S(), g("confirm", a, ...P);
          }, onChange: (...P) => g("change", a, ...P), onCancel: C }), { default: () => [i(Fa, Q({ modelValue: V.value.date, "onUpdate:modelValue": (P) => V.value.date = P }, T(x)[0]), null), i(Ya, Q({ modelValue: V.value.time, "onUpdate:modelValue": (P) => V.value.time = P }, T(x)[1]), null)], ...y() });
        case "single":
          return i(nl, Q({ modelValue: o[a], "onUpdate:modelValue": (P) => o[a] = P, title: `请选择${n}` }, b(), re(x, "groupProps") ? x.groupProps : {}, { onConfirm: (...P) => {
            const [{ selectedValues: N }] = P;
            o[a] = N;
            const j = `${N.slice(0, 3).join("-")} ${N.slice(3).join(":")}`;
            o[`${a}Text`] = j, S(), g("confirm", a, ...P);
          }, onChange: (...P) => g("change", a, ...P), onCancel: C }), y());
      }
    })())]);
  }, "date-range-picker": () => {
    const m = (/* @__PURE__ */ new Date()).getFullYear(), x = A({ start: Me(o[a]) && o[a].length > 0 ? o[a][0] : [], end: Me(o[a]) && o[a].length > 1 ? o[a][1] : [] }), T = d, V = (P) => {
      let N = [{}, {}];
      if (re(P, "groupProps") && Me(P.groupProps)) {
        const [j, F] = P.groupProps || [];
        j && (N[0] = j, N[0].minDate = j.minDate || new Date(m - 20, 1, 1), N[0].maxDate = j.maxDate || new Date(m + 10, 1, 1)), F && (N[1] = F, N[1].minDate = j.minDate || new Date(m - 20, 1, 1), N[1].maxDate = j.maxDate || new Date(m + 10, 1, 1));
      }
      return N;
    };
    return i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (P) => o[`${a}Text`] = P }, k()), w()), B(i(_a, Q({ title: `请选择${n}` }, b(), T, { tabs: re(T, "tabs") ? T.tabs : ["开始日期", "结束日期"], onConfirm: (...P) => {
      o[a] = [x.value.start, x.value.end], o[`${a}Text`] = `${x.value.start.join("-")} 至 ${x.value.end.join("-")}`, S(), g("confirm", a, ...P);
    }, onChange: (...P) => g("change", a, ...P), onCancel: S }), { default: () => [i(Fa, Q({ modelValue: x.value.start, "onUpdate:modelValue": (P) => x.value.start = P }, V(T)[0]), null), i(Fa, Q({ modelValue: x.value.end, "onUpdate:modelValue": (P) => x.value.end = P }, V(T)[1]), null)], ...y() }))]);
  }, "time-range-picker": () => {
    const m = A({ start: Me(o[a]) && o[a].length > 0 ? o[a][0] : [], end: Me(o[a]) && o[a].length > 1 ? o[a][1] : [] }), x = d, T = (V) => {
      let P = {}, N = {};
      if (re(V, "groupProps") && Me(V.groupProps)) {
        const [j, F] = V.groupProps;
        j && (P = j), F && (N = F);
      }
      return [P, N];
    };
    return i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (V) => o[`${a}Text`] = V }, k()), w()), B(i(_a, Q({ title: `请选择${n}` }, b(), x, { tabs: re(x, "tabs") ? x.tabs : ["开始时间", "结束时间"], onConfirm: (...V) => {
      S(), o[a] = [m.value.start, m.value.end], o[`${a}Text`] = `${m.value.start.join(":")} 至 ${m.value.end.join(":")}`, g("confirm", a, ...V);
    }, onChange: (...V) => g("change", a, ...V), onCancel: S }), { default: () => [i(Ya, Q({ modelValue: m.value.start, "onUpdate:modelValue": (V) => m.value.start = V }, T(x)[0]), null), i(Ya, Q({ modelValue: m.value.end, "onUpdate:modelValue": (V) => m.value.end = V }, T(x)[1]), null)], ...y() }))]);
  }, "datetime-range-picker": () => {
    const m = A({ start: Me(o[a]) && o[a].length > 0 ? o[a][0] : [], end: Me(o[a]) && o[a].length > 1 ? o[a][1] : [] }), x = d, T = (V) => {
      let P = {}, N = {};
      if (re(V, "groupProps") && Me(V.groupProps)) {
        const [j, F] = V.groupProps;
        j && (P = j), F && (N = F);
      }
      return [P, N];
    };
    return i(be, null, [i(He, Q({ modelValue: o[`${a}Text`], "onUpdate:modelValue": (V) => o[`${a}Text`] = V }, k()), w()), B(i(_a, Q({ title: `请选择${n}` }, b(), x, { tabs: re(x, "tabs") ? x.tabs : ["开始时间", "结束时间"], onConfirm: (...V) => {
      const { start: P, end: N } = m.value;
      o[a] = [m.value.start, m.value.end];
      const j = `${P.slice(0, 3).join("-")} ${P.slice(3).join(":")}`, F = `${N.slice(0, 3).join("-")} ${N.slice(3).join(":")}`;
      o[`${a}Text`] = `${j} 至 ${F}`, S(), g("confirm", a, ...V);
    }, onChange: (...V) => g("change", a, ...V), onCancel: S }), { default: () => [i(nl, Q({ modelValue: m.value.start, "onUpdate:modelValue": (V) => m.value.start = V }, T(x)[0]), null), i(nl, Q({ modelValue: m.value.end, "onUpdate:modelValue": (V) => m.value.end = V }, T(x)[1]), null)], ...y() }))]);
  }, radio: () => i(He, k(), { input: () => i(zb, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), d, { class: { "readonly-radio": r }, disabled: r || re(d, "disabled") && !!d.disabled }), { default: () => [s == null ? void 0 : s.map((m) => i(qb, Q(m.attrs, { name: m.value }), { default: () => [m.text] }))], ...y() }) }), checkbox: () => i(He, k(), { ...w(), input: () => i(Lb, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), d, { class: { "readonly-checkbox": r }, disabled: r || re(d, "disabled") && !!d.disabled }), { default: () => [s == null ? void 0 : s.map((m) => i(Gb, Q(m.attrs, { name: m.value }), { default: () => [m.text] }))], ...y() }) }), switch: () => i(He, k(), { ...w(), input: () => i(Pb, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), d, { class: { "readonly-switch": r }, disabled: r || re(d, "disabled") && !!d.disabled }), y()) }), rate: () => i(He, k(), { ...w(), input: () => i(sy, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), d, { readonly: r || re(d, "readonly") && !!d.readonly }), y()) }), slider: () => i(He, k(), { ...w(), input: () => i(dy, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), d, { class: { "readonly-slider": r }, disabled: r || re(d, "disabled") && !!d.disabled, onDragStart: (...m) => {
    g("drag-start", a, ...m);
  }, onDragEnd: (...m) => {
    g("drag-end", a, ...m);
  } }), y()) }), stepper: () => i(He, k(), { ...w(), input: () => i(fy, Q({ modelValue: o[a], "onUpdate:modelValue": (m) => o[a] = m }, b(), d, { class: { "readonly-stepper": r }, disabled: r || re(d, "disabled") && !!d.disabled, onPlus: (...m) => {
    g("plus", a, ...m);
  }, onMinus: (...m) => {
    g("minus", a, ...m);
  }, onOverlimit: (...m) => {
    g("overlimit", a, ...m);
  } }), y()) }), text: () => i(He, k(), { ...w(), input: () => i(be, null, [o[a]]) }), html: () => i(He, k(), { ...w(), input: () => i("div", Q({ innerHTML: o[a] }, d), null) }), "input-slot": () => i(He, k(), { ...w(), input: () => i(be, null, [re(v, a) ? so(v, a) : i(be, null, null)]) }), slot: () => i(be, null, [re(v, a) ? so(v, a) : i(be, null, null)]) }, B = (m, x = {}) => i(I4, Q({ show: f.value, "onUpdate:show": (T) => f.value = T, "destroy-on-close": !0, round: !0, position: "bottom" }, x, p), function(T) {
    return typeof T == "function" || Object.prototype.toString.call(T) === "[object Object]" && !Tl(T);
  }(m) ? m : { default: () => [m] });
  return () => i(be, null, [O[t]()]);
} });
function Ay(e) {
  return typeof e == "function" || Object.prototype.toString.call(e) === "[object Object]" && !Tl(e);
}
const [Ey] = v1("form"), Py = z({ name: Ey, props: Object.assign({}, n1, { model: { type: Object, required: !0, default: () => ({}) }, items: { type: Array, required: !0, default: () => [] }, rules: { type: Object, default: () => ({}) }, inset: { type: Boolean, default: !1 } }), emits: ["submit", "failed", "confirm", "cancel", "change", "blur", "focus", "click", "drag-start", "drag-end", "plus", "minus", "overlimit", "finish", "click-tab"], setup(e, { slots: t, attrs: o, emit: n, expose: a }) {
  const l = A();
  return At("x-form", { formSlots: t, rules: e.rules, onEvents: (r, ...s) => {
    n(r, ...s);
  } }), a({ submit: () => l.value.submit(), getValues: () => l.value.getValues(), validate: async (r) => {
    var s;
    return await ((s = l.value) == null ? void 0 : s.validate(r));
  }, resetValidation: (r) => l.value.resetValidation(r), getValidationStatus: () => l.value.getValidationStatus(), scrollToField: (r, s) => l.value.scrollToField(r, s) }), { formRef: l, ...z1(e), attrs: o, getRequired: (r) => {
    const { itemProps: s, name: c } = r, d = !!re(e.rules, c) && !!e.rules[c].find((p) => re(p, "required") && p.required), u = !!re(r, "required") && !!r.required;
    return !(!s || !re(s, "required")) && !!s.required || u || d || !!e.required;
  }, onSubmit: (...r) => n("submit", ...r), onFailed: (...r) => n("failed", ...r) };
}, render() {
  let e;
  const { formRef: t, items: o, model: n, rules: a, required: l, readonly: r, onSubmit: s, onFailed: c, attrs: d, inset: u, ...p } = this;
  return i(Tb, Q({ ref: "formRef", onSubmit: s, onFailed: c, required: l, readonly: r }, p, d), { default: () => [i(oy, { inset: u }, Ay(e = o.map((v, h) => {
    const { vif: g, type: f, name: b, label: w, itemProps: y, popup: k } = v;
    if (!Ty.includes(f)) throw new Error(`${f} 类型组件暂不支持`);
    return !re(v, "vif") || (zl(g) ? g(n) : g) ? i(Dy, { key: b + h, formValue: n, type: f, name: b, label: w, options: v.options, config: v, required: this.getRequired(v), readonly: r, popup: k, itemAttrs: y, orgAttrs: v.attrs }, null) : null;
  })) ? e : { default: () => [e] })] });
} }), m1 = p1(Py), Iy = /* @__PURE__ */ function(e) {
  return (t) => {
    Q3(e, (o) => t.use(o));
  };
}([m1, nl]);
function h1(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
e0();
const { toString: $y } = Object.prototype, { getPrototypeOf: Hi } = Object, wl = (Or = /* @__PURE__ */ Object.create(null), (e) => {
  const t = $y.call(e);
  return Or[t] || (Or[t] = t.slice(8, -1).toLowerCase());
});
var Or;
const It = (e) => (e = e.toLowerCase(), (t) => wl(t) === e), Hl = (e) => (t) => typeof t === e, { isArray: sn } = Array, Un = Hl("undefined"), Yc = It("ArrayBuffer"), jy = Hl("string"), ct = Hl("function"), Xc = Hl("number"), Ga = (e) => e !== null && typeof e == "object", Za = (e) => {
  if (wl(e) !== "object") return !1;
  const t = Hi(e);
  return !(t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.toStringTag in e || Symbol.iterator in e);
}, zy = It("Date"), Ry = It("File"), Ny = It("Blob"), My = It("FileList"), Ly = It("URLSearchParams"), [Fy, _y, Hy, Uy] = ["ReadableStream", "Request", "Response", "Headers"].map(It);
function qn(e, t, { allOwnKeys: o = !1 } = {}) {
  if (e == null) return;
  let n, a;
  if (typeof e != "object" && (e = [e]), sn(e)) for (n = 0, a = e.length; n < a; n++) t.call(null, e[n], n, e);
  else {
    const l = o ? Object.getOwnPropertyNames(e) : Object.keys(e), r = l.length;
    let s;
    for (n = 0; n < r; n++) s = l[n], t.call(null, e[s], s, e);
  }
}
function Gc(e, t) {
  t = t.toLowerCase();
  const o = Object.keys(e);
  let n, a = o.length;
  for (; a-- > 0; ) if (n = o[a], t === n.toLowerCase()) return n;
  return null;
}
const Po = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Zc = (e) => !Un(e) && e !== Po, qy = (Br = typeof Uint8Array < "u" && Hi(Uint8Array), (e) => Br && e instanceof Br);
var Br;
const Wy = It("HTMLFormElement"), Kc = (({ hasOwnProperty: e }) => (t, o) => e.call(t, o))(Object.prototype), Yy = It("RegExp"), Jc = (e, t) => {
  const o = Object.getOwnPropertyDescriptors(e), n = {};
  qn(o, (a, l) => {
    let r;
    (r = t(a, l, e)) !== !1 && (n[l] = r || a);
  }), Object.defineProperties(e, n);
}, Xy = It("AsyncFunction"), g1 = (Qc = typeof setImmediate == "function", eu = ct(Po.postMessage), Qc ? setImmediate : eu ? (Vr = `axios@${Math.random()}`, Ka = [], Po.addEventListener("message", ({ source: e, data: t }) => {
  e === Po && t === Vr && Ka.length && Ka.shift()();
}, !1), (e) => {
  Ka.push(e), Po.postMessage(Vr, "*");
}) : (e) => setTimeout(e));
var Qc, eu, Vr, Ka;
const Gy = typeof queueMicrotask < "u" ? queueMicrotask.bind(Po) : typeof process < "u" && process.nextTick || g1, H = { isArray: sn, isArrayBuffer: Yc, isBuffer: function(e) {
  return e !== null && !Un(e) && e.constructor !== null && !Un(e.constructor) && ct(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}, isFormData: (e) => {
  let t;
  return e && (typeof FormData == "function" && e instanceof FormData || ct(e.append) && ((t = wl(e)) === "formdata" || t === "object" && ct(e.toString) && e.toString() === "[object FormData]"));
}, isArrayBufferView: function(e) {
  let t;
  return t = typeof ArrayBuffer < "u" && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && Yc(e.buffer), t;
}, isString: jy, isNumber: Xc, isBoolean: (e) => e === !0 || e === !1, isObject: Ga, isPlainObject: Za, isReadableStream: Fy, isRequest: _y, isResponse: Hy, isHeaders: Uy, isUndefined: Un, isDate: zy, isFile: Ry, isBlob: Ny, isRegExp: Yy, isFunction: ct, isStream: (e) => Ga(e) && ct(e.pipe), isURLSearchParams: Ly, isTypedArray: qy, isFileList: My, forEach: qn, merge: function e() {
  const { caseless: t } = Zc(this) && this || {}, o = {}, n = (a, l) => {
    const r = t && Gc(o, l) || l;
    Za(o[r]) && Za(a) ? o[r] = e(o[r], a) : Za(a) ? o[r] = e({}, a) : sn(a) ? o[r] = a.slice() : o[r] = a;
  };
  for (let a = 0, l = arguments.length; a < l; a++) arguments[a] && qn(arguments[a], n);
  return o;
}, extend: (e, t, o, { allOwnKeys: n } = {}) => (qn(t, (a, l) => {
  o && ct(a) ? e[l] = h1(a, o) : e[l] = a;
}, { allOwnKeys: n }), e), trim: (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ""), stripBOM: (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), inherits: (e, t, o, n) => {
  e.prototype = Object.create(t.prototype, n), e.prototype.constructor = e, Object.defineProperty(e, "super", { value: t.prototype }), o && Object.assign(e.prototype, o);
}, toFlatObject: (e, t, o, n) => {
  let a, l, r;
  const s = {};
  if (t = t || {}, e == null) return t;
  do {
    for (a = Object.getOwnPropertyNames(e), l = a.length; l-- > 0; ) r = a[l], n && !n(r, e, t) || s[r] || (t[r] = e[r], s[r] = !0);
    e = o !== !1 && Hi(e);
  } while (e && (!o || o(e, t)) && e !== Object.prototype);
  return t;
}, kindOf: wl, kindOfTest: It, endsWith: (e, t, o) => {
  e = String(e), (o === void 0 || o > e.length) && (o = e.length), o -= t.length;
  const n = e.indexOf(t, o);
  return n !== -1 && n === o;
}, toArray: (e) => {
  if (!e) return null;
  if (sn(e)) return e;
  let t = e.length;
  if (!Xc(t)) return null;
  const o = new Array(t);
  for (; t-- > 0; ) o[t] = e[t];
  return o;
}, forEachEntry: (e, t) => {
  const o = (e && e[Symbol.iterator]).call(e);
  let n;
  for (; (n = o.next()) && !n.done; ) {
    const a = n.value;
    t.call(e, a[0], a[1]);
  }
}, matchAll: (e, t) => {
  let o;
  const n = [];
  for (; (o = e.exec(t)) !== null; ) n.push(o);
  return n;
}, isHTMLForm: Wy, hasOwnProperty: Kc, hasOwnProp: Kc, reduceDescriptors: Jc, freezeMethods: (e) => {
  Jc(e, (t, o) => {
    if (ct(e) && ["arguments", "caller", "callee"].indexOf(o) !== -1) return !1;
    const n = e[o];
    ct(n) && (t.enumerable = !1, "writable" in t ? t.writable = !1 : t.set || (t.set = () => {
      throw Error("Can not rewrite read-only method '" + o + "'");
    }));
  });
}, toObjectSet: (e, t) => {
  const o = {}, n = (a) => {
    a.forEach((l) => {
      o[l] = !0;
    });
  };
  return sn(e) ? n(e) : n(String(e).split(t)), o;
}, toCamelCase: (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(t, o, n) {
  return o.toUpperCase() + n;
}), noop: () => {
}, toFiniteNumber: (e, t) => e != null && Number.isFinite(e = +e) ? e : t, findKey: Gc, global: Po, isContextDefined: Zc, isSpecCompliantForm: function(e) {
  return !!(e && ct(e.append) && e[Symbol.toStringTag] === "FormData" && e[Symbol.iterator]);
}, toJSONObject: (e) => {
  const t = new Array(10), o = (n, a) => {
    if (Ga(n)) {
      if (t.indexOf(n) >= 0) return;
      if (!("toJSON" in n)) {
        t[a] = n;
        const l = sn(n) ? [] : {};
        return qn(n, (r, s) => {
          const c = o(r, a + 1);
          !Un(c) && (l[s] = c);
        }), t[a] = void 0, l;
      }
    }
    return n;
  };
  return o(e, 0);
}, isAsyncFn: Xy, isThenable: (e) => e && (Ga(e) || ct(e)) && ct(e.then) && ct(e.catch), setImmediate: g1, asap: Gy };
function de(e, t, o, n, a) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), o && (this.config = o), n && (this.request = n), a && (this.response = a, this.status = a.status ? a.status : null);
}
H.inherits(de, Error, { toJSON: function() {
  return { message: this.message, name: this.name, description: this.description, number: this.number, fileName: this.fileName, lineNumber: this.lineNumber, columnNumber: this.columnNumber, stack: this.stack, config: H.toJSONObject(this.config), code: this.code, status: this.status };
} });
const tu = de.prototype, ou = {};
["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach((e) => {
  ou[e] = { value: e };
}), Object.defineProperties(de, ou), Object.defineProperty(tu, "isAxiosError", { value: !0 }), de.from = (e, t, o, n, a, l) => {
  const r = Object.create(tu);
  return H.toFlatObject(e, r, function(s) {
    return s !== Error.prototype;
  }, (s) => s !== "isAxiosError"), de.call(r, e.message, t, o, n, a), r.cause = e, r.name = e.name, l && Object.assign(r, l), r;
};
function Dr(e) {
  return H.isPlainObject(e) || H.isArray(e);
}
function b1(e) {
  return H.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function nu(e, t, o) {
  return e ? e.concat(t).map(function(n, a) {
    return n = b1(n), !o && a ? "[" + n + "]" : n;
  }).join(o ? "." : "") : t;
}
const Zy = H.toFlatObject(H, {}, null, function(e) {
  return /^is[A-Z]/.test(e);
});
function xl(e, t, o) {
  if (!H.isObject(e)) throw new TypeError("target must be an object");
  t = t || new FormData();
  const n = (o = H.toFlatObject(o, { metaTokens: !0, dots: !1, indexes: !1 }, !1, function(v, h) {
    return !H.isUndefined(h[v]);
  })).metaTokens, a = o.visitor || d, l = o.dots, r = o.indexes, s = (o.Blob || typeof Blob < "u" && Blob) && H.isSpecCompliantForm(t);
  if (!H.isFunction(a)) throw new TypeError("visitor must be a function");
  function c(v) {
    if (v === null) return "";
    if (H.isDate(v)) return v.toISOString();
    if (!s && H.isBlob(v)) throw new de("Blob is not supported. Use a Buffer instead.");
    return H.isArrayBuffer(v) || H.isTypedArray(v) ? s && typeof Blob == "function" ? new Blob([v]) : Buffer.from(v) : v;
  }
  function d(v, h, g) {
    let f = v;
    if (v && !g && typeof v == "object") {
      if (H.endsWith(h, "{}")) h = n ? h : h.slice(0, -2), v = JSON.stringify(v);
      else if (H.isArray(v) && function(b) {
        return H.isArray(b) && !b.some(Dr);
      }(v) || (H.isFileList(v) || H.endsWith(h, "[]")) && (f = H.toArray(v))) return h = b1(h), f.forEach(function(b, w) {
        !H.isUndefined(b) && b !== null && t.append(r === !0 ? nu([h], w, l) : r === null ? h : h + "[]", c(b));
      }), !1;
    }
    return !!Dr(v) || (t.append(nu(g, h, l), c(v)), !1);
  }
  const u = [], p = Object.assign(Zy, { defaultVisitor: d, convertValue: c, isVisitable: Dr });
  if (!H.isObject(e)) throw new TypeError("data must be an object");
  return function v(h, g) {
    if (!H.isUndefined(h)) {
      if (u.indexOf(h) !== -1) throw Error("Circular reference detected in " + g.join("."));
      u.push(h), H.forEach(h, function(f, b) {
        (!(H.isUndefined(f) || f === null) && a.call(t, f, H.isString(b) ? b.trim() : b, g, p)) === !0 && v(f, g ? g.concat(b) : [b]);
      }), u.pop();
    }
  }(e), t;
}
function au(e) {
  const t = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+", "%00": "\0" };
  return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function(o) {
    return t[o];
  });
}
function Ui(e, t) {
  this._pairs = [], e && xl(e, this, t);
}
const lu = Ui.prototype;
function Ky(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function y1(e, t, o) {
  if (!t) return e;
  const n = o && o.encode || Ky;
  H.isFunction(o) && (o = { serialize: o });
  const a = o && o.serialize;
  let l;
  if (l = a ? a(t, o) : H.isURLSearchParams(t) ? t.toString() : new Ui(t, o).toString(n), l) {
    const r = e.indexOf("#");
    r !== -1 && (e = e.slice(0, r)), e += (e.indexOf("?") === -1 ? "?" : "&") + l;
  }
  return e;
}
lu.append = function(e, t) {
  this._pairs.push([e, t]);
}, lu.toString = function(e) {
  const t = e ? function(o) {
    return e.call(this, o, au);
  } : au;
  return this._pairs.map(function(o) {
    return t(o[0]) + "=" + t(o[1]);
  }, "").join("&");
};
class ru {
  constructor() {
    this.handlers = [];
  }
  use(t, o, n) {
    return this.handlers.push({ fulfilled: t, rejected: o, synchronous: !!n && n.synchronous, runWhen: n ? n.runWhen : null }), this.handlers.length - 1;
  }
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  clear() {
    this.handlers && (this.handlers = []);
  }
  forEach(t) {
    H.forEach(this.handlers, function(o) {
      o !== null && t(o);
    });
  }
}
const w1 = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 }, Jy = { isBrowser: !0, classes: { URLSearchParams: typeof URLSearchParams < "u" ? URLSearchParams : Ui, FormData: typeof FormData < "u" ? FormData : null, Blob: typeof Blob < "u" ? Blob : null }, protocols: ["http", "https", "file", "blob", "url", "data"] }, qi = typeof window < "u" && typeof document < "u", oi = typeof navigator == "object" && navigator || void 0, Qy = qi && (!oi || ["ReactNative", "NativeScript", "NS"].indexOf(oi.product) < 0), e5 = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function", t5 = qi && window.location.href || "http://localhost", Ze = { ...Object.freeze(Object.defineProperty({ __proto__: null, hasBrowserEnv: qi, hasStandardBrowserEnv: Qy, hasStandardBrowserWebWorkerEnv: e5, navigator: oi, origin: t5 }, Symbol.toStringTag, { value: "Module" })), ...Jy };
function x1(e) {
  function t(o, n, a, l) {
    let r = o[l++];
    if (r === "__proto__") return !0;
    const s = Number.isFinite(+r), c = l >= o.length;
    return r = !r && H.isArray(a) ? a.length : r, c ? (H.hasOwnProp(a, r) ? a[r] = [a[r], n] : a[r] = n, !s) : (a[r] && H.isObject(a[r]) || (a[r] = []), t(o, n, a[r], l) && H.isArray(a[r]) && (a[r] = function(d) {
      const u = {}, p = Object.keys(d);
      let v;
      const h = p.length;
      let g;
      for (v = 0; v < h; v++) g = p[v], u[g] = d[g];
      return u;
    }(a[r])), !s);
  }
  if (H.isFormData(e) && H.isFunction(e.entries)) {
    const o = {};
    return H.forEachEntry(e, (n, a) => {
      t(function(l) {
        return H.matchAll(/\w+|\[(\w*)]/g, l).map((r) => r[0] === "[]" ? "" : r[1] || r[0]);
      }(n), a, o, 0);
    }), o;
  }
  return null;
}
const pa = { transitional: w1, adapter: ["xhr", "http", "fetch"], transformRequest: [function(e, t) {
  const o = t.getContentType() || "", n = o.indexOf("application/json") > -1, a = H.isObject(e);
  if (a && H.isHTMLForm(e) && (e = new FormData(e)), H.isFormData(e)) return n ? JSON.stringify(x1(e)) : e;
  if (H.isArrayBuffer(e) || H.isBuffer(e) || H.isStream(e) || H.isFile(e) || H.isBlob(e) || H.isReadableStream(e)) return e;
  if (H.isArrayBufferView(e)) return e.buffer;
  if (H.isURLSearchParams(e)) return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
  let l;
  if (a) {
    if (o.indexOf("application/x-www-form-urlencoded") > -1) return function(r, s) {
      return xl(r, new Ze.classes.URLSearchParams(), Object.assign({ visitor: function(c, d, u, p) {
        return Ze.isNode && H.isBuffer(c) ? (this.append(d, c.toString("base64")), !1) : p.defaultVisitor.apply(this, arguments);
      } }, s));
    }(e, this.formSerializer).toString();
    if ((l = H.isFileList(e)) || o.indexOf("multipart/form-data") > -1) {
      const r = this.env && this.env.FormData;
      return xl(l ? { "files[]": e } : e, r && new r(), this.formSerializer);
    }
  }
  return a || n ? (t.setContentType("application/json", !1), function(r, s, c) {
    if (H.isString(r)) try {
      return (s || JSON.parse)(r), H.trim(r);
    } catch (d) {
      if (d.name !== "SyntaxError") throw d;
    }
    return (c || JSON.stringify)(r);
  }(e)) : e;
}], transformResponse: [function(e) {
  const t = this.transitional || pa.transitional, o = t && t.forcedJSONParsing, n = this.responseType === "json";
  if (H.isResponse(e) || H.isReadableStream(e)) return e;
  if (e && H.isString(e) && (o && !this.responseType || n)) {
    const a = !(t && t.silentJSONParsing) && n;
    try {
      return JSON.parse(e);
    } catch (l) {
      if (a)
        throw l.name === "SyntaxError" ? de.from(l, de.ERR_BAD_RESPONSE, this, null, this.response) : l;
    }
  }
  return e;
}], timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, maxBodyLength: -1, env: { FormData: Ze.classes.FormData, Blob: Ze.classes.Blob }, validateStatus: function(e) {
  return e >= 200 && e < 300;
}, headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } } };
H.forEach(["delete", "get", "head", "post", "put", "patch"], (e) => {
  pa.headers[e] = {};
});
const o5 = H.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]), iu = Symbol("internals");
function Fn(e) {
  return e && String(e).trim().toLowerCase();
}
function al(e) {
  return e === !1 || e == null ? e : H.isArray(e) ? e.map(al) : String(e);
}
function Ar(e, t, o, n, a) {
  return H.isFunction(n) ? n.call(this, t, o) : (a && (t = o), H.isString(t) ? H.isString(n) ? t.indexOf(n) !== -1 : H.isRegExp(n) ? n.test(t) : void 0 : void 0);
}
let it = class {
  constructor(e) {
    e && this.set(e);
  }
  set(e, t, o) {
    const n = this;
    function a(r, s, c) {
      const d = Fn(s);
      if (!d) throw new Error("header name must be a non-empty string");
      const u = H.findKey(n, d);
      (!u || n[u] === void 0 || c === !0 || c === void 0 && n[u] !== !1) && (n[u || s] = al(r));
    }
    const l = (r, s) => H.forEach(r, (c, d) => a(c, d, s));
    if (H.isPlainObject(e) || e instanceof this.constructor) l(e, t);
    else if (H.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim())) l(((r) => {
      const s = {};
      let c, d, u;
      return r && r.split(`
`).forEach(function(p) {
        u = p.indexOf(":"), c = p.substring(0, u).trim().toLowerCase(), d = p.substring(u + 1).trim(), !c || s[c] && o5[c] || (c === "set-cookie" ? s[c] ? s[c].push(d) : s[c] = [d] : s[c] = s[c] ? s[c] + ", " + d : d);
      }), s;
    })(e), t);
    else if (H.isHeaders(e)) for (const [r, s] of e.entries()) a(s, r, o);
    else e != null && a(t, e, o);
    return this;
  }
  get(e, t) {
    if (e = Fn(e)) {
      const o = H.findKey(this, e);
      if (o) {
        const n = this[o];
        if (!t) return n;
        if (t === !0) return function(a) {
          const l = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
          let s;
          for (; s = r.exec(a); ) l[s[1]] = s[2];
          return l;
        }(n);
        if (H.isFunction(t)) return t.call(this, n, o);
        if (H.isRegExp(t)) return t.exec(n);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(e, t) {
    if (e = Fn(e)) {
      const o = H.findKey(this, e);
      return !(!o || this[o] === void 0 || t && !Ar(0, this[o], o, t));
    }
    return !1;
  }
  delete(e, t) {
    const o = this;
    let n = !1;
    function a(l) {
      if (l = Fn(l)) {
        const r = H.findKey(o, l);
        !r || t && !Ar(0, o[r], r, t) || (delete o[r], n = !0);
      }
    }
    return H.isArray(e) ? e.forEach(a) : a(e), n;
  }
  clear(e) {
    const t = Object.keys(this);
    let o = t.length, n = !1;
    for (; o--; ) {
      const a = t[o];
      e && !Ar(0, this[a], a, e, !0) || (delete this[a], n = !0);
    }
    return n;
  }
  normalize(e) {
    const t = this, o = {};
    return H.forEach(this, (n, a) => {
      const l = H.findKey(o, a);
      if (l) return t[l] = al(n), void delete t[a];
      const r = e ? function(s) {
        return s.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (c, d, u) => d.toUpperCase() + u);
      }(a) : String(a).trim();
      r !== a && delete t[a], t[r] = al(n), o[r] = !0;
    }), this;
  }
  concat(...e) {
    return this.constructor.concat(this, ...e);
  }
  toJSON(e) {
    const t = /* @__PURE__ */ Object.create(null);
    return H.forEach(this, (o, n) => {
      o != null && o !== !1 && (t[n] = e && H.isArray(o) ? o.join(", ") : o);
    }), t;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([e, t]) => e + ": " + t).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(e) {
    return e instanceof this ? e : new this(e);
  }
  static concat(e, ...t) {
    const o = new this(e);
    return t.forEach((n) => o.set(n)), o;
  }
  static accessor(e) {
    const t = (this[iu] = this[iu] = { accessors: {} }).accessors, o = this.prototype;
    function n(a) {
      const l = Fn(a);
      t[l] || (function(r, s) {
        const c = H.toCamelCase(" " + s);
        ["get", "set", "has"].forEach((d) => {
          Object.defineProperty(r, d + c, { value: function(u, p, v) {
            return this[d].call(this, s, u, p, v);
          }, configurable: !0 });
        });
      }(o, a), t[l] = !0);
    }
    return H.isArray(e) ? e.forEach(n) : n(e), this;
  }
};
function Er(e, t) {
  const o = this || pa, n = t || o, a = it.from(n.headers);
  let l = n.data;
  return H.forEach(e, function(r) {
    l = r.call(o, l, a.normalize(), t ? t.status : void 0);
  }), a.normalize(), l;
}
function S1(e) {
  return !(!e || !e.__CANCEL__);
}
function bn(e, t, o) {
  de.call(this, e ?? "canceled", de.ERR_CANCELED, t, o), this.name = "CanceledError";
}
function k1(e, t, o) {
  const n = o.config.validateStatus;
  o.status && n && !n(o.status) ? t(new de("Request failed with status code " + o.status, [de.ERR_BAD_REQUEST, de.ERR_BAD_RESPONSE][Math.floor(o.status / 100) - 4], o.config, o.request, o)) : e(o);
}
it.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), H.reduceDescriptors(it.prototype, ({ value: e }, t) => {
  let o = t[0].toUpperCase() + t.slice(1);
  return { get: () => e, set(n) {
    this[o] = n;
  } };
}), H.freezeMethods(it), H.inherits(bn, de, { __CANCEL__: !0 });
const Sl = (e, t, o = 3) => {
  let n = 0;
  const a = function(l, r) {
    l = l || 10;
    const s = new Array(l), c = new Array(l);
    let d, u = 0, p = 0;
    return r = r !== void 0 ? r : 1e3, function(v) {
      const h = Date.now(), g = c[p];
      d || (d = h), s[u] = v, c[u] = h;
      let f = p, b = 0;
      for (; f !== u; ) b += s[f++], f %= l;
      if (u = (u + 1) % l, u === p && (p = (p + 1) % l), h - d < r) return;
      const w = g && h - g;
      return w ? Math.round(1e3 * b / w) : void 0;
    };
  }(50, 250);
  return function(l, r) {
    let s, c, d = 0, u = 1e3 / r;
    const p = (v, h = Date.now()) => {
      d = h, s = null, c && (clearTimeout(c), c = null), l.apply(null, v);
    };
    return [(...v) => {
      const h = Date.now(), g = h - d;
      g >= u ? p(v, h) : (s = v, c || (c = setTimeout(() => {
        c = null, p(s);
      }, u - g)));
    }, () => s && p(s)];
  }((l) => {
    const r = l.loaded, s = l.lengthComputable ? l.total : void 0, c = r - n, d = a(c);
    n = r, e({ loaded: r, total: s, progress: s ? r / s : void 0, bytes: c, rate: d || void 0, estimated: d && s && r <= s ? (s - r) / d : void 0, event: l, lengthComputable: s != null, [t ? "download" : "upload"]: !0 });
  }, o);
}, su = (e, t) => {
  const o = e != null;
  return [(n) => t[0]({ lengthComputable: o, total: e, loaded: n }), t[1]];
}, cu = (e) => (...t) => H.asap(() => e(...t)), n5 = Ze.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (o) => (o = new URL(o, Ze.origin), e.protocol === o.protocol && e.host === o.host && (t || e.port === o.port)))(new URL(Ze.origin), Ze.navigator && /(msie|trident)/i.test(Ze.navigator.userAgent)) : () => !0, a5 = Ze.hasStandardBrowserEnv ? { write(e, t, o, n, a, l) {
  const r = [e + "=" + encodeURIComponent(t)];
  H.isNumber(o) && r.push("expires=" + new Date(o).toGMTString()), H.isString(n) && r.push("path=" + n), H.isString(a) && r.push("domain=" + a), l === !0 && r.push("secure"), document.cookie = r.join("; ");
}, read(e) {
  const t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
  return t ? decodeURIComponent(t[3]) : null;
}, remove(e) {
  this.write(e, "", Date.now() - 864e5);
} } : { write() {
}, read: () => null, remove() {
} };
function C1(e, t, o) {
  let n = !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(t);
  return e && (n || o == 0) ? function(a, l) {
    return l ? a.replace(/\/?\/$/, "") + "/" + l.replace(/^\/+/, "") : a;
  }(e, t) : t;
}
const uu = (e) => e instanceof it ? { ...e } : e;
function No(e, t) {
  t = t || {};
  const o = {};
  function n(d, u, p, v) {
    return H.isPlainObject(d) && H.isPlainObject(u) ? H.merge.call({ caseless: v }, d, u) : H.isPlainObject(u) ? H.merge({}, u) : H.isArray(u) ? u.slice() : u;
  }
  function a(d, u, p, v) {
    return H.isUndefined(u) ? H.isUndefined(d) ? void 0 : n(void 0, d, 0, v) : n(d, u, 0, v);
  }
  function l(d, u) {
    if (!H.isUndefined(u)) return n(void 0, u);
  }
  function r(d, u) {
    return H.isUndefined(u) ? H.isUndefined(d) ? void 0 : n(void 0, d) : n(void 0, u);
  }
  function s(d, u, p) {
    return p in t ? n(d, u) : p in e ? n(void 0, d) : void 0;
  }
  const c = { url: l, method: l, data: l, baseURL: r, transformRequest: r, transformResponse: r, paramsSerializer: r, timeout: r, timeoutMessage: r, withCredentials: r, withXSRFToken: r, adapter: r, responseType: r, xsrfCookieName: r, xsrfHeaderName: r, onUploadProgress: r, onDownloadProgress: r, decompress: r, maxContentLength: r, maxBodyLength: r, beforeRedirect: r, transport: r, httpAgent: r, httpsAgent: r, cancelToken: r, socketPath: r, responseEncoding: r, validateStatus: s, headers: (d, u, p) => a(uu(d), uu(u), 0, !0) };
  return H.forEach(Object.keys(Object.assign({}, e, t)), function(d) {
    const u = c[d] || a, p = u(e[d], t[d], d);
    H.isUndefined(p) && u !== s || (o[d] = p);
  }), o;
}
const T1 = (e) => {
  const t = No({}, e);
  let o, { data: n, withXSRFToken: a, xsrfHeaderName: l, xsrfCookieName: r, headers: s, auth: c } = t;
  if (t.headers = s = it.from(s), t.url = y1(C1(t.baseURL, t.url, t.allowAbsoluteUrls), e.params, e.paramsSerializer), c && s.set("Authorization", "Basic " + btoa((c.username || "") + ":" + (c.password ? unescape(encodeURIComponent(c.password)) : ""))), H.isFormData(n)) {
    if (Ze.hasStandardBrowserEnv || Ze.hasStandardBrowserWebWorkerEnv) s.setContentType(void 0);
    else if ((o = s.getContentType()) !== !1) {
      const [d, ...u] = o ? o.split(";").map((p) => p.trim()).filter(Boolean) : [];
      s.setContentType([d || "multipart/form-data", ...u].join("; "));
    }
  }
  if (Ze.hasStandardBrowserEnv && (a && H.isFunction(a) && (a = a(t)), a || a !== !1 && n5(t.url))) {
    const d = l && r && a5.read(r);
    d && s.set(l, d);
  }
  return t;
}, l5 = typeof XMLHttpRequest < "u" && function(e) {
  return new Promise(function(t, o) {
    const n = T1(e);
    let a = n.data;
    const l = it.from(n.headers).normalize();
    let r, s, c, d, u, { responseType: p, onUploadProgress: v, onDownloadProgress: h } = n;
    function g() {
      d && d(), u && u(), n.cancelToken && n.cancelToken.unsubscribe(r), n.signal && n.signal.removeEventListener("abort", r);
    }
    let f = new XMLHttpRequest();
    function b() {
      if (!f) return;
      const y = it.from("getAllResponseHeaders" in f && f.getAllResponseHeaders());
      k1(function(k) {
        t(k), g();
      }, function(k) {
        o(k), g();
      }, { data: p && p !== "text" && p !== "json" ? f.response : f.responseText, status: f.status, statusText: f.statusText, headers: y, config: e, request: f }), f = null;
    }
    f.open(n.method.toUpperCase(), n.url, !0), f.timeout = n.timeout, "onloadend" in f ? f.onloadend = b : f.onreadystatechange = function() {
      f && f.readyState === 4 && (f.status !== 0 || f.responseURL && f.responseURL.indexOf("file:") === 0) && setTimeout(b);
    }, f.onabort = function() {
      f && (o(new de("Request aborted", de.ECONNABORTED, e, f)), f = null);
    }, f.onerror = function() {
      o(new de("Network Error", de.ERR_NETWORK, e, f)), f = null;
    }, f.ontimeout = function() {
      let y = n.timeout ? "timeout of " + n.timeout + "ms exceeded" : "timeout exceeded";
      const k = n.transitional || w1;
      n.timeoutErrorMessage && (y = n.timeoutErrorMessage), o(new de(y, k.clarifyTimeoutError ? de.ETIMEDOUT : de.ECONNABORTED, e, f)), f = null;
    }, a === void 0 && l.setContentType(null), "setRequestHeader" in f && H.forEach(l.toJSON(), function(y, k) {
      f.setRequestHeader(k, y);
    }), H.isUndefined(n.withCredentials) || (f.withCredentials = !!n.withCredentials), p && p !== "json" && (f.responseType = n.responseType), h && ([c, u] = Sl(h, !0), f.addEventListener("progress", c)), v && f.upload && ([s, d] = Sl(v), f.upload.addEventListener("progress", s), f.upload.addEventListener("loadend", d)), (n.cancelToken || n.signal) && (r = (y) => {
      f && (o(!y || y.type ? new bn(null, e, f) : y), f.abort(), f = null);
    }, n.cancelToken && n.cancelToken.subscribe(r), n.signal && (n.signal.aborted ? r() : n.signal.addEventListener("abort", r)));
    const w = function(y) {
      const k = /^([-+\w]{1,25})(:?\/\/|:)/.exec(y);
      return k && k[1] || "";
    }(n.url);
    w && Ze.protocols.indexOf(w) === -1 ? o(new de("Unsupported protocol " + w + ":", de.ERR_BAD_REQUEST, e)) : f.send(a || null);
  });
}, r5 = (e, t) => {
  const { length: o } = e = e ? e.filter(Boolean) : [];
  if (t || o) {
    let n, a = new AbortController();
    const l = function(d) {
      if (!n) {
        n = !0, s();
        const u = d instanceof Error ? d : this.reason;
        a.abort(u instanceof de ? u : new bn(u instanceof Error ? u.message : u));
      }
    };
    let r = t && setTimeout(() => {
      r = null, l(new de(`timeout ${t} of ms exceeded`, de.ETIMEDOUT));
    }, t);
    const s = () => {
      e && (r && clearTimeout(r), r = null, e.forEach((d) => {
        d.unsubscribe ? d.unsubscribe(l) : d.removeEventListener("abort", l);
      }), e = null);
    };
    e.forEach((d) => d.addEventListener("abort", l));
    const { signal: c } = a;
    return c.unsubscribe = () => H.asap(s), c;
  }
}, i5 = function* (e, t) {
  let o = e.byteLength;
  if (o < t) return void (yield e);
  let n, a = 0;
  for (; a < o; ) n = a + t, yield e.slice(a, n), a = n;
}, s5 = async function* (e) {
  if (e[Symbol.asyncIterator]) return void (yield* e);
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: o, value: n } = await t.read();
      if (o) break;
      yield n;
    }
  } finally {
    await t.cancel();
  }
}, du = (e, t, o, n) => {
  const a = async function* (c, d) {
    for await (const u of s5(c)) yield* i5(u, d);
  }(e, t);
  let l, r = 0, s = (c) => {
    l || (l = !0, n && n(c));
  };
  return new ReadableStream({ async pull(c) {
    try {
      const { done: d, value: u } = await a.next();
      if (d) return s(), void c.close();
      let p = u.byteLength;
      if (o) {
        let v = r += p;
        o(v);
      }
      c.enqueue(new Uint8Array(u));
    } catch (d) {
      throw s(d), d;
    }
  }, cancel: (c) => (s(c), a.return()) }, { highWaterMark: 2 });
}, Ul = typeof fetch == "function" && typeof Request == "function" && typeof Response == "function", O1 = Ul && typeof ReadableStream == "function", c5 = Ul && (typeof TextEncoder == "function" ? (pu = new TextEncoder(), (e) => pu.encode(e)) : async (e) => new Uint8Array(await new Response(e).arrayBuffer()));
var pu;
const B1 = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, u5 = O1 && B1(() => {
  let e = !1;
  const t = new Request(Ze.origin, { body: new ReadableStream(), method: "POST", get duplex() {
    return e = !0, "half";
  } }).headers.has("Content-Type");
  return e && !t;
}), ni = O1 && B1(() => H.isReadableStream(new Response("").body)), kl = { stream: ni && ((e) => e.body) };
var vu;
Ul && (vu = new Response(), ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((e) => {
  !kl[e] && (kl[e] = H.isFunction(vu[e]) ? (t) => t[e]() : (t, o) => {
    throw new de(`Response type '${e}' is not supported`, de.ERR_NOT_SUPPORT, o);
  });
}));
const d5 = async (e, t) => {
  const o = H.toFiniteNumber(e.getContentLength());
  return o ?? (async (n) => n == null ? 0 : H.isBlob(n) ? n.size : H.isSpecCompliantForm(n) ? (await new Request(Ze.origin, { method: "POST", body: n }).arrayBuffer()).byteLength : H.isArrayBufferView(n) || H.isArrayBuffer(n) ? n.byteLength : (H.isURLSearchParams(n) && (n += ""), H.isString(n) ? (await c5(n)).byteLength : void 0))(t);
}, V1 = { http: null, xhr: l5, fetch: Ul && (async (e) => {
  let { url: t, method: o, data: n, signal: a, cancelToken: l, timeout: r, onDownloadProgress: s, onUploadProgress: c, responseType: d, headers: u, withCredentials: p = "same-origin", fetchOptions: v } = T1(e);
  d = d ? (d + "").toLowerCase() : "text";
  let h, g = r5([a, l && l.toAbortSignal()], r);
  const f = g && g.unsubscribe && (() => {
    g.unsubscribe();
  });
  let b;
  try {
    if (c && u5 && o !== "get" && o !== "head" && (b = await d5(u, n)) !== 0) {
      let S, O = new Request(t, { method: "POST", body: n, duplex: "half" });
      if (H.isFormData(n) && (S = O.headers.get("content-type")) && u.setContentType(S), O.body) {
        const [B, m] = su(b, Sl(cu(c)));
        n = du(O.body, 65536, B, m);
      }
    }
    H.isString(p) || (p = p ? "include" : "omit");
    const w = "credentials" in Request.prototype;
    h = new Request(t, { ...v, signal: g, method: o.toUpperCase(), headers: u.normalize().toJSON(), body: n, duplex: "half", credentials: w ? p : void 0 });
    let y = await fetch(h);
    const k = ni && (d === "stream" || d === "response");
    if (ni && (s || k && f)) {
      const S = {};
      ["status", "statusText", "headers"].forEach((x) => {
        S[x] = y[x];
      });
      const O = H.toFiniteNumber(y.headers.get("content-length")), [B, m] = s && su(O, Sl(cu(s), !0)) || [];
      y = new Response(du(y.body, 65536, B, () => {
        m && m(), f && f();
      }), S);
    }
    d = d || "text";
    let C = await kl[H.findKey(kl, d) || "text"](y, e);
    return !k && f && f(), await new Promise((S, O) => {
      k1(S, O, { data: C, headers: it.from(y.headers), status: y.status, statusText: y.statusText, config: e, request: h });
    });
  } catch (w) {
    throw f && f(), w && w.name === "TypeError" && /fetch/i.test(w.message) ? Object.assign(new de("Network Error", de.ERR_NETWORK, e, h), { cause: w.cause || w }) : de.from(w, w && w.code, e, h);
  }
}) };
H.forEach(V1, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
const fu = (e) => `- ${e}`, p5 = (e) => H.isFunction(e) || e === null || e === !1, D1 = (e) => {
  e = H.isArray(e) ? e : [e];
  const { length: t } = e;
  let o, n;
  const a = {};
  for (let l = 0; l < t; l++) {
    let r;
    if (o = e[l], n = o, !p5(o) && (n = V1[(r = String(o)).toLowerCase()], n === void 0)) throw new de(`Unknown adapter '${r}'`);
    if (n) break;
    a[r || "#" + l] = n;
  }
  if (!n) {
    const l = Object.entries(a).map(([r, s]) => `adapter ${r} ` + (s === !1 ? "is not supported by the environment" : "is not available in the build"));
    throw new de("There is no suitable adapter to dispatch the request " + (t ? l.length > 1 ? `since :
` + l.map(fu).join(`
`) : " " + fu(l[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
  }
  return n;
};
function Pr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new bn(null, e);
}
function mu(e) {
  return Pr(e), e.headers = it.from(e.headers), e.data = Er.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), D1(e.adapter || pa.adapter)(e).then(function(t) {
    return Pr(e), t.data = Er.call(e, e.transformResponse, t), t.headers = it.from(t.headers), t;
  }, function(t) {
    return S1(t) || (Pr(e), t && t.response && (t.response.data = Er.call(e, e.transformResponse, t.response), t.response.headers = it.from(t.response.headers))), Promise.reject(t);
  });
}
const v5 = "1.8.4", Cl = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Cl[e] = function(o) {
    return typeof o === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const hu = {};
Cl.transitional = function(e, t, o) {
  function n(a, l) {
    return "[Axios v1.8.4] Transitional option '" + a + "'" + l + (o ? ". " + o : "");
  }
  return (a, l, r) => {
    if (e === !1) throw new de(n(l, " has been removed" + (t ? " in " + t : "")), de.ERR_DEPRECATED);
    return t && !hu[l] && (hu[l] = !0, console.warn(n(l, " has been deprecated since v" + t + " and will be removed in the near future"))), !e || e(a, l, r);
  };
}, Cl.spelling = function(e) {
  return (t, o) => (console.warn(`${o} is likely a misspelling of ${e}`), !0);
};
const ll = { assertOptions: function(e, t, o) {
  if (typeof e != "object") throw new de("options must be an object", de.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let a = n.length;
  for (; a-- > 0; ) {
    const l = n[a], r = t[l];
    if (r) {
      const s = e[l], c = s === void 0 || r(s, l, e);
      if (c !== !0) throw new de("option " + l + " must be " + c, de.ERR_BAD_OPTION_VALUE);
    } else if (o !== !0) throw new de("Unknown option " + l, de.ERR_BAD_OPTION);
  }
}, validators: Cl }, zt = ll.validators;
let jo = class {
  constructor(e) {
    this.defaults = e, this.interceptors = { request: new ru(), response: new ru() };
  }
  async request(e, t) {
    try {
      return await this._request(e, t);
    } catch (o) {
      if (o instanceof Error) {
        let n = {};
        Error.captureStackTrace ? Error.captureStackTrace(n) : n = new Error();
        const a = n.stack ? n.stack.replace(/^.+\n/, "") : "";
        try {
          o.stack ? a && !String(o.stack).endsWith(a.replace(/^.+\n.+\n/, "")) && (o.stack += `
` + a) : o.stack = a;
        } catch {
        }
      }
      throw o;
    }
  }
  _request(e, t) {
    typeof e == "string" ? (t = t || {}).url = e : t = e || {}, t = No(this.defaults, t);
    const { transitional: o, paramsSerializer: n, headers: a } = t;
    o !== void 0 && ll.assertOptions(o, { silentJSONParsing: zt.transitional(zt.boolean), forcedJSONParsing: zt.transitional(zt.boolean), clarifyTimeoutError: zt.transitional(zt.boolean) }, !1), n != null && (H.isFunction(n) ? t.paramsSerializer = { serialize: n } : ll.assertOptions(n, { encode: zt.function, serialize: zt.function }, !0)), t.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : t.allowAbsoluteUrls = !0), ll.assertOptions(t, { baseUrl: zt.spelling("baseURL"), withXsrfToken: zt.spelling("withXSRFToken") }, !0), t.method = (t.method || this.defaults.method || "get").toLowerCase();
    let l = a && H.merge(a.common, a[t.method]);
    a && H.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (h) => {
      delete a[h];
    }), t.headers = it.concat(l, a);
    const r = [];
    let s = !0;
    this.interceptors.request.forEach(function(h) {
      typeof h.runWhen == "function" && h.runWhen(t) === !1 || (s = s && h.synchronous, r.unshift(h.fulfilled, h.rejected));
    });
    const c = [];
    let d;
    this.interceptors.response.forEach(function(h) {
      c.push(h.fulfilled, h.rejected);
    });
    let u, p = 0;
    if (!s) {
      const h = [mu.bind(this), void 0];
      for (h.unshift.apply(h, r), h.push.apply(h, c), u = h.length, d = Promise.resolve(t); p < u; ) d = d.then(h[p++], h[p++]);
      return d;
    }
    u = r.length;
    let v = t;
    for (p = 0; p < u; ) {
      const h = r[p++], g = r[p++];
      try {
        v = h(v);
      } catch (f) {
        g.call(this, f);
        break;
      }
    }
    try {
      d = mu.call(this, v);
    } catch (h) {
      return Promise.reject(h);
    }
    for (p = 0, u = c.length; p < u; ) d = d.then(c[p++], c[p++]);
    return d;
  }
  getUri(e) {
    return y1(C1((e = No(this.defaults, e)).baseURL, e.url, e.allowAbsoluteUrls), e.params, e.paramsSerializer);
  }
};
H.forEach(["delete", "get", "head", "options"], function(e) {
  jo.prototype[e] = function(t, o) {
    return this.request(No(o || {}, { method: e, url: t, data: (o || {}).data }));
  };
}), H.forEach(["post", "put", "patch"], function(e) {
  function t(o) {
    return function(n, a, l) {
      return this.request(No(l || {}, { method: e, headers: o ? { "Content-Type": "multipart/form-data" } : {}, url: n, data: a }));
    };
  }
  jo.prototype[e] = t(), jo.prototype[e + "Form"] = t(!0);
});
const ai = { Continue: 100, SwitchingProtocols: 101, Processing: 102, EarlyHints: 103, Ok: 200, Created: 201, Accepted: 202, NonAuthoritativeInformation: 203, NoContent: 204, ResetContent: 205, PartialContent: 206, MultiStatus: 207, AlreadyReported: 208, ImUsed: 226, MultipleChoices: 300, MovedPermanently: 301, Found: 302, SeeOther: 303, NotModified: 304, UseProxy: 305, Unused: 306, TemporaryRedirect: 307, PermanentRedirect: 308, BadRequest: 400, Unauthorized: 401, PaymentRequired: 402, Forbidden: 403, NotFound: 404, MethodNotAllowed: 405, NotAcceptable: 406, ProxyAuthenticationRequired: 407, RequestTimeout: 408, Conflict: 409, Gone: 410, LengthRequired: 411, PreconditionFailed: 412, PayloadTooLarge: 413, UriTooLong: 414, UnsupportedMediaType: 415, RangeNotSatisfiable: 416, ExpectationFailed: 417, ImATeapot: 418, MisdirectedRequest: 421, UnprocessableEntity: 422, Locked: 423, FailedDependency: 424, TooEarly: 425, UpgradeRequired: 426, PreconditionRequired: 428, TooManyRequests: 429, RequestHeaderFieldsTooLarge: 431, UnavailableForLegalReasons: 451, InternalServerError: 500, NotImplemented: 501, BadGateway: 502, ServiceUnavailable: 503, GatewayTimeout: 504, HttpVersionNotSupported: 505, VariantAlsoNegotiates: 506, InsufficientStorage: 507, LoopDetected: 508, NotExtended: 510, NetworkAuthenticationRequired: 511 };
Object.entries(ai).forEach(([e, t]) => {
  ai[t] = e;
});
const $e = function e(t) {
  const o = new jo(t), n = h1(jo.prototype.request, o);
  return H.extend(n, jo.prototype, o, { allOwnKeys: !0 }), H.extend(n, o, null, { allOwnKeys: !0 }), n.create = function(a) {
    return e(No(t, a));
  }, n;
}(pa);
$e.Axios = jo, $e.CanceledError = bn, $e.CancelToken = class A1 {
  constructor(t) {
    if (typeof t != "function") throw new TypeError("executor must be a function.");
    let o;
    this.promise = new Promise(function(a) {
      o = a;
    });
    const n = this;
    this.promise.then((a) => {
      if (!n._listeners) return;
      let l = n._listeners.length;
      for (; l-- > 0; ) n._listeners[l](a);
      n._listeners = null;
    }), this.promise.then = (a) => {
      let l;
      const r = new Promise((s) => {
        n.subscribe(s), l = s;
      }).then(a);
      return r.cancel = function() {
        n.unsubscribe(l);
      }, r;
    }, t(function(a, l, r) {
      n.reason || (n.reason = new bn(a, l, r), o(n.reason));
    });
  }
  throwIfRequested() {
    if (this.reason) throw this.reason;
  }
  subscribe(t) {
    this.reason ? t(this.reason) : this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  unsubscribe(t) {
    if (!this._listeners) return;
    const o = this._listeners.indexOf(t);
    o !== -1 && this._listeners.splice(o, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), o = (n) => {
      t.abort(n);
    };
    return this.subscribe(o), t.signal.unsubscribe = () => this.unsubscribe(o), t.signal;
  }
  static source() {
    let t;
    return { token: new A1(function(n) {
      t = n;
    }), cancel: t };
  }
}, $e.isCancel = S1, $e.VERSION = v5, $e.toFormData = xl, $e.AxiosError = de, $e.Cancel = $e.CanceledError, $e.all = function(e) {
  return Promise.all(e);
}, $e.spread = function(e) {
  return function(t) {
    return e.apply(null, t);
  };
}, $e.isAxiosError = function(e) {
  return H.isObject(e) && e.isAxiosError === !0;
}, $e.mergeConfig = No, $e.AxiosHeaders = it, $e.formToJSON = (e) => x1(H.isHTMLForm(e) ? new FormData(e) : e), $e.getAdapter = D1, $e.HttpStatusCode = ai, $e.default = $e;
const { Axios: C5, AxiosError: T5, CanceledError: O5, isCancel: B5, CancelToken: V5, VERSION: D5, all: A5, Cancel: E5, isAxiosError: P5, spread: I5, toFormData: $5, AxiosHeaders: j5, HttpStatusCode: z5, formToJSON: R5, getAdapter: N5, mergeConfig: M5 } = $e, f5 = { style: { "text-align": "center", "font-size": "1.2em" } }, m5 = { key: 0 }, h5 = { key: 0 }, g5 = { style: { height: "60%" } }, b5 = z({ __name: "index", props: { show: Boolean, orgKey: String, parentId: { type: Number, default: 0 }, type: { type: String, default: "org" }, selected: { type: Array, default: () => [] }, multiple: Boolean, dataPermission: Boolean }, emits: ["update:show", "handleConfirm"], setup(e, { emit: t }) {
  const o = e, n = t, a = E({ get: () => (o.show && (h.value.length = 1, s.value = null, f.value = Dn.clone(o.selected, !0), p(o.parentId)), o.show), set(B) {
    n("update:show", B);
  } }), l = E(() => C.value ? c.value : r.value), r = A([]), s = A(""), c = A([]);
  function d() {
    if (C.value) {
      const B = Dn.locat().searchQuery.token || Dn.cookie("token") || null;
      $e({ url: "http://127.0.0.1:8001/api/dvadmin3_flow/flow_info/user_search/", method: "GET", headers: { Authorization: `JWT ${B}` }, params: { userName: s.value } }).then((m) => {
        const x = m.data;
        c.value = x.data, u(c.value);
      });
    }
  }
  async function u(B) {
    if (f.value.length > 0) for (let m in B) {
      let x = f.value.findIndex((T) => w(T, B[m]));
      x > -1 && (B[m] = f.value[x]);
    }
  }
  const p = (B = null, m = null) => {
    const x = Dn.locat().searchQuery.token || Dn.cookie("token") || null;
    $e({ url: "http://127.0.0.1:8001/api/dvadmin3_flow/flow_info/org_tree/", method: "GET", headers: { Authorization: `JWT ${x}` }, params: { deptId: B, type: o.type, dataPermission: o.dataPermission } }).then((T) => {
      const V = T.data;
      r.value = V.data, u(r.value), m && m(V.data);
    });
  }, v = () => {
    a.value = !1, n("handleConfirm", { key: o.orgKey, value: f.value.map((B) => ({ id: B.id, name: B.name, type: B.type, avatar: B.avatar })) });
  }, h = A([{ id: o.parentId, name: "" }]), g = (B, m) => {
    h.value.length = m + 1, p(B.id);
  }, f = A([]), b = (B) => {
    o.multiple || (f.value = [B[B.length - 1]]);
  }, w = (B, m) => B.id === m.id && B.type === m.type, y = E({ get: () => l.value.every((B) => f.value.some((m) => w(m, B))), set(B) {
    const m = l.value.filter((x) => {
      const T = !f.value.some((V) => w(V, x));
      switch (o.type) {
        case "user":
          return T && x.type === "user";
        case "dept":
        case "role":
          return T && o.type === x.type;
      }
      return !0;
    });
    B ? f.value.push(...m) : f.value = m;
  } }), k = E(() => !y.value && f.value.some((B) => l.value.some((m) => w(m, B)))), C = E(() => (s.value || "").trim() !== ""), S = () => {
    g(h.value[h.value.length - 2], h.value.length - 2);
  }, O = A([]);
  return Ce(() => {
    console.log("加载了....");
  }), (B, m) => (at(), Wn(Lt, { defer: "", to: "#h5preview" }, [i(Se(xt), { teleport: "#h5preview", show: a.value, "onUpdate:show": m[4] || (m[4] = (x) => a.value = x), position: "bottom", round: "", closeable: "", "overlay-style": { position: "absolute" }, style: { height: "80%", paddingTop: "10px", position: "absolute" } }, { default: Fe(() => [ho("div", f5, "选择" + _n(o.type == "user" ? "用户" : "部门"), 1), ho("div", null, [i(Se(Ld), { modelValue: s.value, "onUpdate:modelValue": m[0] || (m[0] = (x) => s.value = x), disabled: e.type !== "user" && e.type !== "org", placeholder: "搜索人员，支持姓名", onSearch: d }, null, 8, ["modelValue", "disabled"])]), e.type !== "role" ? (at(), Xt("div", m5, [i(Se(ie), { name: "manager", size: "24" }), (at(!0), Xt(be, null, Yn(h.value, (x, T) => (at(), Xt(be, null, [T > 1 ? (at(), Xt("span", h5, " > ")) : Ir("", !0), i(Se(Ro), { onClick: (V) => g(x, T), type: T === h.value.length - 1 ? "primary" : "success" }, { default: Fe(() => [mt(_n(x.name), 1)]), _: 2 }, 1032, ["onClick", "type"])], 64))), 256))])) : Ir("", !0), ho("div", null, [i(Se(dt), null, { title: Fe(() => [i(Se(na), { modelValue: y.value, "onUpdate:modelValue": m[1] || (m[1] = (x) => y.value = x), indeterminate: k.value, style: { padding: "0 5px" }, disabled: !(e.multiple && e.type === "user") }, { default: Fe(() => m[5] || (m[5] = [mt("全选")])), _: 1 }, 8, ["modelValue", "indeterminate", "disabled"])]), "right-icon": Fe(() => [i(Se(Le), { size: "small", type: "primary", icon: "ascending", onClick: S, disabled: h.value.length <= 1 || C.value }, { default: Fe(() => m[6] || (m[6] = [mt(" 上级 ")])), _: 1 }, 8, ["disabled"])]), _: 1 })]), ho("div", g5, [i(Se(wi), { modelValue: f.value, "onUpdate:modelValue": m[3] || (m[3] = (x) => f.value = x), onChange: b }, { default: Fe(() => [i(Se(wd), { inset: "" }, { default: Fe(() => [(at(!0), Xt(be, null, Yn(l.value, (x, T) => (at(), Wn(Se(dt), { clickable: "", key: x.id, onClick: (V) => ((P) => {
    O.value[P].toggle();
  })(T) }, yu({ title: Fe(() => [i(Se(na), { disabled: e.type === "user" && x.type === "dept", name: x, ref_for: !0, ref: (V) => O.value[T] = V, onClick: m[2] || (m[2] = Wi(() => {
  }, ["stop"])) }, { default: Fe(() => [mt(_n(x.name), 1)]), _: 2 }, 1032, ["disabled", "name"])]), _: 2 }, [x.type === "dept" ? { name: "right-icon", fn: Fe(() => [i(Se(Le), { type: "primary", icon: "descending", size: "small", onClick: Wi((V) => {
    var P;
    p((P = x).id, (N) => {
      h.value.push(P);
    });
  }, ["stop"]) }, { default: Fe(() => m[7] || (m[7] = [mt("下级")])), _: 2 }, 1032, ["onClick"])]), key: "0" } : void 0]), 1032, ["onClick"]))), 128))]), _: 1 })]), _: 1 }, 8, ["modelValue"])]), ho("div", null, [i(Se(Md), null, { default: Fe(() => [i(Se(_r), { span: "18" }, { default: Fe(() => [m[8] || (m[8] = ho("span", null, "已选：", -1)), (at(!0), Xt(be, null, Yn(f.value, (x) => (at(), Wn(Se(Ro), { style: { "margin-right": "5px" } }, { default: Fe(() => [mt(_n(x.name), 1)]), _: 2 }, 1024))), 256))]), _: 1 }), i(Se(_r), { span: "6" }, { default: Fe(() => [i(Se(Le), { type: "success", style: { width: "100%" }, size: "small", onClick: v }, { default: Fe(() => m[9] || (m[9] = [mt("确定")])), _: 1 })]), _: 1 })]), _: 1 })])]), _: 1 }, 8, ["show"])]));
} }), y5 = z({ __name: "index", props: { formItems: { type: Object, default: () => ({ components: [] }) }, formRules: { type: Object } }, emits: ["submitForm"], setup(e, { emit: t }) {
  const o = e, n = t, a = A(), l = A({}), r = ke({ TextInput: { type: "input" }, TextareaInput: { type: "input" }, NumberInput: { type: "stepper" }, Score: { type: "rate" }, SinglePicker: { type: "radio" }, MultiplePicker: { type: "checkbox" }, DateTimePicker: { type: "datetime-picker" }, DateTimeRangePicker: { type: "datetime-range-picker" }, DeptPicker: { type: "input-slot" }, UserPicker: { type: "input-slot" } }), s = A([]), c = A({}), d = E(() => {
    const f = [];
    for (let b of o.formItems.components) {
      const w = b.type, y = b.props, k = Object.keys(R1(r));
      let C = {};
      const S = b.key;
      if (k.includes(w)) {
        if (C = { type: r[w].type, label: b.name, name: S, required: y.required }, ["SinglePicker", "MultiplePicker"].includes(w)) for (let O of y.options) C.options = { text: O, value: O };
        ["DeptPicker", "UserPicker"].includes(w) && (s.value.push(S), C.itemProps = { slots: {} }, C.itemProps.slots[S] = {}, C.itemProps = { readonly: !0, slots: { button: () => N1(Le, { type: "primary", size: "small", onClick: () => v(S, b) }, "选择") } });
      }
      f.push(C);
    }
    return f;
  }), u = A(!1), p = A(""), v = (f, b) => {
    u.value = !0, console.log(117, b);
    let w = "org";
    b.type === "DeptPicker" && (w = "dept"), b.type === "UserPicker" && (w = "user"), p.value = f, c.value = { type: w, multiple: b.props.multiple, dataPermission: b.props.dataPermission };
  }, h = (f) => {
    console.log(f);
    const { key: b, value: w } = f;
    l.value[b] = w;
  }, g = () => {
    var f;
    (f = a.value) == null || f.validate().then(() => {
      n("submitForm", l.value);
    }).catch((b) => {
      console.log("error", b), Bv("请检查表单填写");
    });
  };
  return (f, b) => (at(), Xt("div", null, [i(Se(m1), { ref_key: "formRef", ref: a, model: l.value, items: d.value, rules: e.formRules }, yu({ _: 2 }, [Yn(s.value, (w) => ({ name: w, fn: Fe(() => [ho("div", null, [(at(!0), Xt(be, null, Yn(l.value[w], (y, k) => (at(), Wn(Se(Ro), { style: { "margin-right": "5px" }, closeable: "", onClose: () => ((C, S) => {
    console.log(C, S), l.value[C].splice(S, 1);
  })(w, k) }, { default: Fe(() => [mt(_n(y.name), 1)]), _: 2 }, 1032, ["onClose"]))), 256))])]) }))]), 1032, ["model", "items", "rules"]), u.value ? (at(), Wn(b5, Q({ key: 0, show: u.value, "onUpdate:show": b[0] || (b[0] = (w) => u.value = w), orgKey: p.value, "onUpdate:orgKey": b[1] || (b[1] = (w) => p.value = w) }, c.value, { selected: l.value[p.value], onHandleConfirm: h }), null, 16, ["show", "orgKey", "selected"])) : Ir("", !0), ho("div", null, [i(Se(Le), { type: "primary", onClick: g, block: "" }, { default: Fe(() => b[2] || (b[2] = [mt("提交")])), _: 1 })])]));
} }), w5 = (e, t) => {
  const o = e.__vccOpts || e;
  for (const [n, a] of t) o[n] = a;
  return o;
}, x5 = [w5(z({ name: "Previewer", components: { render: y5 }, props: { formItems: { type: Object, default: () => {
} }, formRules: { type: Object, default: () => {
} } }, setup: (e, { emit: t }) => ({ submitForm: (o) => {
  t("submitForm", o);
} }) }), [["render", function(e, t, o, n, a, l) {
  const r = M1("render");
  return at(), Xt("div", null, [i(r, { formItems: e.formItems, formRules: e.formRules, onSubmitForm: e.submitForm }, null, 8, ["formItems", "formRules", "onSubmitForm"])]);
}]])];
let rl = [];
rl.length === 0 && function() {
  var t;
  const e = Object.assign({ "./components/orgPicker/index.vue": () => import("./index.BePTJdxq.js") });
  for (const o of Object.keys(e)) try {
    const n = o.match(/^\.\/(?<name>\w+)\.(tsx|vue)$/i) || o.match(/^\.\/((?<name>\w+)\/)+index\.(tsx|vue)$/i);
    if ((t = n == null ? void 0 : n.groups) != null && t.name) {
      const a = n.groups.name, l = L1(e[o]);
      rl.some((r) => r.name === a) || rl.push({ name: a, componentPath: l });
    } else console.warn(`无法解析文件名: ${o}`);
  } catch (n) {
    console.error(`注册组件时出错: ${o}`, n);
  }
}();
const L5 = { install(e) {
  x5.forEach((t) => {
    e.component(t.name) || e.component(t.name, t);
  }), rl.forEach((t) => {
    e.component(t.name) || (console.log("异步注册组件:", t.name), e.component(t.name, t.componentPath));
  }), e.use(d3), e.use(Iy);
} };
export {
  b5 as _,
  L5 as r
};

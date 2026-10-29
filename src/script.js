(function () {
  var $ = function (s) { return document.querySelector(s); };
  var nav = $('#nav');
  addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 40); }, { passive: true });

  // custom cursor (mouse devices only)
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.body.classList.add('has-cursor');
    var c = $('.cursor'), r = $('.cursor-ring');
    addEventListener('mousemove', function (e) {
      c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
    });
  }

  // mobile menu
  var menu = $('#mobileMenu'), burger = $('#burger');
  function setMenu(o) { menu.classList.toggle('open', o); menu.setAttribute('aria-hidden', !o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; }
  burger.onclick = function () { setMenu(true); };
  $('#menuClose').onclick = function () { setMenu(false); };
  menu.querySelectorAll('a').forEach(function (a) { a.onclick = function () { setMenu(false); }; });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeChat(); } });

  // chat assistant: friendly, rule-based, answers from the site's own content
  var D = JSON.parse($('#botdata').textContent), panel = $('#chatPanel'), fab = $('#chatFab'), box = $('#chatMessages'), chips = $('#chatChips'), started = false;
  var st = { service: null, invite: null, fails: 0, name: '', seen: {} }, Q = [], busy = false;
  var wa = function (t) { return 'https://wa.me/' + D.wa + (t ? '?text=' + encodeURIComponent(t) : ''); };
  var LINK = { book: '#booking', wa: wa('Hi Tiana, I have a question.'), ig: D.ig };
  var START = ['What services do you offer?', 'How do I book?', 'How much does it cost?', 'Where are you located?'];
  function closeChat() { panel.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); }
  function V(k, a) { var i; do { i = Math.floor(Math.random() * a.length); } while (a.length > 1 && i === st.seen[k]); st.seen[k] = i; return a[i]; }
  function add(text, who) {
    var m = document.createElement('div'); m.className = 'msg ' + who;
    if (who === 'user') m.textContent = text;
    else {
      var re = /\{(book|wa|ig)\|([^}]+)\}/g, i = 0, x;
      while ((x = re.exec(text))) {
        if (x.index > i) m.appendChild(document.createTextNode(text.slice(i, x.index)));
        var a = document.createElement('a'); a.textContent = x[2]; a.href = LINK[x[1]];
        if (x[1] === 'book') a.onclick = closeChat; else { a.target = '_blank'; a.rel = 'noopener'; }
        m.appendChild(a); i = re.lastIndex;
      }
      if (i < text.length) m.appendChild(document.createTextNode(text.slice(i)));
    }
    box.appendChild(m); box.scrollTop = box.scrollHeight; return m;
  }
  function setChips(list) {
    chips.innerHTML = '';
    (list || []).forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.onclick = function () { ask(c); }; chips.appendChild(b); });
    box.scrollTop = box.scrollHeight;
  }
  function pump() {
    if (busy || !Q.length) return; busy = true;
    var job = Q.shift(), t = document.createElement('div'); t.className = 'msg bot typing'; t.innerHTML = '<i></i><i></i><i></i>';
    box.appendChild(t); box.scrollTop = box.scrollHeight;
    setTimeout(function () { t.remove(); add(job.text, 'bot'); if (job.chips) setChips(job.chips); busy = false; pump(); }, job.delay);
  }
  function reply(msgs, cs) {
    msgs.forEach(function (t, i) { Q.push({ text: t, delay: Math.min(1500, 450 + t.length * 9) + (i ? 150 : 0), chips: i === msgs.length - 1 ? cs : null }); });
    pump();
  }

  // typo tolerance
  var VOC = ('services service offer price prices pricing cost costs much charge book booking appointment reserve location located address where directions contact phone number whatsapp email instagram lashes lash extensions acrylic acrylics manicure bridal package packages infill removal design promotion promotions discount available availability hours opening thanks thank hello please ' +
    'there their these those three share shall while whole whose other later today start great might would could should about which what when your with have time week month first beautiful gorgeous lovely amazing stunning').split(' ');
  D.services.forEach(function (s) { s.name.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).forEach(function (w) { if (w.length > 4 && VOC.indexOf(w) < 0) VOC.push(w); }); });
  function lev(a, b) {
    var m = [], i, j; for (i = 0; i <= a.length; i++) m[i] = [i]; for (j = 1; j <= b.length; j++) m[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function fix(q) {
    return q.replace(/[a-z]+/g, function (w) {
      if (w.length < 5 || VOC.indexOf(w) > -1) return w;
      var best = w, bd = 9, lim = w.length >= 8 ? 2 : 1;
      VOC.forEach(function (v) { if (Math.abs(v.length - w.length) > lim) return; var d = lev(w, v); if (d <= lim && d < bd) { bd = d; best = v; } });
      return best;
    });
  }

  function has(q, re) { return re.test(q); }
  function serviceMatch(q) {
    var stop = /^(nail|nails|and|package|the)$/;
    return D.services.filter(function (s) {
      return s.name.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).some(function (w) { return w.length > 2 && !stop.test(w) && new RegExp('\\b' + w).test(q); });
    });
  }
  function faqMatch(q) {
    var words = q.split(/\W+/).filter(function (w) { return w.length > 3; }), best = null, score = 0;
    D.faq.forEach(function (f) { var s = 0, t = f.question.toLowerCase(); words.forEach(function (w) { if (t.indexOf(w) > -1) s++; }); if (s > score) { score = s; best = f; } });
    return { f: best, s: score };
  }
  function svcChips() { return D.services.slice(0, 3).map(function (s) { return 'Tell me about ' + s.name; }).concat(['How much does it cost?']); }
  function nm() { return st.name ? ', ' + st.name : ''; }
  function R(m, c, inv) { st.invite = inv || null; return { m: m, c: c || START }; }

  function bookReply() {
    return R([V('book', [
      'You can book directly on this page! Just scroll to the booking form, or tap here 👉 {book|Book Now}. Pick your service, date and time, and it opens WhatsApp so Tiana can confirm within 24 hours. We\'d love to have you! 💛',
      'Booking is super easy 📅 Tap {book|Book Now}, choose your service, date and time, and send it over WhatsApp. Tiana confirms within 24 hours!'
    ])], ['What services do you offer?', 'Where are you located?']);
  }
  function serviceReply(sm) {
    if (sm.length === 1) {
      var s = sm[0]; st.service = s;
      return R([s.name + ' 💅\n' + s.desc,
        (s.price ? 'That one is ' + s.price + '. ' : 'Pricing depends on the style, length and design you choose, so Tiana gives a personal quote. ') + V('inv', ['Would you like to {book|book a slot}?', 'Want to {book|book this}? 😊'])],
        ['How much is it?', 'How do I book?', 'What other services do you offer?'], 'book');
    }
    return R(['We have a few that fit 💅\n' + sm.map(function (s) { return '\u2022 ' + s.name; }).join('\n'), 'Tell me which one you like and I\'ll share the details!'], sm.slice(0, 4).map(function (s) { return 'Tell me about ' + s.name; }));
  }

  function answer(raw) {
    var low = raw.toLowerCase(), q = fix(low.replace(/[^a-z0-9'\u20a6 ]/g, ' ').replace(/\s+/g, ' ').trim()), m;
    if ((m = low.match(/\b(?:my name is|call me|this is)\s+([a-z]{2,15})\b/))) {
      st.name = m[1].charAt(0).toUpperCase() + m[1].slice(1);
      return R(['Lovely to meet you, ' + st.name + '! 💛 How can I help you today?']);
    }
    if (has(q, /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|hola)\b/) && q.length < 25) return R([V('hi', ['Hi there' + nm() + '! 👋 Welcome to ' + D.brand + '. Feel free to ask about our services, pricing, booking, or anything else!', 'Hello' + nm() + '! 💛 Great to see you here. Are you thinking nails, lashes, or both?'])]);
    if (st.invite === 'book' && has(q, /^(yes|yeah|yep|yup|sure|ok|okay|please|definitely|of course|sounds good|let'?s do it|why not)\b/) && q.length < 30) return bookReply();
    if (has(q, /\b(beautiful|gorgeous|lovely|amazing|stunning|love (it|them|your)|so good|talented|slay|slayed)\b/) && !has(q, /\b(price|book|where)\b/)) return R([V('praise', ['Aww, thank you so much! 💛 Tiana puts her heart into every single set.', 'That means a lot, thank you! ✨ Would you like to {book|book your own set}?'])], null, 'book');
    if (has(q, /\b(thanks?|thank you|thx|ok|okay|oky|okey|great|nice|cool|alright|noted|perfect)\b/) && q.length < 25) return R([V('thx', ['You\'re so welcome' + nm() + '! 💛 Anything else I can help with?', 'Anytime! 😊 Let me know if you have more questions.', 'Happy to help! If you\'re ready, you can {book|book your appointment} whenever you like. 💅'])]);
    if (has(q, /\b(bye|goodbye|see you|later|cya)\b/) && q.length < 25) return R(['Take care' + nm() + '! 💛 See you soon at Nail Lovers by Tiana.']);
    if (has(q, /\b(promos?|promotions?|discounts?|deals?|specials?|coupons?|sales?)\b/)) {
      if (D.promos.length) return R(['Yes, we have something on right now 🎉\n' + D.promos.map(function (p) { return '\u2022 ' + p.title + (p.badge ? ' (' + p.badge + ')' : '') + (p.code ? ', code ' + p.code : '') + ': ' + p.desc; }).join('\n'), 'Want to {book|use it now}?'], null, 'book');
      return R(['Nothing special running at the moment, but we post new offers on Instagram, so follow {ig|' + D.igHandle + '} to catch the next one! 💛']);
    }
    if (has(q, /\b(price|prices|pricing|cost|costs|how much|charge|rate|rates|fee|fees|afford|cheap|expensive|\u20a6|naira)\b/)) {
      var sm1 = serviceMatch(q), svc = sm1.length === 1 ? sm1[0] : (!sm1.length && st.service && has(q, /\b(it|that|this|the same|one)\b|how much/) ? st.service : null);
      if (svc) {
        st.service = svc;
        return R([svc.price ? svc.name + ' is ' + svc.price + ' 💛' : 'For ' + svc.name + ', the price depends on the style, length and design you choose 💅 Tiana gives a personal quote, so {wa|message her on WhatsApp} with your inspo pic and she\'ll sort you out.', 'Want to {book|book a slot}?'], ['How do I book?', 'What other services do you offer?'], 'book');
      }
      var priced = D.services.filter(function (s) { return s.price; });
      if (priced.length) return R(['Here are our prices 💛\n' + priced.map(function (s) { return '\u2022 ' + s.name + ': ' + s.price; }).join('\n'), priced.length < D.services.length ? 'For the other services or custom designs, {wa|message us on WhatsApp} for a quote.' : 'Want to {book|book a slot}?'], ['How do I book?', 'Where are you located?'], 'book');
      return R([V('price', ['Pricing depends on the style, length and design you choose 💅 The easiest way to get an exact price is to {wa|send Tiana your inspo pic on WhatsApp}. She\'ll quote you quickly!', 'Good question! Every set is custom, so Tiana gives a personal quote based on your style. {wa|Message her on WhatsApp} with a photo of what you like 💛'])], ['How do I book?', 'Where are you located?'], 'book');
    }
    if (has(q, /\b(book|booking|appointment|reserve|reservation|schedule|slot|available|availability)\b/)) return bookReply();
    if (has(q, /\b(where|location|located|address|find you|directions|area|lagos|visit|shop|studio|salon)\b/)) return R(['We\'re based in ' + D.location + ' 📍', 'Once you book, {wa|message us on WhatsApp} and we\'ll send the exact address and directions.'], ['How do I book?', 'How much does it cost?']);
    if (has(q, /\b(contact|phone|call|number|whatsapp|email|mail|reach|instagram|insta|ig|social)\b/)) return R(['Of course! 💛 You can call or WhatsApp {wa|' + D.phone + '}, email ' + D.email + ', or find us on Instagram {ig|' + D.igHandle + '}.']);
    if (has(q, /\b(hour|hours|open|opening|close|closing|time|times|when)\b/) && D.slots.length) return R(['Our booking slots run from ' + D.slots[0] + ' to ' + D.slots[D.slots.length - 1] + ' 🕘 Choose a time in the {book|booking form} and we\'ll confirm it on WhatsApp.'], ['How do I book?', 'Where are you located?'], 'book');
    if (has(q, /\b(who|owner|ceo|founder|tiana|about (you|us))\b/) && !has(q, /\b(book|price|where)\b/)) return R([D.about, 'You can see more of her work on Instagram {ig|' + D.igHandle + '} 💛']);
    if (has(q, /\bservices?\b|\bmenu\b|what (do|can) you (do|offer|provide)|what .*offer|other services/)) return R(['Here\'s what we do 💅\n' + D.services.map(function (s) { return '\u2022 ' + s.name; }).join('\n'), V('svc', ['Tap one to hear more, or just tell me what you\'re after 😊', 'Which one catches your eye? I can share details and pricing!'])], svcChips());
    var fq = faqMatch(q), sm = serviceMatch(q);
    if (sm.length && fq.s < 3) return serviceReply(sm);
    if (fq.f) return R([fq.f.answer, V('more', ['Anything else you\'d like to know? 😊', 'Would you like to {book|book an appointment}?'])], null, 'book');
    if (sm.length) return serviceReply(sm);
    st.fails++;
    if (st.fails === 1) return R(['Hmm, I\'m not sure I caught that 🤔 Could you say it another way? You can ask me about our services, prices, booking or location.']);
    return R(['I wouldn\'t want to give you the wrong info! 💛 {wa|Message Tiana on WhatsApp} and she\'ll get back to you personally.']);
  }
  function ask(text) {
    text = text.trim(); if (!text) return; add(text, 'user'); setChips([]);
    var r = answer(text); setTimeout(function () { reply(r.m, r.c); }, 250);
  }
  function open() {
    panel.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; add('Hi! Welcome to ' + D.brand + ' \u2014 where nails become art \u2728\nHow can I help you today?', 'bot'); setChips(START); }
    setTimeout(function () { $('#chatText').focus({ preventScroll: true }); }, 50);
  }
  fab.onclick = function () { panel.classList.contains('open') ? closeChat() : open(); };
  $('#chatClose').onclick = closeChat;
  $('#chatForm').addEventListener('submit', function (e) { e.preventDefault(); var i = $('#chatText'); ask(i.value); i.value = ''; });

  // hide promotions that expired since the last deploy
  var today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('[data-expires]').forEach(function (el) { if (el.dataset.expires < today) el.remove(); });

  // forms: saved by Netlify Forms (emails you), booking also opens WhatsApp
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 4500); }
  function save(form) {
    return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() }).catch(function () {});
  }
  function missing(form, keys) {
    var d = new FormData(form), k = keys.filter(function (n) { return !String(d.get(n) || '').trim(); });
    if (k.length) { form.querySelector('[name=' + k[0] + ']').focus(); toast('Please fill in the required fields.'); }
    return k.length > 0;
  }
  var form = $('#bookingForm'), date = $('#f-date');
  date.min = today;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (missing(form, ['name', 'phone', 'service', 'date', 'time'])) return;
    var d = new FormData(form);
    var msg = 'Hello Tiana, I would like to book an appointment.\n\nName: ' + d.get('name') + '\nPhone: ' + d.get('phone') +
      (d.get('email') ? '\nEmail: ' + d.get('email') : '') + '\nService: ' + d.get('service') + '\nDate: ' + d.get('date') + '\nTime: ' + d.get('time') +
      (d.get('notes') ? '\nNotes: ' + d.get('notes') : '');
    window.open('https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    save(form); toast("\u2713 Booking sent! We'll confirm via WhatsApp."); form.reset();
  });
  var cform = $('#contactForm');
  cform.addEventListener('submit', function (e) {
    e.preventDefault();
    if (missing(cform, ['name', 'email', 'message'])) return;
    save(cform).then(function () { toast('\u2713 Message sent! We will reply by email soon.'); cform.reset(); });
  });
})();

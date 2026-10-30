// Renders content/*.json into a static, SEO-friendly dist/ site. No dependencies.
const fs = require('fs'), path = require('path');
const R = __dirname, D = path.join(R, 'dist');
const read = f => JSON.parse(fs.readFileSync(path.join(R, 'content', f), 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich = s => String(s || '').split(/\n\s*\n/).map(p => '<p>' + esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>').join('');
const rel = p => String(p || '').replace(/^\//, '');
const img = (src, alt, extra = '') => src ? `<img src="${esc(rel(src))}" alt="${esc(alt)}" loading="lazy" ${extra} onerror="this.style.display='none'">` : '';

const S = read('settings.json'), SV = read('services.json').items, PR = read('promotions.json'),
      G = read('gallery.json'), FAQ = read('faq.json').items, T = read('testimonials.json').items;
const today = new Date().toISOString().slice(0, 10);
const promos = (PR.items || []).filter(p => p.active && (!p.expires || p.expires.slice(0, 10) >= today));
const url = (S.site_url || '').replace(/\/$/, '');
const wa = (t = '') => `https://wa.me/${S.whatsapp}${t ? '?text=' + encodeURIComponent(t) : ''}`;
const nav = [['services','Services'],['gallery','Gallery'],['about','About'],['faq','FAQ']];
if (promos.length) nav.splice(1, 0, ['offers', 'Offers']);
const navAll = [...nav, ['booking','Book Appointment'], ['contact','Contact']];

const ld = {
  '@context': 'https://schema.org', '@type': 'NailSalon', name: S.site_title, description: S.seo_description,
  url, image: url + S.hero_image, telephone: '+' + S.whatsapp, email: S.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
  areaServed: 'Lagos, Nigeria', sameAs: [S.instagram_url],
  makesOffer: SV.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.description } }))
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(S.site_title)} | Nail Tech & Lash Extensions in Lagos</title>
<meta name="description" content="${esc(S.seo_description)}">
<meta name="keywords" content="${esc(S.seo_keywords)}">
<meta name="theme-color" content="#0A0A0A">
${S.google_verification ? `<meta name="google-site-verification" content="${esc(S.google_verification)}">` : ''}
<link rel="canonical" href="${esc(url)}/">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(S.site_title)}">
<meta property="og:description" content="${esc(S.seo_description)}"><meta property="og:url" content="${esc(url)}/">
<meta property="og:image" content="${esc(url + S.hero_image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(q=>({'@type':'Question',name:q.question,acceptedAnswer:{'@type':'Answer',text:q.answer}}))})}</script>
</head>
<body>
<div class="cursor"></div><div class="cursor-ring"></div>
${PR.banner_enabled && PR.banner_text ? `<div class="promo-bar">${PR.banner_link ? `<a href="${esc(PR.banner_link)}">${esc(PR.banner_text)}</a>` : esc(PR.banner_text)}</div>` : ''}

<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
  <button class="mobile-close" id="menuClose" aria-label="Close menu">✕</button>
  ${navAll.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}
</div>

<nav id="nav">
  <a href="#" class="nav-logo">${esc(S.brand_main)} <span>${esc(S.brand_script)}</span></a>
  <ul class="nav-links">
    ${nav.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}
    <li><a href="#booking" class="nav-cta">Book Appointment</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>

<header class="hero">
  <div class="hero-bg"></div><div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-tag">${esc(S.hero_tag)}</div>
    <h1>${esc(S.hero_title)} <span class="accent">${esc(S.hero_accent)}</span></h1>
    <p>${esc(S.hero_text)}</p>
    <div class="hero-btns"><a href="#booking" class="btn-primary">Book Appointment</a><a href="#gallery" class="btn-outline">View My Work</a></div>
  </div>
  <div class="hero-image ph">${img(S.hero_image, S.hero_image_alt, 'fetchpriority="high"').replace('loading="lazy"', '')}</div>
  <div class="hero-stats">${S.stats.map(s => `<div class="stat"><span class="stat-num">${esc(s.num)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join('')}</div>
</header>

<section class="services" id="services">
  <div class="section-header"><span class="section-tag">What We Offer</span><h2 class="section-title">Our <span class="accent">Services</span></h2><div class="section-divider"></div>
  <p class="section-sub">We offer a full range of nail and lash services tailored to make you look and feel your best.</p></div>
  <div class="services-grid">
  ${SV.map((s, i) => `<article class="service-card"><span class="service-num">${String(i + 1).padStart(2, '0')}</span><div class="service-icon">${esc(s.icon)}</div><h3 class="service-name">${esc(s.name)}</h3><p class="service-desc">${esc(s.description)}</p><div class="service-price">${s.price ? esc(s.price) : 'Message us for pricing'}</div></article>`).join('')}
  </div>
</section>

${promos.length ? `<section class="offers" id="offers">
  <div class="section-header"><span class="section-tag">Special Offers</span><h2 class="section-title">Current <span class="accent">Promotions</span></h2><div class="section-divider"></div></div>
  <div class="offers-grid">${promos.map(p => `<article class="offer-card" ${p.expires ? `data-expires="${esc(p.expires.slice(0, 10))}"` : ''}>
    ${p.badge ? `<span class="offer-badge">${esc(p.badge)}</span>` : ''}<h3 class="offer-title">${esc(p.title)}</h3><p class="offer-desc">${esc(p.description)}</p>
    <div class="offer-meta">${p.code ? `<span>Code: ${esc(p.code)}</span>` : ''}${p.expires ? `<span>Ends ${esc(new Date(p.expires).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</span>` : ''}</div>
    <a href="#booking" class="btn-primary">Claim Offer</a></article>`).join('')}</div>
</section>` : ''}

<section class="gallery" id="gallery">
  <div class="section-header"><span class="section-tag">Our Work</span><h2 class="section-title">Our <span class="accent">Portfolio</span></h2><div class="section-divider"></div>
  <p class="section-sub">A glimpse of our nail artistry and lash work. Every client, a masterpiece.</p></div>
  <div class="gallery-grid">${G.items.map(g => `<figure class="gallery-item ph">${img(g.image, g.alt)}<div class="gallery-overlay"><span class="gallery-label">${esc(g.label)}</span></div></figure>`).join('')}</div>
  ${G.video_url ? `<div class="gallery-video"><a class="btn-outline" href="${esc(G.video_url)}" target="_blank" rel="noopener">${esc(G.video_label)}</a></div>` : ''}
</section>

<div class="ceo-wrap" id="about"><section class="ceo">
  <div class="ceo-image-wrap"><div class="ph ph-box"></div>${img(S.about_image, S.about_image_alt)}
    <div class="ceo-badge"><span class="ceo-badge-title">${esc(S.about_badge_title)}</span><span class="ceo-badge-name">${esc(S.about_badge_name)}</span></div></div>
  <div class="ceo-content"><span class="section-tag">${esc(S.about_tag)}</span><h2 class="section-title">${esc(S.about_title.replace(/\s\S+$/, ''))} <span class="accent">${esc(S.about_title.split(' ').pop())}</span></h2><div class="section-divider"></div>
    <div class="ceo-bio">${rich(S.about_bio)}</div>
    <blockquote class="ceo-quote">“${esc(S.about_quote)}”</blockquote>
    <div class="ceo-socials"><a class="social-link" href="${esc(S.instagram_url)}" target="_blank" rel="noopener">📸 Instagram</a><a class="social-link" href="${wa()}" target="_blank" rel="noopener">💬 WhatsApp</a><a class="social-link" href="mailto:${esc(S.email)}">✉️ Email Us</a></div></div>
</section></div>

<section class="faq" id="faq">
  <div class="section-header"><span class="section-tag">Good To Know</span><h2 class="section-title">Frequently Asked <span class="accent">Questions</span></h2><div class="section-divider"></div></div>
  <div class="faq-list">${FAQ.map(q => `<details class="faq-item"><summary>${esc(q.question)}</summary><p>${esc(q.answer)}</p></details>`).join('')}</div>
</section>

<section class="booking" id="booking">
  <div class="section-header"><span class="section-tag">Appointments</span><h2 class="section-title">Book Your <span class="accent">Session</span></h2><div class="section-divider"></div>
  <p class="section-sub">Fill in the form below and we will reach out to confirm your appointment via WhatsApp.</p></div>
  <div class="booking-inner"><form id="bookingForm" name="booking" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-wa="${esc(S.whatsapp)}" novalidate><input type="hidden" name="form-name" value="booking"><p hidden><label>Leave empty <input name="bot-field"></label></p><div class="form-grid">
    <div class="form-group"><label for="f-name">Full Name</label><input id="f-name" name="name" required autocomplete="name"></div>
    <div class="form-group"><label for="f-phone">Phone Number</label><input id="f-phone" name="phone" type="tel" required autocomplete="tel"></div>
    <div class="form-group full"><label for="f-email">Email Address</label><input id="f-email" name="email" type="email" autocomplete="email"></div>
    <div class="form-group full"><label for="f-service">Service</label><select id="f-service" name="service" required><option value="">Select a service</option>${S.booking_services.map(x => `<option>${esc(x)}</option>`).join('')}</select></div>
    <div class="form-group"><label for="f-date">Preferred Date</label><input id="f-date" name="date" type="date" required></div>
    <div class="form-group"><label for="f-time">Preferred Time</label><select id="f-time" name="time" required><option value="">Select time slot</option>${S.time_slots.map(x => `<option>${esc(x)}</option>`).join('')}</select></div>
    <div class="form-group full"><label for="f-notes">Additional Notes</label><textarea id="f-notes" name="notes"></textarea></div>
  </div><div class="form-submit"><button type="submit" class="btn-submit">Confirm Booking</button>
  <p class="booking-note">📍 ${esc(S.location)} &nbsp; ${esc(S.booking_note)}</p></div></form></div>
</section>

<section class="testimonials" id="testimonials">
  <div class="section-header"><span class="section-tag">Client Love</span><h2 class="section-title">What They <span class="accent">Say</span></h2><div class="section-divider"></div></div>
  <div class="testimonials-grid">${T.map(t => `<figure class="testimonial-card"><div class="stars" aria-label="5 out of 5 stars">★★★★★</div><span class="quote-mark">“</span><blockquote class="testimonial-text">${esc(t.text)}</blockquote><figcaption class="testimonial-author"><span class="author-avatar">${esc(t.name.charAt(0))}</span><span><span class="author-name">${esc(t.name)}</span><span class="author-service">${esc(t.service)}</span></span></figcaption></figure>`).join('')}</div>
</section>

<section class="contact" id="contact">
  <div class="section-header" style="margin-bottom:40px"><h2 class="section-title">Get In <span class="accent">Touch</span></h2><div class="section-divider"></div></div>
  <ul class="contact-list"><li>📞 <a href="${wa()}">${esc(S.phone)}</a></li><li>✉️ <a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li><li>📸 <a href="${esc(S.instagram_url)}" target="_blank" rel="noopener">${esc(S.instagram_handle)}</a></li><li>📍 ${esc(S.location)}</li></ul>
  <div class="booking-inner contact-form-wrap"><h3 class="contact-form-title">Send Us a Message</h3>
  <form id="contactForm" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate><input type="hidden" name="form-name" value="contact"><p hidden><label>Leave empty <input name="bot-field"></label></p>
  <div class="form-grid"><div class="form-group"><label for="c-name">Your Name</label><input id="c-name" name="name" required autocomplete="name"></div>
  <div class="form-group"><label for="c-email">Email Address</label><input id="c-email" name="email" type="email" required autocomplete="email"></div>
  <div class="form-group full"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea></div></div>
  <div class="form-submit"><button type="submit" class="btn-submit">Send Message</button></div></form></div>
</section>

<section class="follow" id="instagram">
  <span class="section-tag">Follow Along</span>
  <h2 class="section-title">Daily Nail <span class="accent">Inspiration</span></h2><div class="section-divider"></div>
  <p class="section-sub">New sets, lash transformations and behind-the-scenes on Instagram.</p>
  <a class="btn-primary follow-btn" href="${esc(S.instagram_url)}" target="_blank" rel="noopener">📸 Follow ${esc(S.instagram_handle)}</a>
</section>

<footer>
  <a href="#" class="nav-logo">${esc(S.brand_main)} <span>${esc(S.brand_script)}</span></a>
  <div class="footer-links">${nav.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}<a href="#booking">Book</a><a href="${esc(S.instagram_url)}" target="_blank" rel="noopener">Instagram</a></div>
  <p class="copy">© ${new Date().getFullYear()} ${esc(S.site_title)}. All Rights Reserved.</p>
</footer>

<button class="chat-fab" id="chatFab" aria-label="Open chat" aria-expanded="false">💬</button>
<div class="chat-panel" id="chatPanel" role="dialog" aria-label="Chat with ${esc(S.site_title)}">
  <div class="chat-head"><span class="chat-avatar">TN</span><span class="chat-title"><span class="chat-name">${esc(S.site_title)}</span><span class="chat-status"><i class="dot"></i>Always here to help</span></span><button class="chat-close" id="chatClose" aria-label="Close chat">✕</button></div>
  <div class="chat-messages" id="chatMessages" aria-live="polite"></div>
  <div class="chat-chips" id="chatChips"></div>
  <form class="chat-input" id="chatForm" autocomplete="off"><input id="chatText" type="text" placeholder="Type a question..." aria-label="Type a question" maxlength="200"><button type="submit" aria-label="Send">➤</button></form>
</div>
<script id="botdata" type="application/json">${JSON.stringify({
  brand: S.site_title, about: String(S.about_bio).split(/\n\s*\n/)[0].replace(/\*\*/g, ''), wa: S.whatsapp, phone: S.phone, email: S.email, ig: S.instagram_url, igHandle: S.instagram_handle, location: S.location,
  slots: S.time_slots, services: SV.map(x => ({ name: x.name, desc: x.description, price: x.price || '' })), faq: FAQ,
  promos: promos.map(p => ({ title: p.title, desc: p.description, badge: p.badge, code: p.code }))
}).replace(/</g, '\\u003c')}</script>
<div class="toast" id="toast" role="status"></div>
<script src="script.js" defer></script>
</body>
</html>`;

fs.rmSync(D, { recursive: true, force: true }); fs.mkdirSync(D, { recursive: true });
fs.writeFileSync(path.join(D, 'index.html'), html);
for (const f of ['styles.css', 'script.js']) fs.copyFileSync(path.join(R, 'src', f), path.join(D, f));
if (fs.existsSync(path.join(R, 'static'))) for (const f of fs.readdirSync(path.join(R, 'static'))) if (f !== 'README.txt') fs.copyFileSync(path.join(R, 'static', f), path.join(D, f));
for (const f of fs.readdirSync(R)) if (/\.(jpe?g|png|webp)$/i.test(f)) { fs.copyFileSync(path.join(R, f), path.join(D, f)); if (f.includes(' ')) fs.copyFileSync(path.join(R, f), path.join(D, f.replace(/ /g, '_'))); }
for (const d of ['images', 'admin', 'content']) if (fs.existsSync(path.join(R, d))) fs.cpSync(path.join(R, d), path.join(D, d), { recursive: true });
fs.writeFileSync(path.join(D, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${url}/sitemap.xml\n`);
fs.writeFileSync(path.join(D, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url></urlset>\n`);
console.log('Built dist/ with', SV.length, 'services,', promos.length, 'active promotions');

// Standalone single-file preview (skipped on Netlify)
if (!process.env.NETLIFY) {
  let h = fs.readFileSync(path.join(D, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(R, 'src', 'styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(R, 'src', 'script.js'), 'utf8');
  h = h.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${css}</style>`);
  h = h.replace(/ loading="lazy"/g, '');
  h = h.replace('<script src="script.js" defer></script>', () => `<script>${js}</script>`);
  h = h.replace(/src="([^"]+\.(?:jpe?g|webp))"/g, (m, p) => {
    const f = path.join(R, p);
    return fs.existsSync(f) ? `src="data:image/${/webp$/.test(p) ? 'webp' : 'jpeg'};base64,${fs.readFileSync(f).toString('base64')}"` : m;
  });
  fs.writeFileSync(path.join(D, 'preview-standalone.html'), h);
  console.log('Standalone preview:', Math.round(h.length / 1024), 'KB');
}

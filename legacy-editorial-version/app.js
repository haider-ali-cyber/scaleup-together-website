/*
  ScaleUp Together — App Logic
  GSAP ScrollTrigger, FAQ accordion, Calculator, Contact form, URL tier params.
*/

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  initGSAP();
  initFAQ();
  initCalculator();
  initTierFromURL();
});

/* ── GSAP Scroll Animations ── */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.anim').forEach((el) => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      }
    );
  });

  // Counter animation for hero metrics
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    gsap.to({ val: 0 }, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: function () {
        el.textContent = Math.floor(this.targets()[0].val) + '+';
      }
    });
  });
}

/* ── FAQ Accordion ── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const toggle = item.querySelector('.faq-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        const ans = i.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        const ans = item.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
}

/* ── Profit Calculator ── */
const tiers = [
  { min: 2500,  max: 4999,   name: 'Starter',       client: 0.35 },
  { min: 5000,  max: 7499,   name: 'Growth',         client: 0.40 },
  { min: 7500,  max: 9999,   name: 'Pro',            client: 0.45 },
  { min: 10000, max: 12499,  name: 'Elite',          client: 0.50 },
  { min: 12500, max: 14999,  name: 'Prime',          client: 0.55 },
  { min: 15000, max: 17499,  name: 'Institutional',  client: 0.60 },
  { min: 17500, max: 19999,  name: 'Master',         client: 0.65 },
  { min: 20000, max: 999999, name: 'Supreme',        client: 0.70 }
];

function initCalculator() {
  const cs = document.getElementById('capitalSlider');
  const ps = document.getElementById('profitSlider');
  if (!cs || !ps) return;
  cs.addEventListener('input', updateCalc);
  ps.addEventListener('input', updateCalc);
  updateCalc();
}

function updateCalc() {
  const cap = parseInt(document.getElementById('capitalSlider').value, 10);
  const profit = parseInt(document.getElementById('profitSlider').value, 10);
  const tier = tiers.find(t => cap >= t.min && cap <= t.max) || tiers[tiers.length - 1];

  const clientAmt = profit * tier.client;
  const scaleupAmt = profit - clientAmt;

  document.getElementById('capitalDisplay').textContent = '$' + cap.toLocaleString() + ' — ' + tier.name;
  document.getElementById('profitDisplay').textContent = '$' + profit.toLocaleString();
  document.getElementById('calcTier').textContent = tier.name;
  document.getElementById('calcPct').textContent = Math.round(tier.client * 100) + '%';
  document.getElementById('calcClient').textContent = '$' + Math.round(clientAmt).toLocaleString();
  document.getElementById('calcScaleup').textContent = '$' + Math.round(scaleupAmt).toLocaleString();
}

/* ── Tier auto-select from URL ── */
function initTierFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier');
  if (!tierParam) return;
  const select = document.getElementById('ftier');
  if (!select) return;
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value.toLowerCase().includes(tierParam.toLowerCase())) {
      select.selectedIndex = i;
      break;
    }
  }
}

/* ── Contact form ── */
function handleContact(e) {
  e.preventDefault();
  const name = document.getElementById('fname').value;
  const email = document.getElementById('femail').value;
  const tier = document.getElementById('ftier').value;
  alert('Thank you, ' + name + '! Your consultation request for the ' + tier + ' tier has been received. M Itrut will reach out to ' + email + ' shortly.');
  e.target.reset();
}

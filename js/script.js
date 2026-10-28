document.addEventListener('DOMContentLoaded', function () {
	// page loader
	var loader = document.querySelector('.page-loader');
	if (loader) {
		window.addEventListener('load', function () {
			loader.classList.add('loaded');
		});
		setTimeout(function () { loader.classList.add('loaded'); }, 1200);
	}

	// sticky header shadow on scroll + auto-hide while idle
	var header = document.querySelector('.site-header');
	if (header) {
		var headerHideTimer = null;
		var navbarCollapseEl = header.querySelector('.navbar-collapse');
		var menuIsOpen = false;
		var scrollYAtMenuOpen = 0;
		var mouseOverHeader = false;
		// a single is-scrolled threshold flickers the header between its
		// transparent-hero and scrolled-pill look when scrollY hovers right at
		// that boundary (trackpad rubber-band/overscroll near the top settles
		// a few px either side of it) — track state explicitly and only flip
		// it once scrollY clears a gap on either side of the old threshold
		var isScrolledState = false;

		header.addEventListener('mouseenter', function () {
			mouseOverHeader = true;
			clearTimeout(headerHideTimer);
			header.classList.remove('header-hidden');
		});
		header.addEventListener('mouseleave', function () {
			mouseOverHeader = false;
			if (isScrolledState && !menuIsOpen) {
				clearTimeout(headerHideTimer);
				headerHideTimer = setTimeout(function () {
					if (!menuIsOpen && !mouseOverHeader) {
						closeOpenDropdowns();
						header.classList.add('header-hidden');
					}
				}, 1200);
			}
		});

		// the floating-pill scroll state looks broken while the mobile menu
		// dropdown is open, so reset it to a plain full-width bar for as long
		// as the menu is open — note: this must NOT remove is-scrolled itself,
		// since on mobile the header falls back to position:static without it
		// (removing is-scrolled mid-scroll used to make the header fly off
		// screen with the page instead of staying pinned)
		if (navbarCollapseEl) {
			navbarCollapseEl.addEventListener('show.bs.collapse', function () {
				menuIsOpen = true;
				scrollYAtMenuOpen = window.scrollY;
				// a pending idle-hide timer from before the menu opened must not
				// fire while (or after) the menu is open — it would slide the
				// header away with the dropdown still showing
				clearTimeout(headerHideTimer);
				header.classList.add('menu-open');
				header.classList.remove('header-hidden');
			});
			navbarCollapseEl.addEventListener('hidden.bs.collapse', function () {
				menuIsOpen = false;
				header.classList.remove('menu-open');
			});
		}

		// a desktop Services/Company/Resources dropdown stays positioned where
		// Popper last placed it even after the header slides off-screen, so it
		// has to be closed explicitly when the header auto-hides
		var closeOpenDropdowns = function () {
			var openToggles = header.querySelectorAll('.dropdown-toggle[aria-expanded="true"]');
			openToggles.forEach(function (toggle) {
				if (window.bootstrap) {
					bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
				} else {
					toggle.setAttribute('aria-expanded', 'false');
					var menu = toggle.nextElementSibling;
					if (menu) menu.classList.remove('show');
				}
			});
			header.querySelectorAll('.lang-dropdown.is-open').forEach(function (dd) {
				dd.classList.remove('is-open');
				var langToggle = dd.querySelector('.lang-dropdown-toggle');
				if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
			});
		};

		window.addEventListener('scroll', function () {
			if (menuIsOpen) {
				// opening a dropdown submenu inside the mobile nav can itself
				// fire a stray scroll event with little/no real position change
				// (layout reflow, focus-into-view, etc) — only treat it as the
				// user scrolling the page away if position actually moved by a
				// meaningful amount, otherwise leave the menu open
				if (Math.abs(window.scrollY - scrollYAtMenuOpen) < 15) return;
				// close the open mobile menu on scroll instead of letting it
				// sit open while the header tries to collapse into a pill
				if (navbarCollapseEl && window.bootstrap) {
					bootstrap.Collapse.getOrCreateInstance(navbarCollapseEl).hide();
				}
				return;
			}
			var y = window.scrollY;
			if (!isScrolledState && y > 24) {
				isScrolledState = true;
			} else if (isScrolledState && y < 6) {
				isScrolledState = false;
			}
			header.classList.toggle('is-scrolled', isScrolledState);
			if (!mouseOverHeader) header.classList.remove('header-hidden');
			clearTimeout(headerHideTimer);
			if (isScrolledState && !mouseOverHeader) {
				headerHideTimer = setTimeout(function () {
					if (!menuIsOpen && !mouseOverHeader) {
						closeOpenDropdowns();
						header.classList.add('header-hidden');
					}
				}, 1200);
			}
		});
	}

	// back to top button
	var toTop = document.querySelector('.to-top');
	if (toTop) {
		// same flicker as the header had: a single scroll threshold with no
		// hysteresis toggles the button on/off repeatedly when scrollY hovers
		// right at that boundary (rubber-band overscroll, or — on very tall
		// viewports — the whole page's scroll range sitting close to it) —
		// track state explicitly with a gap on either side, like the header
		var toTopShown = false;
		window.addEventListener('scroll', function () {
			var y = window.scrollY;
			if (!toTopShown && y > 420) {
				toTopShown = true;
			} else if (toTopShown && y < 380) {
				toTopShown = false;
			}
			toTop.classList.toggle('show', toTopShown);
		});
		toTop.addEventListener('click', function (e) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// counter animation
	var counters = document.querySelectorAll('.counter');
	if (counters.length) {
		var animateCounter = function (el) {
			var target = parseInt(el.getAttribute('data-count'), 10) || 0;
			var duration = 1200;
			var startTime = null;

			var step = function (timestamp) {
				if (!startTime) startTime = timestamp;
				var progress = Math.min((timestamp - startTime) / duration, 1);
				el.textContent = Math.floor(progress * target);
				if (progress < 1) {
					requestAnimationFrame(step);
				} else {
					el.textContent = target;
				}
			};
			requestAnimationFrame(step);
		};

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					animateCounter(entry.target);
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.5 });

		counters.forEach(function (el) { observer.observe(el); });
	}

	// animated plan split ruler — replays from 0 every time its accordion row opens
	var percentHighlights = document.querySelectorAll('.percent-gauge-highlight');
	if (percentHighlights.length) {
		percentHighlights.forEach(function (el) {
			var target = el.getAttribute('data-width') || 0;
			var animate = function () {
				el.style.transition = 'none';
				el.style.width = '0%';
				void el.offsetWidth; // force reflow so the reset is committed before re-animating
				el.style.transition = '';
				requestAnimationFrame(function () {
					el.style.width = target + '%';
				});
			};
			var collapseParent = el.closest('.accordion-collapse');
			if (collapseParent) {
				collapseParent.addEventListener('shown.bs.collapse', animate);
			} else {
				var fillObserver = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) { animate(); fillObserver.unobserve(entry.target); }
					});
				}, { threshold: 0.2 });
				fillObserver.observe(el);
			}
		});
	}

	// animated radial profit gauges
	var profitGauges = document.querySelectorAll('.profit-gauge');
	if (profitGauges.length) {
		var ARC_LENGTH = Math.PI * 80; // semicircle, radius 80

		var updateGauge = function (gauge) {
			if (gauge.dataset.gaugeDone) return;
			gauge.dataset.gaugeDone = '1';
			var pct = parseFloat(gauge.getAttribute('data-percent')) || 0;
			var fill = gauge.querySelector('.gauge-fill');
			var needle = gauge.querySelector('.gauge-needle');
			var setGaugeTo = function (p, duration) {
				if (fill) {
					fill.style.transition = 'stroke-dashoffset ' + duration + 's cubic-bezier(.4,.1,.3,1)';
					fill.style.strokeDasharray = ARC_LENGTH;
					fill.style.strokeDashoffset = ARC_LENGTH - (p / 100) * ARC_LENGTH;
				}
				if (needle) {
					needle.style.transition = 'transform ' + duration + 's cubic-bezier(.4,.1,.3,1)';
					needle.style.transform = 'rotate(' + (-90 + (p / 100) * 180) + 'deg)';
				}
			};
			setGaugeTo(100, 0.9);
			setTimeout(function () { setGaugeTo(pct, 1.1); }, 950);
		};

		var gaugeObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					updateGauge(entry.target);
					gaugeObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1 });

		profitGauges.forEach(function (el) {
			var fill = el.querySelector('.gauge-fill');
			var needle = el.querySelector('.gauge-needle');
			if (fill) { fill.style.strokeDasharray = ARC_LENGTH; fill.style.strokeDashoffset = ARC_LENGTH; }
			if (needle) { needle.style.transform = 'rotate(-90deg)'; }
			gaugeObserver.observe(el);

			// gauges inside a collapsed accordion panel have no layout box until
			// expanded, so the observer never fires for them — update on open too
			var collapseParent = el.closest('.accordion-collapse');
			if (collapseParent) {
				collapseParent.addEventListener('shown.bs.collapse', function () {
					updateGauge(el);
				});
			}
		});
	}

	// animated mini speedometer meters (compact plan-row indicator)
	var miniMeters = document.querySelectorAll('.mini-meter');
	if (miniMeters.length) {
		var MINI_ARC = Math.PI * 42; // semicircle, radius 42
		miniMeters.forEach(function (el) {
			var fill = el.querySelector('.mini-meter-fill');
			var needle = el.querySelector('.mini-meter-needle');
			if (fill) { fill.style.strokeDasharray = MINI_ARC; fill.style.strokeDashoffset = MINI_ARC; }
			if (needle) { needle.style.transform = 'rotate(-90deg)'; }
		});
		var miniMeterObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					var el = entry.target;
					var pct = parseFloat(el.getAttribute('data-percent')) || 0;
					var fill = el.querySelector('.mini-meter-fill');
					var needle = el.querySelector('.mini-meter-needle');
					if (fill) fill.style.strokeDashoffset = MINI_ARC - (pct / 100) * MINI_ARC;
					if (needle) needle.style.transform = 'rotate(' + (-90 + (pct / 100) * 180) + 'deg)';
					miniMeterObserver.unobserve(el);
				}
			});
		}, { threshold: 0.1 });
		miniMeters.forEach(function (el) { miniMeterObserver.observe(el); });
	}

	// demo fee popup — shows the 24-hour free window before linking out to
	// open a demo account, with the clicked plan's name/capital filled in
	var demoFeeModalEl = document.getElementById('demoFeeModal');
	var demoLinks = document.querySelectorAll('.demo-trial-link[data-plan]');
	if (demoFeeModalEl && demoLinks.length && window.bootstrap) {
		var demoFeeModal = new bootstrap.Modal(demoFeeModalEl);
		var planEl = demoFeeModalEl.querySelector('.demo-fee-plan');
		var capitalEl = demoFeeModalEl.querySelector('.demo-fee-capital');
		var amountEl = demoFeeModalEl.querySelector('.demo-fee-amount');
		demoLinks.forEach(function (link) {
			link.addEventListener('click', function (e) {
				e.preventDefault();
				planEl.textContent = link.getAttribute('data-plan');
				capitalEl.textContent = link.getAttribute('data-capital');
				if (amountEl) amountEl.textContent = link.getAttribute('data-fee');
				demoFeeModal.show();
			});
		});
		// "Continue to Open Account" used data-bs-dismiss on the <a> itself,
		// which was swallowing the click before the browser could navigate —
		// let the link open Exness normally, then dismiss the modal after
		var continueLink = demoFeeModalEl.querySelector('#demoFeeContinue');
		if (continueLink) {
			continueLink.addEventListener('click', function () {
				setTimeout(function () { demoFeeModal.hide(); }, 100);
			});
		}
	}

	// contact form submission via Web3Forms — a plain native POST (Web3Forms
	// redirects back to the "redirect" hidden field's URL once it processes
	// the submission), not a JS fetch(), since fetch()/AJAX submissions were
	// being rejected by Web3Forms on the free plan ("Pro plan is required")
	var contactForm = document.getElementById('contactForm');
	if (contactForm) {
		var contactSubmitBtn = document.getElementById('contactSubmitBtn');
		contactForm.addEventListener('submit', function () {
			contactSubmitBtn.disabled = true;
			contactSubmitBtn.textContent = 'Sending...';
		});
	}

	// show the success message after Web3Forms redirects back with ?sent=true
	var contactStatus = document.getElementById('contactFormStatus');
	if (contactStatus && window.location.search.indexOf('sent=true') !== -1) {
		contactStatus.textContent = "Thank you — we've received your request and will be in touch shortly.";
		contactStatus.classList.add('text-success', 'fw-bold');
		window.history.replaceState(null, '', window.location.pathname);
		if (typeof fbq === 'function') fbq('track', 'Lead');
	}

	// belt-and-suspenders removal of Google Translate's top banner iframe
	// ("Translated into: X / Show original / Options") — CSS alone hides
	// it, but this actively strips the element the moment it appears in
	// case a future widget version changes its class names
	var removeGoogleBanner = function () {
		document.querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame').forEach(function (el) {
			el.remove();
		});
		document.body.style.top = '0px';
	};
	removeGoogleBanner();
	new MutationObserver(removeGoogleBanner).observe(document.body, { childList: true, subtree: true });

	// custom language switcher (flags + native names) — drives the real
	// Google Translate widget, which is kept off-screen since its own
	// picker UI renders inside a cross-origin iframe we can't restyle
	var langDropdowns = document.querySelectorAll('.lang-dropdown');
	if (langDropdowns.length) {
		var getCookie = function (name) {
			var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
			return match ? decodeURIComponent(match[1]) : null;
		};
		var clearGoogTransCookie = function () {
			var host = window.location.hostname;
			var expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			document.cookie = 'googtrans=; ' + expire;
			document.cookie = 'googtrans=; ' + expire + ' domain=' + host + ';';
			document.cookie = 'googtrans=; ' + expire + ' domain=.' + host + ';';
		};
		var currentLangCode = function () {
			var raw = getCookie('googtrans');
			if (!raw) return 'en';
			var parts = raw.split('/');
			return parts[2] || 'en';
		};
		var applyLanguageToSelect = function (langCode, attemptsLeft) {
			var select = document.querySelector('#google_translate_element select.goog-te-combo');
			if (select) {
				select.value = langCode;
				select.dispatchEvent(new Event('change'));
				return;
			}
			if (attemptsLeft > 0) {
				setTimeout(function () { applyLanguageToSelect(langCode, attemptsLeft - 1); }, 300);
			}
		};
		var setActiveFlag = function (langCode) {
			langDropdowns.forEach(function (dd) {
				var activeBtn = dd.querySelector('[data-lang="' + langCode + '"]');
				var flagEl = activeBtn ? activeBtn.querySelector('.lang-flag') : null;
				var currentFlag = dd.querySelector('.lang-dropdown-current .fi');
				var countryClass = flagEl && flagEl.className.split(' ').filter(function (cls) { return cls.indexOf('fi-') === 0; })[0];
				if (currentFlag) currentFlag.className = 'fi ' + (countryClass || 'fi-gb');
				dd.querySelectorAll('[data-lang]').forEach(function (b) {
					b.classList.toggle('is-active', b.getAttribute('data-lang') === langCode);
				});
			});
		};

		setActiveFlag(currentLangCode());

		langDropdowns.forEach(function (dd) {
			var toggle = dd.querySelector('.lang-dropdown-toggle');
			toggle.addEventListener('click', function (e) {
				e.stopPropagation();
				langDropdowns.forEach(function (other) {
					if (other !== dd) {
						other.classList.remove('is-open');
						var otherToggle = other.querySelector('.lang-dropdown-toggle');
						if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
					}
				});
				var isOpen = dd.classList.toggle('is-open');
				toggle.setAttribute('aria-expanded', isOpen);
				// opening this inline (mobile) can itself shift scroll position
				// as the panel grows — rebase the "did the user actually scroll
				// away" reference point so that shift doesn't closeout the menu
				if (typeof scrollYAtMenuOpen !== 'undefined') scrollYAtMenuOpen = window.scrollY;
			});
			dd.querySelectorAll('[data-lang]').forEach(function (btn) {
				btn.addEventListener('click', function () {
					var lang = btn.getAttribute('data-lang');
					dd.classList.remove('is-open');
					toggle.setAttribute('aria-expanded', 'false');
					if (lang === 'en') {
						clearGoogTransCookie();
						window.location.reload();
					} else {
						setActiveFlag(lang);
						applyLanguageToSelect(lang, 10);
					}
				});
			});
		});

		document.addEventListener('click', function (e) {
			langDropdowns.forEach(function (dd) {
				if (!dd.contains(e.target)) {
					dd.classList.remove('is-open');
					var t = dd.querySelector('.lang-dropdown-toggle');
					if (t) t.setAttribute('aria-expanded', 'false');
				}
			});
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') {
				langDropdowns.forEach(function (dd) { dd.classList.remove('is-open'); });
			}
		});
	}

	// floating contact widget
	var floatingContact = document.querySelector('.floating-contact');
	if (floatingContact) {
		var fcToggle = floatingContact.querySelector('.floating-contact-toggle');
		fcToggle.addEventListener('click', function () {
			var isOpen = floatingContact.classList.toggle('is-open');
			fcToggle.setAttribute('aria-expanded', isOpen);
		});
		document.addEventListener('click', function (e) {
			if (!floatingContact.contains(e.target)) {
				floatingContact.classList.remove('is-open');
				fcToggle.setAttribute('aria-expanded', 'false');
			}
		});
	}
});

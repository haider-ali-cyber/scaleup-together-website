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
		window.addEventListener('scroll', function () {
			var isScrolled = window.scrollY > 10;
			header.classList.toggle('is-scrolled', isScrolled);
			header.classList.remove('header-hidden');
			clearTimeout(headerHideTimer);
			if (isScrolled) {
				headerHideTimer = setTimeout(function () {
					header.classList.add('header-hidden');
				}, 1200);
			}
		});
	}

	// back to top button
	var toTop = document.querySelector('.to-top');
	if (toTop) {
		window.addEventListener('scroll', function () {
			toTop.classList.toggle('show', window.scrollY > 400);
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

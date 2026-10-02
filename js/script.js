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

	// animated plan split bars
	var splitFills = document.querySelectorAll('.split-fill');
	if (splitFills.length) {
		var fillObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					var target = entry.target.getAttribute('data-width') || 0;
					entry.target.style.width = target + '%';
					fillObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.4 });
		splitFills.forEach(function (el) { fillObserver.observe(el); });
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

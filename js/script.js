document.addEventListener('DOMContentLoaded', function () {
	// page loader
	var loader = document.querySelector('.page-loader');
	if (loader) {
		window.addEventListener('load', function () {
			loader.classList.add('loaded');
		});
		setTimeout(function () { loader.classList.add('loaded'); }, 1200);
	}

	// sticky header shadow on scroll
	var header = document.querySelector('.site-header');
	if (header) {
		window.addEventListener('scroll', function () {
			header.classList.toggle('is-scrolled', window.scrollY > 10);
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
});

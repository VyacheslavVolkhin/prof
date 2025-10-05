document.addEventListener("DOMContentLoaded", function() {


	//btn tgl and add
	let tglButtons = document.querySelectorAll('.js-btn-tgl')
	for (i = 0;i < tglButtons.length;i++) {
		tglButtons[i].addEventListener('click', function(e) {
			this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active')
			e.preventDefault()
			return false
		})
	}


	//slider
	const slidersactions = document.querySelectorAll(".slider-actions");
	
	slidersactions.forEach((container) => {
		const swiperEl = container.querySelector(".swiper");
		const paginationEl = container.querySelector(".slider-actions-pagination");
	
		if (!swiperEl) return;
	
		new Swiper(swiperEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: true,
			speed: 400,
			pagination: {
				el: paginationEl,
				clickable: true,
			},
			autoplay: {
				delay: 3500,
				disableOnInteraction: false,
			},
			navigation: false,
		});
	});

})
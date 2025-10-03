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

})
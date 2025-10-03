$.fancybox.defaults.afterShow = clickImg;

function clickImg() {
    let fancyImg = document.querySelector('.fancybox-image');
    let fancyWrap = document.querySelector('.fancybox-wrap.fancybox-desktop');
    let fancyboxInner = document.querySelector('.fancybox-inner');
    let zoomImg = document.createElement('span');
    zoomImg.classList.add('zoom', 'fancy');
    fancyboxInner.append(zoomImg);
    fancyboxInner.addEventListener('click', () => {

        fancyImg.classList.toggle('transform');
        fancyWrap.classList.toggle('transform');
    })
};

/**
 * Класс для работы с политикой конфиденциальности
 */
class Policy {
    static accept(id = undefined) {
        if (id < 0) // id соглашения
            return;
        $.ajax({
            url: '/ajax/policy.php',
            type: 'POST',
            dataType: 'json',
            data: {
                id: id,
                url: window.location.href,
                sessid: BX.bitrix_sessid()
            }
        });
    }
}

// Клик по кнопке "Принять" в блоке Cookies
$(document).ready(function (event) {
    $(document).on('click', '#nca-cookiesaccept-line-accept-btn', function (el) {
        Policy.accept(2);
    });
});


// Клик по кнопке документация
/*
$( document ).ready(function() {
    $('.document-button').click(function(){

		$("html, body").animate({
        	scrollTop: $('a[href="#docs"]').offset().top
    	}, 2000);

		// $('a[href="#docs"]').scrollTop(position);

       /// document.getElementById("docs").scrollIntoView();

		$('a[href="#docs"]').click();

    });
});
*/
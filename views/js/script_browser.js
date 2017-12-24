$(function () {
    $('.toggleForm').click(function () {
        let $btnCode = $(this).attr('nav');
        switch ($btnCode) {
            case 'souls':
                $('#souls').attr('class', 'visible');
                $('#sbtn').css('background-color', '#ff65ae');
                $('#eidolons').attr('class', 'hidden');
                $('#ebtn').css('background-color', '#666f8b');
                $('#ssras').attr('class', 'hidden');
                $('#ssrabtn').css('background-color', '#666f8b');
                $('#ssrs').attr('class', 'hidden');
                $('#ssrbtn').css('background-color', '#666f8b');
                $('#srs').attr('class', 'hidden');
                $('#srbtn').css('background-color', '#666f8b');
                $('#rs').attr('class', 'hidden');
                $('#rbtn').css('background-color', '#666f8b');
                break;
            case 'eidolons':
                $('#souls').attr('class', 'hidden');
                $('#sbtn').css('background-color', '#666f8b');
                $('#eidolons').attr('class', 'visible');
                $('#ebtn').css('background-color', '#ff65ae');
                $('#ssras').attr('class', 'hidden');
                $('#ssrabtn').css('background-color', '#666f8b');
                $('#ssrs').attr('class', 'hidden');
                $('#ssrbtn').css('background-color', '#666f8b');
                $('#srs').attr('class', 'hidden');
                $('#srbtn').css('background-color', '#666f8b');
                $('#rs').attr('class', 'hidden');
                $('#rbtn').css('background-color', '#666f8b');
                break;
            case 'ssras':
                $('#souls').attr('class', 'hidden');
                $('#sbtn').css('background-color', '#666f8b');
                $('#eidolons').attr('class', 'hidden');
                $('#ebtn').css('background-color', '#666f8b');
                $('#ssras').attr('class', 'visible');
                $('#ssrabtn').css('background-color', '#ff65ae');
                $('#ssrs').attr('class', 'hidden');
                $('#ssrbtn').css('background-color', '#666f8b');
                $('#srs').attr('class', 'hidden');
                $('#srbtn').css('background-color', '#666f8b');
                $('#rs').attr('class', 'hidden');
                $('#rbtn').css('background-color', '#666f8b');
            break;
            case 'ssrs':
                $('#souls').attr('class', 'hidden');
                $('#sbtn').css('background-color', '#666f8b');
                $('#eidolons').attr('class', 'hidden');
                $('#ebtn').css('background-color', '#666f8b');
                $('#ssras').attr('class', 'hidden');
                $('#ssrabtn').css('background-color', '#666f8b');
                $('#ssrs').attr('class', 'visible');
                $('#ssrbtn').css('background-color', '#ff65ae');
                $('#srs').attr('class', 'hidden');
                $('#srbtn').css('background-color', '#666f8b');
                $('#rs').attr('class', 'hidden');
                $('#rbtn').css('background-color', '#666f8b');
            break;
            case 'srs':
                $('#souls').attr('class', 'hidden');
                $('#sbtn').css('background-color', '#666f8b');
                $('#eidolons').attr('class', 'hidden');
                $('#ebtn').css('background-color', '#666f8b');
                $('#ssras').attr('class', 'hidden');
                $('#ssrabtn').css('background-color', '#666f8b');
                $('#ssrs').attr('class', 'hidden');
                $('#ssrbtn').css('background-color', '#666f8b');
                $('#srs').attr('class', 'visible');
                $('#srbtn').css('background-color', '#ff65ae');
                $('#rs').attr('class', 'hidden');
                $('#rbtn').css('background-color', '#666f8b');
            break;
            case 'rs':
                $('#souls').attr('class', 'hidden');
                $('#sbtn').css('background-color', '#666f8b');
                $('#eidolons').attr('class', 'hidden');
                $('#ebtn').css('background-color', '#666f8b');
                $('#ssras').attr('class', 'hidden');
                $('#ssrabtn').css('background-color', '#666f8b');
                $('#ssrs').attr('class', 'hidden');
                $('#ssrbtn').css('background-color', '#666f8b');
                $('#srs').attr('class', 'hidden');
                $('#srbtn').css('background-color', '#666f8b');
                $('#rs').attr('class', 'visible');
                $('#rbtn').css('background-color', '#ff65ae');
            break;
        }
    });
});
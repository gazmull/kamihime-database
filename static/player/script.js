$(function () {
    const kamihime = {

        intro: '94/76/',
        scene: 'de/59/',
        get: '76/89/'

    };

    const eidolon = {

        intro: '9f/51/',
        scene: 'd7/ad/',
        get: '9f/51/'

    };

    const soul = {

        intro: '67/01/',
        scene: 'ec/4d/',
        get: '3b/26/'
    };

    const baseURL = {

        scenarios: 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/'

    };

    let $val = $('#animHime').attr('data');
    let $val_arr = ['a', 'b', 'c1', 'c2', 'c3', 'd'];
    let $val_new = $val_arr.indexOf($val);
    let $val_animation = "play 1s steps(1) infinite"

    $('button').click(function () {
        let $btnCode = $(this).attr('nav');
        switch ($btnCode) {
            case 'left':
                nav_left();
                break;
            case 'right':
                nav_right();
                break;
        }
        render();
    });

    $(this).keyup(function (e) {
        let $charCode = e.keyCode || e.which || e.charCode;
        switch ($charCode) {
            case 37:
                nav_left();
                break;
            case 39:
                nav_right();
        }
        render();
    });

    function nav_left() {
        if ($val_new == 0 || $val_new == -1) return;
        switch ($val_new) {
            case 5:
                $val_animation = "play 2s steps(16) infinite";
                $val_new--;
                break;
            case 4:
            case 3:
                $val_animation = "play .67s steps(16) infinite";
                $val_new--;
                break;
            case 2:
                $val_animation = "play 1s steps(16) infinite";
                $val_new--;
                break;
            case 1:
                $val_animation = "play 1s steps(1) infinite";
                $val_new--;
                break;
        }
    }

    function nav_right() {
        if ($val_new == 5) return;
        switch ($val_new) {
            case 4:
                $val_animation = "play 1s steps(1) infinite";
                $val_new++;
                break;
            case 3:
                $val_animation = "play 2s steps(16) infinite";
                $val_new++;
                break;
            case 2:
            case 1:
                $val_animation = "play .67s steps(16) infinite";
                $val_new++;
                break;
            case 0:
                $val_animation = "play 1s steps(16) infinite";
                $val_new++;
                break;
            default:
                $val_animation = "play 2s steps(1) infinite";
                $val_new++;
                break;
        }
    }

    function render() {
        let $img = `${ $.urlParam(0).startsWith('e')
        ? baseURL.scenarios + eidolon.scene
        : $.urlParam(0).startsWith('s')
            ? baseURL.scenarios + soul.scene
            : baseURL.scenarios + kamihime.scene }${ $.urlParam(2).toString() }/${ $.urlParam(0).slice(1) }-${ $.urlParam(1) == 2 ? 2 : 3 }-2_${ $val_arr[$val_new] }.jpg`;
        
        $('body').waitForImages(function () {
            $("#animHime")
            .css({
                "background-image": `url('${$img}')`
            });
        });

        $('body').waitForImages(true).done(function() {
            $("#animHime")
            .css({
                "animation": $val_animation,
                "-webkit-animation": $val_animation,
                "-moz-animation": $val_animation,
                "-o-animation": $val_animation,
                "-ms-animation": $val_animation
            })
            .attr("data", $val_arr[$val_new]);
            $(".seq")
            .html(`<b>Sequence: ${$val_arr[$val_new].toUpperCase()}</b>`)
            .attr("href", $img);
        });
    }

    $.urlParam = function (id) {
        const results = (window.location.pathname).split('/').slice(2, 5);
        return results[id];
    }
});
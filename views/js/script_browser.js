/* eslint-disable */

$(() => {
  $('#peeks')
    .attr('class', 'visible');

  $('#searchBar').on('keyup click input', function() {
    let query = $(this).val();
    query = query.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());

    if (query) {
      $(`#characters > div[class='visible'] > div[name!='${query}']`)
        .attr('class', 'hiddenInstant')
        .css('position', 'absolute');
      $(`#characters > div[class='visible'] > div[name*='${query}']`)
        .attr('class', 'container visible')
        .css('position', 'relative');
    } else
      $('#characters > div[class="visible"] > div[class="hiddenInstant"]')
        .attr('class', 'container visible')
        .css('position', 'relative');
  });

  $('.toggleForm').click(function() {
    const $btnID = $(this).attr('id');
    const $btnCode = $(this).attr('nav');
    const $btnCode_sliced = $btnCode.slice(1);

    $('#searchBar').val('');
    $(`${$btnCode} > div[class='hiddenInstant']`)
      .attr('class', 'container visible')
      .css('position', 'relative');
    $($btnCode).attr('class', 'visible');
    $(`#${$btnID}`).css('background-color', '#ff65ae');
    $(`#characters > div[id!='${$btnCode_sliced}']`).attr('class', 'hidden');
    $(`#characters > div[id!='${$btnCode_sliced}'] > div[class='container visible']`)
      .attr('class', 'hiddenInstant')
      .css('position', 'absolute');
    $(`#btn > button[id!='${$btnID}']`).css('background-color', '#666f8b');
  });
});
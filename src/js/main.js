jQuery(document).ready(function($) {

  // ScrollMagic
  // ---------------------------------------------------------------------------

  // Init ScrollMagic
  var controller = new ScrollMagic.Controller(
    // {addIndicators: true}
  );

  // TODO: Parse data.json for this value
  // Mumber of timeline entries in the DOM
  var entryCount = 21;

  for (var i=0; i<=entryCount; i++) {
    var entry = ".tl-entry-" + i;
    // Create ScrollMagic scene
    var entryScene = new ScrollMagic.Scene({
        triggerElement: entry,
        offset: -300
    })
    .setClassToggle(entry, 'is-active')
    .addTo(controller);
  }

  // Toggle expanded entry content
  // ---------------------------------------------------------------------------

  // Initialise toggled content

  var btnMarkup =
    '<div class="btn-wrapper">' +
      '<button class="read-more" aria-expanded="false" type="button">Read more</button>' +
    '</div>';

  var $entries = $(".tl-entry");

  $entries.each(function(i) {
    var $entry = $(this);
    var ariaControls = [];

    // Added aria-expanded attribute & button markup where relevant.
    $entry.find(".card__body-continued").attr('aria-expanded', false).after(btnMarkup);
    $entry.find(".tl-entry-list").attr('aria-expanded', false).append(btnMarkup);

    // Add correct aria-controls attribute where relevant.
    if ($entry.find(".card__body-continued").length > 0) {
      ariaControls.push('card__body-continued-' + i);
    }
    if ($entry.find(".tl-entry-list").length > 0) {
      ariaControls.push('tl-entry-list-' + i);
    }
    $entry.find(".read-more").attr('aria-controls', ariaControls.join(' '));

  });

  // Toggle functionality

  function toggleEntryBody($entry) {

    var $btns = $entry.find(".read-more");

    $entry.toggleClass("expanded");

    // Toggle content
    if ($entry.hasClass("expanded")) {
      $entry.find(".card__body-continued, .tl-entry-list").attr('aria-expanded', true);
    } else {
      $entry.find(".card__body-continued, .tl-entry-list").attr('aria-expanded', false);
    }

    // Toggle buttons
    $btns.each(function() {
      $btn = $(this);
      if ($btn.attr('aria-expanded') == 'false') {
        $btn.attr('aria-expanded', true);
        $btn.text("Read less");
      } else {
        $btn.attr('aria-expanded', false);
        $btn.text("Read more");
      }
    });

  }

  $( ".read-more" ).on( "click", function() {
    toggleEntryBody( $(this).parents(".tl-entry") );
  });

  // Debug: force all entries to be expanded by default
  // (btn labels aren't updated correctly).
  // toggleEntryBody( $(".tl-entry") );

  // Image & video galleries
  // ---------------------------------------------------------------------------

  // $("[data-fancybox]").fancybox({
  //   loop: true,
  //   buttons: ['close']
  // });

});

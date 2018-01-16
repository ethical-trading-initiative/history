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

  $entries = $(".tl-entry");

  $entries.each(function() {
    $entry = $(this);
    $entry.find(".card__body-continued").after(btnMarkup);
    $entry.find(".tl-entry-list").append(btnMarkup);
  });

  // Toggle functionality

  function toggleEntryBody($entry) {
    var $btns = $entry.find(".read-more");
    $entry.toggleClass("expanded");
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

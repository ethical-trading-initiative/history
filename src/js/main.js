jQuery(document).ready(function($) {

  // ScrollMagic
  // ---------------------------------------------------------------------------

  // Init ScrollMagic
  var controller = new ScrollMagic.Controller();
  // Mumber of timeline entries in the DOM
  var entryCount = 12;

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

  // Image & video galleries
  // ---------------------------------------------------------------------------

  $("[data-fancybox]").fancybox({
    loop: true,
    buttons: ['close']
  });

  // Toggle entry body content
  // ---------------------------------------------------------------------------

  function toggleEntryBody($entry) {
    var $btn = $entry.find(".read-more");
    $entry.toggleClass("expanded");
    if ($btn.text() === "Read more") {
      $btn.text("Read less");
    } else {
      $btn.text("Read more");
    }
  }

  $( ".read-more" ).on( "click", function() {
    toggleEntryBody( $(this).parents(".timeline-entry") );
  });

  // Debug: force all entries to be expanded by default
  // (btn labels aren't updated correctlty).
  // toggleEntryBody( $(".timeline-entry") );

});

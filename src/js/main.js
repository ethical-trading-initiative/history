jQuery(document).ready(function($) {

  /**
   * ScrollMagic
   */

  // Init ScrollMagic
  var controller = new ScrollMagic.Controller(
    // {addIndicators: true}
  );

  // TODO: Parse data.json for this value
  // Number of timeline entries in the DOM
  var entryCount = 25;

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

  /**
   * Toggle expanded entry content
   */

  // Initialise toggled content

  var btnMarkup =
    '<div class="btn-wrapper">' +
      '<button class="btn read-more" aria-expanded="false" type="button">Read more</button>' +
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

  /**
   * Image & video galleries
   */

  // $("[data-fancybox]").fancybox({
  //   loop: true,
  //   buttons: ['close']
  // });

});


// Self invoking function to avoid polluting the global namespace.
(function () {

  /**
   * Opt-in analytics
   */

  function enableAnalytics() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('set', 'anonymizeIp', true);
    ga('create', 'UA-9225247-2', 'auto');
    ga('send', 'pageview');
  }

  // https://cookieconsent.insites.com/documentation/javascript-api/
  window.addEventListener("load", function(){
    window.cookieconsent.initialise({
      "palette": {
        "popup": {
          "background": "#333231",
          "text": "#ffffff",
          "link": "#EBD66E;"
        },
        "button": {
          "background": "#555199",
          "text": "#ffffff"
        }
      },
      "position": "bottom",
      "type": "opt-in",
      "content": {
        "link": "Privacy policy",
        "href": "/privacy.html"
      },
      // https://cookieconsent.insites.com/documentation/disabling-cookies/
      onInitialise: function (status) {
        var type = this.options.type;
        var didConsent = this.hasConsented();
        if (type == 'opt-in' && didConsent) {
          enableAnalytics();
        }
      },
      onStatusChange: function(status, chosenBefore) {
        var type = this.options.type;
        var didConsent = this.hasConsented();
        // Added test of value of `status` here as the example code passed regardless of which button user pressed.
        if (type == 'opt-in' && didConsent && status == 'allow') {
          enableAnalytics();
        }
      }
    })
  });

})();

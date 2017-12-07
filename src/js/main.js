jQuery(document).ready(function($){

	var timelineEntries = $('.timeline-entry');
  // TODO: offset seems very sensitive to content (header height?)
	var offset = 0.9; // was 0.8

	// Hide timeline entries that are outside the viewport.
	hideEntries(timelineEntries, offset);

	// On scolling, show/animate timeline entries when they enter the viewport.
	$(window).on('scroll', function(){
		(!window.requestAnimationFrame)
			? setTimeout(function(){ showEntries(timelineEntries, offset); }, 100)
			: window.requestAnimationFrame(function(){ showEntries(timelineEntries, offset); });
	});

	function hideEntries(entries, offset) {
		entries.each(function(){
			( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.timeline-entry-icon, .timeline-entry-content').addClass('is-hidden');
		});
	}

	function showEntries(entries, offset) {
		entries.each(function(){
			( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.timeline-entry-icon').hasClass('is-hidden') ) && $(this).find('.timeline-entry-icon, .timeline-entry-content').removeClass('is-hidden').addClass('bounce-in');
		});
	}

});

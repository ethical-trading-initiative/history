jQuery(document).ready(function($){
	var timelineBlocks = $('.timeline-entry');
  // TODO: offset seems very sensitive to content (header height?)
	var offset = 0.9; // was 0.8

	//hide timeline blocks which are outside the viewport
	hideBlocks(timelineBlocks, offset);

	//on scolling, show/animate timeline blocks when enter the viewport
	$(window).on('scroll', function(){
		(!window.requestAnimationFrame)
			? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
			: window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
	});

	function hideBlocks(blocks, offset) {
		blocks.each(function(){
			( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.timeline-entry-icon, .timeline-entry-content').addClass('is-hidden');
		});
	}

	function showBlocks(blocks, offset) {
		blocks.each(function(){
			( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.timeline-entry-icon').hasClass('is-hidden') ) && $(this).find('.timeline-entry-icon, .timeline-entry-content').removeClass('is-hidden').addClass('bounce-in');
		});
	}
});

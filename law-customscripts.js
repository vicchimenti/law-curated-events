<script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js"></script> 
<script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/helpers/jquery.fancybox-media.js"></script> 
<script type="text/javascript">
	$(".popup").fancybox({
      	scrolling: 'no',
		wrapCSS: "fancybox-class",
		type: "iframe",
		iframe: {
			preload: false,
          	scrolling: 'no'
		},
		helpers: {
			overlay: {
				locked: false
			}
		}
	});
</script>
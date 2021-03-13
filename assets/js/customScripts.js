window.addEventListener('load', 
  	function() {
  		/* JS to enable the Collabsible element */
		(function(){
			var collapsibles = document.getElementsByClassName("collapsible");
			for (var i = 0; i < collapsibles.length; i++) {
				console.log(collapsibles[i]);
			  	collapsibles[i].addEventListener("click", function(){
				    var target = this.getAttribute("data-target");
				    this.classList.toggle("active");
				    var content = document.getElementById(target);
				    if (content.style.maxHeight){
				      content.style.maxHeight = null;
				    } else {
				      content.style.maxHeight = content.scrollHeight + "px";
				    } 
			  });
			}
		})();

		   
  	}, false);

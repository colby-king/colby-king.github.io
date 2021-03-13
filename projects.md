---
layout: page
title: projects
permalink: /projects/
---

<h2>Video Poker</h2>

<script type="text/javascript">
	if(window.innerWidth < 600){
		alert("Video poker isn't supported on screens less than 600px");
	}
</script>
<div id="game-container"></div>
<script src="/assets/js/videopoker/videopoker.js"></script>
<script type="text/javascript">POKER.Game.start({board:'game-container'});</script>


<h2>Text Animation</h2>
<form onsubmit="return false">
  <label for="fname">Write Me!</label><br>
  <textarea id="textToWrite" rows="5" cols="60">Enter text to display!</textarea><br/>
  <input type="submit" onclick="rerunAnimation()">
</form> 

<div id="hero-animation" style="height:400px; width: 100%">
	<canvas id="animation" style="width:100%; height:100%"></canvas>
</div>
<script src="/assets/js/textAnimation.js"></script>
<script type="text/javascript">
	var fontSize;
	if(window.innerWidth < 450){
		fontSize = 20;
	} else if(window.innerWidth < 800){
		fontSize = 35;
	} else {
		fontSize = 50;
	}

	var an = new animation({
		canvas: 'animation',
		text: "Enter text to display!\n",
		background: '#002140',
		fontSize: fontSize,
		textColor: '#DDE3E8'
	});
	an.run();
</script>
<script type="text/javascript">
	function rerunAnimation(e){
		var text = document.getElementById('textToWrite').value;
		an.reset(text);
	}
</script>
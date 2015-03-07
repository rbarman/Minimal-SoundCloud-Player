var	spinner = new Spinner({
	lines: 12, // The number of lines to draw
	length: 7, // The length of each line
	width: 5, // The line thickness
	radius: 10, // The radius of the inner circle
	color: '#000', // #rbg or #rrggbb
	speed: 1, // Rounds per second
	trail: 100, // Afterglow percentage
	shadow: true // Whether to render a shadow
});

function sayHello() {
	console.log("i'm saying hello right now");
}

var tracks = [];

function getStream() {
	console.log("getting my stream!");
	spinner.spin(document.getElementById("post-login-container")); 
	var page_size = 5;
	SC.get('/me/activities/tracks/affiliated',{limit:page_size,linked_partitioning:1},function(data){
		$(data.collection).each(function(i,track){
			tracks.push({id :track.origin.id, title : track.origin.title});
		});
		console.log("done");
		spinner.stop();
		$("#icon").attr("src","./resources/orange_icon.png");
		$('#icon').fadeIn(3000);
		playSongs(currentIndex);
	});
}

function getFavoriteSongs() {
	console.log("getting favorite songs");
	spinner.spin(document.getElementById("post-login-container")); 

	var page_size = 200;
	SC.get('/me/favorites',{limit:page_size,linked_partitioning: 1},function(data){
		$(data.collection).each(function(i,track){
			// this returned track object is slightly diff than stream track object
			tracks.push({id :track.id, title : track.title});
		});
		console.log("done");
		spinner.stop();
		$("#icon").attr("src","./resources/orange_icon.png");
		// $("#icon").attr("src","http://24.media.tumblr.com/tumblr_lq70q233Er1qjccmlo1_500.gif");
		$('#icon').fadeIn(3000);
		playSongs();
	});
}
var currentIndex = 0;
var paused = false;
function playSongs() {
	SC.stream("/tracks/" + tracks[currentIndex].id, 

		{	onfinish: 
			function() {
				console.log(tracks[currentIndex].title + ' finished');
				currentIndex++;
				playSongs();
			}
		},

		function(sound) {
			sound.play();
			console.log("playing " + tracks[currentIndex].title) + " w/ id : " + tracks[currentIndex].id;
			$('#track-container').text(tracks[currentIndex].title);
			document.onkeydown = function(e) {
				switch (e.keyCode) {
					case 32: // space
						if(paused == true) {
							console.log("resuming " + tracks[currentIndex].title);
							sound.play();
							paused = false; 
						}
						else {
							console.log("pausing " + tracks[currentIndex].title);
							sound.pause();
							paused = true;
						}
						break;
			        case 37: // left
			        	console.log("will play previous song");
			        	sound.stop();
			        	currentIndex--;
			        	playSongs();
			        	break;
			        case 38: // up
			        	console.log("repost " + tracks[currentIndex].title);
			        	break;
			        case 39: //right 
			        	console.log("will play next song");
			        	sound.stop();
			        	currentIndex++;
			        	playSongs();
			        	break;
			        case 40: //down
			        	console.log("favorite " + tracks[currentIndex].title);
			        	break;
			        case 70: // f
			        	console.log("going to get favorites");
			        	tracks.length = 0;
			        	currentIndex = 0;
			        	sound.stop();
			        	getFavoriteSongs();
			        	break;
			        case 83: // s
			        	console.log("going to get stream");
			        	tracks.length = 0;
			        	currentIndex = 0;
			        	sound.stop();
			        	getStream();
			        	break;

			    }
			};
		});
}	

function logIn() {
	SC.initialize({
		client_id: 'b713150b1588a27489dda2c15e8f95c5',
		redirect_uri: 'http://127.0.0.1/~rohan/SCPlaylistDownloader/callback.html'
	});

	SC.connect(function() {
		console.log("successfully connected");
		$('#icon').fadeOut(1000);
		$('#post-login-container').show();
		// getFavoriteSongs();
		getStream();
		// sayHello();
	});
}
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
var currentIndex = 0;


function getStream() {
	console.log("getting my stream!");
	spinner.spin(document.getElementById("post-login-container")); 
	var page_size = 200;
	SC.get('/me/activities/tracks/affiliated',{limit:page_size,linked_partitioning:1},function(data){
		$(data.collection).each(function(i,track){
			tracks.push(track.origin.id);
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
			tracks.push(track.id);
		});
		console.log("done");
		spinner.stop();
		$("#icon").attr("src","./resources/orange_icon.png");
		$('#icon').fadeIn(3000);

		playSongs(currentIndex);
	});
}

var paused = false;
function playSongs(index) {
	SC.stream("/tracks/" + tracks[index], 
		{	onfinish: 
			function() {
				console.log('track finished');
				playSongs(++currentIndex);
			}

		},

		function(sound) {
			sound.play();
			document.onkeydown = function(e) {
				switch (e.keyCode) {
					case 32: // space
					if(paused == true) {
						console.log("resume playing");
						sound.play();
						paused = false; 
					}
					else {
						console.log("pausing");
						sound.pause();
						paused = true;
					}
					break;
			        case 37: // left
			        console.log("will play previous song");
			        sound.stop();
			        playSongs(--currentIndex);
			        break;
			        case 38: // up
			        console.log("repost song");
			        break;
			        case 39: //right 
			        console.log("will play next song");
			        sound.stop();
			        playSongs(++currentIndex);
			        break;
			        case 40: //down
			        console.log("favorite song");
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
		getFavoriteSongs();
		// getStream();
		// sayHello();
	});
}
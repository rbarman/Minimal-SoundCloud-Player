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

var page_size = 200;
var tracks = [];

function sayHello() {
	console.log("i'm saying hello right now");
}

function getStream() {
	console.log("getting my stream!");
	spinner.spin(document.getElementById("post-login-container")); 

	SC.get('/me/activities/tracks/affiliated',{limit:page_size,linked_partitioning:1},function(data){
		$(data.collection).each(function(i,track){
			tracks.push({id :track.origin.id, title : track.origin.title});
		});
		console.log("done");
		spinner.stop();

		$("#icon").attr("src","resources/orange_icon.png");
		$('#icon').fadeIn(3000);

		playSongs();
	});
}

function searchForSongs(search_query){
	console.log("will search for " + search_query);
	spinner.spin(document.getElementById("post-login-container")); 

	SC.get('/tracks', { q: search_query, limit:page_size}, function(data) {
  		$(data).each(function(i, track) {
  			tracks.push({id :track.id, title : track.title});
  		});
		spinner.stop();
		$("#icon").attr("src","resources/orange_icon.png");
		$('#icon').fadeIn(3000);
		playSongs();
	});
}

function getFavoriteSongs() {
	console.log("getting favorite songs");
	spinner.spin(document.getElementById("post-login-container")); 

	SC.get('/me/favorites',{limit:page_size,linked_partitioning: 1},function(data){
		$(data.collection).each(function(i,track){
			// this returned track object is slightly diff than stream track object
			tracks.push({id :track.id, title : track.title});
		});
		console.log("done");
		spinner.stop();
		$("#icon").attr("src","resources/orange_icon.png");
		$('#icon').fadeIn(3000);
		playSongs();
	});
}
var currentIndex = 0;
var paused = false;
function playSongs() {

	if(currentIndex < 0) // if user presses back on the first song
		currentIndex = 0;
	
	SC.stream("/tracks/" + tracks[currentIndex].id, 

		{	onfinish: 
			function() {
				console.log(tracks[currentIndex].title + ' finished');
				currentIndex++;
				playSongs();
			}
		},

		function(sound) {
			playSongsCallback(sound)
		});
}	


var isSearching = false;

function playSongsCallback(sound){
	console.log(sound);
	sound.play();
	setTimeout(
		function(){
			$('#icon').trigger('startRumble');		
		},3000);
	
	console.log("playing " + tracks[currentIndex].title) + " w/ id : " + tracks[currentIndex].id;
	$('#track-container').text(tracks[currentIndex].title);
	$("#track-container").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

	document.title = tracks[currentIndex].title;

	if(currentIndex != 0)
		$("#icon").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);


	document.onkeypress = function(e){
		switch(e.keyCode){
			case 13: // enter
				// if we are not searching (normal playing), a search box will open up.
				// if we are searching, the searchbox will go down and make the search. 
				if(!isSearching) {
					console.log("pressed enter - will show search_box");
					$('#track-container').fadeOut(function(){
						$(this).replaceWith( 
							'<input type="text" id="search_box" autofocus ="autofocus">'
						);
						isSearching = true;
					});
				}
				else if(isSearching){
					console.log("pressed enter - will close search_box");
					var search_query = $('#search_box').val();

					$('#search_box').fadeOut(function(){
						$(this).replaceWith('<div id = "track-container"> </div>');
						$('#track-container').text(tracks[currentIndex].title);
					})
					
					isSearching = false;

					// nothing in search_box, so will not searchForSongs();
					if(!search_query || 0 === search_query.length){
						console.log("nothing in search_box");
					}
					else{
						tracks.length = 0; 
						currentIndex = 0;
						sound.stop();
						$('#icon').trigger('stopRumble');
						searchForSongs(search_query);
					}	
				}
				break;

			case 27: //esc
				// pressing escape should close #search_box if it is currently open
				// also will set isSearching = false;
				console.log("pressed esc");
				$('#search_box').fadeOut(function(){
					$(this).replaceWith('<div id = "track-container"> </div>');
					$('#track-container').text(tracks[currentIndex].title);
					isSearching = false;
				})
				break;
		}
	}

	document.onkeydown = function(e) {
		console.log("isSearching : " + isSearching);
		if(!isSearching){
			switch (e.keyCode) {
				case 32: // space
				// pause song if it is playing, unpause if it is paused
				if(paused == true) {
					console.log("resuming " + tracks[currentIndex].title);
					sound.play();
					$('#icon').trigger('startRumble');

					paused = false; 
				}
				else {
					console.log("pausing " + tracks[currentIndex].title);
					sound.pause();
					$('#icon').trigger('stopRumble');
					paused = true;
				}
				break;

				case 37: // left
					// play previous song
					console.log("will play previous song");
					sound.stop();
					currentIndex--;
					$('#icon').trigger('stopRumble');		
					playSongs();
					break;

			    case 82: // r
			    	// repost current song
			    	console.log("repost " + tracks[currentIndex].title);
			    	repostCurrentSong();
			    	break;

		        case 39: //right 
		        	// play the next song
		        	console.log("will play next song");
		        	sound.stop();
		        	currentIndex++;
		        	$('#icon').trigger('stopRumble');
		        	playSongs();
		        	break;

				case 76: //l
					// favorite/like current song
					console.log("favorite " + tracks[currentIndex].title);
					favoriteCurrentSong();
					break;

		        case 70: // f
		        	// switch to playing favorites
		        	$('#icon').trigger('stopRumble');
		        	console.log("going to get favorites");
		        	tracks.length = 0;
		        	currentIndex = 0;
		        	sound.stop();
		        	getFavoriteSongs();
		        	break;

		        case 83: // s
		        	// switch to playing on stream. 
		        	$('#icon').trigger('stopRumble');
		        	console.log("going to get stream");
		        	tracks.length = 0;
		        	currentIndex = 0;
		        	sound.stop();
		        	getStream();
		        	break;
		        }
		    };
		}
	}

function favoriteCurrentSong(){
	SC.put('/me/favorites/' + tracks[currentIndex].id, function(data){
		// console.log(data);
	});
}

function repostCurrentSong() {
	SC.put('/e1/me/track_reposts/' + tracks[currentIndex].id, function(data){
	// console.log(data);
	});
}

function logIn() {
	SC.initialize({
		client_id: '755f32dd67780dda235270868bb0ae6d',
		redirect_uri: 'http://minimal-soundcloud.herokuapp.com/callback.html'
	});

	SC.connect(function() {
		console.log("successfully connected");
		$('#icon').fadeOut(1000);
		$("#icon").unbind("click");
		$('#icon').jrumble({
			x: 2,
			y: 2,
			rotation: 1
		});
		// getFavoriteSongs();
		getStream();
	});
}

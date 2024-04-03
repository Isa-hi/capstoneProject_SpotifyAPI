document.getElementById('play-button').addEventListener('click', function() {
    if(window.topTrackPreviewUrl !== '') {
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.src = window.topTrackPreviewUrl;
        audioPlayer.play();
    }

    //Change .top5-container display to flex
    const top5Container = document.querySelector('.top5-container');
    top5Container.style.display = 'block';
    const playButton = document.getElementById('play-button');
    playButton.style.display = 'none';
});
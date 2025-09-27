function playSound(type){
    let audio = document.getElementById('audio-'+type);
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

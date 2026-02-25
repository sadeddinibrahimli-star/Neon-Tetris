export const sounds = {
    boom: new Audio('SoundEffects/start.mp3'),
    gameOver: new Audio('SoundEffects/gameOver.mp3'),
    border: new Audio('SoundEffects/border.mp3'),
    levelUp: new Audio('SoundEffects/levelUP.mp3'),
    score: new Audio('SoundEffects/score.mp3'),
    score1000: new Audio('SoundEffects/1000score.mp3'),
    step: new Audio('SoundEffects/step.mp3'),
    skip: new Audio('SoundEffects/skip.mp3'),
    startScreen: new Audio('Songs/Song1KorobeinikiStartScreen.mp3'),
    combo: new Audio('SoundEffects/combo.mp3'),
    songs: [
        new Audio('Songs/song2.mp3'),
        new Audio('Songs/song3.mp3'),
        new Audio('Songs/song5.mp3'),
        new Audio('Songs/song6.mp3'),
        new Audio('Songs/song4.mp3')
    ]
};

export function stopAllMusic() {
    sounds.songs.forEach(song => {
        song.pause();
        song.currentTime = 0;
    });
    sounds.startScreen.pause();
    sounds.startScreen.currentTime = 0;
}
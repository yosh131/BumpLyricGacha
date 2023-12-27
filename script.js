// const NUM_PHRASE = 3;

//乱数クラス
class Random {
    constructor(seed = 88675123) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;
    }

    // XorShift
    next() {
        let t;

        t = this.x ^ (this.x << 11);
        this.x = this.y; this.y = this.z; this.z = this.w;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    }

    // min以上max以下の乱数を生成する
    nextInt(min, max) {
        const r = Math.abs(this.next());
        return min + (r % (max + 1 - min));
    }
}

// ハッシュ・Seedを作成
function generateSeed(name, isFirstCall) {
    // 現在の日付を取得
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    let formattedDate = '';
    if (isFirstCall) {
        formattedDate = `${year}${month}${day}`;
    } else {
        // 初回でない時は秒までシードに含める
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        formattedDate = `${year}${month}${day}-${hours}:${minutes}:${seconds}`;
    }
    // 日付と入力された名前を結合して文字列を作成
    const combinedString = formattedDate + name;

    // 文字列をハッシュ化してSeedにする（単純なハッシュ関数の例）
    let seed = 0;
    for (let i = 0; i < combinedString.length; i++) {
        seed = (seed * 31 + combinedString.charCodeAt(i)) & 0xFFFFFFFF;
    }

    return seed;
}


// ランダムな歌詞を1フレーズ取得する関数
function getLyric(data, seed1, seed2) {
    const MAX_NUM = data.length;
    // 曲番号と歌詞番号の乱数シードは別のものを使う必要がある
    const random = new Random(seed1);
    const random2 = new Random(seed2);

    // ランダムなインデックスで歌詞を選択
    const idx = random.nextInt(0, MAX_NUM);
    const lyricAll = data[idx].lyric;
    const lyricList = lyricAll.split(/[ 　]+/);
    let idxLyric = random2.nextInt(0, lyricList.length);
    let retLyric = lyricList.slice(idxLyric, idxLyric + 1).join(' ');
    while (retLyric.trim() === '') {
        idxLyric = random.nextInt(0, lyricList.length);
        retLyric = lyricList.slice(idxLyric, idxLyric + 1).join(' ');
    }
    // return retLyric;
    return {
        lyric: retLyric,
        title: data[idx].title
    };
}

// CSV ファイルを読み込む関数
function loadCSV(callback) {
    fetch('./bump_all_lyrics_fixed.csv')
        .then(response => response.text())
        .then(csv => {
            const data = parseCSV(csv);
            callback(data);
        })
        .catch(error => console.error('CSV読み込みエラー:', error));
}

// CSV パースのための関数
function parseCSV(csv) {
    const lines = csv.split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line !== '') {
            const values = line.split(',');
            const entry = { title: values[0], lyric: values[1] }; // ファイルの実際の構造に合わせて調整
            result.push(entry);
        }
    }

    return result;
}


var isFirstCall = true;

// 歌詞を生成する関数
function generateLyric() {
    const numPhraseSelect = document.getElementById('numPhraseSelect');
    const NUM_PHRASE = numPhraseSelect.value;
    loadCSV((yourData) => {
        const L = [];
        const T = [];
        const nameInput = document.getElementById('nameInput');
        const name = nameInput.value;
        const seed = generateSeed(name + NUM_PHRASE.toString(), isFirstCall);
        const seed2 = generateSeed(NUM_PHRASE.toString() + name, isFirstCall);
        isFirstCall = false;

        // 歌詞を生成
        for (let i = 0; i < NUM_PHRASE; i++) {
            let songObj = getLyric(yourData, seed + i, seed2 + i);
            L.push(songObj.lyric);
            T.push(songObj.title);
        }

        // 生成された歌詞をコンソールに表示（あとでHTMLに表示するなど、用途に合わせて変更）
        console.log(L);
        const lyricText = L.join('　');
        const titleText = T.join('\ /\ ');

        // ボタンを非表示にし、lyricDisplayを表示する
        // document.querySelector('button').style.display = 'none';
        // document.getElementById('gachaForm').style.display = 'none';
        document.querySelector('button').textContent = 'ガチャを引き直す';

        document.getElementById('lyricDisplay').classList.remove('hidden');
        document.getElementById('lyricText').textContent = lyricText;
        document.getElementById('titleText').textContent = titleText;
        // ユーザーの名前を使って結果の表示を更新
        const gachaResult = document.getElementById('gachaResult');
        gachaResult.textContent = `${name}さんのガチャ結果`;

    });
}


function shareOnTwitter() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value;
    const lyricText = document.getElementById('lyricText').textContent;

    // Twitterシェアボタンの内容を更新
    const twitterShareBtn = document.getElementById('twitterShareBtn');
    const shareText = `${name}さんのガチャ結果: \n${lyricText} \n#BUMP歌詞ガチャ \nhttps://yosh131.github.io/BumpLyricGacha/`;
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    twitterShareBtn.href = twitterURL;

    // Twitterウィンドウを開く
    window.open(twitterURL, '_blank');
}


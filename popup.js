document.addEventListener('DOMContentLoaded', function() {
    const svgContainer = document.getElementById('svg-container');
    const resultDiv = document.getElementById('result');
    
    const rssFeeds = {
        '北海道': 'sapporo', '青森': 'aomori', '岩手': 'morioka', '宮城': 'sendai', 
        '秋田': 'akita', '山形': 'yamagata', '福島': 'fukushima', '茨城': 'mito',
        '栃木': 'utsunomiya', '群馬': 'maebashi', '埼玉': 'saitama', '千葉': 'chiba',
        '東京': 'shutoken', '神奈川': 'yokohama', '新潟': 'niigata', '富山': 'toyama',
        '石川': 'kanazawa', '福井': 'fukui', '山梨': 'kofu', '長野': 'nagano',
        '岐阜': 'gifu', '静岡': 'shizuoka', '愛知': 'nagoya', '三重': 'tsu',
        '滋賀': 'otsu', '京都': 'kyoto', '大阪': 'osaka', '兵庫': 'kobe',
        '奈良': 'nara', '和歌山': 'wakayama', '鳥取': 'tottori', '島根': 'matsue',
        '岡山': 'okayama', '広島': 'hiroshima', '山口': 'yamaguchi', '徳島': 'tokushima',
        '香川': 'takamatsu', '愛媛': 'matsuyama', '高知': 'kochi', '福岡': 'fukuoka',
        '佐賀': 'saga', '長崎': 'nagasaki', '熊本': 'kumamoto', '大分': 'oita',
        '宮崎': 'miyazaki', '鹿児島': 'kagoshima', '沖縄': 'okinawa'
    };
    
    // 都道府県ごとの緯度経度マッピング
    const prefectureCoords = {
        '北海道': { lat: 43.0642, lon: 141.3469 },
        '青森': { lat: 40.8244, lon: 140.74 },
        '岩手': { lat: 39.7036, lon: 141.1527 },
        '宮城': { lat: 38.2688, lon: 140.8721 },
        '秋田': { lat: 39.7186, lon: 140.1024 },
        '山形': { lat: 38.2404, lon: 140.3633 },
        '福島': { lat: 37.7503, lon: 140.4676 },
        '茨城': { lat: 36.3418, lon: 140.4468 },
        '栃木': { lat: 36.5658, lon: 139.8836 },
        '群馬': { lat: 36.3912, lon: 139.0609 },
        '埼玉': { lat: 35.8569, lon: 139.6489 },
        '千葉': { lat: 35.6046, lon: 140.1233 },
        '東京': { lat: 35.6895, lon: 139.6917 },
        '神奈川': { lat: 35.4478, lon: 139.6425 },
        '新潟': { lat: 37.9026, lon: 139.0236 },
        '富山': { lat: 36.6953, lon: 137.2113 },
        '石川': { lat: 36.5947, lon: 136.6256 },
        '福井': { lat: 36.0652, lon: 136.2216 },
        '山梨': { lat: 35.6639, lon: 138.5684 },
        '長野': { lat: 36.6513, lon: 138.1812 },
        '岐阜': { lat: 35.3912, lon: 136.7223 },
        '静岡': { lat: 34.9769, lon: 138.3831 },
        '愛知': { lat: 35.1802, lon: 136.9066 },
        '三重': { lat: 34.7303, lon: 136.5086 },
        '滋賀': { lat: 35.0045, lon: 135.8686 },
        '京都': { lat: 35.0214, lon: 135.7556 },
        '大阪': { lat: 34.6863, lon: 135.52 },
        '兵庫': { lat: 34.6913, lon: 135.183 },
        '奈良': { lat: 34.6851, lon: 135.8048 },
        '和歌山': { lat: 34.226, lon: 135.1675 },
        '鳥取': { lat: 35.5039, lon: 134.2377 },
        '島根': { lat: 35.4723, lon: 133.0505 },
        '岡山': { lat: 34.6618, lon: 133.9344 },
        '広島': { lat: 34.3963, lon: 132.4596 },
        '山口': { lat: 34.1861, lon: 131.4705 },
        '徳島': { lat: 34.0703, lon: 134.5541 },
        '香川': { lat: 34.3401, lon: 134.0434 },
        '愛媛': { lat: 33.8417, lon: 132.7657 },
        '高知': { lat: 33.5597, lon: 133.5311 },
        '福岡': { lat: 33.6064, lon: 130.4181 },
        '佐賀': { lat: 33.2494, lon: 130.2988 },
        '長崎': { lat: 32.7448, lon: 129.8737 },
        '熊本': { lat: 32.7898, lon: 130.7417 },
        '大分': { lat: 33.2382, lon: 131.6126 },
        '宮崎': { lat: 31.9111, lon: 131.4239 },
        '鹿児島': { lat: 31.5602, lon: 130.5581 },
        '沖縄': { lat: 26.2124, lon: 127.6809 }
    };

    // SVGファイルを読み込む
    fetch('japan-map.svg')
        .then(response => response.text())
        .then(svgContent => {
            svgContainer.innerHTML = svgContent;
            addPrefectureLabels();
            setupEventListeners();
        })
        .catch(error => {
            console.error('地図は不定形を維持したままです！🎌🎌🎌:', error);
            resultDiv.textContent = '不定形の地図！これは定められません！🧠🧠🧠';
            resultDiv.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            resultDiv.style.color = 'white';
        });
    
    function setupEventListeners() {
        const prefectures = document.querySelectorAll('.prefecture');
        
        prefectures.forEach(prefecture => {
            prefecture.addEventListener('click', async function(e) {
                e.preventDefault();
                const titleElem = this.querySelector('title');
                if (!titleElem) return;
                const prefectureName = titleElem.textContent.split(' / ')[0];
                showPrefecture(prefectureName);
                // 先にニュース欄をクリア
                const newsArticlesDiv = document.getElementById('news-articles');
                newsArticlesDiv.innerHTML = '';
                // 天気取得＆表示
                const weather = await fetchWeather(prefectureName);
                displayWeather(prefectureName, weather);
                fetchNews(prefectureName);
                
                prefectures.forEach(p => p.classList.remove('selected'));
                this.classList.add('selected');
            });
            
            prefecture.addEventListener('mouseenter', function() {
                this.style.fill = '#bbdefb';
            });
            
            prefecture.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.fill = '#e3f2fd';
                }
            });
        });
    }

    function fetchNews(prefectureName) {
        const newsArticlesDiv = document.getElementById('news-articles');
        newsArticlesDiv.innerHTML = '<p>あなたは知らなくてはならない力を！🦾</p>';

        const prefShortName = prefectureName.replace(/(都|府|県)$/, '');
        const rssCode = rssFeeds[prefShortName];

        if (!rssCode) {
            newsArticlesDiv.innerHTML = `<p>${prefectureName}の権力機能を特定しません！🤔🤔🤔</p>`;
            return;
        }

        const rssUrl = `https://www3.nhk.or.jp/lnews/${rssCode}/toplist.xml`;

        chrome.runtime.sendMessage({ action: "fetchNews", url: rssUrl }, response => {
            if (response && response.success) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(response.data, "text/xml");
                const items = xmlDoc.querySelectorAll("item");

                const allArticles = Array.from(items)
                    .map(item => ({
                        title: item.querySelector("title").textContent,
                        link: new URL(item.querySelector("link").textContent, rssUrl).href,
                        description: item.querySelector("description")?.textContent || '',
                        publishedAt: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                        source: { name: 'NHK NEWS WEB' }
                    }));
                
                const shortPrefectureName = prefectureName.replace(/(都|府|県)$/, '');
                let filteredArticles = allArticles.filter(article => 
                    article.title.includes(shortPrefectureName) || article.description.includes(shortPrefectureName)
                );

                if (filteredArticles.length > 0) {
                    displayNews(filteredArticles, prefectureName);
                } else {
                    displayNews(allArticles, prefectureName);
                }
            } else {
                console.error('あなたに権利は与えられません！🖼🖼🖼:', response ? response.error : '不明なエラー');
                newsArticlesDiv.innerHTML = '<p>権力はあなたのものではありません！🤷‍♂️🤷‍♂️🤷‍♂️</p>';
            }
        });
    }

    function displayNews(articles, prefectureName) {
        const newsArticlesDiv = document.getElementById('news-articles');
        newsArticlesDiv.innerHTML = '';

        if (!articles || articles.length === 0) {
            newsArticlesDiv.innerHTML = `<p>${prefectureName}はあなたを否定しています！。</p>`;
            return;
        }

        articles.slice(0, 10).forEach(article => {
            const articleElement = document.createElement('div');
            articleElement.className = 'news-article';

            const titleElement = document.createElement('h3');
            const linkElement = document.createElement('a');
            linkElement.href = article.link;
            linkElement.textContent = article.title;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            titleElement.appendChild(linkElement);

            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = article.description;

            const metaElement = document.createElement('div');
            metaElement.className = 'meta';
            const sourceElement = document.createElement('span');
            sourceElement.textContent = article.source.name;
            const dateElement = document.createElement('span');
            dateElement.textContent = new Date(article.publishedAt).toLocaleDateString('ja-JP');
            metaElement.appendChild(sourceElement);
            metaElement.appendChild(dateElement);

            articleElement.appendChild(titleElement);
            articleElement.appendChild(descriptionElement);
            articleElement.appendChild(metaElement);
            
            newsArticlesDiv.appendChild(articleElement);
        });
    }
    
    function showPrefecture(prefecture) {
        resultDiv.textContent = `あなたの意志の都道府県✟: ${prefecture}`;
        resultDiv.classList.add('show');
        
        setTimeout(() => {
            resultDiv.classList.remove('show');
        }, 3000);
    }
    
    resultDiv.textContent = '地図上の都道府県にあなたがクリックする権利を与えました!🎁';
    
    function addPrefectureLabels() {
        const svg = svgContainer.querySelector('svg');
        if (!svg) return;
        const prefectureGroups = svg.querySelectorAll('.prefecture');

        prefectureGroups.forEach(g => {
            const titleElem = g.querySelector('title');
            if (!titleElem) return;

            let name = titleElem.textContent.split(' / ')[0];
            const originalName = name;
            
            if (name !== '北海道' && name !== '東京都' && name !== '京都府') {
                name = name.replace(/(都|府|県)$/g, '');
            } else if (name === '東京都') {
                name = '東京';
            } else if (name === '京都府') {
                name = '京都';
            }

            let shapes = Array.from(g.querySelectorAll('path, polygon'));
            if (shapes.length === 0) return;
            
            if (originalName === '東京 / Tokyo') {
                const filteredShapes = shapes.filter(s => s.getBBox().x < 800);
                shapes = filteredShapes.length > 0 ? filteredShapes : shapes;
            }

            let mainShape = shapes[0];
            let maxArea = 0;
            shapes.forEach(shape => {
                const bbox = shape.getBBox();
                const area = bbox.width * bbox.height;
                if (area > maxArea) {
                    maxArea = area;
                    mainShape = shape;
                }
            });

            const bbox = mainShape.getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', cx);
            text.setAttribute('y', cy);
            text.setAttribute('class', 'label');
            text.setAttribute('dominant-baseline', 'central');
            text.textContent = name;
            
            if (name === '北海道') {
                text.setAttribute('x', cx - 20);
            } else if (name === '青森') {
                text.setAttribute('y', cy + 10);
            }
            
            g.appendChild(text);
        });
    }

    // 天気情報取得関数
    async function fetchWeather(prefName) {
        // マッピングのキーを正規化
        let key = prefName.replace(/(都|府|県)$/, '');
        if (key === '東京') key = '東京';
        if (key === '京都') key = '京都';
        const coords = prefectureCoords[key] || prefectureCoords[prefName] || prefectureCoords[prefName.replace(/(都|府|県)$/, '')];
        if (!coords) return null;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            // dailyがなければnull返す
            if (!data.daily || !Array.isArray(data.daily.time)) return null;
            return data.daily;
        } catch (e) {
            return null;
        }
    }

    // 天気アイコン取得（簡易）
    function getWeatherIcon(code) {
        // Open-Meteo weathercode: https://open-meteo.com/en/docs#api_form
        if ([0].includes(code)) return '☀️';
        if ([1, 2, 3].includes(code)) return '⛅';
        if ([45, 48].includes(code)) return '🌫️';
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌦️';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
        if ([95, 96, 99].includes(code)) return '⛈️';
        return '🌡️';
    }

    // 天気表示関数
    function displayWeather(prefName, weather) {
        const weatherDiv = document.getElementById('weather-container');
        let html = '';
        if (!weather || !weather.time || !weather.weathercode) {
            html = `<div class="weather-block">天気情報を取得できませんでした。</div>`;
        } else {
            html = `<div class="weather-block"><b>${prefName}の天気</b><br><table class='weather-table'><tr>`;
            // 1行目: 日付（曜日付き）
            for (let i = 0; i < weather.time.length; i++) {
                const date = new Date(weather.time[i]);
                const week = ['日','月','火','水','木','金','土'][date.getDay()];
                html += `<th>${date.getMonth()+1}/${date.getDate()}<br>(${week})</th>`;
            }
            html += '</tr><tr>';
            // 2行目: 天気アイコン
            for (let i = 0; i < weather.time.length; i++) {
                html += `<td style='font-size:22px;'>${getWeatherIcon(weather.weathercode[i])}</td>`;
            }
            html += '</tr><tr>';
            // 3行目: 最低気温
            for (let i = 0; i < weather.time.length; i++) {
                html += `<td style='color:#2196f3;'>${weather.temperature_2m_min[i]}℃</td>`;
            }
            html += '</tr><tr>';
            // 4行目: 最高気温
            for (let i = 0; i < weather.time.length; i++) {
                html += `<td style='color:#f57c00;'>${weather.temperature_2m_max[i]}℃</td>`;
            }
            html += '</tr></table></div>';
        }
        weatherDiv.innerHTML = html;
    }
}); 
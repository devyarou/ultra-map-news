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
            prefecture.addEventListener('click', function(e) {
                e.preventDefault();
                const titleElem = this.querySelector('title');
                if (!titleElem) return;

                const prefectureName = titleElem.textContent.split(' / ')[0];
                showPrefecture(prefectureName);
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
}); 
let currentLang = 'en';
const audio = document.getElementById('bg-audio');
const playerWrapper = document.getElementById('js-audio-player');
const playIcon = document.getElementById('js-play-icon');
const pauseIcon = document.getElementById('js-pause-icon');

function toggleAudio() {
    if (audio.paused) {
        audio.play()
            .then(() => {
                playerWrapper.classList.add('playing');
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            })
            .catch(err => {
                console.log("Audio contextual trigger missing.");
            });
    } else {
        audio.pause();
        playerWrapper.classList.remove('playing');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

async function loadBlog() {
    try {
        const response = await fetch('articles.json');
        if (!response.ok) throw new Error('Could not load articles JSON');
        
        const articles = await response.json();
        renderBlogMenu(articles);
    } catch (err) {
        document.getElementById('js-blog-render').innerHTML = '<p>Failed to load notebook articles. Ensure you run via Live Server and use articles.json.</p>';
    }
}

function renderBlogMenu(articles) {
    const listEl = document.getElementById('js-post-list');
    listEl.innerHTML = '';
    
    articles.forEach((article, index) => {
        const li = document.createElement('li');
        li.className = `post-item ${index === 0 ? 'active' : ''}`;
        li.onclick = () => selectArticle(article, li);
        
        li.innerHTML = `
            <span class="post-title">${article.title}</span>
            <span class="post-date">${article.date}</span>
        `;
        listEl.appendChild(li);
    });

    if(articles.length > 0) {
        fetchAndDisplayMarkdown(articles[0]);
    }
}

function selectArticle(article, element) {
    document.querySelectorAll('.post-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    fetchAndDisplayMarkdown(article);
}

async function fetchAndDisplayMarkdown(article) {
    const renderEl = document.getElementById('js-blog-render');
    renderEl.innerHTML = '<p>Loading entry...</p>';
    
    try {
        const res = await fetch(article.file);
        if (!res.ok) throw new Error();
        const markdownText = await res.text();
        
        let parsedHtml = marked.parse(markdownText);
        const metaTag = `<span class="meta">Published: ${article.date}</span>`;
        
        if (parsedHtml.includes('</h1>')) {
            parsedHtml = parsedHtml.replace(/<\/h1>/, `</h1>${metaTag}`);
        } else {
            parsedHtml = `<h1>${article.title}</h1>${metaTag}${parsedHtml}`;
        }
        
        renderEl.innerHTML = parsedHtml;
    } catch (err) {
        renderEl.innerHTML = `<p>Error loading article content from ${article.file}</p>`;
    }
}

function updateLayout() {
    const wrappers = document.querySelectorAll('.slide-wrapper');
    wrappers.forEach(w => {
        const enBlock = w.querySelector('.lang-block.en');
        const heBlock = w.querySelector('.lang-block.he');
        const inner = w.querySelector('.slide-inner');
        
        if (currentLang === 'en') {
            w.style.height = `${enBlock.offsetHeight}px`;
            inner.style.transform = 'translateY(0px)';
            enBlock.classList.add('active');
            heBlock.classList.remove('active');
        } else {
            w.style.height = `${heBlock.offsetHeight}px`;
            inner.style.transform = `translateY(-${enBlock.offsetHeight}px)`;
            heBlock.classList.add('active');
            enBlock.classList.remove('active');
        }
    });
}

function initLanguageToggle() {
    setInterval(() => {
        currentLang = currentLang === 'en' ? 'he' : 'en';
        updateLayout();
    }, 28000);
}

function playIntro() {
    const intro = document.getElementById('intro-screen');
    const content = document.getElementById('site-content');
    const INTRO_HOLD_MS = 6500;   
    const INTRO_FADE_MS = 2200;   

    setTimeout(() => {
        intro.classList.add('fade-out');
        content.classList.add('visible');
        document.documentElement.classList.add('intro-done');

        setTimeout(() => {
            intro.remove();
        }, INTRO_FADE_MS);
    }, INTRO_HOLD_MS);
}

window.addEventListener('load', () => {
    updateLayout();
    initLanguageToggle();
    loadBlog();
    playIntro();
});
window.addEventListener('resize', updateLayout);
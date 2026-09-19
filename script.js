let posts = [];
let currentArticle = null;

async function loadArticles() {
    try {
        const response = await fetch("articles.json");

        if (!response.ok) {
            throw new Error(
                `Failed to load articles.json: ${response.status}`
            );
        }

        const data = await response.json();

        posts = data.map((article, index) => ({
            ...article,
            slug: createSlug(article.title, index)
        }));

        renderPostList();
        handleCurrentURL();
    } catch (error) {
        console.error(error);
        showNotebookError();
    }
}

function createSlug(title, index) {
    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return slug || `article-${index + 1}`;
}

function openNotebook() {
    const modal = document.getElementById(
        "notebook-modal"
    );

    if (!modal) {
        return;
    }

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "notebook-open"
    );
}

function closeNotebook(updateURL = true) {
    const modal = document.getElementById(
        "notebook-modal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "notebook-open"
    );

    if (updateURL) {
        const url = new URL(
            window.location.href
        );

        url.searchParams.delete(
            "article"
        );

        history.pushState(
            {},
            "",
            url.pathname +
            url.search +
            url.hash
        );

        document.title = "Ammar";
    }
}

function renderPostList() {
    const list = document.getElementById(
        "js-post-list"
    );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    posts.forEach(post => {
        const item = document.createElement(
            "li"
        );

        const link = document.createElement(
            "a"
        );

        const title = document.createElement(
            "span"
        );

        const date = document.createElement(
            "span"
        );

        link.href = createArticleURL(
            post.slug
        );

        link.dataset.slug = post.slug;

        title.className = "post-title";
        title.textContent = post.title;

        date.className = "post-date";
        date.textContent = post.date;

        link.appendChild(title);
        link.appendChild(date);

        link.addEventListener(
            "click",
            event => {
                event.preventDefault();

                loadArticle(
                    post.slug,
                    true
                );
            }
        );

        item.appendChild(link);
        list.appendChild(item);
    });
}

async function loadArticle(
    slug,
    updateURL = true
) {
    const post = posts.find(
        article =>
            article.slug === slug
    );

    if (!post) {
        showArticleNotFound();
        openNotebook();
        return;
    }

    const render = document.getElementById(
        "js-blog-render"
    );

    const content = document.getElementById(
        "js-blog-content"
    );

    const empty = document.getElementById(
        "js-notebook-empty"
    );

    const shareButton = document.getElementById(
        "js-share-article"
    );

    if (
        !render ||
        !content ||
        !empty ||
        !shareButton
    ) {
        return;
    }

    try {
        const response = await fetch(
            post.file
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load ${post.file}: ${response.status}`
            );
        }

        const markdown = await response.text();

        render.innerHTML = `
            <div class="article-meta">
                ${escapeHTML(post.date)}
            </div>

            ${marked.parse(markdown)}
        `;

        empty.hidden = true;
        content.hidden = false;
        shareButton.hidden = false;

        currentArticle = post;

        updateActiveArticle(
            slug
        );

        if (updateURL) {
            const url = new URL(
                window.location.href
            );

            url.searchParams.set(
                "article",
                slug
            );

            history.pushState(
                {
                    article: slug
                },
                "",
                url.pathname +
                url.search +
                url.hash
            );
        }

        document.title =
            `${post.title} — Ammar`;

        openNotebook();

        requestAnimationFrame(() => {
            const reader =
                document.querySelector(
                    ".notebook-reader"
                );

            if (reader) {
                reader.scrollTop = 0;
            }
        });
    } catch (error) {
        console.error(error);

        showArticleLoadError(
            post
        );

        openNotebook();
    }
}

function updateActiveArticle(slug) {
    const links =
        document.querySelectorAll(
            ".post-list a"
        );

    links.forEach(link => {
        const active =
            link.dataset.slug === slug;

        link.classList.toggle(
            "active",
            active
        );

        if (active) {
            link.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            link.removeAttribute(
                "aria-current"
            );
        }
    });
}

function createArticleURL(slug) {
    const url = new URL(
        window.location.href
    );

    url.searchParams.set(
        "article",
        slug
    );

    return url.toString();
}

function handleCurrentURL() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const slug = params.get(
        "article"
    );

    if (!slug) {
        return;
    }

    loadArticle(
        slug,
        false
    );
}

function showArticleNotFound() {
    const empty = document.getElementById(
        "js-notebook-empty"
    );

    const content = document.getElementById(
        "js-blog-content"
    );

    const shareButton = document.getElementById(
        "js-share-article"
    );

    if (content) {
        content.hidden = true;
    }

    if (shareButton) {
        shareButton.hidden = true;
    }

    if (empty) {
        empty.hidden = false;

        empty.innerHTML = `
            <h2>
                Article not found.
            </h2>
        `;
    }

    currentArticle = null;
}

function showArticleLoadError(post) {
    const empty = document.getElementById(
        "js-notebook-empty"
    );

    const content = document.getElementById(
        "js-blog-content"
    );

    const shareButton = document.getElementById(
        "js-share-article"
    );

    if (content) {
        content.hidden = true;
    }

    if (shareButton) {
        shareButton.hidden = true;
    }

    if (empty) {
        empty.hidden = false;

        empty.innerHTML = `
            <h2>
                Couldn't load<br>
                ${escapeHTML(post.title)}.
            </h2>
        `;
    }

    currentArticle = null;
}

function showNotebookError() {
    const empty = document.getElementById(
        "js-notebook-empty"
    );

    if (!empty) {
        return;
    }

    empty.hidden = false;

    empty.innerHTML = `
        <h2>
            Couldn't load<br>
            the notebook.
        </h2>
    `;
}

async function shareCurrentArticle() {
    if (!currentArticle) {
        return;
    }

    const url = createArticleURL(
        currentArticle.slug
    );

    const shareData = {
        title: currentArticle.title,
        text: currentArticle.title,
        url
    };

    if (navigator.share) {
        try {
            await navigator.share(
                shareData
            );

            return;
        } catch (error) {
            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }
        }
    }

    try {
        await navigator.clipboard.writeText(
            url
        );

        showCopiedState();
    } catch (error) {
        fallbackCopy(url);
        showCopiedState();
    }
}

function showCopiedState() {
    const button = document.getElementById(
        "js-share-article"
    );

    if (!button) {
        return;
    }

    const originalText =
        button.textContent;

    button.textContent =
        "Link copied";

    setTimeout(() => {
        button.textContent =
            originalText;
    }, 1600);
}

function fallbackCopy(text) {
    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value = text;

    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";

    textarea.style.pointerEvents =
        "none";

    document.body.appendChild(
        textarea
    );

    textarea.focus();
    textarea.select();

    document.execCommand(
        "copy"
    );

    textarea.remove();
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

window.addEventListener(
    "popstate",
    () => {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const slug = params.get(
            "article"
        );

        if (slug) {
            loadArticle(
                slug,
                false
            );
        } else {
            closeNotebook(false);

            currentArticle = null;

            document.title =
                "Ammar";

            updateActiveArticle("");
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        const modal =
            document.getElementById(
                "notebook-modal"
            );

        if (
            modal &&
            modal.classList.contains(
                "open"
            )
        ) {
            closeNotebook();
        }
    }
);

document.addEventListener(
    "DOMContentLoaded",
    loadArticles
);
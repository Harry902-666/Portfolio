(() => {
  const data = window.PORTFOLIO;
  const view = document.querySelector('#categoryView');
  const track = document.querySelector('#scrollTrack');
  const currentSlide = document.querySelector('#currentSlide');
  const totalSlides = document.querySelector('#slideTotal');
  const categorySwitcher = document.querySelector('#categorySwitcher');
  let activeCategory = 'ai';
  let slideObserver;

  window.requestAnimationFrame(() => window.setTimeout(() => document.body.classList.add('is-ready'), 60));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function mediaFor(project, category) {
    if (project.media === 'bilibili' && project.bvid) {
      const playerUrl = `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(project.bvid)}&autoplay=0&danmaku=0`;
      return `<div class="video-frame bilibili-frame"><iframe src="${playerUrl}" title="${escapeHtml(project.title)} 视频演示" loading="lazy" allow="fullscreen; autoplay; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>${project.placeholder ? '<span class="source-badge">链接需确认</span>' : ''}</div><div class="media-footnote"><span>哔哩哔哩播放器</span><a href="${escapeHtml(project.sourceUrl)}" target="_blank" rel="noopener">在 B 站打开 ↗</a></div>`;
    }
    if (project.media === 'external' && project.externalUrl) {
      return `<a class="link-stage self-stage" href="${escapeHtml(project.externalUrl)}" target="_blank" rel="noopener"><span class="link-kicker">PROJECT SHOWCASE</span><span class="link-orbit orbit-a"></span><span class="link-orbit orbit-b"></span><b>${escapeHtml(project.title)}</b><span class="link-cta">${escapeHtml(project.externalLabel || '打开作品展示 ↗')}</span></a><div class="media-footnote"><span>飞书作品展示</span><a href="${escapeHtml(project.externalUrl)}" target="_blank" rel="noopener">打开展示页 ↗</a></div>`;
    }
    if (project.media === 'pending-link') {
      return `<div class="video-placeholder link-placeholder"><span class="film-mark">${escapeHtml(project.mark)}</span><span class="link-pending">项目入口待补充</span><span class="video-pending-copy">目前没有公开演示链接</span></div><div class="media-footnote"><span>补充网址后即可添加体验入口</span></div>`;
    }
    if (project.media === 'self') {
      return `<a class="link-stage self-stage" href="#home"><span class="link-kicker">YOU ARE VIEWING</span><span class="link-orbit orbit-a"></span><span class="link-orbit orbit-b"></span><b>陈俊蓉作品集</b><span class="link-cta">当前网页 ↗</span></a><div class="media-footnote"><span>这个作品就是当前页面</span><span>静态网页 · 可直接部署</span></div>`;
    }
    if (project.media === 'image' && project.image) {
      const images = [project.image, ...(project.gallery || [])];
      return `<div class="visual-frame"><img class="main-artwork" src="./${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy"><span class="image-count">01 / ${String(images.length).padStart(2,'0')}</span></div><div class="accordion-gallery" aria-label="作品图片画廊">${images.map((src,index)=>`<button class="accordion-panel ${index === 0 ? 'selected' : ''}" data-image="./${escapeHtml(src)}" aria-label="查看作品图片 ${index+1}" aria-pressed="${index === 0}"><img src="./${escapeHtml(src)}" alt="${escapeHtml(project.title)} ${index+1}" loading="lazy"><span>${String(index+1).padStart(2,'0')}</span></button>`).join('')}</div>${project.extensions?.length ? `<details class="visual-extensions"><summary>查看应用延展 <span>+ ${project.extensions.length}</span></summary><div>${project.extensions.map(src=>`<img src="./${escapeHtml(src)}" alt="冰糖橙设计应用延展" loading="lazy">`).join('')}</div></details>` : ''}`;
    }
    return `<div class="video-placeholder"><span class="film-mark">${escapeHtml(project.mark || 'PROJECT')}</span><span class="video-pending-copy">作品素材待补充</span></div>`;
  }

  function renderProject(project, category, index, total) {
    const desc = escapeHtml(project.description).replace(/\n/g, '<br>');
    const visual = category === 'visual';
    const experience = project.experienceUrl ? `<a class="project-cta" href="${escapeHtml(project.experienceUrl)}" target="_blank" rel="noopener">${escapeHtml(project.experienceLabel || '体验项目')} <b>↗</b></a>` : '';
    const placeholder = project.placeholder ? '<p class="hosting-note">这条视频链接被复用于不同作品或在资料中标为占位，请确认后在 projects.js 中更新。</p>' : '';
    return `<article class="project-slide ${visual ? 'slide-visual' : ''}" data-slide="${index}" aria-label="${escapeHtml(project.title)}">
      <div class="slide-topline"><span>${escapeHtml(project.kind)}${project.year ? ` <i>/</i> ${escapeHtml(project.year)}` : ``}</span><span>${String(index+1).padStart(2,'0')} <i>—</i> ${String(total).padStart(2,'0')}</span></div>
      <div class="slide-heading"><div><p class="project-index">${escapeHtml(project.mark)}</p><h1><span class="slide-title-mask"><span class="slide-title-text">${escapeHtml(project.title)}</span></span></h1></div><p class="project-description">${desc}</p></div>
      <div class="slide-body ${visual ? 'body-visual' : ''}">
        <div class="project-media ${project.media === 'bilibili' ? 'media-video' : ''}">${mediaFor(project, category)}</div>
        <aside class="project-meta"><div><small>我的职责</small><b>${escapeHtml(project.role)}</b></div><div><small>工具 / 方法</small><b>${escapeHtml(project.tools)}</b></div>${experience}${placeholder}</aside>
      </div>
      <div class="slide-footer"><span>CHEN JUNRONG / ${category === 'lessons' ? 'ANIMATION LESSONS' : category === 'visual' ? 'VISUAL ARCHIVE' : category === 'games' ? 'GAME DEVELOPMENT' : 'ARTIFICIAL INTELLIGENCE'}</span><span class="scroll-next">${index < total-1 ? '向下滚动 · 下一件作品' : '已到分类末尾 · 返回首页'} <b>${index < total-1 ? '↓' : '↗'}</b></span></div>
    </article>`;
  }

  function openCategory(key) {
    const category = data[key];
    if (!category) return;
    activeCategory = key;
    categorySwitcher.innerHTML = Object.entries(data).map(([id,item]) => `<button type="button" class="category-tab ${id === key ? 'is-active' : ''}" data-view-category="${id}" aria-current="${id === key ? 'page' : 'false'}">${id === key ? `<span>${item.number} / ${item.english}</span><b>${item.title}</b>` : `<b>${item.title}</b>`}</button>`).join('');
    categorySwitcher.querySelectorAll('[data-view-category]').forEach(button=>button.addEventListener('click',()=>openCategory(button.dataset.viewCategory)));
    totalSlides.textContent = String(category.projects.length).padStart(2,'0');
    currentSlide.textContent = '01';
    track.innerHTML = category.projects.map((project,index)=>renderProject(project,key,index,category.projects.length)).join('');
    track.scrollTop = 0;
    view.className = `category-view view-${key}`;
    view.setAttribute('aria-hidden','false');
    document.body.classList.add('viewing-category');
    requestAnimationFrame(() => view.classList.add('is-open'));
    if (slideObserver) slideObserver.disconnect();
    slideObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-seen');
        currentSlide.textContent = String(Number(entry.target.dataset.slide)+1).padStart(2,'0');
      });
    }, {root:track,threshold:.56});
    track.querySelectorAll('.project-slide').forEach(slide=>slideObserver.observe(slide));
    bindGallery(track);
  }

  function bindGallery(root) {
    root.querySelectorAll('.accordion-panel').forEach(button=>button.addEventListener('click',()=>{
      const media=button.closest('.project-media');
      const art=media.querySelector('.main-artwork');
      art.src=button.dataset.image;
      button.parentElement.querySelectorAll('.accordion-panel').forEach(item=>{
        const selected=item===button;
        item.classList.toggle('selected',selected);
        item.setAttribute('aria-pressed',String(selected));
      });
      const panels=[...button.parentElement.querySelectorAll('.accordion-panel')];
      const counter=media.querySelector('.image-count');
      if(counter)counter.textContent=`${String(panels.indexOf(button)+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;
    }));
  }

  function closeCategory() {
    view.classList.remove('is-open');
    view.setAttribute('aria-hidden','true');
    document.body.classList.remove('viewing-category');
    window.setTimeout(()=>{if(!view.classList.contains('is-open'))track.replaceChildren()},420);
  }

  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>openCategory(button.dataset.category)));
  document.querySelector('#navWorks').addEventListener('click',()=>openCategory(activeCategory));
  document.querySelector('#backHome').addEventListener('click',closeCategory);
  document.querySelector('#closeView').addEventListener('click',closeCategory);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&view.classList.contains('is-open'))closeCategory()});
  document.querySelectorAll('a[href="#about"],a[href="#contact"],a[href="#home"]').forEach(link=>link.addEventListener('click',()=>{if(view.classList.contains('is-open'))closeCategory()}));
})();









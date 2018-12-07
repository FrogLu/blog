function integrateGitalk(router) {
    const linkGitalk = document.createElement('link')
    linkGitalk.href = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css'
    linkGitalk.rel = 'stylesheet'
    const scriptGitalk = document.createElement('script')
    document.body.appendChild(linkGitalk)
    scriptGitalk.src = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js'
    document.body.appendChild(scriptGitalk)
  
    router.afterEach((to) => {
      const commentsContainer = document.createElement('div')
      commentsContainer.id = 'gitalk-container'
      commentsContainer.classList.add('content')
      const $page = document.querySelector('.page')
      if ($page) {
        $page.appendChild(commentsContainer)
      }
      if (scriptGitalk.onload) {
        renderGitalk(to.fullPath)
      } else {
        scriptGitalk.onload = () => {
          const commentsContainer = document.createElement('div')
          commentsContainer.id = 'gitalk-container'
          commentsContainer.classList.add('content')
          const $page = document.querySelector('.page')
          if ($page) {
            $page.appendChild(commentsContainer)
            renderGitalk(to.fullPath)
          }
        }
      }
    })
    function renderGitalk(fullPath) {
      const gitalk = new Gitalk({
        clientID: '6b7640548076143457a4',
        clientSecret: 'b09084f6f86e5ddd140e821d71755101550bcebc',
        repo: 'blog',
        owner: 'froglu',
        admin: ['froglu'],
        id: 'comment',
        distractionFreeMode: false,
        language: 'zh-CN',
      })
  
      gitalk.render('gitalk-container')
    }
  }
  
  export default ({Vue, options, router, siteData}) => {
    try {
      document && integrateGitalk(router)
    } catch (e) {
      console.error(e.message)
    }
  }
  
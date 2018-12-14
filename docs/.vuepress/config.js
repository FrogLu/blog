module.exports = {
    title: '丫头',
    description: 'Cockroachs apprentice',
    serviceWorker: true,
    ga: 'UA-129512845-1',
    markdown: {
        config: md => {
          md.set({breaks: true})
          md.use(require('markdown-it-math'))
        }
    },
    themeConfig: {
        repo: 'FrogLu/FrogLu.github.io',
        lastUpdated: 'Last Updated',
        serviceWorker: {
            updatePopup: {message: 'New content is available.', buttonText: 'Refresh'}
        },
        docsDir: 'docs',
        algolia: { apiKey: '744bca5e7ed206ef244e700fc4014300', indexName: 'FrogLu'},
        tags: true,
        nav: [
            {text: 'Cpp', link: '/Cpp/functionParameter'},
            {text: 'Linux', link: '/Linux/404'},
            {text: 'PAT', link: '/PAT/'},
            {text: 'Others', link: '/Others/404'},
        ],
        sidebarDepth: 2,
        sidebar: {
            '/Cpp/': [
                {
                    title: 'Expression',
                    collapsable: false,
                    children: ['lvalueRvalue','sizeofVector'],
                },
                {
                    title: 'Function',
                    collapsable: false,
                    children: ['functionParameter'],
                },
            ],
            '/PAT/': [
                '',
            ],
            
        },
    },
  };
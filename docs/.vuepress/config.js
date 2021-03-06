module.exports = {
    base: '/',
    title: '丫头',
    description: 'Cockroachs apprentice',
    ga: 'UA-129512845-1',
    head: [
        ['link', {rel: 'shortcut icon', href: '/favicon.png'}],
    ],
    serviceWorker: true,

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
            {text: 'Others', link: '/Others/Summary/2018'},
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
            '/Others/':[
                {
                    title: 'Annual Summary',
                    collapsable: false,
                    children: ['Summary/2018'],
                },
            ],
        },
    },
  };
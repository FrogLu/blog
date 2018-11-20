module.exports = {
    title: 'FrogLu',
    description: 'Cockroachs apprentice',
    ga: 'UA-129512845-1',
    themeConfig: {
        repo: 'FrogLu/FrogLu.github.io',
        lastUpdated: 'Last Updated',
        docsDir: 'docs',
        algolia: { apiKey: '744bca5e7ed206ef244e700fc4014300', indexName: 'FrogLu'},
        tags: true,
        nav: [
            {text: 'Cpp', link: '/Cpp/sizeofVector'},
            {text: 'Linux', link: '/Linux/404'},
            {text: 'PAT', link: '/PAT/'},
            {text: 'Others', link: '/Others/404'},
        ],
        sidebar: {
            '/Cpp/': [
                {
                    title: 'Expression',
                    collapsable: false,
                    children: ['lvalueRvalue','sizeofVector'],
                },
            ],
            '/PAT/': [
                '',
            ],
            
        },
    },
  };
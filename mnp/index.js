import { parse } from 'url'
import fonts from './fonts'
import installPotrace from './potrace'

const font = fonts[Math.floor(Math.random() * fonts.length)]

export default {
  questions: {
    'URL': {
      getDefault ({ org, name }) {
        return `https://${org}.github.io/${name}/`
      },
      alias: 'https://mnpjs.github.io/splendid/',
    },
    'license': {
      text: 'License (MIT/AGPL)',
      getDefault() {
        return 'AGPL'
      },
      // https://spdx.org/licenses/
      afterQuestions({ removeFiles, renameFile, warn }, license) {
        const supported = ['MIT', 'AGPL']
        if (!supported.includes(license)) {
          warn(`Unknown license ${license}`)
          return
        }
        renameFile(`LICENSE-${license}`, 'LICENSE')
        removeFiles(/LICENSE-.+$/)
        if (license == 'AGPL') return 'AGPL-3.0-or-later'
        return 'MIT'
      },
    },
    'Keep help': {
      confirm: true,
      async afterQuestions({ updateFiles, removeFiles }, keep) {
        if (keep) await updateFiles([
          {
            re: /<!-- help: /gm,
            replacement() {
              this.debug('Updating help in %s', this.path)
              return '<!-- '
            },
          },
        ], { extensions: ['html', 'md'] })
        else {
          await updateFiles([
            {
              re: /^ *<!-- help: [\s\S]+? -->\s*/gm,
              replacement() {
                this.debug('Removing help from %s', this.path)
                return ''
              },
            },
          ], { extensions: ['html', 'md'] })
          removeFiles(/splendid\/.*?\/README\.md$/)
        }
      },
    },
  },
  async afterInit({ manager, org, name, URL }, api) {
    const { spawn, warn, updateFiles, github, loading, renameFile } = api

    if (manager == 'yarn') {
      await spawn('yarn')
    } else {
      warn('You should run npm install in the new repository.')
    }
    await updateFiles({
      re: /# start template[\s\S]+?# end template(\n|$)/,
      replacement() {
        this.debug('Fixing .gitignore %s', this.path)
        return ''
      },
    }, { file: '.gitignore' })
    await updateFiles({
      re: /Lobster/g, // {{ font }}
      replacement() {
        this.debug('Setting font in %s', this.path)
        return font
      },
    }, { extensions: ['html', 'css'] })
    await loading('Setting GitHub homepage', github.repos.edit(org, name, {
      homepage: URL,
    }))
    renameFile('docs/.index.html', 'docs/index.html')
    await loading('Enabling Pages on docs', github.pages.enable(org, name))

    const { pathname } = parse(URL)
    await updateFiles([{
      // re: /\/\/start mount\s+mount: '\/{{ name }}', \/\/ end mount/,
      re: /mount: '\/splendid'/,
      replacement() {
        if (pathname == '/') return `// mount: '${pathname}'`
        return `mount: '${pathname}'`
      },
    },
    ], { file: 'splendid/index.js' })
    await installPotrace(api)
    await loading('Fetching splash', splash(api))
  },
  files: {
    filenames(fn) {
      return [...fn, /LICENSE-.+$/]
    },
  },
}

const splash = async ({ download, writeFileSync }) => {
  const photo = await download('https://source.unsplash.com/collection/923267/600x400')
  writeFileSync('splendid/img/splash.jpg', photo)
}
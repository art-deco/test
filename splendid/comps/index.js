import __initResizeObserver from './__init/resize-observer'
import makeClassGetter from './__mcg'
const renameMaps = {  }
__initResizeObserver()
import { Component, render, h } from '@externs/preact'
import { makeIo, init, start } from './__competent-lib'
import Ellipsis from '../components/ellipsis.jsx'
import SocialButtons from 'splendid/build/components/social-buttons'

const __components = {
  'ellipsis': Ellipsis,
  'social-buttons': SocialButtons,
}

const io = makeIo()

/** @type {!Array<!preact.PreactProps>} */
const meta = [{
  key: 'ellipsis',
  id: 'ceb55',
  props: {
    timeout: '300',
  },
  children: ["\n  Please bear one moment while I add the content\n"],
},
{
  key: 'social-buttons',
  id: 'c801e',
  props: {
    url: 'https://mnpjs.github.io/splendid/',
    meta: 'true',
    className: 'b-xq b-Hk',
    mount: '/splendid/',
  },
}]
meta.forEach(({ key, id, props = {}, children = [] }) => {
  const Comp = __components[key]
  const plain = Comp.plain || (/^\s*class\s+/.test(Comp.toString()) && !Component.isPrototypeOf(Comp))
  props.splendid = { addCSS(stylesheet) {
    return makeClassGetter(renameMaps[stylesheet])
  } }

  const ids = id.split(',')
  ids.forEach((Id) => {
    const { parent, el } = init(Id, key)
    const renderMeta = /** @type {_competent.RenderMeta} */ ({ key, id: Id, plain })
    let comp
    el.render = () => {
      comp = start(renderMeta, Comp, comp, el, parent, props, children, { render, Component, h })
      return comp
    }
    el.render.meta = renderMeta
    io.observe(el)
  })
})

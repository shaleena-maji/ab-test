addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

class ElementHandler {
  constructor(replacementText) {
    this.replacementText = replacementText;
  }
  element(element) {
    element.setInnerContent(this.replacementText)
  }
}

class AttributeHandler {
  element(element) {
    element.setAttribute('href', 'https://www.google.com/')
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

  let url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  const response = await fetch(url)
  const { variants } = await response.json()

  let cookie = request.headers.get('cookie');
  let res;
  let variantString = /variant=([01])/.exec(cookie);
  let getVariant = (vExec) => {
    let v;
    if (vExec) {
      if (vExec[1] === '0') {
        v = 0;
      }
      if (vExec[1] === '1') {
        v = 1;
      }
    } else {
      const rand = Math.random();
      if (rand < 0.5) {
        v = 0;
      } else {
        v = 1;
      }
    }
    return v;
  }
  let variant = getVariant(variantString)
  res = await fetch(variants[variant]);
  res = new Response(res.body, res)
  res.headers.set('set-cookie', `variant=${variant}`)

  const rewriter = new HTMLRewriter()
    .on('title', new ElementHandler('Variant 1'))
    .on('h1#title', new ElementHandler('Variant 1'))
    .on('p#description', new ElementHandler('You should keep getting this Variant unless you clear cookies :)'))
    .on('a#url', new AttributeHandler('href'))
    .on('a#url', new ElementHandler('Google'))

  return rewriter.transform(res)

}

let require, resources;
const ENVIRONMENT_IS_NODE =
    'string' == typeof globalThis.process?.versions?.node,
  ENVIRONMENT_IS_DENO =
    ('object' == typeof window && 'Deno' in window) ||
    ('object' == typeof self && 'Deno' in self);
export async function initialize() {
  if (ENVIRONMENT_IS_NODE) {
    const { createRequire: e } = await import('module');
    require = e(import.meta.url);
  } else if (ENVIRONMENT_IS_DENO) {
    const e = new URL('./resources/list.json', import.meta.url),
      r = await globalThis.fetch(e).then((e) => e.json()),
      t = await Promise.all(
        r.map((e) => {
          const r = new URL(`./resources/${e}`, import.meta.url);
          return globalThis
            .fetch(r)
            .then(async (e) => {
              if (e.ok) return e.arrayBuffer();
            })
            .then((r) => ({ buffer: r, filename: e }))
            .catch(() => ({ buffer: void 0, filename: e }));
        })
      );
    resources = t.reduce(
      (e, { filename: r, buffer: t }) => (
        (e[`${globalThis.gdPicture.baseUrl}/resources/${decodeURI(r)}`] = t), e
      ),
      {}
    );
  }
}
export function fetchResource(e, r) {
  fetch(`${globalThis.gdPicture.baseUrl}/resources/${e}`, r);
}
export function fetch(e, r) {
  try {
    if (ENVIRONMENT_IS_NODE) {
      const t = require('node:fs'),
        o = require('node:path'),
        i = t.readFileSync(o.normalize(e));
      globalThis.gdPicture.module.FS.writeFile(r, new Uint8Array(i));
    } else if (ENVIRONMENT_IS_DENO)
      globalThis.gdPicture.module.FS.writeFile(r, new Uint8Array(resources[e]));
    else {
      const t = new XMLHttpRequest();
      t.open('GET', e, !1),
        t.overrideMimeType('text/plain; charset=x-user-defined'),
        t.send(),
        200 === t.status
          ? globalThis.gdPicture.module.FS.writeFile(
              r,
              stringToArrayBuffer(t.response)
            )
          : console.error(`Could not retrieve resource. Status: ${t.status}`);
    }
  } catch (e) {
    console.error(`Could not retrieve resource. Exception: ${e.message}`);
  }
}
function stringToArrayBuffer(e) {
  const r = new ArrayBuffer(e.length),
    t = new Uint8Array(r);
  for (let r = 0, o = e.length; r < o; r++) t[r] = e.charCodeAt(r);
  return t;
}

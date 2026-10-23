import { GOATCOUNTER_CODE } from './config'

// Loads GoatCounter's script, which counts one page view per visit. It sets no
// cookies and ignores localhost, so dev runs are not counted.
export function startAnalytics() {
  if (!GOATCOUNTER_CODE) return
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://gc.zgo.at/count.js'
  script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  document.head.appendChild(script)
}

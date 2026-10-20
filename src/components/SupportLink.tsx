import { SUPPORT_URL } from '../config'

export function SupportLink() {
  return (
    <p className="support">
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
        ☕ Buy me a coffee
      </a>
    </p>
  )
}

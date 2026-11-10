import { ISSUES_URL, SUPPORT_URL } from '../config'

export function SupportLink() {
  return (
    <>
      <p className="support">
        Enjoying the app? A{' '}
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          small tip
        </a>{' '}
        helps keep it maintained and growing.
      </p>
      <p className="support support-issue">
        Found a bug or have an idea?{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
          Report an issue
        </a>
      </p>
    </>
  )
}

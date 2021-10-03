import Link from 'next/link'

import styles from './header.module.scss'

export default function Header() {
  return (
    <Link href="/">
      <img className={styles.logo} src="/logo.svg" alt="logo" />
    </Link>
  )
}

import { GetStaticProps } from 'next';
import Head from 'next/head'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling 42</title>
      </Head>
      <body>
        <main className={styles.container}>
          <img className={styles.logo} src="/images/logo.svg" alt="Space Traveling Blog" />
          <article className={styles.post}>
            <a href="">
              <h1>Como utilizar Hooks</h1>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <div className={styles.postInfos}>
                <div className={styles.updatedAt}>
                  <img src="/images/calendar.svg" alt="" />
                  <time>{new Date().toLocaleDateString('pt-BR', {
                    day:'2-digit',
                    month:'short',
                    year:'numeric'
                  })}</time>
                </div>
                <div className={styles.author}>
                  <img src="/images/user.svg" alt="" />
                  <p>NicholasWM</p>
                </div>
              </div>
            </a>
          </article>
          <a href="" className={styles.buttonMorePosts}>
            Carregar mais posts
          </a>
        </main>
      </body>
    </>

  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };

import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import {FiUser, FiCalendar} from 'react-icons/fi'

import Header from '../components/Header'
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

export default function Home({postsPagination}: HomeProps) {
  const {results, next_page} = postsPagination
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling 42</title>
      </Head>
      <main className={commonStyles.container}>
        <Header/>
        <div className={styles.container}>
          {results.map(({data, first_publication_date,uid}) => (
            <article key={uid} className={styles.post}>
              <Link href={`/post/${uid}`}>
                <a>
                  <h1>{data.title}</h1>
                  <p>{data.subtitle}</p>
                  <div className={styles.postInfos}>
                    <div className={styles.updatedAt}>
                      <FiCalendar className={styles.icon}/>
                      <time>{first_publication_date}</time>
                    </div>
                    <div className={styles.author}>
                      <FiUser className={styles.icon}/>
                      <p>{data.author}</p>
                    </div>
                  </div>
                </a>
              </Link>
            </article>
          ))}
          {!!next_page && (
            <a href="" className={styles.buttonMorePosts}>
              Carregar mais posts
            </a>
          )}
        </div>
      </main>
    </>

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: [
        'posts.title',
        'posts.subtitle',
        'posts.author',
        'posts.uid',
      ]
    }
  );
  // console.log(postsResponse)
  const props: HomeProps = {
    postsPagination:{
      next_page:postsResponse.next_page,
      results: postsResponse.results.map(post => ({
        data:{
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
        first_publication_date: format(
          new Date(post.last_publication_date),
          "dd LLL yyyy",
          {
            locale: ptBR,
            
          }
        ),
        // .split(' ').map((item,index)=> index === 1 ? `${item[0].toLocaleUpperCase()}${item[1]}${item[2]}` : item).join(' '),
        // first_publication_date: new Date(post.first_publication_date).toISOString(),
        uid:post.uid,
      }))
    }
  }
  console.log(JSON.stringify(props, null, 2));
  
  return {props}
};

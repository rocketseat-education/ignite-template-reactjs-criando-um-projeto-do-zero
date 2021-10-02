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
import { useEffect, useState } from 'react';

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
  
  const [posts, setPosts] = useState<Post[]>([] as Post[])
  const [nextPage, setNextPage] = useState<string | null>("")

  useEffect(()=> {
    setNextPage(postsPagination?.next_page)
    setPosts(postsPagination?.results)
  },[postsPagination?.results])

  async function handleLoadMorePosts(){
    if(nextPage){
      try {
        const response: PostPagination = await (await fetch(nextPage)).json()
        console.log(response.next_page);
        
        setPosts([...posts, ...response?.results])
        setNextPage(response.next_page)
        return 
        
      } catch (error) {
        alert(error)        
      }
    }
    alert('Erro ao fazer a requisição!')
  }
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling 42</title>
      </Head>
      <main className={commonStyles.container}>
        <Header/>
        <div className={styles.container}>
          {posts.map(({data, first_publication_date,uid}) => (
            <article key={uid} className={styles.post}>
              <Link href={`/post/${uid}`}>
                <a>
                  <h1>{data.title}</h1>
                  <p>{data.subtitle}</p>
                  <div className={styles.postInfos}>
                    <div className={styles.updatedAt}>
                      <FiCalendar className={styles.icon}/>
                      <time>{format(
                        new Date(first_publication_date),
                        "dd LLL yyyy",
                        {
                          locale: ptBR,
                          
                        }
                      )}</time>
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
          {!!nextPage && (
            <a onClick={handleLoadMorePosts} className={styles.buttonMorePosts}>
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
      ],
      pageSize:1
    }
  );
  const props: HomeProps = {
    postsPagination:{
      next_page:postsResponse.next_page,
      results: postsResponse.results.map(post => ({
        data:{
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
        first_publication_date: post.first_publication_date,
        uid:post.uid,
      }))
    }
  }
  console.log(JSON.stringify(props, null, 2));
  
  return {props}
};

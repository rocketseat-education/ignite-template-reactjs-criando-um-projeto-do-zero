import Head from 'next/head';
import { useRouter } from 'next/router'
import Prismic from '@prismicio/client'
import Link from 'next/link'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';
import {FiUser, FiCalendar, FiClock} from 'react-icons/fi'

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  nextPost: {
    title: string,
    slug: string,
  }| false
  prevPost: {
    title: string,
    slug: string,
  }| false,
  preview: boolean
}

export default function Post(props: PostProps) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Carregando...</div>
  }else{
    const {author, banner, content, title} = props?.post?.data
    const {first_publication_date, last_publication_date} = props?.post
    const {nextPost, prevPost, preview} = props
    const [lectureTime, setLectureTime] = useState(0)
    console.log(last_publication_date);
    
    useEffect(() => {
      console.log(content);
      
      let totalOfWords = 0
      content.forEach(item=> {
        let numberOfWords = RichText.asText(item.body).split(' ').reduce((total, number, currentIndex) => {
          return total + 1
          }, 0)
        totalOfWords += numberOfWords
      }) 
      console.log(totalOfWords/200)
      setLectureTime(Math.round(totalOfWords/200)+1)
    },[lectureTime])
    return (
      <>
        <Head>
          <title>Post | SpaceTraveling 42</title>
        </Head>
        <div className={styles.header}>
          <Header/>
        </div>
        <div className={styles.banner}>
          <img  src={banner.url} alt="banner"/>
        </div>
        <main className={commonStyles.container}>
          <div className={styles.post}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.postInfos}>
              <div className={styles.updatedAt}>
                <FiCalendar className={styles.icon}/>
                <time>
                  {format(
                    new Date(first_publication_date),
                    "dd LLL yyyy",
                    {
                      locale: ptBR,
                    }
                    )
                  }
                </time>
              </div>
              <div className={styles.author}>
                <FiUser className={styles.icon}/>
                <p>{author}</p>
              </div>
              <div className={styles.author}>
                <FiClock className={styles.icon}/>
                <p>{lectureTime} min</p>
              </div>
            </div>
            <div className={styles.lastUpdate}>
              <time>
                  {format(
                    new Date(last_publication_date),
                    "'*editado em' dd LLL 'de' yyyy, 'às' HH:mm",
                    {
                      locale: ptBR,
                    }
                    )
                  }
              </time>
            </div>
            {content.map(({body, heading}, index)=> (
              <div key={index} className={styles.content}>
                <h2>{heading}</h2>
                {body.map(({text})=> (
                  <>
                    <p>{text}</p>
                  </>
                ))}
              </div>
            ))}
              
          </div>
          <nav className={styles.navPosts}>

            {prevPost && (
              <div className={styles.previousPost}>
                <>
                  <p>
                    {prevPost?.title}
                  </p>
                  <Link href={`/post/${prevPost?.slug}`}>
                    <a>
                      Post Anterior
                    </a>
                  </Link>
                </>
              </div>
            )}
            {nextPost && (
              <div className={styles.nextPost}>
                <>
                  <p>
                    {nextPost?.title}
                  </p>
                  <Link href={`/post/${nextPost?.slug}`}>
                    <a>
                      Próximo post
                    </a>
                  </Link>
                </>
              </div>
            )}
          </nav>
          <Comments/>
          {preview && (
            <aside className={commonStyles.preview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </main>
      </>
    )
  }
}

export const getStaticPaths:GetStaticPaths = async () => {
  try {
    const prismic = getPrismicClient();
    const posts = await prismic.query(
      Prismic.Predicates.at('document.type', 'posts'),
      {
        fetch: 'posts.uid',
        pageSize:1
      }
    );
    return {
      paths:posts.results.map(({uid})=> ({params:{slug:uid}}))|| [],
      fallback: true,
    }
    
  } catch (error) {
    console.log(error);
  }
};

export const getStaticProps:GetStaticProps = async ({params, preview = false, previewData}) => {
  try {
    const prismic = getPrismicClient();
    const response = await prismic.getByUID('posts', `${params.slug}`, {ref: previewData?.ref ?? null});
    const prevPost = (await prismic.query(
      Prismic.Predicates.at('document.type', 'posts'),
      {
        pageSize : 3,
        after : `${response.id}`,
        orderings: '[posts.first_publication_date desc]',
      }
    ))?.results[0]

    const nextPost = (await prismic.query(
      Prismic.Predicates.at('document.type', 'posts'),
      {
        pageSize : 1,
        after : `${response.id}`,
        orderings: '[posts.first_publication_date]'
      }
    ))?.results[0]
    
    // console.log("response>>>>>>> ", response);
    console.log("prevPost>>>>>>> ", prevPost);
    console.log("nextPost>>>>>>> ", nextPost);
    // console.log("response>>>>>>> ", response);
    
    const props = {
      post:{
        data:{
          ...response.data,
        },
        first_publication_date: response.first_publication_date,
        last_publication_date: response.last_publication_date,
        uid: response.uid
      },
      prevPost: prevPost ?
      {
        title:prevPost?.data?.title,
        slug: prevPost?.uid
      }: false,
      nextPost: nextPost?
        {
          title:nextPost?.data?.title,
          slug: nextPost?.uid
        }
      : false,
      preview
    }
    console.log(props);
    
    return {props}
    
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
};

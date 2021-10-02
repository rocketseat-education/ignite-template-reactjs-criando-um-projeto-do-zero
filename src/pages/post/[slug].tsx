import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';

import {FiUser, FiCalendar, FiClock} from 'react-icons/fi'

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post(props: PostProps) {
  const {author, banner, content, title} = props.post.data
  const {first_publication_date} = props.post
  const [lectureTime, setLectureTime] = useState(0)
  useEffect(() => {
    console.log(content);
    
    let totalOfWords = 0
    content.forEach(item=> {
      let numberOfWords = RichText.asText(item.body).split(' ').reduce((total, number, currentIndex) => {
        // console.log(total);
        // console.log(number);
        
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
      <main className={commonStyles.container}>
        <Header/>
        <div className={styles.post}>
          <img className={styles.banner} src={banner.url} alt="banner" />
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.postInfos}>
            <div className={styles.updatedAt}>
              <FiCalendar className={styles.icon}/>
              <time>{first_publication_date}</time>
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
          {/* {JSON.stringify(content)} */}
        </div>

      </main>
    </>
  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO
  return {
    paths:[],
    fallback: 'blocking',
  }
};

export const getStaticProps:GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', `${params.slug}`, {});
  const props:PostProps = {
    post:{
      data:{
        title: response.data.title,
        author:response.data.author,
        banner:response.data.banner,
        content: response.data.content,
      },
      first_publication_date: new Date(response.first_publication_date).toISOString(),
      
      
      // first_publication_date:format(
      //   new Date(response.first_publication_date),
      //   "dd LLL yyyy",
      //   {
      //     locale: ptBR,
      //   }
      // ).split(' ').map((item,index)=> index === 1 ? `${item[0].toLocaleUpperCase()}${item[1]}${item[2]}` : item).join(' ')
    }
  }
  return {props}
};

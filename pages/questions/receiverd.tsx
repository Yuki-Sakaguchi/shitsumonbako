import { useState, useEffect, useRef } from 'react'
import firebase from '../../lib/firebase';
import { Question } from '../../models/Question';
import Layout from '../../components/Layout';
import { useAuthentication } from '../../hooks/auth';
import dayjs from 'dayjs'
import Link from 'next/link'

export default function QuestionReceived() {
  const { user } = useAuthentication();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPaginationFinished, setIsPaginationFinished] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * クエリの共通
   */
  function createBaseQuery() {
    return firebase
        .firestore()
        .collection('questions')
        .where('receiverUid', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(10)
  }

  /**
   * スナップショットからデータを更新
   */
  function appendQuestions(snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DOcumentData>) {
    const gotQuestions = snapshot.docs.map(doc => {
      const question = doc.data() as Question;
      question.id = doc.id;
      return question;
    })
    setQuestions(questions.concat(gotQuestions));
  }

  /**
   * 質問を読み込む
   */
  async function loadQuestions() {
    const snapshot = await createBaseQuery().get();

    if (snapshot.empty) {
      setIsPaginationFinished(true);
      return
    }

    appendQuestions(snapshot)
  }

  /**
   * 次の質問を読み込む
   */
  async function loadNextQuestions() {
    if (questions.length === 0) {
      return
    }

    const lastQuestion = questions[questions.length - 1]
    const snapshot = await createBaseQuery().startAfter(lastQuestion.createdAt).get()

    if (snapshot.empty) {
      return
    }

    appendQuestions(snapshot);
  }

  /**
   * スクロールイベント
   */
  function onScroll() {
    if (isPaginationFinished) {
      return
    }

    const container = scrollContainerRef.current
    if (container === null) {
      return
    }

    const rect = container.getBoundingClientRect();
    if (rect.top + rect.height > window.innerHeight) {
      return
    }

    loadNextQuestions();
  }

  // スクロール用
  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    }
  }, [questions, scrollContainerRef.current, isPaginationFinished]);

  // 質問用
  useEffect(() => {
    if (!process.browser) {
      return
    }

    if (user === null) {
      return
    }

    loadQuestions();
  }, [process.browser, user]);

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6" ref={scrollContainerRef}>
          {questions.map((question) => (
            <Link href={`/questions/${question.id}`} key={question.id}>
              <a>
                <div className="card my-3">
                  <div className="card-body">
                    <div className="text-truncate">{question.body}</div>
                    <div className="text-muted text-end">
                      <small>{dayjs(question.createdAt.toDate()).format('YYYY/MM/DD HH:mm')}</small>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router'
import firebase from '../../lib/firebase';
import Layout from '../../components/Layout'
import { Question } from '../../models/Question';
import { Answer } from '../../models/Answer';
import { useAuthentication } from '../../hooks/auth';
import { toast } from 'react-toastify';

type Query = {
  id: string;
}

export default function QuestionShow() {
  const router = useRouter();
  const query = router.query as Query;
  const { user } = useAuthentication();
  const [question, setQuestion] = useState<Question>(null);
  const [answer, setAnswer] = useState<Answer>(null);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function loadData() {
    if (query.id === undefined) {
      return
    }

    const questionDoc = await firebase
      .firestore()
      .collection('questions')
      .doc(query.id)
      .get()

    if (!questionDoc.exists) {
      return
    }

    const gotQuestion = questionDoc.data() as Question
    gotQuestion.id = questionDoc.id
    setQuestion(gotQuestion)

    if (!gotQuestion.isReplied) {
      return
    }

    const answerSnapshot = await firebase
      .firestore()
      .collection('answers')
      .where('questionId', '==', gotQuestion.id)
      .limit(1)
      .get()
    
    if (answerSnapshot.empty) {
      return
    }

    const gotAnswer = answerSnapshot.docs[0].data() as Answer
    gotAnswer.id = answerSnapshot.docs[0].id
    setAnswer(gotAnswer);
  }

  async function onSubmit (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSending(true);

    await firebase.firestore().runTransaction(async (t) => {
      t.set(firebase.firestore().collection('answers').doc(), {
        uid: user.uid,
        questionId: question.id,
        body,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      t.update(firebase.firestore().collection('questions').doc(question.id), {
        isReplied: true,
      })
    });

    setIsSending(false);

    const now = new Date().getTime()
    setAnswer({
      id: '',
      uid: user.uid,
      questionId: question.id,
      body,
      createdAt: new firebase.firestore.Timestamp(now / 1000, now % 1000),
    })

    toast.success('回答を送信しました。', {
      position: 'bottom-left',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }

  useEffect(() => {
    if (user === null) {
      return
    }
    loadData()
  }, [query.id, user])

  return (
    <Layout>
      {question && (
        <>
          <div className="card">
            <div className="card-body">{question.body}</div>
          </div>
          <section className="text-center mt-4">
            <h2 className="h4">回答</h2>
            {answer === null ? (
              <form onSubmit={onSubmit}>
                <textarea
                  className="form-control"
                  placeholder="おげんきですか？"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                ></textarea>
                <div className="m-3">
                  {isSending ? (
                    <div className="spinner-border text-secondary" role="status"></div>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      回答する
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="card">
                <div className="card-body text-left">{answer.body}</div>
              </div>
            )}
          </section>
        </>
      )}
    </Layout>
  )
}
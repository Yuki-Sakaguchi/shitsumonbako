# Next.js + TypeScript + Firebaseで質問箱をつくる

この記事を参考にする  
https://zenn.dev/dala/books/nextjs-firebase-service  

## 学んだこと

### Next.jsも環境変数のプレフィックスがある

`create-react-app`では`REACT_APP_`をつけると環境変数が使えるルールがあったが、Next.jsでは`NEXT_PUBLIC_`とつけるとブラウザとサーバーで使える環境変数になるらしい...
ブラウザで見えて欲しくなもの注意

### ブラウザとサーバーでどちらでも実行されるのでブラウザだけで実行したい場合は`process.browser`を使う

```
if (process.browser) {
  // ブラウザだけで実行する処理
}
```

もしくは

```
if (typeof window !== 'undefined') {
  // ブラウザだけで実行する処理
}
```

### 状態管理はRecoilを使ってみる

Reduxより簡単そうだった。  
大きめな状態管理に使ったわけではないので実際はわからん。  

### Firebaseのトランザクション

２箇所のデータを変更するときなどには`runTransaction`を使う。  
2つ以上のデータ操作がどっちもいい感じに生合成を保ってくれる。

### サーバー側でFirebaseを使うためにはFirebase-adminを使う

秘密鍵をFirebaseの管理画面で作れるのでそれを使う  
これがバレると情報が漏洩しちゃうのでコミットしないようにする  
base64に変換した文字を環境変数に入れて使う。  
ブラウザ側に出ないように`NEXT_PUBLIC_`はつけない。  
↓こんな感じでアクセスできる  
http://localhost:3000/api/answers/fNC706Kemj6TeKSXPRHa  

作ったAPIでページを作る時に`getServerSideProps`でAPIを叩いてその結果をpropsに渡してページを作る  


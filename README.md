# Next.js + TypeScript + Firebaseで質問箱をつくる

この記事を参考に勉強したこと  
https://zenn.dev/dala/books/nextjs-firebase-service  
めっちゃ勉強になった

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

### OGP用の画像を動的に生成する

フォントはライセンスがあるためサーバーに入っているデフォルトの文字とかは避けた方が良いらしい。  
ライセンス的に問題のないフォントをサーバーにインストールしてそれを使うようにする。  

画像の作り方自体は`canvas（node-canvas）`を使ってフロント側で画像を作るのと同じ感じで作る。  
その中に必要なデータなどはfirebaseなどからひっぱてくる。  
nextのルーティングを使えるので`pages/api/answer/[id]/ogp.ts`などを作ってそこで動かす  

本番で動かすためにはnode-canvasを動かすためのライブラリをプロジェクトに置いておく必要があるらしい（canvas_lib64というディレクトリで中身はhttps://github.com/jwerre/node-canvas-lambda/raw/master/node12_canvas_lib64_layer.zip）  
package.jsonにも

```
"now-build": "cp canvas_lib64/*so.1 node_modules/canvas/build/Release/ && yarn build"
```

を追加するらしい。
これらがうまく動けばURLで画像を生成できるようになるので、SSRでmetaが書き換わるように設定すればおK
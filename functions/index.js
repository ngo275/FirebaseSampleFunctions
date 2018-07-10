const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()

const pushMessage = (fcmToken, bookName) => ({
  notification: {
    title: '保存が完了しました',
    body: `「${bookName}」の保存が完了しました🙌`,
  },
  data: {
    hoge: 'fuga', // 任意のデータを送れる
  },
  token: fcmToken,
})

exports.saveBook = functions.firestore
  .document('version/1/user/{userID}/books/{bookID}')
  .onCreate((snapshot, context) => {
    // 以下のようにすればbookの中身が取れる.
    const book = snapshot.data()
    // 以下のようにすればuserIDやbookIDが取れる.
    const userID = context.params.userID
    const userRef = firestore.doc(`version/1/user/${userID}`)
    userRef.get().then((user) => {
      const userData = user.data()
      admin.messaging().send(pushMessage(userData.fcmToken, book.name))
        .then((response) => {
          console.log('Successfully sent message:', response)
        })
        .catch((e) => {
          console.log('Error sending message:', e)
        })
    }).catch((e) => console.log(e))
  })
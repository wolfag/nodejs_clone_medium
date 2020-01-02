import mongoose from 'mongoose';
import {getArticleById, articleModel} from './article';

const bookmarkSchema = new mongoose.Schema ({
  idUser: String,
  idArticle: String,
  idUserBookMark: String,
});

bookmarkSchema.virtual ('userBookMark', {
  foreignField: 'idUser',
  localField: 'idUserBookMark',
  ref: 'users',
  justOne: true,
});

bookmarkSchema.virtual ('userOwnArticle', {
  foreignField: 'idUser',
  localField: 'idUser',
  ref: 'users',
  justOne: true,
});

bookmarkSchema.virtual ('articleBookMark', {
  foreignField: 'idArticle',
  localField: 'idArticle',
  ref: 'Article',
  justOne: true,
});

bookmarkSchema.set ('toObject', {virtuals: true});
bookmarkSchema.set ('toJSON', {virtuals: true});
const bookmarkModel = mongoose.model ('bookmark', bookmarkSchema);

export async function bookMark (input) {
  const {idArticle, idUser} = input;

  // check  count bookmark exist
  const countBookMark = await bookmarkModel
    .countDocuments ({idArticle, idUser})
    .exec ();
  if (countBookMark > 0 || countBookMark == undefined) {
    return;
  }

  const newBookMark = new bookmarkModel (input);

  return new Promise (resolve => {
    newBookMark.save ((err, data) => {
      if (err) {
        resolve (err);
      }
      resolve (data);
    });
  });
}

export function unBookMark({idUserBookMark, idArticle}) {
  return new Promise (resolve => {
    bookmarkModel.deleteMany ({idUserBookMark, idArticle}, err => {
      if (err) {
        resolve (err);
      }
    });
  });
}

export function getAllArticleHasBeenBookMark (idUserBookMark) {
  return new Promise (resolve => {
    bookmarkModel
      .find ({idUserBookMark}, async (err, articleBookmarks) => {
        if (err) {
          resolve (err);
        }

        const data = await Promise.all (
          articleBookmarks.map (async article => {
            const {idArticle} = article;
            const articleBookMark = await articleModel
              .findOne ({idArticle})
              .populate ('hashTagData');
            return {...article, ...{articleBookMark}};
          })
        );
        resolve (data);
      })
      .populate ('userOwnArticle');
  });
}

export function isBookMark({idArticle, idUserBookMark}) {
  return new Promise (resolve => {
    bookmarkModel.countDocuments ({idArticle, idUserBookMark}, (err, count) => {
      if (err) {
        resolve (false);
      }
      if (count > 0) {
        resolve (true);
      }
      resolve (false);
    });
  });
}

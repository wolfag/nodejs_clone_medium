import mongoose from 'mongoose';
import {getArticleById} from './article';

const hashTagSchema = mongoose.Schema ({
  idHashTag: String,
  nameHashTag: String,
  idArticle: String,
});

const hashtagModel = mongoose.model ('hashtag', hashTagSchema);

export function getHashTagAll () {
  return new Promise (resolve => {
    hashtagModel.find ({}, (err, hashtags) => {
      if (err) {
        resolve (err);
      }
      let flag = '';
      const result = [];
      hashtags.forEach (hash => {
        flag = hash.nameHashTag;
        if (!result.map (item => item.nameHashTag).includes (flag)) {
          result.push (hash);
        }
      });
      resolve (result);
    });
  });
}

export function getArticleTagByNameHashTag (nameHashTag) {
  return new Promise (resolve => {
    hashtagModel.find ({nameHashTag}, async (err, data) => {
      if (err) {
        resolve (err);
      }
      const listIdArticle = await Promise.all (
        data.map (async hashTag => await getArticleById (hashTag.idArticle))
      );
      resolve (listIdArticle);
    });
  });
}
export function deleteHashTag (name) {
  return new Promise (resolve => {
    hashtagModel.deleteOne ({name}, (err, data) => {
      if (err) {
        resolve (err);
      }
      resolve (data);
    });
  });
}

export function addManyHashTag (arrHashTag) {
  if (arrHashTag && arrHashTag.length > 0) {
    hashtagModel.insertMany (arrHashTag, (err, data) => {
      if (err) {
        console.log (err);
      }
      return data;
    });
  }
}

import mongoose from 'mongoose';
import uuid from 'uuid';
import {omit} from 'lodash';

import {addManyHashTag} from './hastag';

export const articleSchema = new mongoose.Schema ({
  idUser: String,
  idArticle: String,
  content: String,
  title: String,
  hashTag: [String],
  category: [String],
  totalClap: Number,
  notification: String,
  image: {
    type: String,
    default: 'http://www.rangerwoodperiyar.com/images/joomlart/demo/default.jpg',
  },
  createTime: String,
  count: Number,
});

articleSchema.virtual ('user', {
  foreignField: 'idUser',
  localField: 'idUser',
  ref: 'users',
  justOne: true,
});

articleSchema.virtual ('comment', {
  foreignField: 'isArticle',
  localField: 'idArticle',
  ref: 'comment',
  justOne: false,
});

articleSchema.virtual ('bookmark', {
  foreignField: 'idArticle',
  localField: 'idArticle',
  ref: 'bookmark',
  justOne: false,
});

articleSchema.virtual ('hashTagData', {
  foreignField: 'idArticle',
  localField: 'idArticle',
  ref: 'hashtag',
  justOne: false,
});

articleSchema.set ('toObject', {virtuals: true});
articleSchema.set ('toJSON', {virtuals: true});

export const articleModel = mongoose.model ('Article', articleSchema);

export function updateArticle (article) {
  const {idArticle, idUser} = article;
  const data = omit (article, ['idArticle', 'idUser']);
  return new Promise (resolve => {
    articleModel.updateMany ({idArticle, idUser}, data, (err, doc) => {
      if (err) {
        resolve (err);
      }
      resolve (doc);
    });
  });
}

export function deleteArticle({idArticle, idUser}) {
  return new Promise (resolve => {
    articleModel.deleteOne ({idArticle}, err => {
      if (err) {
        resolve (err);
      }
    });
  });
}

export function addArticle (article) {
  const {hashTag, idArticle} = article;
  const dataHasTag = hashTag.map (tag => ({
    idHashTag: uuid (),
    nameHashTag: tag,
    idArticle,
  }));
  addManyHashTag (dataHasTag);

  const newArticle = new articleModel ({...article, ...{totalClap: 0}});

  return new Promise (resolve => {
    newArticle.save ((err, data) => {
      if (err) {
        resolve (err);
      }
      resolve (data);
    });
  });
}

export function countArticle () {
  return new Promise (resolve => {
    articleModel.countDocuments ((err, count) => {
      if (err) {
        resolve (err);
      }
      resolve (count);
    });
  });
}

/*
    getAllArticle() => get all article we have in database
    parameter :
    - first  => limit count article
    - offset => start index article
    - search => switch mode search 
*/
export function getAllArticle (
  {first, offset, search} = {first: undefined, offset: 0, search: false}
) {
  return new Promise (resolve => {
    articleModel
      .find ({}, (err, data) => {
        if (err) {
          resolve (err);
        }
        if (search) {
          const searchData = data.map (item => {
            item.title = filterStringHTML (item.title);
            return item;
          });
          resolve (searchData);
        }
        data = first === undefined
          ? data.reverse ().slice (offset)
          : data.reverse ().slice (offset, offset + first);
        resolve (data);
      })
      .populate ('user')
      .populate ('comment')
      .populate ('bookmark')
      .populate ('hashTagData');
  });
}

export function getArticleById (idArticle) {
  return new Promise (resolve => {
    articleModel
      .findOne ({idArticle}, (err, data) => {
        if (err) {
          resolve (err);
        }
        resolve (data);
      })
      .populate ('user')
      .populate ('comment')
      .populate ('bookmark')
      .populate ('hashTagData');
  });
}

export function getArticleByCategory (idUser) {
  return new Promise (resolve => {
    articleModel.find ({idUser}, (err, data) => {
      if (err) {
        resolve (err);
      }
      resolve (data);
    });
  });
}

export function getArticleByHashTag (hashTag) {
  return new Promise (resolve => {
    articleModel.find ({hashTag}, (err, data) => {
      if (err) {
        resolve (err);
      }
      resolve (data);
    });
  });
}

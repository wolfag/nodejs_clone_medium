import mongoose from 'mongoose';

const followSchema = new mongoose.Schema ({
  idUser: String,
  idUserFollow: String,
});

followSchema.virtual ('userFollow', {
  foreignField: 'idUser',
  localField: 'idUserFollow',
  ref: 'users',
  justOne: true,
});
const followModel = mongoose.model ('follow', followSchema);

followSchema.set ('toObject', {virtuals: true});
followSchema.set ('toJSON', {virtuals: true});

export async function follow (follow) {
  let countFollow;
  await followModel.countDocuments (follow, (err, count) => {
    countFollow = count;
  });
  if (countFollow > 0 || countFollow == undefined) {
    return;
  }

  const newFollow = new followModel (follow).populate ('userFollow');

  return new Promise (resolve => {
    newFollow.save (async (err, saveData) => {
      if (err) {
        resolve (err);
      }
      resolve (saveData);
    });
  });
}

export function getAllInformationUserFollowYour (idUser) {
  return new Promise (resolve => {
    followModel
      .find ({idUser}, (err, data) => {
        if (err) {
          resolve (err);
        }
        resolve (data);
      })
      .populate ('userFollow');
  });
}

export function unFollow (follow) {
  return new Promise (resolve => {
    followModel.deleteMany (follow, err => {
      if (err) {
        resolve (err);
      }
    });
  });
}
